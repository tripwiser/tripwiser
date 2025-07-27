import React, { createContext, useContext } from 'react';
import { Appearance } from 'react-native';
import { useUserStore } from '../state/userStore';

// Smart theme object with semantic keys and isDark boolean
export const themes = {
  light: {
    isDark: false,
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#1A202C',
    muted: '#6B7280',
    border: '#E5E7EB',
    primary: '#4F46E5',
    secondary: '#6366F1',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    inputBackground: '#F1F5F9',
    inputBorder: '#E5E7EB',
  },
  dark: {
    isDark: true,
    background: '#1A202C',
    card: '#23272F',
    text: '#F7FAFC',
    muted: '#A0AEC0',
    border: '#374151',
    primary: '#818CF8',
    secondary: '#6366F1',
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
    inputBackground: '#23272F',
    inputBorder: '#374151',
  }
};

const ThemeContext = createContext(themes.light);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const themeSetting = useUserStore((s) => s.theme);
  const systemTheme = Appearance.getColorScheme();
  const theme = themeSetting === 'system' ? (systemTheme === 'dark' ? themes.dark : themes.light) : themes[themeSetting];
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext); 