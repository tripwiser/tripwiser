import apiService from './apiService';

interface TripDetails {
  destination: string;
  startDate: string;
  endDate: string;
  tripType: 'beach' | 'hiking' | 'business' | 'family' | 'other';
  specialRequests?: string;
}

/**
 * Generates a new packing list by calling the backend API.
 * @param tripDetails - The details of the trip.
 * @returns The generated packing list.
 */
export const generatePackingList = async (tripDetails: TripDetails) => {
  try {
    const response = await apiService.post('/packing/generate', tripDetails);
    return response.data;
  } catch (error) {
    console.error('Error generating packing list:', error);
    // You might want to handle the error in the UI, e.g., show a toast message.
    throw error;
  }
}; 