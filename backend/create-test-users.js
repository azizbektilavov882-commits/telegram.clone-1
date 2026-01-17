const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const testUsers = [
  {
    username: 'ali_dev',
    email: 'ali@test.com',
    phone: '+998901234567',
    password: 'password123',
    firstName: 'Ali',
    lastName: 'Valiyev'
  },
  {
    username: 'vali_user',
    email: 'vali@test.com',
    phone: '+998901234568',
    password: 'password123',
    firstName: 'Vali',
    lastName: 'Aliyev'
  },
  {
    username: 'sardor_test',
    email: 'sardor@test.com',
    phone: '+998901234569',
    password: 'password123',
    firstName: 'Sardor',
    lastName: 'Karimov'
  },
  {
    username: 'aziz_admin',
    email: 'aziz@test.com',
    phone: '+998901234570',
    password: 'password123',
    firstName: 'Aziz',
    lastName: 'Rahimov'
  },
  {
    username: 'john_doe',
    email: 'john@test.com',
    phone: '+998901234571',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe'
  }
];

async function createTestUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/telegram-clone');
    console.log('Connected to MongoDB');

    // Clear existing test users
    await User.deleteMany({ email: { $regex: '@test.com$' } });
    console.log('Cleared existing test users');

    // Create new test users
    for (const userData of testUsers) {
      // Don't hash password here - let the User model's pre-save hook do it
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${userData.username} (${userData.email})`);
    }

    console.log('\n✅ Test users created successfully!\n');
    console.log('=== LOGIN CREDENTIALS ===\n');
    
    testUsers.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Phone: ${user.phone}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}\n`);
    });

    console.log('You can login with any of these credentials!');
    console.log('Use username, email, or phone number to login.\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

createTestUsers();
