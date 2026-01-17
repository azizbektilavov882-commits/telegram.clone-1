const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// MongoDB connection
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  isOnline: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  await connectDB();

  const { httpMethod, path } = event;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    // Login endpoint
    if (httpMethod === 'POST' && path.includes('/login')) {
      const { username, password } = body;

      const user = await User.findOne({
        $or: [{ username }, { email: username }]
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: 'Invalid credentials' })
        };
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar
          }
        })
      };
    }

    // Register endpoint
    if (httpMethod === 'POST' && path.includes('/register')) {
      const { username, email, password, firstName, lastName } = body;

      const existingUser = await User.findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'User already exists' })
        };
      }

      const user = new User({
        username,
        email,
        password,
        firstName,
        lastName
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          token,
          user: {
            id: user._id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
          }
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Endpoint not found' })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};