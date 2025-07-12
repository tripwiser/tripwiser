import { WeatherData } from '../types';

// Mock weather data for demo purposes
// In a real app, you'd integrate with OpenWeatherMap, WeatherAPI, etc.
const mockWeatherData: Record<string, WeatherData> = {
  'paris': {
    temperature: { min: 15, max: 22, avg: 18 },
    condition: 'partly_cloudy',
    humidity: 65,
    precipitation: 20,
    description: 'Partly cloudy with occasional showers',
    icon: '⛅',
  },
  'tokyo': {
    temperature: { min: 20, max: 28, avg: 24 },
    condition: 'sunny',
    humidity: 70,
    precipitation: 5,
    description: 'Sunny and warm',
    icon: '☀️',
  },
  'new york': {
    temperature: { min: 18, max: 25, avg: 21 },
    condition: 'cloudy',
    humidity: 60,
    precipitation: 15,
    description: 'Mostly cloudy',
    icon: '☁️',
  },
  'london': {
    temperature: { min: 12, max: 18, avg: 15 },
    condition: 'rainy',
    humidity: 80,
    precipitation: 60,
    description: 'Frequent rain showers',
    icon: '🌧️',
  },
  'dubai': {
    temperature: { min: 25, max: 35, avg: 30 },
    condition: 'sunny',
    humidity: 40,
    precipitation: 0,
    description: 'Hot and sunny',
    icon: '☀️',
  },
  'thailand': {
    temperature: { min: 24, max: 32, avg: 28 },
    condition: 'tropical',
    humidity: 85,
    precipitation: 40,
    description: 'Hot and humid with afternoon showers',
    icon: '🌴',
  },
};

export async function fetchWeatherData(destination: string): Promise<WeatherData> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const destKey = destination.toLowerCase();
  
  // Try to find matching weather data
  const weatherKey = Object.keys(mockWeatherData).find(key => 
    destKey.includes(key) || key.includes(destKey)
  );
  
  if (weatherKey) {
    return mockWeatherData[weatherKey];
  }
  
  // Default weather data for unknown destinations
  return {
    temperature: { min: 18, max: 25, avg: 21 },
    condition: 'partly_cloudy',
    humidity: 60,
    precipitation: 20,
    description: 'Pleasant weather expected',
    icon: '⛅',
  };
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