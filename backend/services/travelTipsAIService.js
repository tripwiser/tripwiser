// travelTipsAIService.js
require('dotenv').config();
const axios = require('axios');

const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'mistral-small-3.2-24b';
const OPENROUTER_REFERER = process.env.OPENROUTER_REFERER || '';
const OPENROUTER_TITLE = process.env.OPENROUTER_TITLE || '';

// Popular destinations for destination-specific tips
const POPULAR_DESTINATIONS = [
  'Paris', 'Tokyo', 'New York', 'London', 'Rome', 'Barcelona', 'Amsterdam', 
  'Bangkok', 'Singapore', 'Sydney', 'Dubai', 'Istanbul', 'Prague', 'Vienna',
  'Berlin', 'Madrid', 'Milan', 'Florence', 'Venice', 'Athens', 'Santorini',
  'Kyoto', 'Osaka', 'Seoul', 'Hong Kong', 'Taipei', 'Bali', 'Phuket',
  'Mumbai', 'Delhi', 'Jaipur', 'Agra', 'Varanasi', 'Mumbai', 'Kolkata'
];

// Tip categories with their specific focus areas
const TIP_CATEGORIES = {
  packing: {
    name: 'Packing Hacks',
    description: 'Space-saving, organization, and smart packing techniques',
    examples: ['rolling clothes', 'packing cubes', 'multi-purpose items', 'travel-size containers']
  },
  destination: {
    name: 'Destination Tips & Tricks',
    description: 'Local insights, hidden gems, and practical advice for specific destinations',
    examples: ['local customs', 'best times to visit', 'transportation tips', 'money-saving hacks']
  },
  weather: {
    name: 'Weather Wisdom',
    description: 'Weather-related packing and preparation advice',
    examples: ['layering techniques', 'weather-proofing', 'seasonal considerations', 'climate adaptation']
  },
  culture: {
    name: 'Cultural Insights',
    description: 'Positive cultural understanding and respectful travel practices',
    examples: ['local etiquette', 'cultural celebrations', 'respectful behavior', 'cultural appreciation']
  },
  safety: {
    name: 'Safety Tips & Hacks',
    description: 'Travel safety, security, and emergency preparedness',
    examples: ['document safety', 'emergency contacts', 'safe navigation', 'health precautions']
  }
};

/**
 * Generates a daily travel tip using OpenRouter AI
 * @param {string} category - The category of tip to generate (packing, destination, weather, culture, safety)
 * @param {string} destination - Optional destination for destination-specific tips
 * @returns {Promise<object>} - The generated tip as JSON
 */
const generateDailyTip = async (category = null, destination = null) => {
  if (!OPENROUTER_API_KEY) {
    console.log('No OpenRouter API key provided, using fallback tip');
    // Return fallback tip instead of throwing error
    return {
      id: `daily-${category || 'general'}-fallback-${Date.now()}`,
      title: 'Roll Your Clothes to Save Space',
      content: 'Rolling your clothes instead of folding them can save up to 30% more space in your suitcase and helps prevent wrinkles. This simple technique is a game-changer for efficient packing.',
      category: category || 'packing',
      tags: ['space-saving', 'wrinkles', 'basics'],
      rating: 4.5,
      isDailyTip: true,
      generatedAt: new Date().toISOString()
    };
  }

  // If no category specified, randomly select one
  if (!category) {
    const categories = Object.keys(TIP_CATEGORIES);
    category = categories[Math.floor(Math.random() * categories.length)];
  }

  // If destination category but no destination specified, randomly select one
  if (category === 'destination' && !destination) {
    destination = POPULAR_DESTINATIONS[Math.floor(Math.random() * POPULAR_DESTINATIONS.length)];
  }

  const categoryInfo = TIP_CATEGORIES[category];
  
  let prompt;
  if (category === 'destination' && destination) {
    prompt = `
      You are a travel expert. Generate a practical, actionable travel tip specifically for ${destination}.
      
      Category: ${categoryInfo.name}
      Focus: ${categoryInfo.description}
      
      Create a tip that includes:
      - A catchy, specific title (max 60 characters)
      - Detailed, practical content (150-200 words)
      - 3-5 relevant tags
      - A rating between 4.5 and 5.0
      
      The tip should be:
      - Highly practical and actionable
      - Specific to ${destination} or general travel wisdom
      - Positive and helpful
      - Based on real travel experience
      
      Respond with ONLY a valid JSON object in this format:
      {
        "id": "daily-${category}-${Date.now()}",
        "title": "Catchy Title Here",
        "content": "Detailed practical content here...",
        "category": "${category}",
        "destination": "${destination}",
        "tags": ["tag1", "tag2", "tag3"],
        "rating": 4.8,
        "isDailyTip": true,
        "generatedAt": "${new Date().toISOString()}"
      }
    `;
  } else {
    prompt = `
      You are a travel expert. Generate a practical, actionable travel tip.
      
      Category: ${categoryInfo.name}
      Focus: ${categoryInfo.description}
      Examples: ${categoryInfo.examples.join(', ')}
      
      Create a tip that includes:
      - A catchy, specific title (max 60 characters)
      - Detailed, practical content (150-200 words)
      - 3-5 relevant tags
      - A rating between 4.5 and 5.0
      
      The tip should be:
      - Highly practical and actionable
      - Applicable to most travelers
      - Positive and helpful
      - Based on real travel experience
      
      Respond with ONLY a valid JSON object in this format:
      {
        "id": "daily-${category}-${Date.now()}",
        "title": "Catchy Title Here",
        "content": "Detailed practical content here...",
        "category": "${category}",
        "tags": ["tag1", "tag2", "tag3"],
        "rating": 4.8,
        "isDailyTip": true,
        "generatedAt": "${new Date().toISOString()}"
      }
    `;
  }

  try {
    const headers = {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    };
    if (OPENROUTER_REFERER) headers['HTTP-Referer'] = OPENROUTER_REFERER;
    if (OPENROUTER_TITLE) headers['X-Title'] = OPENROUTER_TITLE;

    const response = await axios.post(
      OPENROUTER_API_URL,
      JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7, // Add some creativity
        max_tokens: 500
      }),
      { headers }
    );

    // Validate response structure
    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      throw new Error('Invalid response structure from OpenRouter API');
    }

    let aiContent = response.data.choices[0].message.content.trim();
    
    // Remove Markdown code block if present
    if (aiContent.startsWith('```')) {
      aiContent = aiContent.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
    }
    
    // Sanitize line breaks in strings
    aiContent = aiContent.replace(/\n(?=(?:(?:[^"]*"){2})*[^"]*"[^"]*$)/g, ' ');
    
    // Extract JSON if extra text
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiContent = jsonMatch[0];
    }
    
    let parsed;
    try {
      parsed = JSON.parse(aiContent);
    } catch (e) {
      console.error('Failed to parse AI tip response:', e, aiContent);
      throw e;
    }
    
    // Validate the response structure
    if (!parsed.title || !parsed.content || !parsed.category) {
      throw new Error('Invalid tip structure received from AI');
    }
    
    return parsed;
  } catch (error) {
    console.error('Error communicating with OpenRouter (travel tip):', error.message);
    if (error.response) {
      console.error('OpenRouter response error:', error.response.data);
    }
    
    // Return a fallback tip instead of throwing error
    console.log('Using fallback tip due to AI service error');
    return {
      id: `daily-${category}-fallback-${Date.now()}`,
      title: category === 'packing' ? 'Roll Your Clothes to Save Space' :
             category === 'destination' ? 'Research Local Customs Before You Go' :
             category === 'weather' ? 'Check Weather Forecast 3-5 Days Before' :
             category === 'culture' ? 'Learn Basic Local Phrases' :
             'Keep Important Documents in Multiple Locations',
      content: category === 'packing' ? 'Rolling your clothes instead of folding them can save up to 30% more space in your suitcase and helps prevent wrinkles. This simple technique is a game-changer for efficient packing.' :
               category === 'destination' ? 'Before visiting any destination, take time to research local customs, etiquette, and cultural norms. This shows respect and helps you avoid unintentional cultural faux pas.' :
               category === 'weather' ? 'Always check the weather forecast 3-5 days before your trip to adjust your packing list accordingly. Weather can change quickly, so stay prepared.' :
               category === 'culture' ? 'Learning basic phrases like "hello," "thank you," and "please" in the local language goes a long way. Locals appreciate the effort and it enhances your travel experience.' :
               'Keep copies of important documents like passport, ID, and travel insurance in separate locations. Consider digital copies in the cloud and physical copies in different bags.',
      category: category,
      tags: category === 'packing' ? ['space-saving', 'wrinkles', 'basics'] :
            category === 'destination' ? ['culture', 'respect', 'research'] :
            category === 'weather' ? ['forecast', 'planning', 'preparation'] :
            category === 'culture' ? ['language', 'respect', 'local'] :
            ['documents', 'safety', 'backup'],
      rating: 4.5,
      isDailyTip: true,
      generatedAt: new Date().toISOString()
    };
  }
};

/**
 * Generates multiple tips for different categories
 * @param {number} count - Number of tips to generate
 * @returns {Promise<Array>} - Array of generated tips
 */
const generateMultipleTips = async (count = 5) => {
  const categories = Object.keys(TIP_CATEGORIES);
  const tips = [];
  
  for (let i = 0; i < count; i++) {
    const category = categories[i % categories.length];
    const destination = category === 'destination' ? 
      POPULAR_DESTINATIONS[Math.floor(Math.random() * POPULAR_DESTINATIONS.length)] : 
      null;
    
    try {
      const tip = await generateDailyTip(category, destination);
      tips.push(tip);
    } catch (error) {
      console.error(`Failed to generate tip for category ${category}:`, error);
      // Continue with other tips even if one fails
    }
  }
  
  return tips;
};

module.exports = { 
  generateDailyTip, 
  generateMultipleTips,
  TIP_CATEGORIES,
  POPULAR_DESTINATIONS
}; 