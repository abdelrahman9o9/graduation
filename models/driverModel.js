const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  profile: {
    type: String,
    default: 'default profile.png',
  },
  name: {
    type: String,
    required: [true, 'p;ease provide a name'],
  },
  email: {
    type: String,
    required: [true, 'p;ease provide a email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'p;ease provide a password'],
    minlength: 8,
    select: false,
  },
  phone: {
    type: String,
    required: [true, 'p;ease provide a phone'],
    unique: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  passwordChangedAt: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
