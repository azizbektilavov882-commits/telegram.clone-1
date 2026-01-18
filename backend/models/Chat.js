const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'voice'],
    default: 'text'
  },
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  // Message Reactions
  reactions: [{
    emoji: {
      type: String,
      required: true
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    count: {
      type: Number,
      default: 0
    }
  }],
  // Message Forwarding
  forwardedFrom: {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat'
    },
    originalSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    originalDate: Date
  },
  // Message Pinning
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pinnedAt: Date,
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isGroup: {
    type: Boolean,
    default: false
  },
  groupName: String,
  groupAvatar: String,
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [messageSchema],
  lastMessage: {
    type: messageSchema,
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  // Pinned Messages
  pinnedMessages: [{
    type: mongoose.Schema.Types.ObjectId
  }],
  // Chat Theme
  theme: {
    type: String,
    enum: ['default', 'dark', 'blue', 'green', 'purple', 'red'],
    default: 'default'
  },
  // Typing Indicators
  typingUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    lastTyping: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Chat', chatSchema);