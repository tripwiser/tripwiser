const express = require('express');
const router = express.Router();
const { generateDestinationRecommendations, generateItinerary } = require('../services/ollamaService');
const { getUnsplashImage } = require('../services/unsplashService');

// POST /api/ai/recommend-destinations
router.post('/recommend-destinations', async (req, res) => {
  console.log('POST /api/ai/recommend-destinations called. Body:', req.body);
  try {
    const { prompt, preferences } = req.body;
    
    console.log('Received destination recommendation request:', { prompt, preferences });
    
    // If we have detailed preferences, use them; otherwise, use the prompt
    const userPreferences = preferences || {
      likes: prompt || 'Not specified',
      dislikes: 'Not specified',
      budget: 'Not specified',
      tripType: 'Not specified',
      duration: 'Not specified',
      interests: 'Not specified',
      climate: 'Not specified'
    };

    // Generate recommendations using OpenRouter AI
    const recommendations = await generateDestinationRecommendations(userPreferences);
    
    // Fetch images for each destination using Unsplash
    const enrichedDestinations = await Promise.all(
      (recommendations.destinations || []).map(async (dest) => {
        // Clean up the name for Unsplash search
        let searchName = dest.name;
        if (searchName.includes(',')) {
          searchName = searchName.split(',')[0].trim();
        }
        // Remove common suffixes that might interfere with search
        searchName = searchName.replace(/\s+(Country|City|Town|Village|State|Province|Region)$/i, '').trim();
        
        console.log(`Searching Unsplash for: "${searchName}" (original: "${dest.name}")`);
        const imageUrl = await getUnsplashImage(searchName);
        console.log(`Enriching destination ${dest.name} with imageUrl:`, imageUrl);
        // Ensure we always have a valid imageUrl
        const finalImageUrl = imageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
        console.log('Final image URL for', dest.name, ':', finalImageUrl);
        return { ...dest, imageUrl: finalImageUrl };
      })
    );

    console.log('Sending enriched destinations:', enrichedDestinations);
    
    res.json({
      success: true,
      destinations: enrichedDestinations,
      promptReceived: prompt,
      preferencesUsed: userPreferences
    });
    
  } catch (error) {
    console.error('Error generating destination recommendations:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to generate destination recommendations'
    });
  }
});

// POST /api/ai/itinerary
router.post('/itinerary', async (req, res) => {
  console.log('POST /api/ai/itinerary called. Body:', req.body);
  try {
    const { tripName, destination, startDate, endDate } = req.body;
    if (!tripName || !destination || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Missing required trip info.' });
    }
    const itinerary = await generateItinerary({ tripName, destination, startDate, endDate });
    res.json({ success: true, itinerary });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ success: false, error: error.message, message: 'Failed to generate itinerary' });
  }
});

module.exports = router; 