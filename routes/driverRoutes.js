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
router.post('/verifyResetCode', authController.verifyResetCode);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.post('/SignUp', driverController.SignUpDriver);
router.post(
  '/addDriverLicense',
  driverController.uploadDriverDocuments,
  driverController.addDriverLicense
);

router.post('/verify-email', driverController.verifyEmail);

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

module.exports = router;
