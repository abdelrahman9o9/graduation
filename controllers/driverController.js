const fs = require('fs');
const Driver = require('../models/driverModel');

exports.registerDriver = (req, res) => {
  res
    .status(200)
    .json({ message: 'driver registerDiver not implemented yet.' });
};

exports.loginDriver = (req, res) => {
  res.status(200).json({ message: 'driver loginDriver not implemented yet.' });
};

exports.logoutDriver = (req, res) => {
  res.status(200).json({ message: 'User logout not implemented yet .' });
};

exports.forgotPassword = (req, res) => {
  res
    .status(200)
    .json({ message: 'Driver forgotPassword not implemented yet.' });
};

exports.resetPassword = (req, res) => {
  res
    .status(200)
    .json({ message: 'Driver resetPassword not implemented yet.' });
};

exports.updatePassword = (req, res) => {
  res
    .status(200)
    .json({ message: 'Driver updatePassword not implemented yet.' });
};

exports.updateDriverProfile = (req, res) => {
  res
    .status(200)
    .json({ message: 'driver updateUserProfile not implemented yet.' });
};

exports.getDriverProfile = (req, res) => {
  res
    .status(200)
    .json({ message: 'driver getDriverProfile not implemented yet.' });
};

exports.uploadDriverPhoto = (req, res) => {
  res
    .status(200)
    .json({ message: 'User uploadUserPhoto not implemented yet.' });
};

exports.resizeDriverPhoto = (req, res) => {
  res
    .status(200)
    .json({ message: 'User resizeUserPhoto not implemented yet.' });
};

exports.rideHistory = (req, res) => {
  res.status(200).json({ message: 'driver rideHistory not implemented yet.' });
};

exports.availableRides = (req, res) => {
  res
    .status(200)
    .json({ message: 'driver availableRides not implemented yet.' });
};

// exports.registerDriver = async (req, res) => {
//   const { drivername, driveremail, driverphone } = req.body;

//   // تحقق من صحة البيانات المرسلة
//   if (!drivername || !driveremail || !driverphone) {
//     return res.status(400).json({ message: 'All fields are required.' });
//   }

//   try {
//     // تحقق من وجود السائق بالفعل
//     const existingDriver = await Driver.findOne({ driveremail });
//     if (existingDriver) {
//       return res.status(400).json({ message: 'Driver already exists.' });
//     }

//     // إنشاء سائق جديد
//     const newDriver = new Driver({
//       drivername,
//       driveremail,
//       driverphone,
//     });

//     await newDriver.save();

//     res.status(201).json({
//       message: 'Driver registered successfully',
//       driver: newDriver,
//     });
//   } catch (error) {
//     console.error('Error registering driver:', error);
//     res.status(500).json({ message: 'Server error, please try again later.' });
//   }
// };
