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
    const userId = req.user.id; // Assuming auth middleware adds user to req

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
            notes: item.notes
          });
        });
      }
    }

    // 5. Create and save the new packing list
    const newPackingList = new PackingList({
      trip: newTrip._id,
      items: packingListItems,
    });
    await newPackingList.save();

    res.status(201).json(newPackingList);
  } catch (error) {
    console.error('Error generating packing list:', error);
    res.status(500).json({ message: 'Failed to generate packing list', error: error.message });
  }
};

module.exports = {
  generatePackingList,
};
