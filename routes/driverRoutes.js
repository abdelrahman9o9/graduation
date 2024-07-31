const express = require('express');
const driverController = require('../controllers/driverController');
const router = express.Router();
const authController = require('../controllers/authController');
const {
  uploadDriverPhoto,
  resizeDriverPhoto,
} = require('../middlewares/fileUpload');

// Password management routes
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.post('/register', driverController.registerDriver);
router.post('/login', authController.loginDriver);
router.get('/logout', authController.logoutDriver);

// User profile routes
router.patch(
  '/updateMe',
  authController.protect,
  uploadDriverPhoto,
  resizeDriverPhoto,
  driverController.updateMe
);

// router.delete('/deleteMe', driverController.deleteMe);
router.get(
  '/profile',
  authController.protect,
  driverController.getDriverProfile
);

// Ride management routes
router.get('/availableRides', driverController.availableRides);
router.get('/rideHistory', driverController.rideHistory);
module.exports = router;
