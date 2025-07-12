// API Configuration
// This file centralizes all API-related configuration

// Environment-based API URL
const getApiUrl = () => {
  if (__DEV__) {
    // Development - you can change this to your local backend if needed
    return 'https://tripwiser.onrender.com/api';
  }
  // Production
  return 'https://tripwiser.onrender.com/api';
};

export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  
  // Destinations
  DESTINATIONS: {
    TRENDING: '/destinations/trending',
    PERSONALIZED: '/destinations/personalized',
    FEEDBACK: '/destinations/feedback',
    SWIPEABLE: '/destinations/swipeable',
    SWIPE_RESULT: '/destinations/swipe-result',
  },
  
  // AI Services
  AI: {
    ITINERARY: '/ai/itinerary',
    RECOMMEND_DESTINATIONS: '/ai/recommend-destinations',
    PACKING_GENERATE: '/ai/packing-generate',
  },
  
  // Packing
  PACKING: {
    GENERATE: '/packing/generate',
    GENERATE_TIP: '/packing/generate-tip',
  },
  
  // Travel Tips
  TRAVEL_TIPS: {
    DAILY: '/travel-tips/daily',
    MULTIPLE: '/travel-tips/multiple',
    GENERATE: '/travel-tips/generate',
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    PREFERENCES: '/users/preferences',
  },
  
  // Health Check
  HEALTH: '/health',
  PING: '/ping',
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Environment info
export const ENV_INFO = {
  isDevelopment: __DEV__,
  apiUrl: API_CONFIG.BASE_URL,
  version: '1.0.0',
}; 