// itineraryAIService.js
require('dotenv').config();
const axios = require('axios');

const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'mistral-small-3.2-24b';
const OPENROUTER_REFERER = process.env.OPENROUTER_REFERER || '';
const OPENROUTER_TITLE = process.env.OPENROUTER_TITLE || '';

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

module.exports = { generateItinerary }; 