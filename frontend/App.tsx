import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator, Text } from "react-native";
import React from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import AppNavigator from "./src/navigation/AppNavigator";
import './src/utils/reanimatedConfig';
import { ThemeProvider } from './src/theme/ThemeContext';
import './src/i18n/i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n/i18n';
import { scheduleDailyTravelTip } from './src/services/notificationService';
import mixpanel from './src/services/analytics';
// import "./src/utils/suppressWarnings"; // Suppress development warnings

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App crashed:', error);
    console.error('Error info:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            App Crashed
          </Text>
          <Text style={{ fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
            {this.state.error?.message || 'Unknown error occurred'}
          </Text>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#666' }}>
            Please restart the app or check the console for more details.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Racing Sans One': require('./assets/fonts/RacingSansOne-Regular.ttf'),
  });

  React.useEffect(() => {
    if (fontsLoaded) {
      // Hide splash screen once fonts are loaded
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Notification setup
  React.useEffect(() => {
    (async () => {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Enable notifications to receive important updates!');
      }
      // Set notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      // Listen for notifications
      const subscription = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });
      // Show a test notification on mount
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Welcome to Tripwiser!',
          body: 'Notifications are enabled.',
        },
        trigger: null,
      });
      // Schedule daily travel tip
      await scheduleDailyTravelTip('Always keep a digital copy of your important documents.');
      return () => subscription.remove();
    })();
  }, []);

  React.useEffect(() => {
    // Track app launch event
    mixpanel.track('App Launched');
  }, []);

  console.log('Fonts loaded:', fontsLoaded);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    // @ts-ignore
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <ErrorBoundary>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <NavigationContainer>
                <AppNavigator />
                <StatusBar style="auto" />
              </NavigationContainer>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </ErrorBoundary>
      </ThemeProvider>
    </I18nextProvider>
  );
}