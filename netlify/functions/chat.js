const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// MongoDB connection
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Chat Schema
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  messages: [messageSchema],
  lastMessage: { type: messageSchema, default: null },
  lastActivity: { type: Date, default: Date.now }
}, { timestamps: true });

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);
const User = mongoose.models.User || mongoose.model('User', require('./auth').userSchema);

// Auth middleware
const authenticate = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  await connectDB();

  const { httpMethod, path } = event;
  const body = event.body ? JSON.parse(event.body) : {};
  const token = event.headers.authorization?.replace('Bearer ', '');
  
  const userId = authenticate(token);
  if (!userId) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ message: 'Unauthorized' })
    };
  }

  try {
    // Get chats
    if (httpMethod === 'GET' && path.includes('/chats')) {
      const chats = await Chat.find({
        participants: userId
      })
      .populate('participants', 'username firstName lastName avatar isOnline')
      .populate('lastMessage.sender', 'username firstName lastName')
      .sort({ lastActivity: -1 });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(chats)
      };
    }

    // Send message
    if (httpMethod === 'POST' && path.includes('/send')) {
      const { recipientId, text, messageType = 'text' } = body;

      let chat = await Chat.findOne({
        participants: { $all: [userId, recipientId] }
      });

      if (!chat) {
        chat = new Chat({
          participants: [userId, recipientId],
          messages: []
        });
      }

      const newMessage = {
        sender: userId,
        text,
        messageType,
        readBy: [{ user: userId }]
      };

      chat.messages.push(newMessage);
      chat.lastMessage = newMessage;
      chat.lastActivity = new Date();

      await chat.save();

      const populatedChat = await Chat.findById(chat._id)
        .populate('participants', 'username firstName lastName avatar')
        .populate('messages.sender', 'username firstName lastName');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Message sent successfully',
          chat: populatedChat
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Endpoint not found' })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};