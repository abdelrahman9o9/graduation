const Ride = require('../models/rideModel');

exports.getAvailableRides = async (req, res) => {
  try {
    const availableRides = await Ride.find({
      status: { $in: ['available', 'requested'] },
    });
    res.status(200).json({
      status: 'success',
      results: availableRides.length,
      data: {
        rides: availableRides,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.id; // Assuming driver is authenticated

    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { status: 'accepted', driver: driverId },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({
        status: 'fail',
        message: 'Ride not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ride,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.ignoreRide = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { status: 'ignored' },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({
        status: 'fail',
        message: 'Ride not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ride,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getRideDetails = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        status: 'fail',
        message: 'Ride not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ride,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.confirmPickup = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { status: 'in-progress' },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({
        status: 'fail',
        message: 'Ride not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ride,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.confirmDropOff = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { status: 'completed' },
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({
        status: 'fail',
        message: 'Ride not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ride,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getTripHistory = async (req, res) => {
  try {
    const { driverId } = req.params;

    const rides = await Ride.find({ driver: driverId, status: 'completed' });

    res.status(200).json({
      status: 'success',
      results: rides.length,
      data: {
        rides,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.rebookTrip = async (req, res) => {
  try {
    const { rideId } = req.params;

    const ride = await Ride.findByIdAndUpdate(
      rideId,
      { status: 'available' }, // or 'requested', depending on your logic
      { new: true }
    );

    if (!ride) {
      return res.status(404).json({
        status: 'fail',
        message: 'Ride not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        ride,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
