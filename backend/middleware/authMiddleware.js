const jwt = require('jsonwebtoken');

// Import User model conditionally for local development
let User;
try {
  User = require('../models/userModel');
} catch (error) {
  console.log('User model not available, using mock auth');
}

const authMiddleware = async (req, res, next) => {
  try {
    // For local development, skip authentication entirely
    if (process.env.NODE_ENV !== 'production' || !User) {
      req.user = { _id: 'test-user-id', email: 'test@example.com' };
      return next();
    }

    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'YOUR_JWT_SECRET_KEY');
    
    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
