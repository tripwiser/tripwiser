const axios = require('axios');

const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'mistral-small-3.2-24b';
const OPENROUTER_REFERER = process.env.OPENROUTER_REFERER || '';
const OPENROUTER_TITLE = process.env.OPENROUTER_TITLE || '';

/**
 * Generates a packing list using OpenRouter AI.
 *
 * @param {object} tripDetails - Details of the trip from the Trip model.
 * @param {object} weatherData - The weather forecast data.
 * @returns {Promise<object>} - The generated packing list, structured as JSON.
 */
const generatePackingList = async (tripDetails, weatherData) => {
  const { destination, tripType, specialRequests } = tripDetails;
  const duration = (tripDetails.endDate - tripDetails.startDate) / (1000 * 60 * 60 * 24);

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
    return JSON.parse(response.data.choices[0].message.content);

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

module.exports = {
  generatePackingList,
  generateTravelTip,
}; 