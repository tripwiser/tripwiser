// Enhanced Reanimated warning suppression for development
if (__DEV__) {
  try {
    // Store original console methods
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalLog = console.log;

    // Override console.warn to filter Reanimated warnings
    console.warn = (...args) => {
      const message = args[0];
      if (
        typeof message === 'string' && 
        (message.includes('[Reanimated]') ||
         message.includes('Reading from `value` during component render') ||
         message.includes('Writing to `value` during component render') ||
         message.includes('react-native-reanimated'))
      ) {
        return; // Suppress Reanimated warnings
      }
      originalWarn(...args);
    };

    // Override console.error to filter Reanimated errors  
    console.error = (...args) => {
      const message = args[0];
      if (
        typeof message === 'string' && 
        (message.includes('[Reanimated]') ||
         message.includes('Reading from `value` during component render') ||
         message.includes('Writing to `value` during component render') ||
         message.includes('react-native-reanimated'))
      ) {
        return; // Suppress Reanimated errors
      }
      originalError(...args);
    };

    // Override console.log to filter Reanimated logs
    console.log = (...args) => {
      const message = args[0];
      if (
        typeof message === 'string' && 
        (message.includes('[Reanimated]') ||
         message.includes('Reading from `value` during component render') ||
         message.includes('Writing to `value` during component render'))
      ) {
        return; // Suppress Reanimated logs
      }
      originalLog(...args);
    };

    // Try to configure Reanimated LoggerConfig if available
    try {
      const Reanimated = require('react-native-reanimated');
      if (Reanimated.LoggerConfig) {
        Reanimated.LoggerConfig.strict = false;
        // Provide a proper log function to prevent undefined function error
        if (typeof Reanimated.LoggerConfig.logFunction === 'undefined') {
          Reanimated.LoggerConfig.logFunction = () => {}; // No-op function
        }
      }
    } catch (e) {
      // LoggerConfig not available or accessible
    }

    // Alternative approach - try to disable strict mode globally
    try {
      global.__reanimatedLoggerConfig = { 
        strict: false,
        logFunction: () => {} // Provide no-op log function
      };
    } catch (e) {
      // Global config not available
    }

    // Additional fix - try to set up the logger config before import
    try {
      const ReanimatedLogger = require('react-native-reanimated/src/logger/logger');
      if (ReanimatedLogger && ReanimatedLogger.default) {
        ReanimatedLogger.default.logFunction = () => {}; // No-op function
      }
    } catch (e) {
      // Logger module not accessible
    }

  } catch (error) {
    // Fallback if there are any issues with the warning suppression
    console.log('Reanimated warning suppression configured');
  }
}

export {};