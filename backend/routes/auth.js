const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Build query conditions - only check fields that are provided
    const conditions = [{ username }];
    
    if (email) {
      conditions.push({ email });
    }
    
    if (phone) {
      conditions.push({ phone });
    }

    const existingUser = await User.findOne({
      $or: conditions
    });

    if (existingUser) {
      // Determine which field is duplicate
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      if (phone && existingUser.phone === phone) {
        return res.status(400).json({ message: 'Phone number already exists' });
      }
      return res.status(400).json({ message: 'User already exists' });
    }

    // Don't hash password here - User model's pre-save hook will do it
    const user = new User({
      username,
      email,
      phone: phone || undefined,
      password // Plain password - will be hashed by pre-save hook
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    
    console.log('Login attempt:', { emailOrPhone, password: password ? '***' : 'missing' });

    if (!emailOrPhone || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ message: 'Email/Phone and password required' });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }, { username: emailOrPhone }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

module.exports = router;
