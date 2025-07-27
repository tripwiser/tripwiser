import { Trip, SubscriptionTier } from '../types';
import { SubscriptionService } from './subscriptionService';
import apiService from './apiService';
import { buildApiUrl } from '../config/api';

export interface TravelTip {
  id: string;
  title: string;
  content: string;
  category: 'packing' | 'destination' | 'general' | 'weather' | 'culture' | 'safety';
  requiredTier: SubscriptionTier;
  destination?: string;
  tags: string[];
  rating: number;
  usageCount: number;
  isPremium?: boolean;
  isDailyTip?: boolean;
  generatedAt?: string;
}

// Basic tips for free users
const basicTips: TravelTip[] = [
  {
    id: 'basic-1',
    title: 'Roll Your Clothes',
    content: 'Rolling clothes instead of folding saves 30% more space in your suitcase and prevents wrinkles.',
    category: 'packing',
    requiredTier: 'free',
    tags: ['space-saving', 'wrinkles', 'basics'],
    rating: 4.8,
    usageCount: 0,
  },
  {
    id: 'basic-2',
    title: 'Pack One Extra Day',
    content: 'Always pack one extra day worth of essentials in case of delays or emergencies.',
    category: 'packing',
    requiredTier: 'free',
    tags: ['emergency', 'delays', 'essentials'],
    rating: 4.7,
    usageCount: 0,
  },
  {
    id: 'basic-3',
    title: 'Check the Weather',
    content: 'Always check the weather forecast 3-5 days before departure to adjust your packing list.',
    category: 'weather',
    requiredTier: 'free',
    tags: ['weather', 'forecast', 'planning'],
    rating: 4.6,
    usageCount: 0,
  },
  {
    id: 'basic-4',
    title: 'Important Documents',
    content: 'Keep copies of important documents (passport, ID, tickets) in separate locations.',
    category: 'safety',
    requiredTier: 'free',
    tags: ['documents', 'safety', 'backup'],
    rating: 4.9,
    usageCount: 0,
  },
];

// Premium destination-specific tips
const premiumTips: TravelTip[] = [
  {
    id: 'premium-paris-1',
    title: 'Paris Metro Etiquette',
    content: 'In Paris, always move to the center of the metro car and remove your backpack in crowded spaces. Keep your bag in front of you.',
    category: 'destination',
    requiredTier: 'pro',
    destination: 'Paris',
    tags: ['paris', 'metro', 'etiquette', 'transport'],
    rating: 4.8,
    usageCount: 0,
  },
  {
    id: 'premium-tokyo-1',
    title: 'Tokyo Shoe Etiquette',
    content: 'Pack slip-on shoes for Tokyo visits. You will remove shoes frequently when entering homes, temples, and some restaurants.',
    category: 'destination',
    requiredTier: 'pro',
    destination: 'Tokyo',
    tags: ['tokyo', 'shoes', 'culture', 'temples'],
    rating: 4.9,
    usageCount: 0,
  },
  {
    id: 'premium-london-1',
    title: 'London Weather Layers',
    content: 'London weather changes quickly. Pack layers and always carry a compact umbrella, even on sunny days.',
    category: 'destination',
    requiredTier: 'pro',
    destination: 'London',
    tags: ['london', 'weather', 'layers', 'umbrella'],
    rating: 4.7,
    usageCount: 0,
  },
  {
    id: 'premium-general-1',
    title: 'Power Adapter Strategy',
    content: 'Research the exact plug type for your destination. Some countries use multiple types (like UK vs Northern Ireland).',
    category: 'general',
    requiredTier: 'pro',
    tags: ['power', 'adapter', 'electronics', 'research'],
    rating: 4.6,
    usageCount: 0,
  },
  {
    id: 'premium-culture-1',
    title: 'Cultural Dress Codes',
    content: 'Research dress codes for religious sites, upscale restaurants, and business meetings in your destination.',
    category: 'culture',
    requiredTier: 'pro',
    tags: ['culture', 'dress-code', 'respect', 'planning'],
    rating: 4.8,
    usageCount: 0,
  },
];

export class TravelTipsService {
  private static instance: TravelTipsService;
  private allTips: TravelTip[] = [...basicTips, ...premiumTips];
  
  static getInstance(): TravelTipsService {
    if (!TravelTipsService.instance) {
      TravelTipsService.instance = new TravelTipsService();
    }
    return TravelTipsService.instance;
  }
  
  getTipsForTrip(trip: Trip, isPremium: boolean): TravelTip[] {
    let availableTips = this.allTips.filter(tip => 
      isPremium || !tip.isPremium
    );
    
    // Filter by destination if premium
    if (isPremium && trip.destination) {
      const destinationSpecific = availableTips.filter(tip => 
        tip.destination && tip.destination.toLowerCase().includes(trip.destination.toLowerCase())
      );
      
      const general = availableTips.filter(tip => !tip.destination);
      
      // Combine destination-specific and general tips
      availableTips = [...destinationSpecific, ...general];
    }
    
    // Sort by rating and usage (less used tips first)
    return availableTips
      .sort((a, b) => {
        if (a.usageCount !== b.usageCount) {
          return a.usageCount - b.usageCount; // Less used first
        }
        return b.rating - a.rating; // Higher rated first
      })
      .slice(0, isPremium ? 10 : 3); // More tips for premium users
  }
  
  getDailyTip(isPremium: boolean): TravelTip {
    const availableTips = this.allTips.filter(tip => 
      isPremium || !tip.isPremium
    );
    
    // Select based on current date to ensure consistency
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const tipIndex = dayOfYear % availableTips.length;
    
    return availableTips[tipIndex];
  }
  
  getTipsByCategory(category: TravelTip['category'], isPremium: boolean): TravelTip[] {
    return this.allTips
      .filter(tip => 
        tip.category === category && (isPremium || !tip.isPremium)
      )
      .sort((a, b) => b.rating - a.rating);
  }
  
  searchTips(query: string, subscriptionTier: SubscriptionTier): TravelTip[] {
    const searchTerm = query.toLowerCase();
    
    return this.allTips
      .filter(tip => {
        if (!this.canAccessTip(tip, subscriptionTier)) return false;
        
        return (
          tip.title.toLowerCase().includes(searchTerm) ||
          tip.content.toLowerCase().includes(searchTerm) ||
          tip.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          (tip.destination && tip.destination.toLowerCase().includes(searchTerm))
        );
      })
      .sort((a, b) => b.rating - a.rating);
  }
  
  incrementTipUsage(tipId: string): void {
    const tip = this.allTips.find(t => t.id === tipId);
    if (tip) {
      tip.usageCount++;
    }
  }
  
  private canAccessTip(tip: TravelTip, subscriptionTier: SubscriptionTier): boolean {
    switch (tip.requiredTier) {
      case 'free':
        return true;
      case 'pro':
        return subscriptionTier === 'pro' || subscriptionTier === 'elite';
      case 'elite':
        return subscriptionTier === 'elite';
      default:
        return true;
    }
  }
  
  getRandomTip(subscriptionTier: SubscriptionTier, category?: TravelTip['category']): TravelTip {
    let availableTips = this.allTips.filter(tip => 
      this.canAccessTip(tip, subscriptionTier)
    );
    
    if (category) {
      availableTips = availableTips.filter(tip => tip.category === category);
    }
    
    const randomIndex = Math.floor(Math.random() * availableTips.length);
    return availableTips[randomIndex];
  }
  
  getWeatherBasedTips(trip: Trip, subscriptionTier: SubscriptionTier): TravelTip[] {
    const tips: TravelTip[] = [];
    
    if (trip.weather) {
      const temp = (trip.weather.temperature.min + trip.weather.temperature.max) / 2;
      
      if (temp < 10) {
        tips.push({
          id: 'weather-cold',
          title: 'Cold Weather Packing',
          content: 'Layer your clothing for cold destinations. Pack thermal underwear, wool socks, and waterproof outer layer.',
          category: 'weather',
          requiredTier: 'free',
          tags: ['cold', 'layers', 'thermal'],
          rating: 4.7,
          usageCount: 0,
        });
      } else if (temp > 25) {
        tips.push({
          id: 'weather-hot',
          title: 'Hot Weather Essentials', 
          content: 'Pack light, breathable fabrics, extra sunscreen, and electrolyte packets for hot destinations.',
          category: 'weather',
          requiredTier: 'free',
          tags: ['hot', 'sun', 'hydration'],
          rating: 4.6,
          usageCount: 0,
        });
      }
      
      if (trip.weather.condition.includes('rain') || trip.weather.condition.includes('storm')) {
        tips.push({
          id: 'weather-rain',
          title: 'Rainy Weather Prep',
          content: 'Pack waterproof bags for electronics, quick-dry clothing, and comfortable waterproof shoes.',
          category: 'weather',
          requiredTier: 'free',
          tags: ['rain', 'waterproof', 'protection'],
          rating: 4.8,
          usageCount: 0,
        });
      }
    }
    
    return tips;
  }

  /**
   * Get daily AI-generated travel tip from backend
   * @param category - Optional category for the tip
   * @param destination - Optional destination for destination-specific tips
   * @returns Promise with the generated tip
   */
  async getAIDailyTip(category?: string, destination?: string): Promise<TravelTip> {
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (destination) params.append('destination', destination);
      
      console.log('Fetching AI daily tip using apiService...');
      
      // Use the existing apiService instead of direct fetch
      const response = await apiService.get(`/travel-tips/daily?${params.toString()}`);
      
      console.log('AI daily tip response:', response.data);
      
      if (response.data.success) {
        return response.data.tip;
      } else {
        throw new Error(response.data.message || 'Failed to get daily tip');
      }
    } catch (error) {
      console.error('Error getting AI daily tip:', error);
      console.error('API URL used:', buildApiUrl('/travel-tips/daily'));
      console.error('Full error details:', error);
      // Fallback to static daily tip
      return this.getDailyTip(false);
    }
  }

  /**
   * Get multiple AI-generated travel tips from backend
   * @param count - Number of tips to generate
   * @returns Promise with array of generated tips
   */
  async getAIMultipleTips(count: number = 5): Promise<TravelTip[]> {
    try {
      const response = await fetch(`${buildApiUrl('/travel-tips/multiple')}?count=${count}`);
      const data = await response.json();
      
      if (data.success) {
        return data.tips;
      } else {
        throw new Error(data.message || 'Failed to get multiple tips');
      }
    } catch (error) {
      console.error('Error getting AI multiple tips:', error);
      // Fallback to static tips
      return this.getTipsByCategory('general', false);
    }
  }

  /**
   * Generate a custom AI travel tip
   * @param category - Category for the tip
   * @param destination - Optional destination for destination-specific tips
   * @returns Promise with the generated tip
   */
  async generateCustomAITip(category: string, destination?: string): Promise<TravelTip> {
    try {
      const response = await fetch(`${buildApiUrl('/travel-tips/generate')}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category, destination }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.tip;
      } else {
        throw new Error(data.message || 'Failed to generate custom tip');
      }
    } catch (error) {
      console.error('Error generating custom AI tip:', error);
      // Fallback to random static tip
      return this.getRandomTip('free', category as any);
    }
  }

  /**
   * Generate a dynamic travel tip using backend AI (legacy method)
   * @param context - Context for the tip generation
   * @returns Promise with the generated tip
   */
  async generateDynamicTip(context: {
    destination?: string;
    packing?: string;
    weather?: string;
    culture?: string;
    safety?: string;
  }): Promise<string> {
    try {
      const response = await apiService.post('/packing/generate-tip', context);
      return response.data.tip;
    } catch (error) {
      console.error('Error generating dynamic travel tip:', error);
      // Fallback to a static tip if AI generation fails
      return 'Stay safe and enjoy your travels!';
    }
  }

  /**
   * Submit a user travel tip for AI moderation and posting
   * @param user - User ID
   * @param trip - Trip ID
   * @param content - Tip content
   * @returns Promise with backend response (success, tip, or error)
   */
  async submitUserTip(user: string, trip: string | undefined, content: string) {
    try {
      // Always use demo user if user is not provided
      const demoUserId = '64b7f8c2e1a2b3c4d5e6f7a8';
      const payload: any = { user: user || demoUserId, content };
      if (trip) payload.trip = trip;
      const response = await apiService.post('/travel-tips/submit', payload);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'Failed to submit tip', error: error.message };
    }
  }

  /**
   * Add a comment to a tip
   */
  async addComment(tipId: string, user: string | undefined, text: string) {
    try {
      const response = await apiService.post(`/travel-tips/${tipId}/comment`, { user, text });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'Failed to add comment', error: error.message };
    }
  }

  /**
   * Get all comments for a tip
   */
  async getComments(tipId: string) {
    try {
      const response = await apiService.get(`/travel-tips/${tipId}/comments`);
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'Failed to fetch comments', error: error.message };
    }
  }

  /**
   * Rate a tip
   */
  async rateTip(tipId: string, user: string | undefined, value: number) {
    try {
      const response = await apiService.post(`/travel-tips/${tipId}/rate`, { user, value });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'Failed to rate tip', error: error.message };
    }
  }

  /**
   * Report a tip
   */
  async reportTip(tipId: string, user: string | undefined, reason: string) {
    try {
      const response = await apiService.post(`/travel-tips/${tipId}/report`, { user, reason });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      return { success: false, message: 'Failed to report tip', error: error.message };
    }
  }
}

export const travelTipsService = TravelTipsService.getInstance();