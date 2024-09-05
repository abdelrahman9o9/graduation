const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  passenger: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Assuming there is a User model for passengers
    required: true,
  },
  driver: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // Assuming there is a User model for drivers
    default: null,
  },
  pickupLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    address: String,
  },
  dropoffLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
    address: String,
  },
  fare: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      'available',
      'requested',
      'accepted',
      'in-progress',
      'completed',
      'ignored',
    ],
    default: 'requested',
  },
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  acceptedAt: Date,
  pickedUpAt: Date,
  droppedOffAt: Date,
});

rideSchema.index({ pickupLocation: '2dsphere' });
rideSchema.index({ dropoffLocation: '2dsphere' });

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;
