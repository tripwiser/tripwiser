import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { JournalEntry, JournalPhoto, TripJournal, PackingInsight, JournalLocation } from '../types';

interface JournalStore {
  journals: Record<string, TripJournal>; // Key: tripId
  
  // Journal Management
  createJournal: (tripId: string) => TripJournal;
  getJournal: (tripId: string) => TripJournal | undefined;
  updateJournal: (tripId: string, updates: Partial<TripJournal>) => void;
  
  // Entry Management
  addEntry: (tripId: string, entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateEntry: (tripId: string, entryId: string, updates: Partial<JournalEntry>) => void;
  deleteEntry: (tripId: string, entryId: string) => void;
  getEntriesByDate: (tripId: string, date: string) => JournalEntry[];
  getEntriesByType: (tripId: string, type: JournalEntry['type']) => JournalEntry[];
  
  // Photo Management
  addPhotoToEntry: (tripId: string, entryId: string, photo: Omit<JournalPhoto, 'id'>) => void;
  removePhotoFromEntry: (tripId: string, entryId: string, photoId: string) => void;
  updatePhotoCaption: (tripId: string, entryId: string, photoId: string, caption: string) => void;
  
  // Packing Insights
  addPackingInsight: (tripId: string, insight: PackingInsight) => void;
  updatePackingInsight: (tripId: string, itemId: string, updates: Partial<PackingInsight>) => void;
  getPackingInsights: (tripId: string) => PackingInsight[];
  
  // Location Management
  addFavoriteLocation: (tripId: string, location: JournalLocation) => void;
  removeFavoriteLocation: (tripId: string, locationIndex: number) => void;
  
  // Export/Share
  exportJournal: (tripId: string) => TripJournal | undefined;
  getJournalStats: (tripId: string) => {
    totalEntries: number;
    totalPhotos: number;
    visitedLocations: number;
    daysDocumented: number;
  };
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const useJournalStore = create<JournalStore>()(
  persist(
    (set, get) => ({
      journals: {},

      createJournal: (tripId: string) => {
        const newJournal: TripJournal = {
          id: generateId(),
          tripId,
          entries: [],
          packingInsights: [],
          favoriteLocations: [],
          isPublic: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          journals: {
            ...state.journals,
            [tripId]: newJournal,
          },
        }));

        return newJournal;
      },

      getJournal: (tripId: string) => {
        const state = get();
        return state.journals[tripId];
      },

      updateJournal: (tripId: string, updates: Partial<TripJournal>) => {
        set((state) => ({
          journals: {
            ...state.journals,
            [tripId]: {
              ...state.journals[tripId],
              ...updates,
              updatedAt: new Date().toISOString(),
            },
          },
        }));
      },

      addEntry: (tripId: string, entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
        const entryId = generateId();
        const newEntry: JournalEntry = {
          ...entryData,
          id: entryId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => {
          const journal = state.journals[tripId] || get().createJournal(tripId);
          return {
            journals: {
              ...state.journals,
              [tripId]: {
                ...journal,
                entries: [...journal.entries, newEntry],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });

        return entryId;
      },

      updateEntry: (tripId: string, entryId: string, updates: Partial<JournalEntry>) => {
        set((state) => {
          const journal = state.journals[tripId];
          if (!journal) return state;

          return {
            journals: {
              ...state.journals,
              [tripId]: {
                ...journal,
                entries: journal.entries.map((entry) =>
                  entry.id === entryId
                    ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
                    : entry
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      deleteEntry: (tripId: string, entryId: string) => {
        set((state) => {
          const journal = state.journals[tripId];
          if (!journal) return state;

          return {
            journals: {
              ...state.journals,
              [tripId]: {
                ...journal,
                entries: journal.entries.filter((entry) => entry.id !== entryId),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      getEntriesByDate: (tripId: string, date: string) => {
        const journal = get().journals[tripId];
        if (!journal) return [];
        
        return journal.entries.filter((entry) => entry.date === date);
      },

      getEntriesByType: (tripId: string, type: JournalEntry['type']) => {
        const journal = get().journals[tripId];
        if (!journal) return [];
        
        return journal.entries.filter((entry) => entry.type === type);
      },

      addPhotoToEntry: (tripId: string, entryId: string, photoData: Omit<JournalPhoto, 'id'>) => {
        const photoId = generateId();
        const newPhoto: JournalPhoto = {
          ...photoData,
          id: photoId,
        };

        set((state) => {
          const journal = state.journals[tripId];
          if (!journal) return state;

          return {
            journals: {
              ...state.journals,
              [tripId]: {
                ...journal,
                entries: journal.entries.map((entry) =>
                  entry.id === entryId
                    ? { 
                        ...entry, 
                        photos: [...entry.photos, newPhoto],
                        updatedAt: new Date().toISOString(),
                      }
                    : entry
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      removePhotoFromEntry: (tripId: string, entryId: string, photoId: string) => {
        set((state) => {
          const journal = state.journals[tripId];
          if (!journal) return state;

          return {
            journals: {
              ...state.journals,
              [tripId]: {
                ...journal,
                entries: journal.entries.map((entry) =>
                  entry.id === entryId
                    ? { 
                        ...entry, 
                        photos: entry.photos.filter((photo) => photo.id !== photoId),
                        updatedAt: new Date().toISOString(),
                      }
                    : entry
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      updatePhotoCaption: (tripId: string, entryId: string, photoId: string, caption: string) => {
        set((state) => {
          const journal = state.journals[tripId];
          if (!journal) return state;

          return {
            journals: {
              ...state.journals,
              [tripId]: {
                ...journal,
                entries: journal.entries.map((entry) =>
                  entry.id === entryId
                    ? { 
                        ...entry, 
                        photos: entry.photos.map((photo) =>
                          photo.id === photoId ? { ...photo, caption } : photo
                        ),
                        updatedAt: new Date().toISOString(),
                      }
                    : entry
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      addPackingInsight: (tripId: string, insight: PackingInsight) => {
        set((state) => {
          const journal = state.journals[tripId] || get().createJournal(tripId);
          return {
            journals: {
              ...state.journals,
              [tripId]: {
                ...journal,
                packingInsights: [
                  ...journal.packingInsights.filter((i) => i.itemId !== insight.itemId),
                  insight,
                ],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      updatePackingInsight: (tripId: string, itemId: string, updates: Partial<PackingInsight>) => {
        set((state) => {
          const journal = state.journals[tripId];
          if (!journal) return state;

          return {
            journals: {
              ...state.journals,
              [tripId]: {
                ...journal,
                packingInsights: journal.packingInsights.map((insight) =>
                  insight.itemId === itemId ? { ...insight, ...updates } : insight
                ),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      getPackingInsights: (tripId: string) => {
        const journal = get().journals[tripId];
        return journal?.packingInsights || [];
      },

      addFavoriteLocation: (tripId: string, location: JournalLocation) => {
        set((state) => {
          const journal = state.journals[tripId] || get().createJournal(tripId);
          return {
            journals: {
              ...state.journals,
              [tripId]: {
                ...journal,
                favoriteLocations: [...journal.favoriteLocations, location],
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      removeFavoriteLocation: (tripId: string, locationIndex: number) => {
        set((state) => {
          const journal = state.journals[tripId];
          if (!journal) return state;

          return {
            journals: {
              ...state.journals,
              [tripId]: {
                ...journal,
                favoriteLocations: journal.favoriteLocations.filter((_, index) => index !== locationIndex),
                updatedAt: new Date().toISOString(),
              },
            },
          };
        });
      },

      exportJournal: (tripId: string) => {
        return get().journals[tripId];
      },

      getJournalStats: (tripId: string) => {
        const journal = get().journals[tripId];
        if (!journal) {
          return { totalEntries: 0, totalPhotos: 0, visitedLocations: 0, daysDocumented: 0 };
        }

        const totalPhotos = journal.entries.reduce((sum, entry) => sum + entry.photos.length, 0);
        const uniqueDates = new Set(journal.entries.map((entry) => entry.date));

        return {
          totalEntries: journal.entries.length,
          totalPhotos,
          visitedLocations: journal.favoriteLocations.length,
          daysDocumented: uniqueDates.size,
        };
      },
    }),
    {
      name: 'journal-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ journals: state.journals }),
    }
  )
);