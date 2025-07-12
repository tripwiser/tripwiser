const axios = require('axios');

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_API_URL = 'https://api.pexels.com/v1/search';

async function getDestinationImage(destinationName) {
  if (!PEXELS_API_KEY) {
    // Return a fallback image if no API key
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
  }
  try {
    const res = await axios.get(PEXELS_API_URL, {
      headers: { Authorization: PEXELS_API_KEY },
      params: { query: destinationName, per_page: 1 },
    });
    if (res.data && res.data.photos && res.data.photos.length > 0) {
      return res.data.photos[0].src.landscape || res.data.photos[0].src.medium;
    }
    // Fallback if no image found
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
  } catch (err) {
    // Fallback on error
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
  }
}

module.exports = { getDestinationImage }; 