const mongoose = require('mongoose');
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

const User = mongoose.models.User || mongoose.model('User', userSchema);

// Auth middleware
const authenticate = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  await connectDB();

  const { httpMethod, path, queryStringParameters } = event;
  const body = event.body ? JSON.parse(event.body) : {};
  const token = event.headers.authorization?.replace('Bearer ', '');
  
  const userId = authenticate(token);
  if (!userId) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ message: 'Unauthorized' })
    };
  }

  try {
    // Search users
    if (httpMethod === 'GET' && path.includes('/search')) {
      const { q } = queryStringParameters || {};
      
      if (!q) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Search query required' })
        };
      }

      const users = await User.find({
        $and: [
          { _id: { $ne: userId } },
          {
            $or: [
              { username: { $regex: q, $options: 'i' } },
              { firstName: { $regex: q, $options: 'i' } },
              { lastName: { $regex: q, $options: 'i' } },
              { email: { $regex: q, $options: 'i' } }
            ]
          }
        ]
      })
      .select('username firstName lastName avatar isOnline lastSeen')
      .limit(20);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(users)
      };
    }

    // Get user profile
    if (httpMethod === 'GET' && path.includes('/profile')) {
      const user = await User.findById(userId)
        .select('-password');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user)
      };
    }

    // Update profile
    if (httpMethod === 'PUT' && path.includes('/profile')) {
      const { firstName, lastName, bio, avatar } = body;

      const user = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName, bio, avatar },
        { new: true }
      ).select('-password');

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(user)
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