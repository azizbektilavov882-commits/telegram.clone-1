const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Chat = require('./models/Chat');

async function checkData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log(`Total users: ${users.length}`);
    users.forEach(user => {
      console.log(`- ${user.username} (${user.email})`);
    });

    const chats = await Chat.find({});
    console.log(`\nTotal chats: ${chats.length}`);
    chats.forEach(chat => {
      console.log(`- ${chat.isGroup ? 'Group' : 'Chat'}: ${chat.groupName || 'Private'} (${chat.participants.length} participants)`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkData();