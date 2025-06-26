import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, PackingItem } from '../types';

interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  
  // Actions
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;
  setCurrentTrip: (tripId: string | null) => void;
  
  // Packing list actions
  togglePackingItem: (tripId: string, itemId: string) => void;
  addPackingItem: (tripId: string, item: Omit<PackingItem, 'id'>) => void;
  removePackingItem: (tripId: string, itemId: string) => void;
  updatePackingItem: (tripId: string, itemId: string, updates: Partial<PackingItem>) => void;
  reorderPackingItems: (tripId: string, items: PackingItem[]) => void;
  
  // Utilities
  getTripById: (tripId: string) => Trip | undefined;
  getPackingProgress: (tripId: string) => { packed: number; total: number; percentage: number };
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      currentTrip: null,
      
      addTrip: (tripData) => {
        const newTrip: Trip = {
          ...tripData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          trips: [...state.trips, newTrip],
          currentTrip: newTrip,
        }));
        
        return newTrip.id;
      },
      
      updateTrip: (tripId, updates) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? { ...trip, ...updates, updatedAt: new Date().toISOString() }
              : trip
          ),
          currentTrip: state.currentTrip?.id === tripId 
            ? { ...state.currentTrip, ...updates, updatedAt: new Date().toISOString() }
            : state.currentTrip,
        }));
      },
      
      deleteTrip: (tripId) => {
        set((state) => ({
          trips: state.trips.filter((trip) => trip.id !== tripId),
          currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip,
        }));
      },
      
      setCurrentTrip: (tripId) => {
        const trip = tripId ? get().trips.find((t) => t.id === tripId) : null;
        set({ currentTrip: trip || null });
      },
      
      togglePackingItem: (tripId, itemId) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  packingList: trip.packingList.map((item) =>
                    item.id === itemId ? { ...item, packed: !item.packed } : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : trip
          ),
          currentTrip: state.currentTrip?.id === tripId 
            ? {
                ...state.currentTrip,
                packingList: state.currentTrip.packingList.map((item) =>
                  item.id === itemId ? { ...item, packed: !item.packed } : item
                ),
                updatedAt: new Date().toISOString(),
              }
            : state.currentTrip,
        }));
      },
      
      addPackingItem: (tripId, itemData) => {
        const newItem: PackingItem = {
          ...itemData,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };
        
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  packingList: [...trip.packingList, newItem],
                  updatedAt: new Date().toISOString(),
                }
              : trip
          ),
          currentTrip: state.currentTrip?.id === tripId 
            ? {
                ...state.currentTrip,
                packingList: [...state.currentTrip.packingList, newItem],
                updatedAt: new Date().toISOString(),
              }
            : state.currentTrip,
        }));
      },
      
      removePackingItem: (tripId, itemId) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  packingList: trip.packingList.filter((item) => item.id !== itemId),
                  updatedAt: new Date().toISOString(),
                }
              : trip
          ),
          currentTrip: state.currentTrip?.id === tripId 
            ? {
                ...state.currentTrip,
                packingList: state.currentTrip.packingList.filter((item) => item.id !== itemId),
                updatedAt: new Date().toISOString(),
              }
            : state.currentTrip,
        }));
      },
      
      updatePackingItem: (tripId, itemId, updates) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  packingList: trip.packingList.map((item) =>
                    item.id === itemId ? { ...item, ...updates } : item
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : trip
          ),
          currentTrip: state.currentTrip?.id === tripId 
            ? {
                ...state.currentTrip,
                packingList: state.currentTrip.packingList.map((item) =>
                  item.id === itemId ? { ...item, ...updates } : item
                ),
                updatedAt: new Date().toISOString(),
              }
            : state.currentTrip,
        }));
      },
      
      reorderPackingItems: (tripId, items) => {
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? { ...trip, packingList: items, updatedAt: new Date().toISOString() }
              : trip
          ),
          currentTrip: state.currentTrip?.id === tripId 
            ? { ...state.currentTrip, packingList: items, updatedAt: new Date().toISOString() }
            : state.currentTrip,
        }));
      },
      
      getTripById: (tripId) => {
        return get().trips.find((trip) => trip.id === tripId);
      },
      
      getPackingProgress: (tripId) => {
        const trip = get().trips.find((t) => t.id === tripId);
        if (!trip) return { packed: 0, total: 0, percentage: 0 };
        
        const packed = trip.packingList.filter((item) => item.packed).length;
        const total = trip.packingList.length;
        
        // For completed trips with empty packing lists, show as complete
        if (trip.completed && total === 0) {
          return { packed: 0, total: 0, percentage: 100 };
        }
        
        const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;
        
        return { packed, total, percentage };
      },
    }),
    {
      name: 'tripkit-trips',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);