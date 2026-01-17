const mongoose = require('mongoose');
require('dotenv').config();

async function resetAll() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-clone');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Drop all collections
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections`);
    
    for (const collection of collections) {
      await db.dropCollection(collection.name);
      console.log(`Dropped collection: ${collection.name}`);
    }

    console.log('\n✅ All data cleared!');
    console.log('\nNext steps:');
    console.log('1. Run: node create-test-users.js');
    console.log('2. Run: node create-test-chats.js');
    console.log('3. Login with: ali_dev / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAll();
