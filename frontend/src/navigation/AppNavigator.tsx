import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import MyTripsScreen from '../screens/MyTripsScreen';
import TripSetupScreen from '../screens/TripSetupScreen';
import QuickTripSetupScreen from '../screens/QuickTripSetupScreen';
import PackingListScreen from '../screens/PackingListScreen';
import JournalScreen from '../screens/JournalScreen';
import AddJournalEntryScreen from '../screens/AddJournalEntryScreen';
import ViewJournalEntryScreen from '../screens/ViewJournalEntryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PremiumScreen from '../screens/PremiumScreen';
import TemplatesScreen from '../screens/TemplatesScreen';
import ViewTemplateScreen from '../screens/ViewTemplateScreen';
import SmartTemplateSetupScreen from '../screens/SmartTemplateSetupScreen';
import TravelTipsScreen from '../screens/TravelTipsScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';

import { useUserStore } from '../state/userStore';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  TripSetup: { editTripId?: string; templateId?: string; createTemplate?: boolean; templateName?: string; createSmartTemplate?: boolean };
  SmartTemplateSetup: undefined;
  QuickTripSetup: { mode: 'ongoing' | 'completed' };
  PackingList: { tripId: string };
  Journal: { tripId: string };
  AddJournalEntry: { tripId: string; entryId?: string };
  ViewJournalEntry: { tripId: string; entryId: string };
  Premium: undefined;
  Subscription: undefined;
  Templates: undefined;
  ViewTemplate: { templateId: string };
  TravelTips: undefined;
};

export type TabParamList = {
  MyTrips: undefined;
  Templates: undefined;
  TravelTips: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'MyTrips') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Templates') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'TravelTips') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4F46E5',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="MyTrips" 
        component={MyTripsScreen} 
        options={{ tabBarLabel: 'My Trips' }}
      />
      <Tab.Screen 
        name="Templates" 
        component={TemplatesScreen} 
        options={{ tabBarLabel: 'Templates' }}
      />
      <Tab.Screen 
        name="TravelTips" 
        component={TravelTipsScreen} 
        options={{ tabBarLabel: 'Tips' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const hasCompletedOnboarding = useUserStore((state) => state.hasCompletedOnboarding);
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      {!hasCompletedOnboarding ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : !isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen 
            name="SignUp" 
            component={SignUpScreen}
            options={{
              animation: 'slide_from_bottom',
            }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen 
            name="TripSetup" 
            component={TripSetupScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Plan Your Trip',
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: '600',
              },
            }}
          />
          <Stack.Screen 
            name="QuickTripSetup" 
            component={QuickTripSetupScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="PackingList" 
            component={PackingListScreen}
            options={{
              headerShown: true,
              headerTitle: 'Packing List',
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: '600',
              },
              headerBackTitleVisible: false,
            }}
          />
          <Stack.Screen 
            name="Journal" 
            component={JournalScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="AddJournalEntry" 
            component={AddJournalEntryScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
            }}
          />
          <Stack.Screen 
            name="ViewJournalEntry" 
            component={ViewJournalEntryScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Templates" 
            component={TemplatesScreen}
            options={{
              headerShown: true,
              headerTitle: 'Templates',
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: '600',
              },
            }}
          />
          <Stack.Screen 
            name="SmartTemplateSetup" 
            component={SmartTemplateSetupScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="TravelTips" 
            component={TravelTipsScreen}
            options={{
              headerShown: true,
              headerTitle: 'Travel Tips',
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: '600',
              },
            }}
          />
          <Stack.Screen 
            name="Premium" 
            component={PremiumScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Upgrade to Premium',
              headerTitleStyle: {
                fontSize: 18,
                fontWeight: '600',
              },
            }}
          />
          <Stack.Screen 
            name="ViewTemplate" 
            component={ViewTemplateScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen 
            name="Subscription" 
            component={SubscriptionScreen}
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}