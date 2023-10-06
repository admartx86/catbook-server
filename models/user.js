const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  realName: String,
  hash: String,
  salt: String,
  email: String,
  dateJoined: {
    type: Date,
    default: Date.now
  },
  bio: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('User', userSchema);
