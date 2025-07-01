const mongoose = require('mongoose');

const packingHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: String,
  travelDuration: Number,
  preferences: String,
  packingList: [String], // Store packing list as an array of strings (items)
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PackingHistory', packingHistorySchema);
