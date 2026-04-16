import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useCurrency, CURRENCIES } from '../context/CurrencyContext';
import { RADIUS } from '../styles/theme';
import { transactionsAPI, usersAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationService from '../services/notificationService';

export default function SettingsScreen({ navigation }) {
  const { colors, darkMode, toggleTheme } = useTheme();
  const { currency, changeCurrency, formatAmount } = useCurrency();
  
  const [stats, setStats] = useState({ totalEntries: 0, totalTracked: 0 });
  const [loading, setLoading] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await transactionsAPI.getStats();
      setStats(res.data.data);
    } catch (err) {
      console.log('Stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const value = await AsyncStorage.getItem('dailyReminderEnabled');
      if (value !== null) {
        setReminderEnabled(value === 'true');
      }
    } catch (err) {
      console.log('Error loading notification settings:', err);
    }
  };

  const toggleReminder = async (value) => {
    setReminderEnabled(value);
    try {
      await AsyncStorage.setItem('dailyReminderEnabled', value.toString());
      if (value) {
        // Schedule for 8:00 PM (20:00)
        await NotificationService.scheduleDailyReminder(20, 0);
        Alert.alert('Notifications Enabled', 'Daily reminder set for 8:00 PM.');
      } else {
        await NotificationService.cancelDailyReminders();
      }
    } catch (err) {
      console.log('Error saving notification settings:', err);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to delete all transactions? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Everything', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await transactionsAPI.deleteAll();
              fetchStats();
              Alert.alert('Success', 'All data has been cleared.');
            } catch (err) {
              Alert.alert('Error', err.message);
            }
          } 
        },
      ]
    );
  };

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg3 },
    topbar: {
      backgroundColor: colors.bg, borderBottomWidth: 0.5,
      borderBottomColor: colors.border, paddingHorizontal: 16,
      paddingVertical: 12, flexDirection: 'row', alignItems: 'center',
    },
    backBtn: { marginRight: 12, padding: 4 },
    topbarTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
    scroll: { flex: 1 },
    content: { padding: 16, paddingBottom: 40 },
    sectionTitle: { 
      fontSize: 12, fontWeight: '700', color: '#9A9A9E', 
      textTransform: 'uppercase', marginBottom: 12, marginLeft: 4,
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: colors.bg, borderWidth: 0.5, borderColor: colors.border,
      borderRadius: RADIUS.lg, marginBottom: 24, overflow: 'hidden',
      elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 3,
    },
    row: { 
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
      padding: 16 
    },
    rowLabel: { fontSize: 15, color: colors.text },
    rowSub: { fontSize: 12, color: colors.text2, marginTop: 2 },
    
    // Currency styles
    currencyScroll: { marginBottom: 16 },
    currencyContent: { paddingHorizontal: 4, gap: 8 },
    currencyPill: {
      paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md,
      backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
      alignItems: 'center', minWidth: 70
    },
    currencyPillActive: {
      backgroundColor: colors.green, borderColor: colors.green
    },
    currencyCode: { fontSize: 14, fontWeight: '700', color: colors.text },
    currencySymbol: { fontSize: 11, color: colors.text2, marginTop: 2 },
    activeText: { color: colors.white },

    // Stats Styles
    statsCard: {
      flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between'
    },
    statItem: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, height: 40, backgroundColor: colors.border, opacity: 0.5 },
    statVal: { fontSize: 18, fontWeight: '700', color: '#5B67C9', marginBottom: 6 },
    statLabel: { fontSize: 10, fontWeight: '600', color: '#9A9A9E', textTransform: 'uppercase' },

    // Data Styles
    clearBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
      padding: 16, backgroundColor: '#FFF5F5', margin: 12, borderRadius: RADIUS.md,
      borderWidth: 1, borderColor: '#FFE5E5'
    },
    clearText: { color: '#E53E3E', fontWeight: '700', fontSize: 16, marginLeft: 8 },

    // Signature Styles
    signature: { alignItems: 'center', marginTop: 20 },
    sigLogo: { fontSize: 32, marginBottom: 8 },
    sigAppName: { fontSize: 22, fontWeight: '800', color: colors.text },
    sigVersion: { fontSize: 12, color: colors.text2, marginBottom: 16, marginTop: 4 },
    sigDesc: { 
      fontSize: 14, color: '#9A9A9E', textAlign: 'center', 
      paddingHorizontal: 20, lineHeight: 20 
    }
  });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={{ fontSize: 20, color: colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={s.topbarTitle}>Settings</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {/* Currency section */}
        <Text style={s.sectionTitle}>Currency</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={s.currencyScroll}
          contentContainerStyle={s.currencyContent}
        >
          {CURRENCIES.map((c) => (
            <TouchableOpacity 
              key={c.code} 
              style={[s.currencyPill, currency.code === c.code && s.currencyPillActive]}
              onPress={() => changeCurrency(c)}
            >
              <Text style={[s.currencyCode, currency.code === c.code && s.activeText]}>{c.code}</Text>
              <Text style={[s.currencySymbol, currency.code === c.code && s.activeText]}>{c.symbol}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={s.sectionTitle}>Notifications</Text>
        <View style={s.card}>
          <View style={s.row}>
            <View>
              <Text style={s.rowLabel}>Daily Reminder</Text>
              <Text style={s.rowSub}>Remind me to track my expenses at 8:00 PM</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={toggleReminder}
              trackColor={{ false: colors.border, true: colors.green + '80' }}
              thumbColor={reminderEnabled ? colors.green : '#f4f3f4'}
            />
          </View>
        </View>

        <Text style={s.sectionTitle}>Appearance</Text>
        <View style={s.card}>
          <View style={s.row}>
            <View>
              <Text style={s.rowLabel}>Dark Mode</Text>
              <Text style={s.rowSub}>Enjoy a darker color palette</Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.green + '80' }}
              thumbColor={darkMode ? colors.green : '#f4f3f4'}
            />
          </View>
        </View>

        {/* App Stats */}
        <Text style={s.sectionTitle}>App Stats</Text>
        <View style={s.card}>
          <View style={s.statsCard}>
            <View style={s.statItem}>
              <Text style={s.statVal}>{stats.totalEntries}</Text>
              <Text style={s.statLabel}>Total Entries</Text>
            </View>
            <View style={s.statDivider} />
            <View style={[s.statItem, { flex: 1.5 }]}>
              <Text style={[s.statVal, { fontSize: 16, textAlign: 'center' }]}>
                {formatAmount(stats.totalTracked).split(' ')[0]} {formatAmount(stats.totalTracked).split(' ')[1]}
              </Text>
              <Text style={s.statLabel}>Total Tracked</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={[s.statVal, { color: '#5B67C9' }]}>{currency.code}</Text>
              <Text style={s.statLabel}>Currency</Text>
            </View>
          </View>
        </View>

        {/* Data section */}
        <Text style={s.sectionTitle}>Data</Text>
        <View style={s.card}>
          <TouchableOpacity style={s.clearBtn} onPress={handleClearData}>
            <Text style={{ fontSize: 18 }}>🗑️</Text>
            <Text style={s.clearText}>Clear All Expense Data</Text>
          </TouchableOpacity>
        </View>

        {/* Signature Footer */}
        <View style={s.signature}>
          <Text style={s.sigLogo}>💰</Text>
          <Text style={s.sigAppName}>Expense Tracker</Text>
          <Text style={s.sigVersion}>Version 1.0.0</Text>
          <Text style={s.sigDesc}>
            Track your daily expenses, set budgets, and understand your spending habits.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
