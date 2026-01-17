const mongoose = require('mongoose');
require('dotenv').config();

async function fixAllIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-clone');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all indexes
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop problematic indexes
    const indexesToDrop = ['phone_1', 'phoneNumber_1'];
    
    for (const indexName of indexesToDrop) {
      try {
        await usersCollection.dropIndex(indexName);
        console.log(`Dropped ${indexName} index`);
      } catch (error) {
        console.log(`${indexName} index does not exist or already dropped`);
      }
    }

    // Create new sparse indexes
    await usersCollection.createIndex({ phone: 1 }, { unique: true, sparse: true });
    console.log('Created new sparse phone index');

    // Remove users with null phone (if any duplicates exist)
    const result = await usersCollection.deleteMany({ 
      $or: [
        { phone: null },
        { phoneNumber: null }
      ]
    });
    console.log(`Removed ${result.deletedCount} users with null phone`);

    console.log('\n✅ All indexes fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
}

fixAllIndexes();
