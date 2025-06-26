const mongoose = require('mongoose');

const packingListItemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['clothing', 'electronics', 'toiletries', 'accessories', 'documents', 'other']
  },
  quantity: {
    type: Number,
    default: 1
  },
  packed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String
  }
});

const packingListSchema = new mongoose.Schema({
  trip: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  items: [packingListItemSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PackingList', packingListSchema); 