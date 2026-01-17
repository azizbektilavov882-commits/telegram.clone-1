const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Chat = require('./models/Chat');

async function createTestChats() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-clone');
    console.log('Connected to MongoDB');

    // Get all test users
    const users = await User.find({ email: { $regex: '@test.com$' } });
    
    if (users.length < 2) {
      console.log('Not enough users found. Please run create-test-users.js first.');
      process.exit(1);
    }

    console.log(`Found ${users.length} test users`);

    // Clear existing test chats
    await Chat.deleteMany({
      participants: { $in: users.map(u => u._id) }
    });
    console.log('Cleared existing test chats');

    // Create chats between users
    const chatsToCreate = [
      {
        participants: [users[0]._id, users[1]._id], // ali_dev <-> vali_user
        messages: [
          {
            sender: users[0]._id,
            text: 'Salom Vali! Qalaysan?',
            createdAt: new Date(Date.now() - 3600000) // 1 hour ago
          },
          {
            sender: users[1]._id,
            text: 'Salom Ali! Yaxshi, rahmat. Sen-chi?',
            createdAt: new Date(Date.now() - 3500000)
          },
          {
            sender: users[0]._id,
            text: 'Men ham yaxshi. Bugun ishlar qanday?',
            createdAt: new Date(Date.now() - 3400000)
          },
          {
            sender: users[1]._id,
            text: 'Yaxshi ketayapti. Yangi loyiha ustida ishlayapman.',
            createdAt: new Date(Date.now() - 1800000) // 30 min ago
          }
        ]
      },
      {
        participants: [users[0]._id, users[2]._id], // ali_dev <-> sardor_test
        messages: [
          {
            sender: users[2]._id,
            text: 'Ali, ertaga uchrashuv bormi?',
            createdAt: new Date(Date.now() - 7200000) // 2 hours ago
          },
          {
            sender: users[0]._id,
            text: 'Ha, soat 10:00 da.',
            createdAt: new Date(Date.now() - 7100000)
          },
          {
            sender: users[2]._id,
            text: 'Yaxshi, kelaman.',
            createdAt: new Date(Date.now() - 600000) // 10 min ago
          }
        ]
      },
      {
        participants: [users[1]._id, users[2]._id], // vali_user <-> sardor_test
        messages: [
          {
            sender: users[1]._id,
            text: 'Sardor, kod review qildingmi?',
            createdAt: new Date(Date.now() - 5400000) // 1.5 hours ago
          },
          {
            sender: users[2]._id,
            text: 'Ha, bir nechta comment qoldirdim.',
            createdAt: new Date(Date.now() - 5300000)
          }
        ]
      },
      {
        participants: [users[0]._id, users[3]._id], // ali_dev <-> aziz_admin
        messages: [
          {
            sender: users[3]._id,
            text: 'Ali, yangi feature tayyor bo\'ldimi?',
            createdAt: new Date(Date.now() - 10800000) // 3 hours ago
          },
          {
            sender: users[0]._id,
            text: 'Deyarli tayyor. Bugun deploy qilaman.',
            createdAt: new Date(Date.now() - 10700000)
          },
          {
            sender: users[3]._id,
            text: 'Ajoyib! Testing uchun link yubor.',
            createdAt: new Date(Date.now() - 300000) // 5 min ago
          }
        ]
      },
      {
        participants: [users[1]._id, users[4]._id], // vali_user <-> john_doe
        messages: [
          {
            sender: users[4]._id,
            text: 'Hi Vali! How are you?',
            createdAt: new Date(Date.now() - 14400000) // 4 hours ago
          },
          {
            sender: users[1]._id,
            text: 'Hi John! I\'m good, thanks. Working on the new project.',
            createdAt: new Date(Date.now() - 14300000)
          },
          {
            sender: users[4]._id,
            text: 'Great! Let me know if you need any help.',
            createdAt: new Date(Date.now() - 14200000)
          }
        ]
      }
    ];

    // Create chats
    for (const chatData of chatsToCreate) {
      const lastMessage = chatData.messages[chatData.messages.length - 1];
      const chat = new Chat({
        participants: chatData.participants,
        messages: chatData.messages,
        lastMessage: lastMessage,
        lastActivity: lastMessage.createdAt
      });
      await chat.save();
      
      const user1 = users.find(u => u._id.equals(chatData.participants[0]));
      const user2 = users.find(u => u._id.equals(chatData.participants[1]));
      console.log(`Created chat: ${user1.username} <-> ${user2.username} (${chatData.messages.length} messages)`);
    }

    console.log('\n✅ Test chats created successfully!\n');
    console.log('=== CREATED CHATS ===\n');
    console.log('1. ali_dev <-> vali_user (4 messages)');
    console.log('2. ali_dev <-> sardor_test (3 messages)');
    console.log('3. vali_user <-> sardor_test (2 messages)');
    console.log('4. ali_dev <-> aziz_admin (3 messages)');
    console.log('5. vali_user <-> john_doe (3 messages)\n');
    console.log('Login with any user to see their chats!');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test chats:', error);
    process.exit(1);
  }
}

createTestChats();
