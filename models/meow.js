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
      // required: true,
      minlength: 0,
      maxlength: 280,
      validate: {
        validator: function (text) {
          // If there is text, it's always valid
          if (text && text.length > 0) return true;

          // If it's a remeow or has media, text is not required
          if (this.isARemeow || this.meowMedia) return true;

          // In all other cases, text is required
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
    }
  },

  { timestamps: true }
);

meowSchema.index({ meowText: 'text' });

module.exports = mongoose.model('Meow', meowSchema);
