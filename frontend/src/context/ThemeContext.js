import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT_COLORS, DARK_COLORS } from '../styles/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemColorScheme === 'dark');
  const [loadComplete, setLoadComplete] = useState(false);

  useEffect(() => {
    // Load preference from storage
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('user-theme');
        if (savedTheme !== null) {
          setDarkMode(savedTheme === 'dark');
        } else {
          setDarkMode(systemColorScheme === 'dark');
        }
      } catch (e) {
        console.log('Error loading theme:', e);
      } finally {
        setLoadComplete(true);
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    try {
      const newMode = !darkMode;
      setDarkMode(newMode);
      await AsyncStorage.setItem('user-theme', newMode ? 'dark' : 'light');
    } catch (e) {
      console.log('Error saving theme:', e);
    }
  };

  const colors = darkMode ? DARK_COLORS : LIGHT_COLORS;

  // Values exposed to consumers
  const value = {
    darkMode,
    setDarkMode,
    toggleTheme,
    colors,
    loadComplete
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
