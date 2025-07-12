const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const firebaseAuth = require('../middleware/firebaseAuth');

// @route   GET api/auth/test
// @desc    Test route to verify connections
// @access  Public
router.get('/test', async (req, res) => {
  try {
    res.json({ 
      message: 'Auth routes working!',
      timestamp: new Date().toISOString(),
      firebase_configured: true,
      mongo_configured: true
    });
  } catch (error) {
    console.error('Test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/register
// @desc    Register a new user (local auth)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User({
      email,
      password: await bcrypt.hash(password, 10),
      name,
      auth_provider: 'local'
    });

    await user.save();

    // Create JWT token
    const payload = {
      userId: user._id
    };

    const token = jwt.sign(payload, 'YOUR_JWT_SECRET_KEY', { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        auth_provider: user.auth_provider
      } 
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/login
// @desc    Login user (local auth)
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email, auth_provider: 'local' });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = {
      userId: user._id
    };

    const token = jwt.sign(payload, 'YOUR_JWT_SECRET_KEY', { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        auth_provider: user.auth_provider
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/auth/firebase
// @desc    Authenticate with Firebase token
// @access  Public
router.post('/firebase', firebaseAuth, async (req, res) => {
  try {
    // User is already authenticated and created/retrieved by middleware
    const user = req.user;
    
    // Create JWT token for our backend
    const payload = {
      userId: user._id
    };

    const token = jwt.sign(payload, 'YOUR_JWT_SECRET_KEY', { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        auth_provider: user.auth_provider,
        firebase_uid: user.firebase_uid
      } 
    });
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', firebaseAuth, async (req, res) => {
  try {
    const user = req.user;
    res.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        auth_provider: user.auth_provider,
        preferences: user.preferences
      } 
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
