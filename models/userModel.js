const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  profile: {
    type: String,
    default: 'default profile.png',
  },
  username: {
    type: String,
    required: true,
  },
  useremail: {
    type: String,
    required: true,
    unique: true,
  },
  userphone: {
    type: String,
    required: true,
    unique: true,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
