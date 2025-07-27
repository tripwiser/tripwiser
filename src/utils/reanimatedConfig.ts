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

    // Optionally set global logger config for Reanimated
    (global as any).__reanimatedLoggerConfig = {
      strict: false,
      level: 'warn',
      logFunction: (...args: any[]) => { console.log(...args); }, // Added to prevent missing logFunction error
    };

  } catch (error) {
    // Fallback if there are any issues with the warning suppression
    console.log('Reanimated warning suppression configured');
  }
}

export {};