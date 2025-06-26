/**
 * Temperature conversion utilities
 */

export const celsiusToFahrenheit = (celsius: number): number => {
  return Math.round((celsius * 9/5) + 32);
};

export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return Math.round((fahrenheit - 32) * 5/9);
};

export const formatTemperature = (temp: number, unit: 'celsius' | 'fahrenheit'): string => {
  const symbol = unit === 'celsius' ? '°C' : '°F';
  return `${temp}${symbol}`;
};

export const convertTemperature = (temp: number, fromUnit: 'celsius' | 'fahrenheit', toUnit: 'celsius' | 'fahrenheit'): number => {
  if (fromUnit === toUnit) return temp;
  
  if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
    return celsiusToFahrenheit(temp);
  } else if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
    return fahrenheitToCelsius(temp);
  }
  
  return temp;
};

export const getTemperatureDisplayValue = (
  celsiusTemp: number, 
  userUnit: 'celsius' | 'fahrenheit'
): { value: number; unit: string } => {
  if (userUnit === 'fahrenheit') {
    return {
      value: celsiusToFahrenheit(celsiusTemp),
      unit: '°F'
    };
  }
  
  return {
    value: celsiusTemp,
    unit: '°C'
  };
};