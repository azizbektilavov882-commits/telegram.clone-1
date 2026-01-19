const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Chat = require('./models/Chat');

async function createGroups() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ email: { $regex: '@test.com' } });
    console.log(`Found ${users.length} users`);

    // Clear existing groups
    await Chat.deleteMany({ isGroup: true });
    console.log('Cleared existing groups');

    // Create Developers Team
    const devGroup = new Chat({
      participants: [users[0]._id, users[1]._id, users[2]._id], // ali, vali, sardor
      isGroup: true,
      groupName: 'Developers Team',
      groupAdmin: users[0]._id, // ali_dev
      messages: [
        {
          sender: users[0]._id,
          text: 'Salom hammaga! Yangi loyiha ustida ishlaymiz.',
          createdAt: new Date(Date.now() - 7200000)
        },
        {
          sender: users[1]._id,
          text: 'Salom Ali! Qaysi texnologiyalardan foydalanamiz?',
          createdAt: new Date(Date.now() - 7100000)
        },
        {
          sender: users[2]._id,
          text: 'React va Node.js ishlatamizmi?',
          createdAt: new Date(Date.now() - 7000000)
        }
      ],
      lastActivity: new Date(Date.now() - 7000000)
    });

    // Set lastMessage
    devGroup.lastMessage = devGroup.messages[devGroup.messages.length - 1];
    await devGroup.save();
    console.log('Created: Developers Team');

    // Create General Chat
    const generalGroup = new Chat({
      participants: users.map(u => u._id), // All users
      isGroup: true,
      groupName: 'General Chat',
      groupAdmin: users[1]._id, // vali_user
      messages: [
        {
          sender: users[1]._id,
          text: 'Salom barchaga! Bu umumiy chat.',
          createdAt: new Date(Date.now() - 3600000)
        },
        {
          sender: users[4]._id,
          text: 'Hi everyone! Nice to meet you all.',
          createdAt: new Date(Date.now() - 3400000)
        }
      ],
      lastActivity: new Date(Date.now() - 3400000)
    });

    generalGroup.lastMessage = generalGroup.messages[generalGroup.messages.length - 1];
    await generalGroup.save();
    console.log('Created: General Chat');

    console.log('\n✅ Groups created successfully!');
    console.log('Login to see your groups!');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createGroups();