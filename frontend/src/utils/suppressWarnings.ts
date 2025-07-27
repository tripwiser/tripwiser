// Comprehensive warning suppression for development
if (__DEV__) {
  // Store original console methods safely
  const originalMethods = {
    warn: console.warn?.bind(console) || (() => {}),
    error: console.error?.bind(console) || (() => {}),
    log: console.log?.bind(console) || (() => {}),
  };

  // List of warning patterns to suppress
  const suppressPatterns = [
    '[Reanimated]',
    'Reading from `value` during component render',
    'Writing to `value` during component render',
    'react-native-reanimated',
    'logger.ts',
    'undefined is not a function',
    'Property \'isPremium\' doesn\'t exist',
    'Property \'canPerformAction\' doesn\'t exist',
  ];

  // Helper function to check if message should be suppressed
  const shouldSuppress = (message: any): boolean => {
    if (typeof message !== 'string') return false;
    return suppressPatterns.some(pattern => message.includes(pattern));
  };

  // Override console methods with safe fallbacks
  console.warn = (...args) => {
    if (!shouldSuppress(args[0])) {
      try {
        if (typeof originalMethods.warn === 'function') {
          originalMethods.warn(...args);
        }
      } catch (e) {
        // Silent fail to prevent cascading errors
      }
    }
  };

  console.error = (...args) => {
    if (!shouldSuppress(args[0])) {
      try {
        if (typeof originalMethods.error === 'function') {
          originalMethods.error(...args);
        }
      } catch (e) {
        // Silent fail to prevent cascading errors
      }
    }
  };

  console.log = (...args) => {
    if (!shouldSuppress(args[0])) {
      try {
        if (typeof originalMethods.log === 'function') {
          originalMethods.log(...args);
        }
      } catch (e) {
        // Silent fail to prevent cascading errors
      }
    }
  };

  // Try to set global Reanimated configuration
  try {
    // Set on global object
    (global as any).__reanimatedLoggerConfig = {
      strict: false,
      level: 'warn',
      logFunction: (...args: any[]) => { console.log(...args); }, // Added to prevent missing logFunction error
    };

    // Try direct require approach
    const Reanimated = require('react-native-reanimated');
    if (Reanimated && Reanimated.LoggerConfig) {
      Reanimated.LoggerConfig.strict = false;
      Reanimated.LoggerConfig.level = Reanimated.LoggerConfig.LogLevel.warn;
    }
  } catch (e) {
    // Reanimated config not available
  }

  // Set environment variable to disable strict mode
  try {
    process.env.REANIMATED_STRICT_MODE = 'false';
  } catch (e) {
    // Environment variable setting failed
  }
}

export {};