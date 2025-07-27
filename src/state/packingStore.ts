import { create } from 'zustand';
import { PackingItem } from '../types';

interface PackingState {
  items: PackingItem[];
  fetchPackingList: (tripId: string) => Promise<void>;
  addPackingItem: (tripId: string, item: PackingItem) => Promise<void>;
  updatePackingItem: (tripId: string, itemIndex: number, item: PackingItem) => Promise<void>;
  deletePackingItem: (tripId: string, itemIndex: number) => Promise<void>;
}

const API_URL = 'http://10.13.185.144:5000/api/packing';

export const usePackingStore = create<PackingState>((set) => ({
  items: [],
  fetchPackingList: async (tripId) => {
    const res = await fetch(`${API_URL}/${tripId}`);
    const items = await res.json();
    set({ items });
  },
  addPackingItem: async (tripId, item) => {
    const res = await fetch(`${API_URL}/${tripId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    const newItem = await res.json();
    set((state) => ({ items: [...state.items, newItem] }));
  },
  updatePackingItem: async (tripId, itemIndex, item) => {
    const res = await fetch(`${API_URL}/${tripId}/${itemIndex}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    const updatedItem = await res.json();
    set((state) => {
      const items = [...state.items];
      items[itemIndex] = updatedItem;
      return { items };
    });
  },
  deletePackingItem: async (tripId, itemIndex) => {
    await fetch(`${API_URL}/${tripId}/${itemIndex}`, { method: 'DELETE' });
    set((state) => {
      const items = [...state.items];
      items.splice(itemIndex, 1);
      return { items };
    });
  },
})); 