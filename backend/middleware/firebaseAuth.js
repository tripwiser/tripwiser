const admin = require('../config/firebase');
const User = require('../models/userModel');

const firebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Find or create user in MongoDB
    let user = await User.findOne({ firebase_uid: decodedToken.uid });
    
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        name: decodedToken.name || decodedToken.email.split('@')[0],
        email: decodedToken.email,
        firebase_uid: decodedToken.uid,
        auth_provider: 'firebase'
      });
      await user.save();
    }
    
    req.user = user;
    req.firebaseUser = decodedToken;
    next();
  } catch (error) {
    console.error('Firebase Auth Error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = firebaseAuth; 