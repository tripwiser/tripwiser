import { WeatherData } from '../types';
import { WEATHERAPI_KEY } from '@env';

export async function fetchWeatherData(destination: string): Promise<WeatherData> {
  // Call WeatherAPI.com for real weather data
  const apiKey = WEATHERAPI_KEY;
  const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(destination)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch weather data');
    const data = await response.json();
    return {
      temperature: {
        min: data.current.temp_c, // WeatherAPI only provides current temp, so use for min/max/avg
        max: data.current.temp_c,
        avg: data.current.temp_c,
      },
      condition: data.current.condition.text.toLowerCase().replace(/ /g, '_'),
      humidity: data.current.humidity,
      precipitation: data.current.precip_mm,
      description: data.current.condition.text,
      icon: data.current.condition.icon, // WeatherAPI provides an icon URL
    };
  } catch (error) {
    // Fallback to default weather data
    return {
      temperature: { min: 18, max: 25, avg: 21 },
      condition: 'partly_cloudy',
      humidity: 60,
      precipitation: 20,
      description: 'Pleasant weather expected',
      icon: '⛅',
    };
  }
}

export function getWeatherRecommendations(weather: WeatherData): string[] {
  const recommendations: string[] = [];
  if (weather.temperature.min < 15) {
    recommendations.push('Pack warm clothes - it will be cold!');
  }
  if (weather.temperature.max > 28) {
    recommendations.push('Bring light, breathable clothing - it will be hot!');
  }
  if (weather.precipitation > 40) {
    recommendations.push('Don\'t forget rain gear - expect frequent showers!');
  }
  if (weather.humidity > 70) {
    recommendations.push('Pack moisture-wicking fabrics - it will be humid!');
  }
  if (weather.condition === 'sunny') {
    recommendations.push('Sunscreen and sunglasses are essential!');
  }
  return recommendations;
}