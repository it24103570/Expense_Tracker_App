import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { useMonth } from '../context/MonthContext';
import { budgetsAPI } from '../services/api';
import { RADIUS, BUDGET_CATEGORIES, CAT_ICONS } from '../styles/theme';
import { PrimaryButton, EmptyState, Toast } from '../components/UI';

export default function BudgetScreen() {
  const { colors } = useTheme();
  const { formatAmount, currency, convertToBase, convertFromBase } = useCurrency();
  const { selectedMonth } = useMonth();
  const [budgets, setBudgets] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCat, setSelectedCat] = useState('food');
  const [limitInput, setLimitInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });

  const showToast = (msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: msg, visible: false }), 2500);
  };

  const fetchBudgets = async () => {
    try {
      const params = { month: selectedMonth.month, year: selectedMonth.year };
      const res = await budgetsAPI.getAll(params);
      setBudgets(res.data.data);
    } catch (err) {
      console.log(err.message);
    }
  };

  useFocusEffect(useCallback(() => { fetchBudgets(); }, [selectedMonth]));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBudgets();
    setRefreshing(false);
  };

  const handleSaveBudget = async () => {
    const limit = parseFloat(limitInput);
    if (!limit || limit <= 0) { showToast('Enter a valid limit'); return; }
    setSaving(true);
    try {
      await budgetsAPI.save(selectedCat, convertToBase(limit));
      showToast('Budget saved!');
      setModalVisible(false);
      setLimitInput('');
      await fetchBudgets();
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await budgetsAPI.delete(id);
      showToast('Budget removed');
      await fetchBudgets();
    } catch (err) {
      showToast(err.message);
    }
  };

  const getBarColor = (pct) => {
    if (pct >= 90) return colors.red;
    if (pct >= 70) return colors.amber;
    return colors.green;
  };

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg3 },
    topbar: {
      backgroundColor: colors.bg, borderBottomWidth: 0.5,
      borderBottomColor: colors.border, paddingHorizontal: 16,
      paddingVertical: 12, flexDirection: 'row',
      alignItems: 'center', justifyContent: 'space-between',
    },
    topbarTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
    addBtnText: { fontSize: 26, color: colors.green },
    scroll: { flex: 1 },
    content: { padding: 16, paddingBottom: 32 },

    budgetCard: {
      backgroundColor: colors.bg, borderWidth: 0.5, borderColor: colors.border,
      borderRadius: RADIUS.lg, padding: 14, marginBottom: 10,
    },
    budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    budgetCat: { fontSize: 14, fontWeight: '600', color: colors.text },
    removeBtn: { fontSize: 13, color: colors.red },
    budgetVals: { fontSize: 13, color: colors.text2, marginBottom: 8 },
    progressBg: { backgroundColor: colors.bg2, borderRadius: 4, height: 6, overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    warningText: { fontSize: 12, color: colors.red, marginTop: 6 },

    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    sheet: {
      backgroundColor: colors.bg, borderTopLeftRadius: 20,
      borderTopRightRadius: 20, padding: 20, paddingBottom: 40,
    },
    handle: {
      width: 40, height: 4, backgroundColor: colors.border,
      borderRadius: 2, alignSelf: 'center', marginBottom: 16,
    },
    sheetTitle: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 16 },
    label: { fontSize: 13, color: colors.text2, marginBottom: 6 },
    catScroll: { marginBottom: 14 },
    catPill: {
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full,
      borderWidth: 0.5, borderColor: colors.border, marginRight: 8, backgroundColor: colors.bg,
    },
    catPillActive: { backgroundColor: colors.green, borderColor: colors.green },
    catPillText: { fontSize: 13, color: colors.text2 },
    catPillTextActive: { color: colors.white },
    input: {
      borderWidth: 0.5, borderColor: colors.border, borderRadius: RADIUS.md,
      paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
      color: colors.text, backgroundColor: colors.bg, marginBottom: 14,
    },
  });

  return (
    <SafeAreaView style={s.safe}>
      <Toast message={toast.message} visible={toast.visible} />

      {/* Top Bar */}
      <View style={s.topbar}>
        <View>
          <Text style={s.topbarTitle}>Budget</Text>
          <Text style={{ fontSize: 11, color: colors.text2 }}>
            {new Date(selectedMonth.year, selectedMonth.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <TouchableOpacity 
          onPress={() => { setLimitInput(''); setSelectedCat('food'); setModalVisible(true); }}
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
        {budgets.length === 0 ? (
          <EmptyState icon="🎯" message="No budgets set. Tap + to add one." />
        ) : (
          budgets.map((b) => (
            <View key={b._id} style={s.budgetCard}>
              <View style={s.budgetHeader}>
                <Text style={s.budgetCat}>
                  {CAT_ICONS[b.category.toLowerCase()] || '📦'} {b.category.charAt(0).toUpperCase() + b.category.slice(1)}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity 
                    onPress={() => {
                      setSelectedCat(b.category.toLowerCase());
                      setLimitInput(convertFromBase(b.limit).toString());
                      setModalVisible(true);
                    }}
                    style={{ marginRight: 12 }}
                  >
                    <Text style={{ fontSize: 13, color: colors.blue }}>Change</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(b._id)}>
                    <Text style={s.removeBtn}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={s.budgetVals}>
                {formatAmount(b.spent || 0)} / {formatAmount(b.limit)} ({Math.min(b.percentage || 0, 100)}%)
              </Text>
              <View style={s.progressBg}>
                <View
                  style={[
                    s.progressFill,
                    { 
                      width: `${Math.min(100, b.percentage || 0)}%`, 
                      backgroundColor: getBarColor(b.percentage || 0) 
                    },
                  ]}
                />
              </View>
              {b.percentage >= 100 ? (
                <Text style={s.warningText}>🚨 Budget Exceeded!</Text>
              ) : b.percentage >= 90 ? (
                <Text style={s.warningText}>⚠️ Budget almost exceeded!</Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      {/* Add Budget Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setModalVisible(false)} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.sheetTitle}>Set Budget</Text>

          <Text style={s.label}>Category</Text>
          <View style={{ height: 48, marginBottom: 14 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll}>
              {BUDGET_CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[s.catPill, selectedCat === c.value && s.catPillActive]}
                  onPress={() => setSelectedCat(c.value)}
                >
                  <Text style={[s.catPillText, selectedCat === c.value && s.catPillTextActive]}>
                    {CAT_ICONS[c.value]} {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Text style={s.label}>Monthly Limit ({currency.code})</Text>
          <TextInput
            style={s.input}
            placeholder="0.00"
            placeholderTextColor={colors.text2}
            value={limitInput}
            onChangeText={setLimitInput}
            keyboardType="decimal-pad"
          />

          <PrimaryButton title="Set Budget" onPress={handleSaveBudget} loading={saving} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
