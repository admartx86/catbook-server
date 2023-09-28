const mongoose = require('mongoose');

const meowSchema = new mongoose.Schema({
  authorPhoto: { type: String, required: true },
  authorName: { type: String, required: true },
  authorUsername: { type: String, required: true },
  isPinned: { type: Boolean, default: false },
  meowText: { 
    type: String, 
    required: true, 
    minlength: 1, 
    maxlength: 280 
  },
  meowMedia: String,
  embeddedMeow: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Meow'
  },
  isAReply: { type: Boolean, default: false },
  isARemeow: { type: Boolean, default: false },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Meow', meowSchema);
