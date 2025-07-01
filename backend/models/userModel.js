const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false // Optional for Firebase Auth users
  },
  firebase_uid: {
    type: String,
    required: false,
    unique: true,
    sparse: true // Allows multiple null values
  },
  auth_provider: {
    type: String,
    enum: ['local', 'firebase'],
    default: 'local'
  },
  preferences: {
    type: String,
    default: ''
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
userSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
