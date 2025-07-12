const Trip = require('../models/tripModel');
const { getDestinationImage } = require('../services/pexelsService');
// const openrouterAI = require('../services/ollamaService'); // For AI integration

// Get trending destinations (static 2025 mock data)
exports.getTrendingDestinations = async (req, res) => {
  const destinations = [
    { name: 'Kyoto, Japan', description: 'Timeless temples, cherry blossoms, and rich culture.' },
    { name: 'Reykjavik, Iceland', description: 'Northern lights, geothermal spas, and dramatic landscapes.' },
    { name: 'Marrakech, Morocco', description: 'Vibrant souks, palaces, and desert adventures.' },
    { name: 'Queenstown, New Zealand', description: 'Adventure capital with stunning lakes and mountains.' },
    { name: 'Santorini, Greece', description: 'Iconic white-washed villages and breathtaking sunsets.' },
    { name: 'Banff, Canada', description: 'Majestic mountains, turquoise lakes, and wildlife.' },
    { name: 'Seoul, South Korea', description: 'Futuristic cityscapes, K-culture, and street food.' },
    { name: 'Cape Town, South Africa', description: 'Table Mountain, beaches, and diverse culture.' },
    { name: 'Cusco, Peru', description: 'Gateway to Machu Picchu and Incan heritage.' },
    { name: 'Dubrovnik, Croatia', description: 'Medieval walls, Adriatic views, and Game of Thrones fame.' },
    { name: 'Sydney, Australia', description: 'Opera House, beaches, and vibrant city life.' },
    { name: 'Rome, Italy', description: 'Ancient ruins, art, and world-class cuisine.' },
    { name: 'Buenos Aires, Argentina', description: 'Tango, steak, and European charm.' },
    { name: 'Vancouver, Canada', description: 'Urban sophistication meets natural beauty.' },
    { name: 'Petra, Jordan', description: 'Ancient rock-cut architecture and desert wonders.' },
  ];
  const trending = await Promise.all(destinations.map(async (dest, i) => ({
    id: String(i + 1),
    name: dest.name,
    description: dest.description,
    imageUrl: await getDestinationImage(dest.name),
  })));
  res.json({ trending });
};

// Get personalized destination suggestion (mock logic for now)
exports.getPersonalizedSuggestion = async (req, res) => {
  // TODO: Use user's past trips and AI to generate suggestion
  // For now, return mock data
  const suggestion = {
    id: 'tokyo',
    name: 'Tokyo',
    imageUrl: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?auto=format&fit=crop&w=400&q=80',
    reason: 'Based on your love for vibrant cities and your recent trip to Seoul.',
  };
  res.json({ suggestion });
};

// Record like/dislike feedback (mock logic for now)
exports.postDestinationFeedback = async (req, res) => {
  // TODO: Save feedback to DB for future improvements
  const { destinationId, feedback } = req.body;
  // For now, just acknowledge
  res.json({ success: true });
};

// Get swipeable destinations (now with real images)
exports.getSwipeableDestinations = async (req, res) => {
  // TODO: Fetch 10-20 random/popular destinations from DB
  const names = ['Bali', 'Paris', 'Tokyo', 'New York', 'Rome', 'Sydney', 'London', 'Barcelona', 'Dubai', 'Cape Town'];
  const swipeable = await Promise.all(names.map(async (name, i) => ({
    id: String(i + 1),
    name,
    imageUrl: await getDestinationImage(name),
  })));
  res.json({ swipeable });
};

// Record swipe result (like/dislike)
exports.postSwipeResult = async (req, res) => {
  // TODO: Save swipe result to DB for user
  const { destinationId, result } = req.body; // result: 'like' | 'dislike'
  // For now, just acknowledge
  res.json({ success: true });
}; 