
import "./global.css";
import "react-native-get-random-values";

// Disable Reanimated strict mode in development
if (__DEV__) {
  try {
    require('./src/utils/suppressWarnings');
  } catch (e) {
    console.log('Warning suppression loaded');
  }
}
import { LogBox } from "react-native";
LogBox.ignoreLogs([
  "Expo AV has been deprecated", 
  "Disconnected from Metro",
  "[Reanimated] Reading from `value` during component render",
  "[Reanimated] Writing to `value` during component render",
  "react-native-reanimated",
  "logger.ts"
]);
//DO NOT REMOVE THE ABOVE CODE

import { registerRootComponent } from "expo";

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
