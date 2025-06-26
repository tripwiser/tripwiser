const axios = require('axios');

// TODO: User needs to provide an API key for a weather service
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'YOUR_API_KEY';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/forecast';

/**
 * Fetches the weather forecast for a given destination.
 * @param {string} destination - The destination city.
 * @returns {Promise<object>} - The weather data.
 */
const getWeather = async (destination) => {
  try {
    // For now, this is a placeholder. A real implementation would use the destination
    // and dates to get a forecast. The API may need coordinates instead of a city name.
    const response = await axios.get(WEATHER_API_URL, {
      params: {
        q: destination,
        appid: WEATHER_API_KEY,
        units: 'metric' // or 'imperial'
      }
    });

    // This is a simplified forecast. We can process this further to give a summary.
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    // In a real app, you might want to return a default/fallback value
    // or handle the error more gracefully.
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    // Return a mock response or throw error, for now we will return a mock.
    return {
        mock: true,
        forecast: 'Sunny with a chance of clouds. Temp: 25°C'
    };
  }
};

module.exports = {
  getWeather
}; 