import React from 'react';
import { LogBox } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { CurrencyProvider } from './src/context/CurrencyContext';
import { MonthProvider } from './src/context/MonthContext';
import AppNavigator from './src/navigation/AppNavigator';

import * as Notifications from 'expo-notifications';

// Suppress the warning since we are only using local notifications
LogBox.ignoreLogs([
  'expo-notifications: Android Push notifications functionality was removed from Expo Go',
]);


export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <CurrencyProvider>
          <AuthProvider>
            <MonthProvider>
              <StatusBar style="auto" />
              <AppNavigator />
            </MonthProvider>
          </AuthProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
