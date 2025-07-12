// Load environment variables from .env file
require('dotenv').config();

const axios = require('axios');
const TOMORROW_API_KEY = process.env.WEATHER_API_KEY;
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;
const TOMORROW_API_URL = 'https://api.tomorrow.io/v4/weather/forecast';
const OPENCAGE_API_URL = 'https://api.opencagedata.com/geocode/v1/json';

// Helper: Geocode city name to lat/lon
async function geocodeCity(city) {
  if (!OPENCAGE_API_KEY) throw new Error('No OpenCage API key set in OPENCAGE_API_KEY');
  const response = await axios.get(OPENCAGE_API_URL, {
    params: {
      key: OPENCAGE_API_KEY,
      q: city,
      limit: 1
    }
  });
  if (response.data.results.length === 0) throw new Error('Could not geocode city: ' + city);
  const { lat, lng } = response.data.results[0].geometry;
  return { lat, lon: lng };
}

const getWeather = async (destination) => {
  if (!TOMORROW_API_KEY) {
    throw new Error('No Tomorrow.io API key provided. Please set WEATHER_API_KEY in your .env file.');
  }

  let lat, lon;
  if (typeof destination === 'string') {
    // Geocode city name
    ({ lat, lon } = await geocodeCity(destination));
  } else if (destination.lat && destination.lon) {
    lat = destination.lat;
    lon = destination.lon;
  } else {
    throw new Error('Destination must be a city name or { lat, lon } object');
  }

  try {
    const response = await axios.get(TOMORROW_API_URL, {
      params: {
        location: `${lat},${lon}`,
        apikey: TOMORROW_API_KEY,
        timesteps: '1d',
        units: 'metric',
        fields: 'temperature,weatherCode,precipitationType,precipitationProbability,windSpeed'
      }
    });

    const daily = response.data.timelines.daily[0];
    const summary = `Weather: ${daily.values.weatherCode}, Temp: ${daily.values.temperature}°C, Precipitation: ${daily.values.precipitationProbability}%`;

    return {
      summary,
      raw: daily.values
    };
  } catch (error) {
    console.error('Error fetching weather data from Tomorrow.io:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
};

module.exports = {
  getWeather
}; 