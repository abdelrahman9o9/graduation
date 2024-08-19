const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const driverSchema = new mongoose.Schema({
  profile: {
    type: String,
    default: 'default profile.png',
  },
  name: {
    type: String,
    required: [true, 'p;ease provide a name'],
  },
  photo: String,
  email: {
    type: String,
    required: [true, 'p;ease provide a email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'please provide a valid email'],
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
    minlength: 11,
  },
  status: {
    type: Boolean,
    default: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      //This only works on CRATE & SAVE !!
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

driverSchema.pre('save', async function (next) {
  //only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  //Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Set passwordChangedAt to the current date and time
  this.passwordChangedAt = new Date();

  //Delete passwordConfirmation field
  this.passwordConfirm = undefined;
  next();
});

driverSchema.methods.correctPassword = async function (
  candidatePassword,
  driverPassword
) {
  return await bcrypt.compare(candidatePassword, driverPassword);
};

driverSchema.methods.ChangedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }

  //False means Not changed
  return false;
};

driverSchema.methods.createPasswordResetToken = function () {
  // Generate a random 6-digit code
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetCode)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetCode;
};

const Driver = mongoose.model('Driver', driverSchema);

module.exports = Driver;
