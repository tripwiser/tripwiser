// Notification utility for Tripwiser
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Helper to get trigger for a specific date/time
function getCalendarTrigger(date: Date, hours: number, minutes: number = 0, repeats: boolean = false) {
  return {
    type: 'calendar',
    year: date.getFullYear(),
    month: date.getMonth() + 1, // JS months are 0-based, Expo expects 1-based
    day: date.getDate(),
    hour: hours,
    minute: minutes,
    repeats,
  } as Notifications.CalendarTriggerInput;
}

// 1. Trip Start/Upcoming Trip Reminder
export async function scheduleTripReminder(tripName: string, destination: string, startDate: string) {
  const tripStart = new Date(startDate);
  const oneDayBefore = new Date(tripStart);
  oneDayBefore.setDate(tripStart.getDate() - 1);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Upcoming Trip: ${tripName}`,
      body: `Your trip to ${destination} starts tomorrow! Don’t forget to pack your essentials.`,
      sound: true,
    },
    trigger: getCalendarTrigger(oneDayBefore, 9), // 9am the day before
  });
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Trip Starts Today!` ,
      body: `Bon voyage! Your trip to ${destination} starts today.`,
      sound: true,
    },
    trigger: getCalendarTrigger(tripStart, 8), // 8am on start date
  });
}

// 2. Packing List Reminder
export async function schedulePackingReminder(tripName: string, destination: string, startDate: string) {
  const tripStart = new Date(startDate);
  const oneDayBefore = new Date(tripStart);
  oneDayBefore.setDate(tripStart.getDate() - 1);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Packing Reminder` ,
      body: `Have you checked off everything on your packing list for your trip to ${destination}?`,
      sound: true,
    },
    trigger: getCalendarTrigger(oneDayBefore, 18), // 6pm the day before
  });
}

// 3. Weather Alert
export async function scheduleWeatherAlert(destination: string, startDate: string, weather: string) {
  const tripStart = new Date(startDate);
  const oneDayBefore = new Date(tripStart);
  oneDayBefore.setDate(tripStart.getDate() - 1);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Weather Alert for ${destination}`,
      body: weather,
      sound: true,
    },
    trigger: getCalendarTrigger(oneDayBefore, 7), // 7am the day before
  });
}

// 4. Itinerary Activity Reminder
export async function scheduleItineraryActivityReminder(activityTitle: string, activityTime: string, tripName: string) {
  const activityDate = new Date(activityTime);
  const oneHourBefore = new Date(activityDate.getTime() - 60 * 60 * 1000);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `Upcoming Activity: ${activityTitle}`,
      body: `Your activity for ${tripName} starts in 1 hour.`,
      sound: true,
    },
    trigger: getCalendarTrigger(oneHourBefore, oneHourBefore.getHours(), oneHourBefore.getMinutes()),
  });
}

// 5. Daily Travel Tip
export async function scheduleDailyTravelTip(tip: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Travel Tip of the Day',
      body: tip,
      sound: true,
    },
    trigger: {
      type: 'calendar',
      hour: 8,
      minute: 0,
      repeats: true,
    } as Notifications.CalendarTriggerInput,
  });
}

/*
Example usage:
import { scheduleTripReminder, schedulePackingReminder, scheduleWeatherAlert, scheduleItineraryActivityReminder, scheduleDailyTravelTip } from './notificationService';

// When creating a trip:
scheduleTripReminder('Paris Adventure', 'Paris', '2024-07-01T00:00:00.000Z');
schedulePackingReminder('Paris Adventure', 'Paris', '2024-07-01T00:00:00.000Z');

// When weather is fetched:
scheduleWeatherAlert('Paris', '2024-07-01T00:00:00.000Z', 'Rain is expected tomorrow. Pack an umbrella!');

// For each itinerary activity:
scheduleItineraryActivityReminder('Eiffel Tower Tour', '2024-07-02T10:00:00.000Z', 'Paris Adventure');

// On app start (once):
scheduleDailyTravelTip('Always keep a digital copy of your important documents.');
*/ 