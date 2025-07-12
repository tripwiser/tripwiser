export interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
  essential: boolean;
  customAdded: boolean;
  quantity?: number;
  notes?: string;
  priorityScore?: number;
  assignedTo?: string;
}

export interface WeatherData {
  temperature: {
    min: number;
    max: number;
    avg: number;
  };
  condition: string;
  humidity: number;
  precipitation: number;
  description: string;
  icon: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  duration: number; // days
  travelers: number;
  tripType: ('business' | 'leisure' | 'adventure' | 'family' | 'romantic' | 'wellness' | 'cultural' | 'backpacking' | 'roadtrip')[];
  activities: string[];
  additionalInfo?: string;
  packingList: PackingItem[];
  weather?: WeatherData;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
}

export type SubscriptionTier = 'free' | 'pro' | 'elite';

export interface SubscriptionFeatures {
  // Trip limits
  maxActiveTrips: number | 'unlimited';
  maxTotalTrips: number | 'unlimited';
  maxOfflineTrips: number | 'unlimited';
  
  // Template limits
  maxTemplatesCreatedPerMonth: number | 'unlimited';
  maxTemplatesUsed: number | 'unlimited';
  
  // Journal limits
  maxJournalEntriesPerMonth: number | 'unlimited';
  maxJournalContributors: number | 'unlimited';
  
  // Collaboration limits
  maxCollaboratorsPerTrip: number | 'unlimited';
  
  // Sharing limits
  maxPackingListShares: number | 'unlimited';
  maxPackingListSharesPerMonth: number | 'unlimited';
  
  // Export limits
  maxPDFExportsPerMonth: number | 'unlimited';
  maxPDFExportsTotal: number | 'unlimited';
  
  // Features
  cloudSync: boolean;
  customListImport: boolean;
  adFree: boolean;
  supportTier: 'basic' | 'standard' | 'priority';
}

export interface UserPreferences {
  name?: string;
  avatar?: string;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry?: string; // ISO date string for Pro/Elite
  theme: 'light' | 'dark' | 'system';
  temperatureUnit: 'celsius' | 'fahrenheit';
  notifications: {
    packingReminders: boolean;
    weatherUpdates: boolean;
    tipOfTheDay: boolean;
  };
  defaultSettings: {
    travelers: number;
    preferredActivities: string[];
  };
}

export interface AppState {
  hasCompletedOnboarding: boolean;
  currentTripId?: string;
  lastOpenedTrip?: string;
  
  // Usage tracking for limits
  usageThisMonth: {
    tripsCreated: number;
    templatesCreated: number;
    journalEntries: number;
    packingListShares: number;
    pdfExports: number;
    resetDate: string; // ISO date string
  };
  
  // Total usage tracking
  totalUsage: {
    trips: number;
    packingListShares: number;
    pdfExports: number;
  };
  
  showSubscriptionUpsell: boolean;
}

export type ActivityType = 
  | 'beach' 
  | 'hiking' 
  | 'business' 
  | 'formal-events' 
  | 'outdoor-sports' 
  | 'city-sightseeing' 
  | 'winter-sports' 
  | 'photography' 
  | 'nightlife' 
  | 'camping' 
  | 'cultural-visits' 
  | 'shopping';

export type ClimateType = 'tropical' | 'temperate' | 'cold' | 'arid' | 'mediterranean';

export interface PackingTemplate {
  category: string;
  items: {
    name: string;
    essential: boolean;
    activities: ActivityType[];
    climate: ClimateType[];
    businessTrip?: boolean;
  }[];
}

// Journal Feature Types
export interface JournalLocation {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface MapPin {
  id: string;
  tripId: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  category: 'food' | 'attraction' | 'stay' | 'transport' | 'shopping' | 'other';
  rating?: 1 | 2 | 3 | 4 | 5;
  photos: string[];
  tags: string[];
  visitDate: string;
  entryIds: string[]; // Related journal entries
  createdAt: string;
  updatedAt: string;
}

export interface JournalPhoto {
  id: string;
  uri: string;
  caption?: string;
  location?: JournalLocation;
  timestamp: string;
}

export interface JournalEntry {
  id: string;
  tripId: string;
  date: string;
  type: 'reflection' | 'meal' | 'discovery' | 'lesson' | 'highlight' | 'place' | 'person' | 'general';
  title?: string;
  content: string;
  photos: JournalPhoto[];
  location?: JournalLocation;
  tags: string[];
  mood?: 'amazing' | 'great' | 'good' | 'okay' | 'awful';
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackingInsight {
  itemId: string;
  itemName: string;
  category: string;
  wasUsed: boolean;
  usageFrequency: 'never' | 'rarely' | 'sometimes' | 'often' | 'daily';
  notes?: string;
}

export interface TripJournal {
  id: string;
  tripId: string;
  entries: JournalEntry[];
  packingInsights: PackingInsight[];
  favoriteLocations: JournalLocation[];
  coverPhoto?: JournalPhoto;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}