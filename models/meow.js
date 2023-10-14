const mongoose = require('mongoose');

const meowSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPinned: { type: Boolean, default: false },
    meowText: {
      type: String,
      minlength: 0,
      maxlength: 280,
      validate: {
        validator: function (text) {
          if (text && text.length > 0) return true;
          if (this.isARemeow || this.meowMedia) return true;
          return false;
        },
        message: "Text is required for meows that aren't remeows and have no media."
      }
    },
    meowMedia: String,
    embeddedMeow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meow'
    },
    isAReply: { type: Boolean, default: false },
    isARemeow: { type: Boolean, default: false },
    isADirectRemeow: { type: Boolean, default: false },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    remeowedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    repliedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    repliedToMeow: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meow',
      default: null
    },
    repliedToAuthor: {
      type: String,
      default: null
    },
    isAPlaceholder: { type: Boolean, default: false }
  },

  { timestamps: true }
);

meowSchema.index({ meowText: 'text' });

module.exports = mongoose.model('Meow', meowSchema);
