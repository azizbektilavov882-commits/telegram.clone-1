const mongoose = require('mongoose');
require('dotenv').config();

async function fixPhoneIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-clone');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Drop the old phone index
    try {
      await usersCollection.dropIndex('phone_1');
      console.log('Dropped old phone_1 index');
    } catch (error) {
      console.log('phone_1 index does not exist or already dropped');
    }

    // Create new sparse index
    await usersCollection.createIndex({ phone: 1 }, { unique: true, sparse: true });
    console.log('Created new sparse phone index');

    // Remove users with null phone (if any duplicates exist)
    const result = await usersCollection.deleteMany({ phone: null });
    console.log(`Removed ${result.deletedCount} users with null phone`);

    console.log('Phone index fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing phone index:', error);
    process.exit(1);
  }
}

fixPhoneIndex();
