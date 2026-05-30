const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['user', 'owner'],
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const supportChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  // Unread count for owner
  ownerUnreadCount: {
    type: Number,
    default: 0
  },
  // Unread count for user
  userUnreadCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for efficient queries
supportChatSchema.index({ userId: 1, ownerId: 1, hotelId: 1 });

module.exports = mongoose.model('SupportChat', supportChatSchema);
