const mongoose = require('mongoose');

const journalEntrySchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  title: { type: String },
  text: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Journal', journalEntrySchema); 