const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mp3|wav/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get all chats for user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.userId
    })
      .populate('participants', 'username email phone firstName lastName')
      .populate('messages.sender', 'username firstName lastName')
      .sort({ lastActivity: -1 });

    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
});

// Get or create chat with user
router.post('/with/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.userId === userId) {
      return res.status(400).json({ message: 'Cannot chat with yourself' });
    }

    let chat = await Chat.findOne({
      participants: { $all: [req.userId, userId] }
    })
      .populate('participants', 'username email phone')
      .populate('lastMessage');

    if (!chat) {
      chat = new Chat({
        participants: [req.userId, userId],
        messages: []
      });
      await chat.save();
      await chat.populate('participants', 'username email phone');
    }

    res.json(chat);
  } catch (error) {
    console.error('Get/create chat error:', error);
    res.status(500).json({ message: 'Failed to get chat' });
  }
});

// Get chat messages
router.get('/:chatId/messages', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('messages.sender', 'username firstName lastName email');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Filter out deleted messages
    const activeMessages = chat.messages.filter(msg => !msg.isDeleted);
    res.json(activeMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// Send message
router.post('/:chatId/messages', auth, async (req, res) => {
  try {
    const { text, messageType = 'text' } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = {
      sender: req.userId,
      text: text || '',
      messageType,
      timestamp: new Date(),
      createdAt: new Date(),
      isRead: false
    };

    chat.messages.push(message);
    chat.lastMessage = message;
    chat.lastActivity = new Date();
    await chat.save();
    
    await chat.populate('messages.sender', 'username firstName lastName email');
    const populatedMessage = chat.messages[chat.messages.length - 1];

    res.json(populatedMessage);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Upload file
router.post('/:chatId/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = {
      sender: req.userId,
      text: req.file.originalname,
      messageType: 'file',
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      timestamp: new Date(),
      isRead: false
    };

    chat.messages.push(message);
    chat.lastMessage = message;
    chat.lastActivity = new Date();
    await chat.save();
    
    await chat.populate('messages.sender', 'username firstName lastName email');
    const populatedMessage = chat.messages[chat.messages.length - 1];

    res.json(populatedMessage);
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// Edit message
router.put('/:chatId/messages/:messageId', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to edit this message' });
    }

    message.text = text;
    message.edited = true;
    message.editedAt = new Date();
    await chat.save();

    res.json(message);
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({ message: 'Failed to edit message' });
  }
});

// Delete message
router.delete('/:chatId/messages/:messageId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    // Delete file if exists
    if (message.fileUrl) {
      const filePath = path.join(__dirname, '..', message.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    message.remove();
    await chat.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

// Mark messages as read
router.put('/:chatId/read', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Mark all unread messages as read for this user
    let updated = false;
    chat.messages.forEach(message => {
      if (message.sender.toString() !== req.userId) {
        const alreadyRead = message.readBy.some(read => 
          read.user.toString() === req.userId
        );
        if (!alreadyRead) {
          message.readBy.push({
            user: req.userId,
            readAt: new Date()
          });
          updated = true;
        }
      }
    });

    if (updated) {
      await chat.save();
    }

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Failed to mark messages as read' });
  }
});

// Mark message as read
router.put('/:chatId/messages/:messageId/read', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (message && message.sender.toString() !== req.userId) {
      const alreadyRead = message.readBy.some(read => 
        read.user.toString() === req.userId
      );
      if (!alreadyRead) {
        message.readBy.push({
          user: req.userId,
          readAt: new Date()
        });
        await chat.save();
      }
    }

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Failed to mark message as read' });
  }
});

// Search messages
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const chats = await Chat.find({
      participants: req.userId,
      'messages.text': { $regex: q, $options: 'i' }
    })
      .populate('participants', 'username email phone')
      .populate('messages.sender', 'username firstName lastName');

    const results = chats.map(chat => ({
      chat,
      messages: chat.messages.filter(msg => 
        msg.text.toLowerCase().includes(q.toLowerCase())
      )
    }));

    res.json(results);
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

module.exports = router;
