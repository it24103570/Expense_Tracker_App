import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { useMonth } from '../context/MonthContext';
import { transactionsAPI, budgetsAPI } from '../services/api';
import { RADIUS, CAT_ICONS, CAT_COLORS } from '../styles/theme';
import { currentMonthLabel } from '../utils/helpers';
import NotificationService from '../services/notificationService';
import TransactionItem from '../components/TransactionItem';
import TransactionModal from '../components/TransactionModal';
import { SectionHeader, EmptyState, Toast } from '../components/UI';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const { formatAmount } = useCurrency();
  const { selectedMonth } = useMonth();
  
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0 });
  const [categories, setCategories] = useState([]);
  const [recent, setRecent] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });

  const showToast = (msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: msg, visible: false }), 2500);
  };

  const fetchData = async () => {
    try {
      const params = { month: selectedMonth.month, year: selectedMonth.year };
      const [summaryRes, catsRes, recentRes] = await Promise.all([
        transactionsAPI.getSummary(params),
        transactionsAPI.getCategories(params),
        transactionsAPI.getAll({ ...params, limit: 4 }), // ✅ FIXED: Added month & year params
      ]);
      setSummary(summaryRes.data.data);
      setCategories(catsRes.data.data);
      setRecent(recentRes.data.data);
    } catch (err) {
      console.log('Fetch error:', err.message);
    }
  };

  useFocusEffect(useCallback(() => { fetchData(); }, [selectedMonth]));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleSave = async (data) => {
    try {
      if (editItem) {
        await transactionsAPI.update(editItem._id, data);
        showToast('Transaction updated!');
      } else {
        await transactionsAPI.create(data);
        showToast('Transaction added!');
        
        // --- Budget Notification Logic ---
        if (data.type === 'expense') {
          // Fetch updated budgets to check if limit exceeded
          const budgetRes = await budgetsAPI.getAll();
          const budgets = budgetRes.data.data;
          
          // Find the budget for the category we just added an expense to
          const categoryBudget = budgets.find(b => b.category.toLowerCase() === data.category.toLowerCase());
          
          if (categoryBudget && categoryBudget.spent > categoryBudget.limit) {
            // Trigger local notification
            await NotificationService.sendBudgetAlert(
              categoryBudget.category,
              formatAmount(categoryBudget.spent),
              formatAmount(categoryBudget.limit)
            );
          }
        }
      }
      await fetchData();
    } catch (err) {
      showToast(err.message || 'Error saving transaction');
    }
  };

  const openAdd = () => { setEditItem(null); setModalVisible(true); };
  const openEdit = (item) => { setEditItem(item); setModalVisible(true); };

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg3 },
    topbar: {
      backgroundColor: colors.bg, borderBottomWidth: 0.5,
      borderBottomColor: colors.border, paddingHorizontal: 16,
      paddingVertical: 12, flexDirection: 'row', alignItems: 'center',
    },
    topbarSub: { fontSize: 12, color: colors.text2 },
    topbarTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
    addBtn: { padding: 4 },
    addBtnText: { fontSize: 26, color: colors.green, fontWeight: '400' },
    scroll: { flex: 1 },
    content: { padding: 16, paddingBottom: 32 },

    summaryCard: {
      backgroundColor: colors.green, borderRadius: RADIUS.lg,
      padding: 20, marginBottom: 16,
    },
    summaryMonth: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
    summaryBalance: { fontSize: 32, fontWeight: '600', color: colors.white, marginBottom: 16 },
    summaryRow: { flexDirection: 'row', gap: 12 },
    summaryItem: {
      flex: 1, backgroundColor: 'rgba(255,255,255,0.18)',
      borderRadius: RADIUS.md, padding: 10,
    },
    summaryItemLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: 2 },
    summaryItemVal: { fontSize: 14, fontWeight: '600', color: colors.white },

    breakdownCard: {
      backgroundColor: colors.bg, borderWidth: 0.5, borderColor: colors.border,
      borderRadius: RADIUS.lg, padding: 16, marginBottom: 16,
    },
    breakdownTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 14 },
    catRow: { marginBottom: 16 },
    catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    catLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    catIcon: { 
      width: 32, height: 32, borderRadius: 16, 
      alignItems: 'center', justifyContent: 'center' 
    },
    catIconText: { fontSize: 16 },
    catName: { fontSize: 14, fontWeight: '500', color: colors.text },
    catAmount: { fontSize: 14, fontWeight: '600', color: colors.text },
    catPercent: { fontSize: 12, color: colors.text2, marginLeft: 4 },
    progressBg: { height: 6, backgroundColor: colors.bg3, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 3 },
  });

  return (
    <SafeAreaView style={s.safe}>
      <Toast message={toast.message} visible={toast.visible} />

      {/* Top Bar */}
      <View style={s.topbar}>
        <View style={{ flex: 1 }}>
          <Text style={s.topbarSub}>Welcome back, <Text style={{ fontSize: 16 }}>👋</Text></Text>
          <Text style={s.topbarTitle}>{user?.name?.split(' ')[0] || 'User'}</Text>
        </View>
        <TouchableOpacity 
          style={s.addBtn} 
          onPress={openAdd}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Text style={s.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />}
      >
        {/* Summary Card */}
        <View style={s.summaryCard}>
          <Text style={s.summaryMonth}>{summary.month || currentMonthLabel()}</Text>
          <Text style={s.summaryBalance}>{formatAmount(summary.balance)}</Text>
          <View style={s.summaryRow}>
            <View style={s.summaryItem}>
              <Text style={s.summaryItemLabel}>↑ Income</Text>
              <Text style={s.summaryItemVal}>{formatAmount(summary.income)}</Text>
            </View>
            <View style={s.summaryItem}>
              <Text style={s.summaryItemLabel}>↓ Expenses</Text>
              <Text style={s.summaryItemVal}>{formatAmount(summary.expenses)}</Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        {categories.length > 0 && (
          <View style={s.breakdownCard}>
            <Text style={s.breakdownTitle}>Spending Breakdown</Text>
            {categories.slice(0, 4).map((item) => (
              <View key={item.category} style={s.catRow}>
                <View style={s.catHeader}>
                  <View style={s.catLabel}>
                    <View style={[s.catIcon, { backgroundColor: CAT_COLORS[item.category] || colors.bg3 }]}>
                      <Text style={s.catIconText}>{CAT_ICONS[item.category] || '📦'}</Text>
                    </View>
                    <Text style={s.catName}>
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </Text>
                  </View>
                  <Text style={s.catAmount}>
                    {formatAmount(item.amount)}
                    <Text style={s.catPercent}> ({Math.round(item.percentage)}%)</Text>
                  </Text>
                </View>
                <View style={s.progressBg}>
                  <View 
                    style={[
                      s.progressFill, 
                      { 
                        width: `${item.percentage}%`, 
                        backgroundColor: colors.green 
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
            {categories.length > 4 && (
              <TouchableOpacity onPress={() => navigation.navigate('Report')}>
                <Text style={{ color: colors.green, fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                  View All Categories
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Recent Transactions */}
        <SectionHeader
          title="Recent Transactions"
          actionLabel="See all"
          onAction={() => navigation.navigate('Transactions')}
        />
        {recent.length === 0 ? (
          <EmptyState icon="🧾" message="No transactions yet. Tap + to add one." />
        ) : (
          recent.map((item) => (
            <TransactionItem key={item._id} item={item} onPress={openEdit} />
          ))
        )}
      </ScrollView>

      <TransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        editItem={editItem}
      />
    </SafeAreaView>
  );
}
