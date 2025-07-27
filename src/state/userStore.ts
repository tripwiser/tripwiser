import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences, AppState, SubscriptionTier } from '../types';
import { SubscriptionService } from '../services/subscriptionService';

// Add avatar to User type
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry?: string;
}

interface UserState extends UserPreferences, AppState {
  // User auth state
  user: User | null;
  isAuthenticated: boolean;
  
  // Actions
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateApp: (appState: Partial<AppState>) => void;
  completeOnboarding: () => void;
  upgradeSubscription: (tier: SubscriptionTier, expiry?: string) => void;
  incrementUsage: (type: 'tripsCreated' | 'templatesCreated' | 'journalEntries' | 'packingListShares' | 'pdfExports') => void;
  canPerformAction: (action: string) => { allowed: boolean; remaining: number | 'unlimited' };
  getEffectiveTier: () => SubscriptionTier;
  shouldShowSubscriptionUpsell: () => boolean;
  dismissSubscriptionUpsell: () => void;
  resetMonthlyUsageIfNeeded: () => void;
  setUser: (user: User) => void;
  logout: () => void;
  updateProfile: (profile: { name: string; email: string; avatar?: string | null }) => void;
}

const defaultPreferences: UserPreferences = {
  subscriptionTier: 'free',
  theme: 'system',
  temperatureUnit: 'celsius',
  notifications: {
    packingReminders: true,
    weatherUpdates: true,
    tipOfTheDay: false,
  },
  defaultSettings: {
    travelers: 1,
    preferredActivities: [],
  },
};

const defaultAppState: AppState = {
  hasCompletedOnboarding: false,
  usageThisMonth: {
    tripsCreated: 0,
    templatesCreated: 0,
    journalEntries: 0,
    packingListShares: 0,
    pdfExports: 0,
    resetDate: new Date().toISOString(),
  },
  totalUsage: {
    trips: 0,
    packingListShares: 0,
    pdfExports: 0,
  },
  showSubscriptionUpsell: false,
};

const defaultUserAuth = {
  user: null,
  isAuthenticated: false,
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      ...defaultPreferences,
      ...defaultAppState,
      ...defaultUserAuth,
      
      updatePreferences: (preferences) => {
        set((state) => ({
          ...state,
          ...preferences,
        }));
      },
      
      updateApp: (appState) => {
        set((state) => ({
          ...state,
          ...appState,
        }));
      },
      
      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },
      
      upgradeSubscription: (tier, expiry) => {
        set({ 
          subscriptionTier: tier,
          subscriptionExpiry: expiry,
          showSubscriptionUpsell: false,
        });
      },
      
      incrementUsage: (type) => {
        get().resetMonthlyUsageIfNeeded();
        
        set((state) => {
          const newUsageThisMonth = { ...state.usageThisMonth };
          newUsageThisMonth[type] += 1;
          
          const newTotalUsage = { ...state.totalUsage };
          if (type === 'tripsCreated') newTotalUsage.trips += 1;
          if (type === 'packingListShares') newTotalUsage.packingListShares += 1;
          if (type === 'pdfExports') newTotalUsage.pdfExports += 1;
          
          return {
            usageThisMonth: newUsageThisMonth,
            totalUsage: newTotalUsage,
          };
        });
      },
      
      canPerformAction: (action) => {
        try {
          const state = get();
          const effectiveTier = get().getEffectiveTier();
          
          let currentUsage = 0;
          
          switch (action) {
            case 'createTrip': {
              // Check both monthly active trips and total trips
              const activeTrips = state.usageThisMonth.tripsCreated;
              const totalTrips = state.totalUsage.trips;
              
              const canCreateActiveTrip = SubscriptionService.canPerformAction(effectiveTier, 'createTrip', activeTrips);
              const canCreateTotalTrip = SubscriptionService.canPerformAction(effectiveTier, 'maxTotalTrips', totalTrips);
              
              const allowed = canCreateActiveTrip && canCreateTotalTrip;
              const remaining = SubscriptionService.getRemainingCount(effectiveTier, 'createTrip', activeTrips);
              
              return { allowed, remaining };
            }
          
          case 'createTemplate':
            currentUsage = state.usageThisMonth.templatesCreated;
            break;
            
          case 'createJournalEntry':
            currentUsage = state.usageThisMonth.journalEntries;
            break;
            
          case 'sharePackingList':
            currentUsage = state.usageThisMonth.packingListShares;
            break;
            
          case 'exportPdf':
            currentUsage = state.usageThisMonth.pdfExports;
            break;
            
          case 'maxTemplatesUsed':
            // For checking if user can use templates (different from creating)
            currentUsage = 0; // This would need to be tracked separately if needed
            break;
        }
        
          const allowed = SubscriptionService.canPerformAction(effectiveTier, action, currentUsage);
          const remaining = SubscriptionService.getRemainingCount(effectiveTier, action, currentUsage);
          
          return { allowed, remaining };
        } catch (error) {
          console.error('canPerformAction error:', error);
          // Return safe defaults on error
          return { allowed: true, remaining: 'unlimited' as const };
        }
      },
      
      getEffectiveTier: () => {
        // For testing, always return 'elite'
        return 'elite';
      },
      
      shouldShowSubscriptionUpsell: () => {
        const state = get();
        const effectiveTier = get().getEffectiveTier();
        
        return effectiveTier === 'free' && (
          state.usageThisMonth.tripsCreated >= 1 || // Show after 1st trip
          state.showSubscriptionUpsell
        );
      },
      
      dismissSubscriptionUpsell: () => {
        set({ showSubscriptionUpsell: false });
      },
      
      resetMonthlyUsageIfNeeded: () => {
        const state = get();
        
        if (SubscriptionService.shouldResetMonthlyUsage(state.usageThisMonth.resetDate)) {
          set({
            usageThisMonth: {
              tripsCreated: 0,
              templatesCreated: 0,
              journalEntries: 0,
              packingListShares: 0,
              pdfExports: 0,
              resetDate: SubscriptionService.getNextResetDate(),
            },
          });
        }
      },
      
      setUser: (user) => {
        set({ 
          user: { ...user, subscriptionTier: 'elite' }, // Force elite tier
          isAuthenticated: true,
          subscriptionTier: 'elite', // Force elite tier at root as well
          subscriptionExpiry: user.subscriptionExpiry,
        });
      },
      
      logout: () => {
        try {
          // Clear user authentication but keep app preferences
          set((state) => ({
            ...state,
            user: null,
            isAuthenticated: false,
            hasCompletedOnboarding: false,
          }));
        } catch (error) {
          console.warn('Logout error:', error);
          // Force a complete reset if partial logout fails
          try {
            set({
              ...defaultPreferences,
              ...defaultAppState,
              ...defaultUserAuth,
            });
          } catch (resetError) {
            console.warn('Reset error during logout:', resetError);
          }
        }
      },

      updateProfile: (profile) => set((state) => ({
        user: {
          ...state.user,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
        },
      })),
    }),
    {
      name: 'tripkit-user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);