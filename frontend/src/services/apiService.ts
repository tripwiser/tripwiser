import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the base URL of your backend.
// For development, this will be your local IP address.
const API_URL = 'http://<YOUR_LOCAL_IP_ADDRESS>:5000/api';

const apiService = axios.create({
  baseURL: API_URL,
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

export default apiService; 