import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { transactionsAPI } from '../services/api';
import { RADIUS, CAT_ICONS, CAT_COLORS } from '../styles/theme';
import { currentMonthLabel } from '../utils/helpers';
import { SectionHeader, Toast } from '../components/UI';

export default function ReportScreen() {
  const { colors } = useTheme();
  const { formatAmount } = useCurrency();
  
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0 });
  const [report, setReport] = useState({ totalSpent: 0, transactionCount: 0, dailyAvg: 0, budgetUsedPercent: 0 });
  const [chartData, setChartData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });

  const fetchData = async () => {
    try {
      const [summaryRes, chartRes, reportRes, dailyRes] = await Promise.all([
        transactionsAPI.getSummary(),
        transactionsAPI.getChart(),
        transactionsAPI.getReport(),
        transactionsAPI.getDailyActivity(),
      ]);
      setSummary(summaryRes.data.data);
      setChartData(chartRes.data.data);
      setReport(reportRes.data.data);
      setDailyData(dailyRes.data.data);
    } catch (err) {
      console.log('Fetch error:', err.message);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const openEdit = (item) => { setEditItem(item); setModalVisible(true); };

  const maxBar = Math.max(...chartData.map((b) => b.total), 1);
  const maxDailyBar = Math.max(...dailyData.map((b) => b.total), 1);

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg3 },
    header: {
      backgroundColor: colors.bg, paddingHorizontal: 16, paddingVertical: 16,
      borderBottomWidth: 0.5, borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 24, fontWeight: '700', color: colors.text },
    headerSub: { fontSize: 13, color: colors.text2, marginTop: 4 },
    scroll: { flex: 1 },
    content: { padding: 16, paddingBottom: 40 },

    card: {
      backgroundColor: colors.bg, borderRadius: RADIUS.lg,
      padding: 16, marginBottom: 20, borderWidth: 0.5, borderColor: colors.border,
      elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05, shadowRadius: 3,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
    statCard: {
      width: '48%', backgroundColor: colors.bg, borderRadius: RADIUS.lg,
      padding: 16, borderWidth: 0.5, borderColor: colors.border,
      elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 2,
    },
    statIcon: { fontSize: 22, marginBottom: 10 },
    statLabel: { fontSize: 11, fontWeight: '600', color: colors.text2, textTransform: 'uppercase', marginBottom: 4 },
    statVal: { fontSize: 16, fontWeight: '700', color: colors.text },
    statSub: { fontSize: 10, color: colors.text2, marginTop: 4 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    sumItem: { flex: 1 },
    sumLabel: { fontSize: 11, fontWeight: '600', color: colors.text2, textTransform: 'uppercase', marginBottom: 4 },
    sumVal: { fontSize: 18, fontWeight: '700', color: colors.text },

    chartCard: {
      backgroundColor: colors.bg, borderWidth: 0.5, borderColor: colors.border,
      borderRadius: RADIUS.lg, padding: 16, marginBottom: 20,
    },
    chartTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 16 },
    chartBars: { flexDirection: 'row', alignItems: 'flex-end', height: 140, gap: 10 },
    barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
    barFill: { width: '100%', borderRadius: 6, backgroundColor: colors.greenLight },
    barFillCurrent: { backgroundColor: colors.green },
    barLabel: { fontSize: 11, color: colors.text2, fontWeight: '500' },
    barVal: { fontSize: 9, color: colors.text2, marginBottom: 2 },

    dailyCard: {
      backgroundColor: colors.bg, borderWidth: 0.5, borderColor: colors.border,
      borderRadius: RADIUS.lg, padding: 16, marginBottom: 20,
    },
    dailyScroll: { marginTop: 10 },
    dailyBarCol: { width: 30, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
    dailyBarFill: { width: 12, borderRadius: 6, backgroundColor: colors.blueLight },
    dailyBarFillNow: { backgroundColor: colors.blue },
    dailyBarLabel: { fontSize: 10, color: colors.text2 },

    progressBar: { height: 6, backgroundColor: colors.bg3, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },
  });

  return (
    <SafeAreaView style={s.safe}>
      <Toast message={toast.message} visible={toast.visible} />
      
      <View style={s.header}>
        <Text style={s.headerTitle}>Monthly Report</Text>
        <Text style={s.headerSub}>Overview for {currentMonthLabel()}</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />}
      >
        <View style={s.grid}>
          {/* Total Spent */}
          <View style={s.statCard}>
            <Text style={s.statIcon}>💸</Text>
            <Text style={s.statLabel}>Total Spent</Text>
            <Text style={[s.statVal, { color: colors.red }]}>{formatAmount(report.totalSpent)}</Text>
          </View>

          {/* Transactions */}
          <View style={s.statCard}>
            <Text style={s.statIcon}>📝</Text>
            <Text style={s.statLabel}>Transactions</Text>
            <Text style={s.statVal}>{report.transactionCount}</Text>
            <Text style={s.statSub}>Total entries</Text>
          </View>

          {/* Daily Avg */}
          <View style={s.statCard}>
            <Text style={s.statIcon}>📊</Text>
            <Text style={s.statLabel}>Daily Avg</Text>
            <Text style={s.statVal}>{formatAmount(report.dailyAvg)}</Text>
            <Text style={s.statSub}>Average per day</Text>
          </View>

          {/* Budget Used */}
          <View style={s.statCard}>
            <Text style={s.statIcon}>🎯</Text>
            <Text style={s.statLabel}>Budget Used</Text>
            <Text style={[s.statVal, { color: report.budgetUsedPercent > 90 ? colors.red : colors.green }]}>
              {Math.round(report.budgetUsedPercent)}%
            </Text>
            <View style={[s.progressBar, { width: '100%', marginTop: 6, height: 4 }]}>
              <View 
                style={[
                  s.progressFill, 
                  { 
                    width: `${Math.min(100, report.budgetUsedPercent)}%`, 
                    backgroundColor: report.budgetUsedPercent > 90 ? colors.red : colors.green 
                  }
                ]} 
              />
            </View>
          </View>
        </View>

        <View style={s.chartCard}>
          <Text style={s.chartTitle}>Expense Overview (Last 6 Months)</Text>
          <View style={s.chartBars}>
            {chartData.map((bar, i) => (
              <View key={i} style={s.barCol}>
                <Text style={s.barVal}>{bar.total > 0 ? formatAmount(bar.total).split(' ')[1] : ''}</Text>
                <View
                  style={[
                    s.barFill,
                    { height: Math.max(6, Math.round((bar.total / maxBar) * 100)) },
                    bar.isCurrent && s.barFillCurrent,
                  ]}
                />
                <Text style={s.barLabel}>{bar.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Daily Activity Chart */}
        <View style={s.dailyCard}>
          <Text style={s.chartTitle}>Daily Activity (This Month)</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={s.dailyScroll}
            contentContainerStyle={{ paddingBottom: 10, gap: 4 }}
          >
            {dailyData.map((item, i) => (
              <View key={i} style={s.dailyBarCol}>
                <View
                  style={[
                    s.dailyBarFill,
                    { height: Math.max(4, Math.round((item.total / maxDailyBar) * 80)) },
                    !item.isFuture && item.total > 0 && s.dailyBarFillNow,
                    item.isFuture && { opacity: 0.3 },
                  ]}
                />
                <Text style={s.dailyBarLabel}>{item.day}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
