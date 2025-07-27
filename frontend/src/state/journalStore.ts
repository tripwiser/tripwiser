import { create } from 'zustand';
import { JournalEntry } from '../types';
import apiService from '../services/apiService';

interface Journal {
  tripId: string;
  entries: JournalEntry[];
  createdAt: string;
  updatedAt: string;
}

interface JournalState {
  journals: Record<string, Journal>;
  fetchJournals: () => Promise<void>;
  addEntry: (tripId: string, entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEntry: (tripId: string, entryId: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (tripId: string, entryId: string) => Promise<void>;
  getJournal: (tripId: string) => Journal | null;
  getJournalStats: (tripId: string) => {
    totalEntries: number;
    totalPhotos: number;
    daysDocumented: number;
    visitedLocations: number;
  };
}

export const useJournalStore = create<JournalState>()((set, get) => ({
  journals: {},

  fetchJournals: async () => {
    try {
      const response = await apiService.get('/journals');
      const journalsArr: Journal[] = response.data;
      const journals: Record<string, Journal> = {};
      journalsArr.forEach(journal => {
        journals[journal.tripId] = journal;
      });
      set({ journals });
    } catch (error) {
      console.error('Failed to fetch journals:', error);
    }
  },

  addEntry: async (tripId, entry) => {
    try {
      const response = await apiService.post(`/journals/${tripId}/entries`, entry);
      set((state) => {
        const journal = state.journals[tripId] || { tripId, entries: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        return {
          journals: {
            ...state.journals,
            [tripId]: {
              ...journal,
              entries: [...journal.entries, response.data],
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
    } catch (error) {
      console.error('Failed to add journal entry:', error);
      throw error;
    }
  },

  updateEntry: async (tripId, entryId, updates) => {
    try {
      const response = await apiService.put(`/journals/${tripId}/entries/${entryId}`, updates);
      set((state) => {
        const journal = state.journals[tripId];
        if (!journal) return state;
        return {
          journals: {
            ...state.journals,
            [tripId]: {
              ...journal,
              entries: journal.entries.map((entry) =>
                entry.id === entryId ? { ...entry, ...response.data } : entry
              ),
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
    } catch (error) {
      console.error('Failed to update journal entry:', error);
      throw error;
    }
  },

  deleteEntry: async (tripId, entryId) => {
    try {
      await apiService.delete(`/journals/${tripId}/entries/${entryId}`);
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
    } catch (error) {
      console.error('Failed to delete journal entry:', error);
      throw error;
    }
  },

  getJournal: (tripId) => {
    return get().journals[tripId] || null;
  },

  getJournalStats: (tripId) => {
    const journal = get().journals[tripId];
    if (!journal) {
      return {
        totalEntries: 0,
        totalPhotos: 0,
        daysDocumented: 0,
        visitedLocations: 0,
      };
    }

    const totalEntries = journal.entries.length;
    const totalPhotos = journal.entries.reduce((sum, entry) => sum + (entry.photos?.length || 0), 0);
    const daysDocumented = new Set(journal.entries.map(entry => entry.date)).size;
    const visitedLocations = new Set(
      journal.entries
        .filter(entry => entry.location?.name)
        .map(entry => entry.location!.name)
    ).size;

    return {
      totalEntries,
      totalPhotos,
      daysDocumented,
      visitedLocations,
    };
  },
}));