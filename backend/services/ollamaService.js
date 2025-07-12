// Load environment variables from .env file
require('dotenv').config();

const axios = require('axios');

const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'mistral-small-3.2-24b';
const OPENROUTER_REFERER = process.env.OPENROUTER_REFERER || '';
const OPENROUTER_TITLE = process.env.OPENROUTER_TITLE || '';

/**
 * Generates a mock packing list when AI service is not available.
 */
const generateMockPackingList = (destination, duration, tripType, weatherData) => {
  const baseItems = {
    clothing: [
      { itemName: "T-shirts", quantity: `${Math.ceil(duration / 3)}`, notes: "Essential daily wear" },
      { itemName: "Pants/Shorts", quantity: `${Math.ceil(duration / 4)}`, notes: "Comfortable travel wear" },
      { itemName: "Underwear", quantity: `${Math.ceil(duration / 2)}`, notes: "Daily essentials" },
      { itemName: "Socks", quantity: `${Math.ceil(duration / 2)}`, notes: "Daily essentials" },
      { itemName: "Sleepwear", quantity: "1", notes: "Comfortable sleep clothes" }
    ],
    electronics: [
      { itemName: "Phone Charger", quantity: "1", notes: "Essential for communication" },
      { itemName: "Power Bank", quantity: "1", notes: "Backup power source" },
      { itemName: "Camera", quantity: "1", notes: "Capture memories" },
      { itemName: "Universal Adapter", quantity: "1", notes: "For international travel" }
    ],
    toiletries: [
      { itemName: "Toothbrush & Toothpaste", quantity: "1", notes: "Daily hygiene" },
      { itemName: "Shampoo & Conditioner", quantity: "1", notes: "Hair care" },
      { itemName: "Deodorant", quantity: "1", notes: "Personal hygiene" },
      { itemName: "Sunscreen", quantity: "1", notes: "Sun protection" }
    ],
    accessories: [
      { itemName: "Backpack/Day Bag", quantity: "1", notes: "Daily essentials carrier" },
      { itemName: "Water Bottle", quantity: "1", notes: "Stay hydrated" },
      { itemName: "Sunglasses", quantity: "1", notes: "Eye protection" },
      { itemName: "Hat/Cap", quantity: "1", notes: "Sun protection" }
    ],
    documents: [
      { itemName: "Passport", quantity: "1", notes: "Essential for international travel" },
      { itemName: "Travel Insurance", quantity: "1", notes: "Safety and protection" },
      { itemName: "Credit/Debit Cards", quantity: "2", notes: "Payment methods" },
      { itemName: "Emergency Contacts", quantity: "1", notes: "Important phone numbers" }
    ],
    other: [
      { itemName: "First Aid Kit", quantity: "1", notes: "Basic medical supplies" },
      { itemName: "Travel Pillow", quantity: "1", notes: "Comfort during travel" },
      { itemName: "Books/Entertainment", quantity: "1", notes: "For downtime" },
      { itemName: "Snacks", quantity: "1", notes: "Quick energy boost" }
    ]
  };

  // Add trip-type specific items
  if (tripType === 'business') {
    baseItems.clothing.push(
      { itemName: "Business Suit", quantity: "1", notes: "Professional meetings" },
      { itemName: "Dress Shirts", quantity: `${Math.ceil(duration / 2)}`, notes: "Professional attire" },
      { itemName: "Dress Shoes", quantity: "1", notes: "Professional footwear" }
    );
  } else if (tripType === 'beach') {
    baseItems.clothing.push(
      { itemName: "Swimsuit", quantity: "2", notes: "Beach activities" },
      { itemName: "Beach Towel", quantity: "1", notes: "Beach essentials" },
      { itemName: "Flip Flops", quantity: "1", notes: "Beach footwear" }
    );
  } else if (tripType === 'hiking') {
    baseItems.clothing.push(
      { itemName: "Hiking Boots", quantity: "1", notes: "Sturdy footwear for trails" },
      { itemName: "Hiking Socks", quantity: `${Math.ceil(duration / 2)}`, notes: "Moisture-wicking socks" },
      { itemName: "Rain Jacket", quantity: "1", notes: "Weather protection" }
    );
  }

  return baseItems;
};

/**
 * Generates a packing list using OpenRouter AI.
 *
 * @param {object} tripDetails - Details of the trip from the Trip model.
 * @param {object} weatherData - The weather forecast data.
 * @returns {Promise<object>} - The generated packing list, structured as JSON.
 */
const generatePackingList = async (tripDetails, weatherData) => {
  console.log('ollamaService received tripDetails:', tripDetails);
  console.log('tripDetails.startDate type:', typeof tripDetails.startDate);
  console.log('tripDetails.endDate type:', typeof tripDetails.endDate);
  
  const { destination, tripType, specialRequests } = tripDetails;
  
  // Ensure dates are Date objects
  if (!tripDetails.startDate || !tripDetails.endDate) {
    throw new Error('Start date and end date are required for generating packing list');
  }
  
  const startDate = tripDetails.startDate instanceof Date ? tripDetails.startDate : new Date(tripDetails.startDate);
  const endDate = tripDetails.endDate instanceof Date ? tripDetails.endDate : new Date(tripDetails.endDate);
  
  // Validate that dates are valid
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid date format provided to packing list generator');
  }
  
  const duration = (endDate - startDate) / (1000 * 60 * 60 * 24);

  if (!OPENROUTER_API_KEY) {
    throw new Error('No OpenRouter API key provided. Please set OPENROUTER_API_KEY in your .env file.');
  }

  // Constructing a detailed prompt for the AI
  const prompt = `
    You are an expert travel assistant. Create a personalized packing list for a trip to ${destination} for ${duration} day(s).
    The trip type is "${tripType}".
    The weather forecast is: ${weatherData.forecast}.
    Special requests from the user: "${specialRequests || 'None'}".

    Please provide a detailed packing list categorized into:
    - Clothing
    - Electronics
    - Toiletries
    - Accessories
    - Documents
    - Other

    For each item, provide the item name, a recommended quantity, and a brief note on why it's suggested (e.g., "for rainy weather" or "for business meetings").
    Respond with ONLY a valid JSON object in the following format:
    {
      "clothing": [{"itemName": "...", "quantity": "...", "notes": "..."}],
      "electronics": [{"itemName": "...", "quantity": "...", "notes": "..."}],
      "toiletries": [{"itemName": "...", "quantity": "...", "notes": "..."}],
      "accessories": [{"itemName": "...", "quantity": "...", "notes": "..."}],
      "documents": [{"itemName": "...", "quantity": "...", "notes": "..."}],
      "other": [{"itemName": "...", "quantity": "...", "notes": "..."}]
    }
  `;

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
        ]
      }),
      { headers }
    );

    // The response from OpenRouter should be in response.data.choices[0].message.content
    let aiContent = response.data.choices[0].message.content.trim();
    console.log('AI raw response:', aiContent); // Log the raw AI response
    // Remove Markdown code block if present
    if (aiContent.startsWith('```')) {
      aiContent = aiContent.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(aiContent);
      console.log('AI parsed response:', parsed); // Log the parsed response
    } catch (e) {
      console.error('Failed to parse AI response:', e, aiContent);
      throw e;
    }
    return parsed;

  } catch (error) {
    console.error('Error communicating with OpenRouter (packing list):', error.message);
    if (error.response) {
      console.error('OpenRouter response error:', error.response.data);
    }
    throw new Error('Failed to generate packing list from AI service.');
  }
};

/**
 * Generates a travel tip using OpenRouter AI based on context.
 * @param {object} context - { destination, packing, weather, culture, safety }
 * @returns {Promise<string>} - The generated travel tip.
 */
const generateTravelTip = async (context) => {
  const { destination, packing, weather, culture, safety } = context;
  const prompt = `You are a travel expert. Give a single, concise, and practical travel tip for a trip to ${destination || 'a random place'}.

Consider these aspects:
- Packing: ${packing || 'general'}
- Weather: ${weather || 'unknown'}
- Culture: ${culture || 'general'}
- Safety: ${safety || 'general'}

Respond with only the tip, no extra text.`;

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
        ]
      }),
      { headers }
    );
    // The response from OpenRouter should be in response.data.choices[0].message.content
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error communicating with OpenRouter (travel tip):', error.message);
    if (error.response) {
      console.error('OpenRouter response error:', error.response.data);
    }
    return 'Stay safe and enjoy your travels!';
  }
};

/**
 * Generates destination recommendations using OpenRouter AI based on user preferences.
 * @param {object} preferences - User preferences including likes, dislikes, budget, tripType, etc.
 * @returns {Promise<object>} - The generated destination recommendations with details.
 */
const generateDestinationRecommendations = async (preferences) => {
  const { likes, dislikes, budget, tripType, duration, interests, climate } = preferences;
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('No OpenRouter API key provided. Please set OPENROUTER_API_KEY in your .env file.');
  }

  const prompt = `
    You are an expert travel advisor. Based on the following user preferences, recommend 5 unique and personalized travel destinations.

    User Preferences:
    - Likes: ${likes || 'Not specified'}
    - Dislikes: ${dislikes || 'Not specified'}
    - Budget: ${budget || 'Not specified'}
    - Trip Type: ${tripType || 'Not specified'}
    - Duration: ${duration || 'Not specified'}
    - Interests: ${interests || 'Not specified'}
    - Preferred Climate: ${climate || 'Not specified'}

    For each destination, provide a structured response with:
    - name: "Destination Name, Country" (keep it concise)
    - description: "A compelling 1-2 sentence description of why this destination matches their preferences"
    - bestTimeToVisit: "Best months to visit (e.g., 'March to May, September to November')"
    - budgetRange: "Budget range for a typical trip (e.g., '$2000-$4000 per person for 7 days')"
    - imageUrl: "A relevant Unsplash image URL for this destination"

    Respond with ONLY a valid JSON object in the following format:
    {
      "destinations": [
        {
          "name": "Destination Name, Country",
          "description": "A compelling 1-2 sentence description of why this destination matches their preferences",
          "bestTimeToVisit": "Best months to visit",
          "budgetRange": "Budget range for a typical trip",
          "imageUrl": "https://images.unsplash.com/photo-..."
        }
      ]
    }

    Make sure the destinations are diverse and truly match the user's preferences. Keep descriptions concise but compelling.
  `;

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
        ]
      }),
      { headers }
    );

    // The response from OpenRouter should be in response.data.choices[0].message.content
    let aiContent = response.data.choices[0].message.content.trim();
    console.log('AI raw response (destinations):', aiContent);
    
    // Remove Markdown code block if present
    if (aiContent.startsWith('```')) {
      aiContent = aiContent.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
    }

    // Sanitize the AI response to fix JSON parsing issues
    // Remove line breaks within strings that break JSON
    aiContent = aiContent.replace(/\n(?=(?:(?:[^"]*"){2})*[^"]*"[^"]*$)/g, ' ');
    
    // Also try to extract JSON if there's extra text
    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiContent = jsonMatch[0];
    }

    let parsed;
    try {
      parsed = JSON.parse(aiContent);
      console.log('AI parsed response (destinations):', parsed);
    } catch (e) {
      console.error('Failed to parse AI response (destinations):', e);
      console.error('Sanitized content:', aiContent);
      throw e;
    }
    return parsed;

  } catch (error) {
    console.error('Error communicating with OpenRouter (destinations):', error.message);
    if (error.response) {
      console.error('OpenRouter response error:', error.response.data);
    }
    throw new Error('Failed to generate destination recommendations from AI service.');
  }
};

/**
 * Generates a day-by-day itinerary using OpenRouter AI.
 * @param {object} tripInfo - { tripName, destination, startDate, endDate }
 * @returns {Promise<object>} - The generated itinerary as JSON.
 */
const generateItinerary = async (tripInfo) => {
  const { tripName, destination, startDate, endDate } = tripInfo;

  if (!OPENROUTER_API_KEY) {
    throw new Error('No OpenRouter API key provided. Please set OPENROUTER_API_KEY in your .env file.');
  }

  const prompt = `
    You are a travel assistant. Given the following trip details, generate a detailed day-by-day itinerary.
    - Trip Name: ${tripName}
    - Destination: ${destination}
    - Start Date: ${startDate}
    - End Date: ${endDate}

    For each day, provide:
    - date: YYYY-MM-DD
    - label: a short label for the day (e.g., 'MON', 'TUE', etc.)
    - items: 3-6 scheduled activities with time, title, location, and notes

    Respond with ONLY a valid JSON object in this format:
    {
      "days": [
        {
          "date": "YYYY-MM-DD",
          "label": "DAY LABEL",
          "items": [
            { "time": "8:00am", "title": "Activity", "location": "...", "notes": "..." }
          ]
        }
      ]
    }
    Ensure the itinerary covers every day from start to end date, and that activities are realistic and well-distributed throughout each day.
  `;

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
        ]
      }),
      { headers }
    );

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
      console.error('Failed to parse AI itinerary response:', e, aiContent);
      throw e;
    }
    return parsed;
  } catch (error) {
    console.error('Error communicating with OpenRouter (itinerary):', error.message);
    if (error.response) {
      console.error('OpenRouter response error:', error.response.data);
    }
    throw new Error('Failed to generate itinerary from AI service.');
  }
};

module.exports = {
  generatePackingList,
  generateTravelTip,
  generateDestinationRecommendations,
  generateItinerary, // Export new function
}; 