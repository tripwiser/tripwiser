import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, buildApiUrl } from '../config/api';

// Create axios instance with production configuration
const apiService = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
apiService.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default apiService;

export async function getTrendingDestinations() {
  const res = await fetch(buildApiUrl('/destinations/trending'), {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch trending destinations');
  return res.json();
}

export async function getPersonalizedSuggestion() {
  const res = await fetch(buildApiUrl('/destinations/personalized'), {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch personalized suggestion');
  return res.json();
}

export async function postDestinationFeedback(destinationId: string, feedback: 'like' | 'dislike') {
  const res = await fetch(buildApiUrl('/destinations/feedback'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ destinationId, feedback }),
  });
  if (!res.ok) throw new Error('Failed to send feedback');
  return res.json();
}

export async function getSwipeableDestinations() {
  const res = await fetch(buildApiUrl('/destinations/swipeable'), {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch swipeable destinations');
  return res.json();
}

export async function postSwipeResult(destinationId: string, result: 'like' | 'dislike') {
  const res = await fetch(buildApiUrl('/destinations/swipe-result'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ destinationId, result }),
  });
  if (!res.ok) throw new Error('Failed to send swipe result');
  return res.json();
} 