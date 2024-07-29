const fs = require('fs');
const Driver = require('../models/driverModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');

// Register a new driver
exports.registerDriver = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res
        .status(400)
        .json({ message: 'Please provide all required fields.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newDriver = await Driver.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });
    res.status(201).json({ status: 'success', data: { driver: newDriver } });
  } catch (error) {
    res.status(500).json({ message: 'Error registering driver.', error });
    console.log(error);
  }
};

// Login a driver
exports.loginDriver = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide email and password.' });
    }

    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!driver.password) {
      console.log('Driver found but password is undefined:', driver);
      return res
        .status(500)
        .json({ message: 'Server error. Please try again later.' });
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
    res.status(500).json({ message: 'Error logging in driver.', error });
    console.log(error);
  }
};

exports.logoutDriver = (req, res) => {
  res.status(200).json({ message: 'Driver logged out successfully.' });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide email.' });
    }

    const driver = await Driver.findOne({ email });
    if (!driver) {
      return res
        .status(404)
        .json({ message: 'No driver found with this email.' });
    }

    // Generate a password reset token and send it to the email
    const resetToken = crypto.randomBytes(32).toString('hex');
    driver.resetPasswordToken = resetToken;
    driver.resetPasswordExpires = Date.now() + 3600000;
    await driver.save();

    // Send the reset token to the email (implement sending email logic)
    res.status(200).json({ message: 'Password reset token sent to email.' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error processing password reset.', error });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Please provide token and new password.' });
    }

    const driver = await Driver.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!driver) {
      return res
        .status(400)
        .json({ message: 'Password reset token is invalid or has expired.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    driver.password = hashedPassword;
    driver.resetPasswordToken = undefined;
    driver.resetPasswordExpires = undefined;
    await driver.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password.', error });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: 'Please provide old and new passwords.' });
    }

    const driver = await Driver.findById(req.driver.id);
    if (!driver || !(await bcrypt.compare(oldPassword, driver.password))) {
      return res.status(401).json({ message: 'Incorrect old password.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    driver.password = hashedPassword;
    await driver.save();

    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password.', error });
  }
};

// Update driver profile
exports.updateDriverProfile = async (req, res) => {
  try {
    const updates = req.body;
    const driver = await Driver.findByIdAndUpdate(req.driver.id, updates, {
      new: true,
    });
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found.' });
    }

    res.status(200).json({ status: 'success', data: { driver } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile.', error });
  }
};

// Get driver profile
exports.getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found.' });
    }

    res.status(200).json({ status: 'success', data: { driver } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile.', error });
  }
};

// Upload driver photo
exports.uploadDriverPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo uploaded.' });
    }

    const filePath = `uploads/drivers/${req.file.filename}`;
    fs.writeFileSync(filePath, req.file.buffer);

    res
      .status(200)
      .json({ status: 'success', message: 'Photo uploaded successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading photo.', error });
  }
};

// Resize driver photo
exports.resizeDriverPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No photo to resize.' });
    }

    const resizedPhoto = await sharp(req.file.buffer)
      .resize(300, 300)
      .toBuffer();

    const filePath = `uploads/drivers/resized_${req.file.filename}`;
    fs.writeFileSync(filePath, resizedPhoto);

    res
      .status(200)
      .json({ status: 'success', message: 'Photo resized successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error resizing photo.', error });
  }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////
// Ride history
exports.rideHistory = async (req, res) => {
  try {
    const driver = await Driver.findById(req.driver.id).populate('rides');
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found.' });
    }

    res.status(200).json({ status: 'success', data: { rides: driver.rides } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching ride history.', error });
  }
};

// Available rides
exports.availableRides = async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'available' });
    res.status(200).json({ status: 'success', data: { rides } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available rides.', error });
  }
};
