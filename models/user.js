const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
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
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

userSchema.index({
  username: 'text',
  realName: 'text'
});

module.exports = mongoose.model('User', userSchema);
