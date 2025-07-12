const axios = require('axios');
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

async function getUnsplashImage(destinationName) {
  if (!UNSPLASH_ACCESS_KEY) {
    console.log('No Unsplash API key provided, using fallback image');
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
  }
  
  try {
    // Try multiple search strategies to get the best image
    const searchQueries = [
      `${destinationName} landmark`,
      `${destinationName} cityscape`,
      `${destinationName} travel`,
      `${destinationName} landscape`,
      `${destinationName} tourism`,
      destinationName
    ];
    
    for (const query of searchQueries) {
      console.log(`Trying Unsplash search: "${query}"`);
      const res = await axios.get('https://api.unsplash.com/search/photos', {
        params: { 
          query: query, 
          per_page: 3,
          orientation: 'landscape'
        },
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
      });
      
      if (res.data && res.data.results && res.data.results.length > 0) {
        // Pick a random image from the results
        const randomIdx = Math.floor(Math.random() * res.data.results.length);
        const imageUrl = res.data.results[randomIdx].urls.regular;
        console.log(`Found image for "${query}":`, imageUrl);
        return imageUrl;
      }
    }
    
    console.log(`No images found for "${destinationName}" after trying all search queries`);
    // Fallback: return a generic travel image
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
  } catch (err) {
    console.error('Error fetching from Unsplash:', err.message);
    return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80';
  }
}

module.exports = { getUnsplashImage }; 