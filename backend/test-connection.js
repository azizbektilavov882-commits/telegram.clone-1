const mongoose = require('mongoose');
require('dotenv').config();

console.log('Starting connection test...');
console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-clone')
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });