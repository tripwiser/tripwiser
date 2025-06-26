const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: String,
    required: [true, 'Please provide a destination']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date']
  },
  tripType: {
    type: String,
    enum: ['beach', 'hiking', 'business', 'family', 'other'],
    default: 'other'
  },
  specialRequests: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Trip', tripSchema); 