const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/userModel');
const { summarizeTrip } = require('../controllers/userController');

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    // Get user from database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Mock user lookup and update
    const userIndex = mockUsers.findIndex(u => u._id === req.user._id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) mockUsers[userIndex].name = name;
    if (email) mockUsers[userIndex].email = email;

    res.json({ user: { id: mockUsers[userIndex]._id, email: mockUsers[userIndex].email, name: mockUsers[userIndex].name } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/trip/:tripId/summary', summarizeTrip);

module.exports = router;
