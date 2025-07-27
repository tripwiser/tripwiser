import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Permission = 'view' | 'edit';
export type SharedItemType = 'Trip' | 'Itinerary' | 'Journal' | 'PackingList';

export interface SharedItem {
  id: string; // Unique ID for the shared item itself
  tripId: string; // ID of the parent trip
  tripName: string;
  itemName: string; // e.g., "Maldives Packing List" or "Trip"
  itemType: SharedItemType;
  sharedBy: string; // User name of the person who shared it
  permission: Permission;
  sharedAt: string; // ISO date string
}

interface CollaborationState {
  sharedItems: SharedItem[];
  addSharedItem: (item: SharedItem) => void;
  removeSharedItem: (itemId: string) => void;
  updatePermission: (itemId: string, permission: Permission) => void;
}

export const useCollaborationStore = create<CollaborationState>()(
  persist(
    (set) => ({
      sharedItems: [
        {
          id: 'shared_trip_1',
          tripId: 'trip123',
          tripName: 'Maldives Trip 2025',
          itemName: 'Trip',
          itemType: 'Trip',
          sharedBy: 'John Doe',
          permission: 'edit',
          sharedAt: new Date().toISOString(),
        },
      ],
      addSharedItem: (item) => {
        set((state) => ({
          sharedItems: [...state.sharedItems.filter((i) => i.id !== item.id), item],
        }));
      },
      removeSharedItem: (itemId) => {
        set((state) => ({
          sharedItems: state.sharedItems.filter((i) => i.id !== itemId),
        }));
      },
      updatePermission: (itemId, permission) => {
        set((state) => ({
          sharedItems: state.sharedItems.map((item) =>
            item.id === itemId ? { ...item, permission } : item
          ),
        }));
      },
    }),
    {
      name: 'collaboration-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 