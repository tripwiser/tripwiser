const axios = require('axios');

// The default URL for a local Ollama instance
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/generate';

/**
 * Generates a packing list using Ollama AI.
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
    const response = await axios.post(OLLAMA_API_URL, {
      model: "llama2", // Or whichever model you are using, e.g., "mistral"
      prompt: prompt,
      stream: false, // We want the full response at once
      format: "json" // Specify that we want a JSON output
    });

    // The response from Ollama with format:"json" should be a JSON string in the 'response' field.
    return JSON.parse(response.data.response);

  } catch (error) {
    console.error('Error communicating with Ollama:', error.message);
    if (error.response) {
      console.error('Ollama response error:', error.response.data);
    }
    // You might want to return a default or fallback packing list here.
    throw new Error('Failed to generate packing list from AI service.');
  }
};

module.exports = {
  generatePackingList
}; 