const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Chat = require('./models/Chat');

async function createValiAliChat() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-clone');
    console.log('Connected to MongoDB');

    // Find vali_user and ali_dev
    const vali = await User.findOne({ username: 'vali_user' });
    const ali = await User.findOne({ username: 'ali_dev' });

    if (!vali || !ali) {
      console.log('Users not found!');
      console.log('vali_user:', vali ? 'Found' : 'Not found');
      console.log('ali_dev:', ali ? 'Found' : 'Not found');
      process.exit(1);
    }

    console.log(`Found users: ${vali.username} and ${ali.username}`);

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      participants: { $all: [vali._id, ali._id] }
    });

    if (existingChat) {
      console.log('Chat already exists between vali_user and ali_dev!');
      console.log(`Chat ID: ${existingChat._id}`);
      process.exit(0);
    }

    // Create new chat with messages
    const messages = [
      {
        sender: vali._id,
        text: 'Salom Ali! Qalaysan?',
        createdAt: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        sender: ali._id,
        text: 'Salom Vali! Yaxshi, rahmat. Sen-chi?',
        createdAt: new Date(Date.now() - 3500000)
      },
      {
        sender: vali._id,
        text: 'Men ham yaxshi. Bugun ishlar qanday?',
        createdAt: new Date(Date.now() - 3400000)
      },
      {
        sender: ali._id,
        text: 'Yaxshi ketayapti. Yangi loyiha ustida ishlayapman.',
        createdAt: new Date(Date.now() - 1800000) // 30 min ago
      },
      {
        sender: vali._id,
        text: 'Ajoyib! Qaysi texnologiyalardan foydalanyapsan?',
        createdAt: new Date(Date.now() - 1700000)
      },
      {
        sender: ali._id,
        text: 'React, Node.js va MongoDB. Socket.io ham qo\'shyapman.',
        createdAt: new Date(Date.now() - 600000) // 10 min ago
      }
    ];

    const lastMessage = messages[messages.length - 1];

    const chat = new Chat({
      participants: [vali._id, ali._id],
      messages: messages,
      lastMessage: lastMessage,
      lastActivity: lastMessage.createdAt
    });

    await chat.save();

    console.log('\n✅ Chat created successfully!');
    console.log(`\nChat between: ${vali.username} <-> ${ali.username}`);
    console.log(`Messages: ${messages.length}`);
    console.log(`Chat ID: ${chat._id}`);
    console.log('\nMessages:');
    messages.forEach((msg, i) => {
      const sender = msg.sender.equals(vali._id) ? 'Vali' : 'Ali';
      console.log(`${i + 1}. ${sender}: ${msg.text}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating chat:', error);
    process.exit(1);
  }
}

createValiAliChat();
