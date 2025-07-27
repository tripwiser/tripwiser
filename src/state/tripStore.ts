import { create } from 'zustand';
import { Trip, PackingItem } from '../types';
import apiService from '../services/apiService';

interface TripState {
  trips: Trip[];
  fetchTrips: () => Promise<void>;
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateTrip: (tripId: string, updates: Partial<Trip>) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  getTripById: (tripId: string) => Trip | null;
  togglePackingItem: (tripId: string, itemId: string) => void;
  addPackingItem: (tripId: string, item: Omit<PackingItem, 'id'>) => void;
  updatePackingItem: (tripId: string, itemId: string, updates: Partial<PackingItem>) => void;
  removePackingItem: (tripId: string, itemId: string) => void;
}

export const useTripStore = create<TripState>()((set, get) => ({
  trips: [],

  fetchTrips: async () => {
    try {
      const response = await apiService.get('/trips');
      set({ trips: response.data });
    } catch (error) {
      console.error('Failed to fetch trips:', error);
    }
  },

  addTrip: async (tripData) => {
    try {
      const response = await apiService.post('/trips', tripData);
      set((state) => ({ trips: [...state.trips, response.data] }));
      return response.data.id;
    } catch (error) {
      console.error('Failed to add trip:', error);
      throw error;
    }
  },

  updateTrip: async (tripId, updates) => {
    try {
      const response = await apiService.put(`/trips/${tripId}`, updates);
      set((state) => ({
        trips: state.trips.map((trip) =>
          trip.id === tripId ? { ...trip, ...response.data } : trip
        ),
      }));
    } catch (error) {
      console.error('Failed to update trip:', error);
      throw error;
    }
  },

  deleteTrip: async (tripId) => {
    try {
      await apiService.delete(`/trips/${tripId}`);
      set((state) => ({ trips: state.trips.filter((trip) => trip.id !== tripId) }));
    } catch (error) {
      console.error('Failed to delete trip:', error);
      throw error;
    }
  },

  getTripById: (tripId) => {
    return get().trips.find((t) => t.id === tripId) || null;
  },

  togglePackingItem: (tripId, itemId) => {
    set((state) => ({
      trips: state.trips.map((trip) => {
        if (trip.id !== tripId) return trip;
        const packingList = trip.packingList.map((item) =>
          item.id === itemId ? { ...item, packed: !item.packed } : item
        );
        return { ...trip, packingList };
      }),
    }));
  },

  addPackingItem: (tripId, item) => {
    set((state) => ({
      trips: state.trips.map((trip) => {
        if (trip.id !== tripId) return trip;
        const newItem = { ...item, id: `item_${Date.now()}` };
        return { ...trip, packingList: [...trip.packingList, newItem] };
      }),
    }));
  },

  updatePackingItem: (tripId, itemId, updates) => {
    set((state) => ({
      trips: state.trips.map((trip) => {
        if (trip.id !== tripId) return trip;
        const packingList = trip.packingList.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        );
        return { ...trip, packingList };
      }),
    }));
  },

  removePackingItem: (tripId, itemId) => {
    set((state) => ({
      trips: state.trips.map((trip) => {
        if (trip.id !== tripId) return trip;
        const packingList = trip.packingList.filter((item) => item.id !== itemId);
        return { ...trip, packingList };
      }),
    }));
  },
}));