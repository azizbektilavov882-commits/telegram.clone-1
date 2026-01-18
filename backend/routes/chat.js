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

// Create group chat
router.post('/group', auth, async (req, res) => {
  try {
    const { groupName, participants } = req.body;

    if (!groupName || !participants || participants.length < 2) {
      return res.status(400).json({ 
        message: 'Group name and at least 2 participants required' 
      });
    }

    // Add creator to participants if not included
    const allParticipants = [...new Set([req.userId, ...participants])];

    const groupChat = new Chat({
      participants: allParticipants,
      isGroup: true,
      groupName,
      groupAdmin: req.userId,
      messages: [],
      lastActivity: new Date()
    });

    await groupChat.save();
    await groupChat.populate('participants', 'username firstName lastName avatar');

    res.json(groupChat);
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ message: 'Failed to create group' });
  }
});

// Add member to group
router.post('/:chatId/members', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (chat.groupAdmin.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only admin can add members' });
    }

    // Check if user is already a member
    if (chat.participants.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    chat.participants.push(userId);
    await chat.save();
    await chat.populate('participants', 'username firstName lastName avatar');

    res.json(chat);
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Failed to add member' });
  }
});

// Remove member from group
router.delete('/:chatId/members/:userId', auth, async (req, res) => {
  try {
    const { chatId, userId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin or removing themselves
    if (chat.groupAdmin.toString() !== req.userId && userId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    chat.participants = chat.participants.filter(p => p.toString() !== userId);
    
    // If admin leaves, assign new admin
    if (userId === chat.groupAdmin.toString() && chat.participants.length > 0) {
      chat.groupAdmin = chat.participants[0];
    }

    await chat.save();
    await chat.populate('participants', 'username firstName lastName avatar');

    res.json(chat);
  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Failed to remove member' });
  }
});

// Update group info
router.put('/:chatId/group', auth, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { groupName, groupAvatar } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin
    if (chat.groupAdmin.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only admin can update group info' });
    }

    if (groupName) chat.groupName = groupName;
    if (groupAvatar) chat.groupAvatar = groupAvatar;

    await chat.save();
    await chat.populate('participants', 'username firstName lastName avatar');

    res.json(chat);
  } catch (error) {
    console.error('Update group error:', error);
    res.status(500).json({ message: 'Failed to update group' });
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
      participants: { $all: [req.userId, userId] },
      isGroup: false
    })
      .populate('participants', 'username email phone')
      .populate('lastMessage');

    if (!chat) {
      chat = new Chat({
        participants: [req.userId, userId],
        isGroup: false,
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

// Add reaction to message
router.post('/:chatId/messages/:messageId/reactions', auth, async (req, res) => {
  try {
    const { emoji } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Find existing reaction with this emoji
    let reaction = message.reactions.find(r => r.emoji === emoji);
    
    if (reaction) {
      // Check if user already reacted with this emoji
      const userIndex = reaction.users.indexOf(req.userId);
      if (userIndex > -1) {
        // Remove reaction
        reaction.users.splice(userIndex, 1);
        reaction.count = reaction.users.length;
        if (reaction.count === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        // Add reaction
        reaction.users.push(req.userId);
        reaction.count = reaction.users.length;
      }
    } else {
      // Create new reaction
      message.reactions.push({
        emoji,
        users: [req.userId],
        count: 1
      });
    }

    await chat.save();
    res.json(message.reactions);
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({ message: 'Failed to add reaction' });
  }
});

// Pin/Unpin message
router.put('/:chatId/messages/:messageId/pin', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is admin (for groups) or participant
    if (chat.isGroup && chat.groupAdmin.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only admin can pin messages' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.isPinned) {
      // Unpin message
      message.isPinned = false;
      message.pinnedBy = undefined;
      message.pinnedAt = undefined;
      chat.pinnedMessages = chat.pinnedMessages.filter(id => !id.equals(message._id));
    } else {
      // Pin message
      message.isPinned = true;
      message.pinnedBy = req.userId;
      message.pinnedAt = new Date();
      chat.pinnedMessages.push(message._id);
    }

    await chat.save();
    res.json({ isPinned: message.isPinned, pinnedAt: message.pinnedAt });
  } catch (error) {
    console.error('Pin message error:', error);
    res.status(500).json({ message: 'Failed to pin message' });
  }
});

// Forward message
router.post('/:chatId/messages/:messageId/forward', auth, async (req, res) => {
  try {
    const { targetChatIds } = req.body;
    const sourceChat = await Chat.findById(req.params.chatId);

    if (!sourceChat) {
      return res.status(404).json({ message: 'Source chat not found' });
    }

    const originalMessage = sourceChat.messages.id(req.params.messageId);
    if (!originalMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const forwardedMessages = [];

    for (const targetChatId of targetChatIds) {
      const targetChat = await Chat.findById(targetChatId);
      if (!targetChat || !targetChat.participants.includes(req.userId)) {
        continue; // Skip if chat not found or user not participant
      }

      const forwardedMessage = {
        sender: req.userId,
        text: originalMessage.text,
        messageType: originalMessage.messageType,
        fileUrl: originalMessage.fileUrl,
        fileName: originalMessage.fileName,
        fileSize: originalMessage.fileSize,
        forwardedFrom: {
          chat: req.params.chatId,
          originalSender: originalMessage.sender,
          originalDate: originalMessage.createdAt
        },
        timestamp: new Date(),
        createdAt: new Date(),
        isRead: false,
        reactions: []
      };

      targetChat.messages.push(forwardedMessage);
      targetChat.lastMessage = forwardedMessage;
      targetChat.lastActivity = new Date();
      await targetChat.save();

      forwardedMessages.push({
        chatId: targetChatId,
        messageId: targetChat.messages[targetChat.messages.length - 1]._id
      });
    }

    res.json({ forwardedTo: forwardedMessages.length, messages: forwardedMessages });
  } catch (error) {
    console.error('Forward message error:', error);
    res.status(500).json({ message: 'Failed to forward message' });
  }
});

// Set typing status
router.post('/:chatId/typing', auth, async (req, res) => {
  try {
    const { isTyping } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (isTyping) {
      // Add or update typing status
      const existingTyping = chat.typingUsers.find(t => t.user.toString() === req.userId);
      if (existingTyping) {
        existingTyping.lastTyping = new Date();
      } else {
        chat.typingUsers.push({
          user: req.userId,
          lastTyping: new Date()
        });
      }
    } else {
      // Remove typing status
      chat.typingUsers = chat.typingUsers.filter(t => t.user.toString() !== req.userId);
    }

    await chat.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Set typing error:', error);
    res.status(500).json({ message: 'Failed to set typing status' });
  }
});

// Get pinned messages
router.get('/:chatId/pinned', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('messages.sender', 'username firstName lastName')
      .populate('messages.pinnedBy', 'username firstName lastName');

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const pinnedMessages = chat.messages.filter(msg => msg.isPinned);
    res.json(pinnedMessages);
  } catch (error) {
    console.error('Get pinned messages error:', error);
    res.status(500).json({ message: 'Failed to get pinned messages' });
  }
});

// Update chat theme
router.put('/:chatId/theme', auth, async (req, res) => {
  try {
    const { theme } = req.body;
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is participant
    if (!chat.participants.includes(req.userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    chat.theme = theme;
    await chat.save();

    res.json({ theme: chat.theme });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ message: 'Failed to update theme' });
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
