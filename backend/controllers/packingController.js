// Import models conditionally for local development
let Trip, PackingList;
try {
  Trip = require('../models/tripModel');
  PackingList = require('../models/packingListModel');
} catch (error) {
  console.log('MongoDB models not available, using mock data');
}

const weatherService = require('../services/weatherService');
const ollamaService = require('../services/ollamaService');

/**
 * Generate a new packing list for a trip.
 */
const generatePackingList = async (req, res) => {
  try {
    console.log('Received request body:', req.body);
    const { destination, startDate, endDate, tripType, specialRequests } = req.body;
    const userId = req.user ? req.user._id : 'test-user-id'; // Handle case when auth is disabled

    console.log('Extracted values:', { destination, startDate, endDate, tripType, specialRequests });

    // Validate required fields
    if (!destination || !startDate || !endDate) {
      console.log('Missing required fields:', { destination, startDate, endDate });
      return res.status(400).json({ 
        message: 'Missing required fields: destination, startDate, and endDate are required' 
      });
    }

    // 2. Fetch weather data
    const weatherData = await weatherService.getWeather(destination);

    // 3. Generate packing list with Ollama
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    // Validate that dates are valid
    if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
      return res.status(400).json({ 
        message: 'Invalid date format provided' 
      });
    }
    
    const tripData = {
      destination,
      startDate: startDateObj,
      endDate: endDateObj,
      tripType: tripType || 'other',
      specialRequests: specialRequests || ''
    };
    
    console.log('tripData being passed to ollamaService:', tripData);
    console.log('tripData.startDate instanceof Date:', tripData.startDate instanceof Date);
    console.log('tripData.endDate instanceof Date:', tripData.endDate instanceof Date);
    
    const generatedList = await ollamaService.generatePackingList(tripData, weatherData);

    // 4. Transform the AI response into our packing list item schema
    const packingListItems = [];
    for (const category in generatedList) {
      if (Array.isArray(generatedList[category])) {
        generatedList[category].forEach((item, index) => {
          packingListItems.push({
            id: `${category}-${index}`,
            name: item.itemName || item.name || '', // Map to 'name' for frontend compatibility
            category: category,
            packed: false, // Default to not packed
            essential: false, // Default to not essential
            customAdded: false, // Default to not custom added
            quantity: item.quantity || '',
            notes: item.notes || ''
          });
        });
      }
    }

    // 5. Create response (skip database save for local development)
    const mockTrip = {
      _id: 'mock-trip-id',
      user: userId,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      tripType,
      specialRequests
    };

    const mockPackingList = {
      _id: 'mock-packing-list-id',
      trip: mockTrip._id,
      items: packingListItems
    };

    // Log the full API response for debugging
    console.log('PackingList API response:', JSON.stringify({ trip: mockTrip, packingList: mockPackingList }, null, 2));

    res.status(201).json({ trip: mockTrip, packingList: mockPackingList });
  } catch (error) {
    console.error('Generate packing list error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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
