const { getOpenRouterSummary } = require('../services/openrouterService');
const Trip = require('../models/tripModel');
const PackingList = require('../models/packingListModel');
const Journal = require('../models/journalModel');

// Summarize trip (itinerary, packing, journal)
exports.summarizeTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    // Fetch trip
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    // Fetch packing list
    const packingList = await PackingList.findOne({ tripId });
    // Fetch journal entries
    const journalEntries = await Journal.find({ tripId });

    // Build prompt
    let prompt = `Summarize this trip for a user in a friendly, concise way.\n`;
    prompt += `Trip: ${trip.name} to ${trip.destination} from ${trip.startDate} to ${trip.endDate}.\n`;
    if (trip.itinerary && trip.itinerary.days) {
      prompt += `Itinerary: ` + trip.itinerary.days.map(day => `\n${day.label}: ` + day.items.map(item => `${item.time} - ${item.title} (${item.location || ''})`).join('; ')).join(' ');
    }
    if (packingList && packingList.items) {
      prompt += `\nPacking List: ` + packingList.items.map(item => item.name).join(', ');
    }
    if (journalEntries && journalEntries.length > 0) {
      prompt += `\nJournal Highlights: ` + journalEntries.map(entry => entry.text || entry.title).join(' | ');
    }
    prompt += `\nGive a summary that covers the highlights, what was packed, and any journaled memories.`;

    // Call OpenRouter
    const summary = await getOpenRouterSummary(prompt);
    res.json({ summary });
  } catch (error) {
    console.error('Trip summary error:', error);
    res.status(500).json({ error: 'Failed to summarize trip' });
  }
};
