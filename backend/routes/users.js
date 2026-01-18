const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.userId } },
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { phone: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
      .select('_id username email phone')
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
});

// Get user by ID
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, bio } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { firstName, lastName, bio },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Update online status
router.put('/status', auth, async (req, res) => {
  try {
    const { onlineStatus } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        onlineStatus,
        isOnline: onlineStatus === 'online',
        lastSeen: new Date()
      },
      { new: true }
    ).select('onlineStatus isOnline lastSeen');

    res.json(user);
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { theme, language, notifications } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { 
        'preferences.theme': theme,
        'preferences.language': language,
        'preferences.notifications': notifications
      },
      { new: true }
    ).select('preferences');

    res.json(user.preferences);
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Failed to update preferences' });
  }
});

// Get online users
router.get('/online/list', auth, async (req, res) => {
  try {
    const onlineUsers = await User.find({
      isOnline: true,
      _id: { $ne: req.userId }
    }).select('_id username firstName lastName onlineStatus lastSeen');

    res.json(onlineUsers);
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({ message: 'Failed to get online users' });
  }
});

module.exports = router;
