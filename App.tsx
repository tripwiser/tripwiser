import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { View, ActivityIndicator } from "react-native";
import React from "react";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';

import AppNavigator from "./src/navigation/AppNavigator";
import "./src/utils/suppressWarnings"; // Suppress development warnings
import "./src/utils/reanimatedConfig"; // Configure Reanimated logger

export default function App() {
  const [fontsLoaded] = useFonts({
    'Racing Sans One': require('./assets/fonts/RacingSansOne-Regular.ttf'),
  });

  console.log('Fonts loaded:', fontsLoaded);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}