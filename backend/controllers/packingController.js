const Trip = require('../models/tripModel');
const PackingList = require('../models/packingListModel');
const weatherService = require('../services/weatherService');
const ollamaService = require('../services/ollamaService');

/**
 * Generate a new packing list for a trip.
 */
const generatePackingList = async (req, res) => {
  try {
    const { destination, startDate, endDate, tripType, specialRequests } = req.body;
    const userId = req.user._id; // Assuming auth middleware adds user to req

    // 1. Create and save the new trip
    const newTrip = new Trip({
      user: userId,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      tripType,
      specialRequests
    });
    await newTrip.save();

    // 2. Fetch weather data
    const weatherData = await weatherService.getWeather(destination);

    // 3. Generate packing list with Ollama
    const generatedList = await ollamaService.generatePackingList(newTrip, weatherData);

    // 4. Transform the AI response into our packing list item schema
    const packingListItems = [];
    for (const category in generatedList) {
      if (Array.isArray(generatedList[category])) {
        generatedList[category].forEach(item => {
          packingListItems.push({
            itemName: item.itemName,
            category: category,
            quantity: item.quantity,
            notes: item.notes,
            packed: false
          });
        });
      }
    }

    // 5. Create and save the new packing list
    const newPackingList = new PackingList({
      trip: newTrip._id,
      items: packingListItems
    });
    await newPackingList.save();

    res.status(201).json({ trip: newTrip, packingList: newPackingList });
  } catch (error) {
    console.error('Generate packing list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Generate a travel tip using Ollama based on context.
 */
const generateTravelTip = async (req, res) => {
  try {
    console.log('generateTravelTip endpoint hit. Body:', req.body);
    const { destination, packing, weather, culture, safety } = req.body;
    const tip = await ollamaService.generateTravelTip({ destination, packing, weather, culture, safety });
    res.status(200).json({ tip });
  } catch (error) {
    console.error('Error generating travel tip:', error);
    res.status(500).json({ message: 'Failed to generate travel tip', error: error.message });
  }
};

module.exports = {
  generatePackingList,
  generateTravelTip,
};
