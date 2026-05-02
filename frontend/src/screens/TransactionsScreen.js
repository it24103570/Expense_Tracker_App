import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useMonth } from '../context/MonthContext';
import { transactionsAPI, categoriesAPI } from '../services/api';
import { RADIUS } from '../styles/theme';
import TransactionItem from '../components/TransactionItem';
import TransactionModal from '../components/TransactionModal';
import { EmptyState, Toast } from '../components/UI';

export default function TransactionsScreen({ navigation }) {
  const { colors } = useTheme();
  const { selectedMonth } = useMonth();
  const [transactions, setTransactions] = useState([]);
  const [filterCat, setFilterCat] = useState('all');
  const [apiCategories, setApiCategories] = useState([{ value: 'all', label: 'All' }]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ message: '', visible: false });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => 
      t.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  const showToast = (msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: msg, visible: false }), 2500);
  };

  const fetchTransactions = async () => {
    try {
      const params = { 
        ... (filterCat !== 'all' ? { category: filterCat } : {}),
        month: selectedMonth.month,
        year: selectedMonth.year,
        limit: 100 
      };
      const res = await transactionsAPI.getAll(params);
      setTransactions(res.data.data);
    } catch (err) {
      console.log('Fetch Error:', err.message);
      showToast(err.message || 'Network Error. Check your connection.');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      const fetchedCats = res.data.data.map(c => ({
        value: c.name.toLowerCase(),
        label: c.name
      }));
      setApiCategories([{ value: 'all', label: 'All' }, ...fetchedCats]);
    } catch (err) {
      console.log('Fetch Categories Error:', err.message);
    }
  };

  useFocusEffect(useCallback(() => { 
    fetchTransactions(); 
    fetchCategories();
  }, [filterCat, selectedMonth]));

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    setRefreshing(false);
  };

  const handleSave = async (data) => {
    if (editItem) {
      await transactionsAPI.update(editItem._id, data);
      showToast('Transaction updated!');
    } else {
      await transactionsAPI.create(data);
      showToast('Transaction added!');
    }
    await fetchTransactions();
  };

  const openAdd = () => { setEditItem(null); setModalVisible(true); };
  const openEdit = (item) => { setEditItem(item); setModalVisible(true); };

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
    filterScroll: { backgroundColor: colors.bg, maxHeight: 52 },
    filterContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
    pill: {
      paddingHorizontal: 14, paddingVertical: 5, borderRadius: RADIUS.full,
      borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.bg,
    },
    pillActive: { backgroundColor: colors.green, borderColor: colors.green },
    pillText: { fontSize: 13, color: colors.text2 },
    pillTextActive: { color: colors.white, fontWeight: '500' },
    scroll: { flex: 1 },
    content: { padding: 16, paddingBottom: 32 },
    searchBar: {
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.bg, paddingHorizontal: 12, paddingVertical: 10,
      borderBottomWidth: 0.5, borderBottomColor: colors.border,
    },
    searchInputContainer: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      backgroundColor: colors.bg3, borderRadius: RADIUS.md,
      paddingHorizontal: 10, height: 40,
    },
    searchInput: {
      flex: 1, fontSize: 15, color: colors.text, paddingVertical: 0,
    },
    searchIcon: { fontSize: 16, marginRight: 8 },
    clearSearch: { padding: 4 },
  });

  return (
    <SafeAreaView style={s.safe}>
      <Toast message={toast.message} visible={toast.visible} />

      {/* Top Bar */}
      <View style={s.topbar}>
        <View>
          <Text style={s.topbarTitle}>Transactions</Text>
          <Text style={{ fontSize: 11, color: colors.text2 }}>
            {new Date(selectedMonth.year, selectedMonth.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Categories')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: colors.bg2, paddingHorizontal: 10, paddingVertical: 6, 
              borderRadius: RADIUS.full
            }}
          >
            <Text style={{ fontSize: 14 }}>🏷️</Text>
            <Text style={{ fontSize: 11, color: colors.text2, fontWeight: '600' }}>Manage Categories</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={openAdd}
            hitSlop={{ top: 20, bottom: 20, left: 10, right: 20 }}
          >
            <Text style={s.addBtnText}>＋</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={s.searchBar}>
        <View style={s.searchInputContainer}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor={colors.text2}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={s.clearSearch}>
              <Text style={{ fontSize: 14, color: '#999' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filterScroll}
        contentContainerStyle={s.filterContent}
      >
        {apiCategories.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[s.pill, filterCat === c.value && s.pillActive]}
            onPress={() => setFilterCat(c.value)}
          >
            <Text style={[s.pillText, filterCat === c.value && s.pillTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />}
      >
        {filteredTransactions.length === 0 ? (
          <EmptyState icon="🔍" message={searchQuery ? "No matching transactions." : "No transactions found."} />
        ) : (
          filteredTransactions.map((item) => (
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
