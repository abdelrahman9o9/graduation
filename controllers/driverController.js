const fs = require('fs');
const Driver = require('../models/driverModel');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.registerDriver = async (req, res) => {
  try {
    const { name, email, password, phone, passwordConfirm } = req.body;
    if (!name || !email || !password || !phone) {
      return res
        .status(400)
        .json({ message: 'Please provide all required fields.' });
    }

    const newDriver = await Driver.create({
      name,
      email,
      phone,
      password,
      passwordConfirm,
    });

    res.status(201).json({ status: 'success', data: { driver: newDriver } });
  } catch (error) {
    res.status(500).json({ message: 'Error registering driver.', error });
    console.log(error);
  }
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 3) Filtered out unwanted fildes names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 2) Update Driver document
  const updatedDriver = await Driver.findByIdAndUpdate(
    req.driver.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json({
    status: 'success',
    data: {
      driver: updatedDriver,
    },
  });
});

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

////////////////////////////////////////////////////////////////////////
/*
//not yet
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

//not yet
exports.availableRides = async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'available' });
    res.status(200).json({ status: 'success', data: { rides } });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available rides.', error });
  }
};
*/
