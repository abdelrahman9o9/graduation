const jwt = require('jsonwebtoken');
const Driver = require('../models/driverModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (driver, statusCode, res) => {
  const token = signToken(driver._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.cookie('jwt', token, cookieOptions);

  //Remove password from output
  driver.password = undefined;
  driver.passwordChangedAt = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      driver,
    },
  });
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'You are not logged in!' });
    }

    console.log('Token:', token); // Log the token to check its format

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentDriver = await Driver.findById(decoded.id);
    if (!currentDriver) {
      return res.status(401).json({ message: 'The driver no longer exists.' });
    }

    req.driver = currentDriver;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error protecting route.', error });
    console.log(error);
  }
};

exports.loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide email and password.' });
    }

    const driver = await Driver.findOne({ email }).select('+password');
    if (!driver) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, driver.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: driver._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
    res.status(200).json({ status: 'success', token });
  } catch (error) {
    console.error('Error logging in driver:', error);
    res.status(500).json({ message: 'Error logging in driver.', error });
  }
};

exports.logoutDriver = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
    message: 'You are now logged out!',
  });
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) Getting driver based on Posted email
  const driver = await Driver.findOne({ email: req.body.email });
  if (!driver) {
    return next(new AppError('There is no driver with email address', 404));
  }

  //2) Generate the random reset token
  const resetCode = driver.createPasswordResetToken();
  await driver.save({ validateBeforeSave: false });

  //3) Send it to driver email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/driver/resetPassword/${resetCode}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:${resetURL}.\nIf you did not forget your password ,please ignore this email!`;

  try {
    await sendEmail({
      email: driver.email,
      subject: 'Your Password reset code (valid for 10 min )',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Code sent to email',
    });
  } catch (err) {
    console.error('Error sending email:', err); // Log the error

    driver.passwordResetToken = undefined;
    driver.passwordResetExpires = undefined;
    await driver.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.verifyResetCode = catchAsync(async (req, res, next) => {
  // 1) Get the reset code from the request body
  const { resetCode } = req.body;

  // 2) Check if the reset code is provided
  if (!resetCode) {
    return next(new AppError('Please provide the reset code.', 400));
  }

  // 3) Hash the reset code (since it was hashed when storing)
  const hashedCode = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  // 4) Find the driver with the hashed code and check if it is not expired
  const driver = await Driver.findOne({
    passwordResetToken: hashedCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 5) If no driver is found, or the token is expired
  if (!driver) {
    return next(new AppError('Invalid or expired reset code.', 400));
  }

  // 6) If the code is valid, respond with success
  res.status(200).json({
    status: 'success',
    message: 'Reset code is valid.',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get driver based on the code
  const hashedCode = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const driver = await Driver.findOne({
    passwordResetToken: hashedCode,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If code have not expired, and there is usr, set the new password
  if (!driver) {
    return next(new AppError('Code is invalid or has expired', 400));
  }
  driver.password = req.body.password;
  driver.passwordConfirm = req.body.passwordConfirm;
  driver.passwordResetToken = undefined;
  driver.passwordResetExpires = undefined;
  await driver.save();
  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(driver, 200, res);

  const token = signToken(driver._id);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  console.log('req.driver:', req.driver); // Debugging line
  const driver = await Driver.findById(req.driver.id).select('+password');

  // 1) Get driver from collection
  //const driver = await Driver.findById(req.driver._id).select('+password');

  // 2) Check if posted current password is correct
  if (
    !(await driver.correctPassword(req.body.passwordCurrent, driver.password))
  ) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // 3) If so, uddate password
  driver.password = req.body.password;
  driver.passwordConfirm = req.body.passwordConfirm;
  await driver.save();

  // driver.findByIdAndUpdate will NOT work as intended!

  // 4) Log driver in, send JWT
  createSendToken(driver, 200, res);
});
