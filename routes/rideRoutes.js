const express = require('express');
const rideController = require('../controllers/rideController');

const router = express.Router();

router.get('/available-rides', rideController.getAvailableRides);
router.patch('/accept-ride/:rideId', rideController.acceptRide);
router.patch('/ignore-ride/:rideId', rideController.ignoreRide);
router.get('/ride-details/:rideId', rideController.getRideDetails);
router.patch('/confirm-pickup/:rideId', rideController.confirmPickup);
router.patch('/confirm-dropoff/:rideId', rideController.confirmDropOff);
router.get('/trip-history/:driverId', rideController.getTripHistory);
router.patch('/rebook-trip/:rideId', rideController.rebookTrip);

module.exports = router;
