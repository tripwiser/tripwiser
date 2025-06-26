import * as Notifications from 'expo-notifications';
import { Trip, PackingItem } from '../types';
import { differenceInDays, addDays, format } from 'date-fns';

export interface ReminderSettings {
  enabled: boolean;
  daysBeforeTrip: number[];
  timeOfDay: { hour: number; minute: number };
  includeWeatherReminders: boolean;
  includeEssentialOnly: boolean;
}

export interface SmartReminder {
  id: string;
  tripId: string;
  title: string;
  body: string;
  scheduledFor: Date;
  type: 'packing' | 'weather' | 'essentials' | 'final-check';
  items?: string[];
  priority: 'low' | 'medium' | 'high';
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class ReminderService {
  private static instance: ReminderService;
  
  static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }
  
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  }
  
  generateSmartReminders(trip: Trip, settings: ReminderSettings, isPremium: boolean): SmartReminder[] {
    const reminders: SmartReminder[] = [];
    const tripStart = new Date(trip.startDate);
    const now = new Date();
    const daysUntilTrip = differenceInDays(tripStart, now);
    
    if (daysUntilTrip <= 0) return reminders; // Trip already started or passed
    
    // Basic reminders for free users (essentials only)
    if (!isPremium || settings.includeEssentialOnly) {
      const essentialItems = trip.packingList.filter(item => item.essential && !item.packed);
      
      if (essentialItems.length > 0) {
        // 3 days before reminder
        if (daysUntilTrip >= 3) {
          const reminderDate = addDays(now, daysUntilTrip - 3);
          reminderDate.setHours(settings.timeOfDay.hour, settings.timeOfDay.minute, 0, 0);
          
          reminders.push({
            id: `${trip.id}-essentials-3d`,
            tripId: trip.id,
            title: `🧳 ${trip.name} - Pack Essentials`,
            body: `Don't forget your essentials! ${essentialItems.slice(0, 3).map(i => i.name).join(', ')}${essentialItems.length > 3 ? ` and ${essentialItems.length - 3} more` : ''}`,
            scheduledFor: reminderDate,
            type: 'essentials',
            items: essentialItems.map(i => i.name),
            priority: 'high',
          });
        }
        
        // 1 day before reminder
        if (daysUntilTrip >= 1) {
          const reminderDate = addDays(now, daysUntilTrip - 1);
          reminderDate.setHours(settings.timeOfDay.hour, settings.timeOfDay.minute, 0, 0);
          
          reminders.push({
            id: `${trip.id}-essentials-1d`,
            tripId: trip.id,
            title: `⚡ Final Check - ${trip.name}`,
            body: `Your trip is tomorrow! Make sure you have: ${essentialItems.slice(0, 2).map(i => i.name).join(', ')}`,
            scheduledFor: reminderDate,
            type: 'final-check',
            items: essentialItems.map(i => i.name),
            priority: 'high',
          });
        }
      }
      
      return reminders;
    }
    
    // Premium smart reminders
    const unpackedItems = trip.packingList.filter(item => !item.packed);
    const essentialItems = trip.packingList.filter(item => item.essential && !item.packed);
    const categoryGroups = this.groupItemsByCategory(unpackedItems);
    
    // Smart scheduling based on trip duration and type
    const reminderSchedule = this.calculateOptimalSchedule(trip, daysUntilTrip);
    
    reminderSchedule.forEach((schedule, index) => {
      const reminderDate = addDays(now, schedule.daysBeforeTrip);
      reminderDate.setHours(settings.timeOfDay.hour, settings.timeOfDay.minute, 0, 0);
      
      if (schedule.type === 'category-focus' && categoryGroups.length > index) {
        const category = categoryGroups[index];
        reminders.push({
          id: `${trip.id}-category-${index}`,
          tripId: trip.id,
          title: `📦 Pack ${category.name} - ${trip.name}`,
          body: `Time to pack your ${category.name.toLowerCase()}: ${category.items.slice(0, 3).map(i => i.name).join(', ')}${category.items.length > 3 ? '...' : ''}`,
          scheduledFor: reminderDate,
          type: 'packing',
          items: category.items.map(i => i.name),
          priority: schedule.priority,
        });
      } else if (schedule.type === 'weather-check' && settings.includeWeatherReminders) {
        reminders.push({
          id: `${trip.id}-weather-${index}`,
          tripId: trip.id,
          title: `🌤️ Weather Check - ${trip.name}`,
          body: `Check the weather for ${trip.destination} and adjust your packing accordingly!`,
          scheduledFor: reminderDate,
          type: 'weather',
          priority: schedule.priority,
        });
      } else if (schedule.type === 'essentials' && essentialItems.length > 0) {
        reminders.push({
          id: `${trip.id}-essentials-${index}`,
          tripId: trip.id,
          title: `⭐ Essential Items - ${trip.name}`,
          body: `Don't forget these essentials: ${essentialItems.slice(0, 3).map(i => i.name).join(', ')}`,
          scheduledFor: reminderDate,
          type: 'essentials',
          items: essentialItems.map(i => i.name),
          priority: schedule.priority,
        });
      }
    });
    
    // Final check reminder
    if (daysUntilTrip >= 1) {
      const finalCheckDate = addDays(now, daysUntilTrip - 1);
      finalCheckDate.setHours(20, 0, 0, 0); // Evening before
      
      reminders.push({
        id: `${trip.id}-final-check`,
        tripId: trip.id,
        title: `✈️ Ready for ${trip.name}?`,
        body: `Your trip is tomorrow! Final packing check: ${Math.round((trip.packingList.filter(i => i.packed).length / trip.packingList.length) * 100)}% complete`,
        scheduledFor: finalCheckDate,
        type: 'final-check',
        priority: 'high',
      });
    }
    
    return reminders.filter(r => r.scheduledFor > now);
  }
  
  private groupItemsByCategory(items: PackingItem[]): { name: string; items: PackingItem[] }[] {
    const groups = items.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, PackingItem[]>);
    
    return Object.entries(groups)
      .map(([name, items]) => ({ name, items }))
      .sort((a, b) => b.items.length - a.items.length); // Sort by number of items
  }
  
  private calculateOptimalSchedule(trip: Trip, daysUntilTrip: number): Array<{
    daysBeforeTrip: number;
    type: 'category-focus' | 'weather-check' | 'essentials' | 'final-check';
    priority: 'low' | 'medium' | 'high';
  }> {
    const schedule = [];
    
    if (daysUntilTrip >= 7) {
      // Week+ before trip
      schedule.push(
        { daysBeforeTrip: 7, type: 'category-focus' as const, priority: 'medium' as const },
        { daysBeforeTrip: 5, type: 'weather-check' as const, priority: 'low' as const },
        { daysBeforeTrip: 3, type: 'essentials' as const, priority: 'high' as const },
        { daysBeforeTrip: 1, type: 'final-check' as const, priority: 'high' as const }
      );
    } else if (daysUntilTrip >= 3) {
      // 3-7 days before
      schedule.push(
        { daysBeforeTrip: Math.max(1, daysUntilTrip - 2), type: 'category-focus' as const, priority: 'medium' as const },
        { daysBeforeTrip: 1, type: 'essentials' as const, priority: 'high' as const }
      );
    } else {
      // Last minute
      schedule.push(
        { daysBeforeTrip: 1, type: 'essentials' as const, priority: 'high' as const }
      );
    }
    
    return schedule.filter(s => s.daysBeforeTrip <= daysUntilTrip && s.daysBeforeTrip > 0);
  }
  
  async scheduleReminders(reminders: SmartReminder[]): Promise<string[]> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }
    
    // Cancel existing notifications for the trip
    const existingIds = reminders.map(r => r.id);
    await Notifications.cancelScheduledNotificationsAsync(existingIds);
    
    const scheduledIds: string[] = [];
    
    for (const reminder of reminders) {
      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          identifier: reminder.id,
          content: {
            title: reminder.title,
            body: reminder.body,
            data: {
              tripId: reminder.tripId,
              type: reminder.type,
              items: reminder.items,
            },
          },
          trigger: {
            date: reminder.scheduledFor,
          },
        });
        
        scheduledIds.push(notificationId);
      } catch (error) {
        console.error('Failed to schedule reminder:', reminder.id, error);
      }
    }
    
    return scheduledIds;
  }
  
  async cancelRemindersForTrip(tripId: string): Promise<void> {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const tripNotifications = scheduled
      .filter(n => n.content.data?.tripId === tripId)
      .map(n => n.identifier);
    
    if (tripNotifications.length > 0) {
      await Notifications.cancelScheduledNotificationsAsync(tripNotifications);
    }
  }
  
  async updateRemindersForTrip(trip: Trip, settings: ReminderSettings, isPremium: boolean): Promise<void> {
    // Cancel existing reminders
    await this.cancelRemindersForTrip(trip.id);
    
    if (!settings.enabled) return;
    
    // Generate new reminders
    const reminders = this.generateSmartReminders(trip, settings, isPremium);
    
    // Schedule them
    await this.scheduleReminders(reminders);
  }
}