const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}


const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// API Routes - MUST come before static file serving
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);

// Serve frontend build if it exists
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');

if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));

  // Catch all handler: send back React's index.html file for any non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Telegram Clone API is running',
      note: 'Frontend build not found. Run "cd frontend && npm run build" to build the frontend.'
    });
  });
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-clone', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// MongoDB reconnection events
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

// Socket.io connection handling
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    activeUsers.set(userId, socket.id);
    socket.userId = userId;
    io.emit('userOnline', userId);
  });

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.userId} joined chat ${chatId}`);
  });

  socket.on('leaveChat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.userId} left chat ${chatId}`);
  });

  socket.on('sendMessage', (messageData) => {
    if (messageData.isGroup) {
      // Send to all participants in group chat
      socket.to(messageData.chatId).emit('newMessage', messageData);
    } else {
      // Send to specific recipient for 1-to-1 chat
      const recipientSocketId = activeUsers.get(messageData.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('newMessage', messageData);
      }
    }
    socket.emit('messageSent', messageData);
  });

  socket.on('typing', (data) => {
    if (data.isGroup) {
      // Broadcast typing to all group members except sender
      socket.to(data.chatId).emit('userTyping', {
        userId: socket.userId,
        isTyping: data.isTyping,
        chatId: data.chatId
      });
    } else {
      // Send typing to specific recipient
      const recipientSocketId = activeUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('userTyping', {
          userId: socket.userId,
          isTyping: data.isTyping
        });
      }
    }
  });

  socket.on('messageRead', (data) => {
    if (data.isGroup) {
      // Broadcast read receipt to all group members
      socket.to(data.chatId).emit('messageReadReceipt', {
        chatId: data.chatId,
        messageId: data.messageId,
        readBy: socket.userId
      });
    } else {
      // Send read receipt to message sender
      const senderSocketId = activeUsers.get(data.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('messageReadReceipt', {
          chatId: data.chatId,
          messageId: data.messageId
        });
      }
    }
  });

  // Message Reactions
  socket.on('messageReaction', (data) => {
    socket.to(data.chatId).emit('messageReactionUpdate', {
      chatId: data.chatId,
      messageId: data.messageId,
      reactions: data.reactions,
      userId: socket.userId
    });
  });

  // Message Pinning
  socket.on('messagePin', (data) => {
    socket.to(data.chatId).emit('messagePinUpdate', {
      chatId: data.chatId,
      messageId: data.messageId,
      isPinned: data.isPinned,
      pinnedBy: socket.userId
    });
  });

  // Message Forwarding
  socket.on('messageForward', (data) => {
    data.targetChatIds.forEach(chatId => {
      socket.to(chatId).emit('newMessage', {
        ...data.message,
        chatId: chatId
      });
    });
  });

  // Online Status Update
  socket.on('statusUpdate', (data) => {
    io.emit('userStatusUpdate', {
      userId: socket.userId,
      onlineStatus: data.onlineStatus,
      lastSeen: new Date()
    });
  });

  // Chat Theme Update
  socket.on('themeUpdate', (data) => {
    socket.to(data.chatId).emit('chatThemeUpdate', {
      chatId: data.chatId,
      theme: data.theme,
      updatedBy: socket.userId
    });
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      activeUsers.delete(socket.userId);
      io.emit('userOffline', socket.userId);
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


  



