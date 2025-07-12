import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, PackingItem, SubscriptionTier } from '../types';
import { PackingTemplate } from '../state/templateStore';
import { SubscriptionService } from './subscriptionService';

export interface SyncData {
  trips: Trip[];
  templates: PackingTemplate[];
  lastSynced: string;
  deviceId: string;
}

export interface SyncStatus {
  isEnabled: boolean;
  lastSyncTime?: string;
  isSyncing: boolean;
  hasConflicts: boolean;
  conflictCount: number;
}

export class CloudSyncService {
  private static instance: CloudSyncService;
  private apiUrl = 'https://api.tripkit.app'; // Mock API endpoint
  private syncKey = 'tripkit-cloud-sync';
  private deviceId: string;
  
  private constructor() {
    this.deviceId = this.generateDeviceId();
  }
  
  static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }
  
  private generateDeviceId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  
  async isCloudSyncEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(`${this.syncKey}-enabled`);
      return enabled === 'true';
    } catch {
      return false;
    }
  }
  
  async enableCloudSync(userId: string, subscriptionTier: SubscriptionTier): Promise<boolean> {
    const features = SubscriptionService.getFeatures(subscriptionTier);
    if (!features.cloudSync) {
      throw new Error('Cloud sync requires Pro or Elite subscription');
    }
    
    try {
      await AsyncStorage.setItem(`${this.syncKey}-enabled`, 'true');
      await AsyncStorage.setItem(`${this.syncKey}-userId`, userId);
      return true;
    } catch (error) {
      console.error('Failed to enable cloud sync:', error);
      return false;
    }
  }
  
  async disableCloudSync(): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.syncKey}-enabled`);
      await AsyncStorage.removeItem(`${this.syncKey}-userId`);
      await AsyncStorage.removeItem(`${this.syncKey}-lastSync`);
    } catch (error) {
      console.error('Failed to disable cloud sync:', error);
    }
  }
  
  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const enabled = await this.isCloudSyncEnabled();
      const lastSyncTime = await AsyncStorage.getItem(`${this.syncKey}-lastSync`);
      const isSyncing = await AsyncStorage.getItem(`${this.syncKey}-syncing`) === 'true';
      
      return {
        isEnabled: enabled,
        lastSyncTime: lastSyncTime || undefined,
        isSyncing,
        hasConflicts: false, // TODO: Implement conflict detection
        conflictCount: 0,
      };
    } catch {
      return {
        isEnabled: false,
        isSyncing: false,
        hasConflicts: false,
        conflictCount: 0,
      };
    }
  }
  
  async syncData(trips: Trip[], templates: PackingTemplate[], force = false): Promise<SyncData | null> {
    const isEnabled = await this.isCloudSyncEnabled();
    if (!isEnabled && !force) {
      return null;
    }
    
    try {
      await AsyncStorage.setItem(`${this.syncKey}-syncing`, 'true');
      
      // In a real implementation, this would sync with a remote server
      // For now, we'll simulate cloud sync by storing data locally with a different key
      const syncData: SyncData = {
        trips,
        templates,
        lastSynced: new Date().toISOString(),
        deviceId: this.deviceId,
      };
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store in "cloud" (actually local storage with cloud prefix)
      await AsyncStorage.setItem(`${this.syncKey}-cloud-data`, JSON.stringify(syncData));
      await AsyncStorage.setItem(`${this.syncKey}-lastSync`, syncData.lastSynced);
      
      return syncData;
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      await AsyncStorage.setItem(`${this.syncKey}-syncing`, 'false');
    }
  }
  
  async downloadCloudData(): Promise<SyncData | null> {
    const isEnabled = await this.isCloudSyncEnabled();
    if (!isEnabled) {
      return null;
    }
    
    try {
      // In real implementation, this would fetch from remote server
      const cloudData = await AsyncStorage.getItem(`${this.syncKey}-cloud-data`);
      
      if (!cloudData) {
        return null;
      }
      
      return JSON.parse(cloudData) as SyncData;
    } catch (error) {
      console.error('Failed to download cloud data:', error);
      return null;
    }
  }
  
  async resolveConflicts(localData: SyncData, cloudData: SyncData): Promise<SyncData> {
    // Simple conflict resolution: merge and prefer newer items
    const resolvedTrips = this.mergeTrips(localData.trips, cloudData.trips);
    const resolvedTemplates = this.mergeTemplates(localData.templates, cloudData.templates);
    
    return {
      trips: resolvedTrips,
      templates: resolvedTemplates,
      lastSynced: new Date().toISOString(),
      deviceId: this.deviceId,
    };
  }
  
  private mergeTrips(localTrips: Trip[], cloudTrips: Trip[]): Trip[] {
    const merged = new Map<string, Trip>();
    
    // Add local trips
    localTrips.forEach(trip => {
      merged.set(trip.id, trip);
    });
    
    // Merge cloud trips (prefer newer updatedAt)
    cloudTrips.forEach(cloudTrip => {
      const localTrip = merged.get(cloudTrip.id);
      
      if (!localTrip) {
        merged.set(cloudTrip.id, cloudTrip);
      } else {
        // Compare updatedAt and keep newer version
        const localTime = new Date(localTrip.updatedAt).getTime();
        const cloudTime = new Date(cloudTrip.updatedAt).getTime();
        
        if (cloudTime > localTime) {
          merged.set(cloudTrip.id, cloudTrip);
        }
      }
    });
    
    return Array.from(merged.values());
  }
  
  private mergeTemplates(localTemplates: PackingTemplate[], cloudTemplates: PackingTemplate[]): PackingTemplate[] {
    const merged = new Map<string, PackingTemplate>();
    
    // Add local templates
    localTemplates.forEach(template => {
      merged.set(template.id, template);
    });
    
    // Merge cloud templates (prefer newer updatedAt)
    cloudTemplates.forEach(cloudTemplate => {
      const localTemplate = merged.get(cloudTemplate.id);
      
      if (!localTemplate) {
        merged.set(cloudTemplate.id, cloudTemplate);
      } else {
        // Compare updatedAt and keep newer version
        const localTime = new Date(localTemplate.updatedAt).getTime();
        const cloudTime = new Date(cloudTemplate.updatedAt).getTime();
        
        if (cloudTime > localTime) {
          merged.set(cloudTemplate.id, cloudTemplate);
        }
      }
    });
    
    return Array.from(merged.values());
  }
  
  async exportUserData(trips: Trip[], templates: PackingTemplate[]): Promise<string> {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: {
        trips: trips.map(trip => ({
          ...trip,
          // Remove any sensitive data if needed
        })),
        templates: templates.filter(t => t.isCustom), // Only export custom templates
      },
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  async importUserData(jsonData: string): Promise<{ trips: Trip[]; templates: PackingTemplate[] }> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.data || !importData.version) {
        throw new Error('Invalid import format');
      }
      
      // Validate and clean imported data
      const trips = (importData.data.trips || []).map((trip: any) => ({
        ...trip,
        id: trip.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
        createdAt: trip.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      const templates = (importData.data.templates || []).map((template: any) => ({
        ...template,
        id: template.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
        isCustom: true,
        createdAt: template.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: template.usageCount || 0,
      }));
      
      return { trips, templates };
    } catch (error) {
      console.error('Import failed:', error);
      throw new Error('Failed to import data. Please check the file format.');
    }
  }
}

export const cloudSyncService = CloudSyncService.getInstance();