import { SubscriptionTier, SubscriptionFeatures } from '../types';

export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, SubscriptionFeatures> = {
  free: {
    // Trip limits
    maxActiveTrips: 1,
    maxTotalTrips: 3,
    maxOfflineTrips: 1,
    
    // Template limits
    maxTemplatesCreatedPerMonth: 1,
    maxTemplatesUsed: 3,
    
    // Journal limits
    maxJournalEntriesPerMonth: 5,
    maxJournalContributors: 3,
    
    // Collaboration limits
    maxCollaboratorsPerTrip: 3,
    
    // Sharing limits
    maxPackingListShares: 'unlimited', // view-only
    maxPackingListSharesPerMonth: 1,
    
    // Export limits
    maxPDFExportsPerMonth: 1,
    maxPDFExportsTotal: 3,
    
    // Features
    cloudSync: false,
    customListImport: false,
    adFree: false,
    supportTier: 'basic',
  },
  
  pro: {
    // Trip limits
    maxActiveTrips: 'unlimited',
    maxTotalTrips: 'unlimited',
    maxOfflineTrips: 'unlimited',
    
    // Template limits
    maxTemplatesCreatedPerMonth: 1,
    maxTemplatesUsed: 'unlimited',
    
    // Journal limits (called "moments" in user specs)
    maxJournalEntriesPerMonth: 20,
    maxJournalContributors: 3,
    
    // Collaboration limits
    maxCollaboratorsPerTrip: 3,
    
    // Sharing limits
    maxPackingListShares: 'unlimited',
    maxPackingListSharesPerMonth: 'unlimited',
    
    // Export limits (PDF and links)
    maxPDFExportsPerMonth: 'unlimited',
    maxPDFExportsTotal: 'unlimited',
    
    // Features
    cloudSync: true,
    customListImport: true,
    adFree: true,
    supportTier: 'standard',
  },
  
  elite: {
    // Trip limits
    maxActiveTrips: 'unlimited',
    maxTotalTrips: 'unlimited',
    maxOfflineTrips: 'unlimited',
    
    // Template limits
    maxTemplatesCreatedPerMonth: 'unlimited',
    maxTemplatesUsed: 'unlimited',
    
    // Journal limits (unlimited moments)
    maxJournalEntriesPerMonth: 'unlimited',
    maxJournalContributors: 'unlimited',
    
    // Collaboration limits (unlimited people per trip)
    maxCollaboratorsPerTrip: 'unlimited',
    
    // Sharing limits
    maxPackingListShares: 'unlimited',
    maxPackingListSharesPerMonth: 'unlimited',
    
    // Export limits
    maxPDFExportsPerMonth: 'unlimited',
    maxPDFExportsTotal: 'unlimited',
    
    // Features
    cloudSync: true,
    customListImport: true,
    adFree: true,
    supportTier: 'priority',
  },
};

export const SUBSCRIPTION_PRICING = {
  pro: {
    monthly: 5,
    annual: 48,
  },
  elite: {
    monthly: 9,
    annual: 81,
  },
};

export class SubscriptionService {
  static getFeatures(tier: SubscriptionTier): SubscriptionFeatures {
    return SUBSCRIPTION_FEATURES[tier];
  }
  
  static canPerformAction(
    tier: SubscriptionTier,
    action: keyof SubscriptionFeatures | string,
    currentUsage: number
  ): boolean {
    const features = this.getFeatures(tier);
    
    // Map action strings to feature keys
    let featureKey: keyof SubscriptionFeatures;
    switch (action) {
      case 'createTrip':
        featureKey = 'maxActiveTrips';
        break;
      case 'createTemplate':
        featureKey = 'maxTemplatesCreatedPerMonth';
        break;
      case 'createJournalEntry':
        featureKey = 'maxJournalEntriesPerMonth';
        break;
      case 'sharePackingList':
        featureKey = 'maxPackingListSharesPerMonth';
        break;
      case 'exportPdf':
        featureKey = 'maxPDFExportsPerMonth';
        break;
      default:
        featureKey = action as keyof SubscriptionFeatures;
    }
    
    const limit = features[featureKey];
    
    if (limit === 'unlimited') return true;
    if (typeof limit === 'number') return currentUsage < limit;
    if (typeof limit === 'boolean') return limit;
    
    return false;
  }
  
  static getRemainingCount(
    tier: SubscriptionTier,
    feature: keyof SubscriptionFeatures | string,
    currentUsage: number
  ): number | 'unlimited' {
    const features = this.getFeatures(tier);
    
    // Map action strings to feature keys
    let featureKey: keyof SubscriptionFeatures;
    switch (feature) {
      case 'createTrip':
        featureKey = 'maxActiveTrips';
        break;
      case 'createTemplate':
        featureKey = 'maxTemplatesCreatedPerMonth';
        break;
      case 'createJournalEntry':
        featureKey = 'maxJournalEntriesPerMonth';
        break;
      case 'sharePackingList':
        featureKey = 'maxPackingListSharesPerMonth';
        break;
      case 'exportPdf':
        featureKey = 'maxPDFExportsPerMonth';
        break;
      default:
        featureKey = feature as keyof SubscriptionFeatures;
    }
    
    const limit = features[featureKey];
    
    if (limit === 'unlimited') return 'unlimited';
    if (typeof limit === 'number') return Math.max(0, limit - currentUsage);
    
    return 0;
  }
  
  static isExpired(subscriptionExpiry?: string): boolean {
    if (!subscriptionExpiry) return false;
    return new Date(subscriptionExpiry) < new Date();
  }
  
  static getEffectiveTier(tier: SubscriptionTier, subscriptionExpiry?: string): SubscriptionTier {
    if (tier === 'free') return 'free';
    
    if (this.isExpired(subscriptionExpiry)) {
      return 'free'; // Downgrade to free if subscription expired
    }
    
    return tier;
  }
  
  static shouldResetMonthlyUsage(resetDate: string): boolean {
    const reset = new Date(resetDate);
    const now = new Date();
    
    // Check if we're in a new month
    return reset.getMonth() !== now.getMonth() || reset.getFullYear() !== now.getFullYear();
  }
  
  static getNextResetDate(): string {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toISOString();
  }

  static getPlanDisplayName(tier: SubscriptionTier): string {
    switch (tier) {
      case 'free':
        return 'Free Plan';
      case 'pro':
        return 'Pro Plan';
      case 'elite':
        return 'Elite Plan';
      default:
        return 'Unknown Plan';
    }
  }

  static getPlanDescription(tier: SubscriptionTier): string {
    switch (tier) {
      case 'free':
        return 'Perfect for trying out TripKit';
      case 'pro':
        return 'For solo travelers and casual explorers';
      case 'elite':
        return 'Premium experience';
      default:
        return '';
    }
  }

  static getUpgradeRecommendation(currentTier: SubscriptionTier, usage: any): SubscriptionTier | null {
    if (currentTier === 'elite') return null;
    
    if (currentTier === 'free') {
      // Recommend Pro for basic upgrade
      if (usage.tripsCreated >= 1 || usage.journalEntries >= 3) {
        return 'pro';
      }
    }
    
    if (currentTier === 'pro') {
      // Recommend Elite for unlimited collaboration
      if (usage.templatesCreated >= 1 || usage.journalEntries >= 15) {
        return 'elite';
      }
    }
    
    return null;
  }
}