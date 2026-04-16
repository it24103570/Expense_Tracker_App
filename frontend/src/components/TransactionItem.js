import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useCurrency } from '../context/CurrencyContext';
import { RADIUS, CAT_ICONS, CAT_COLORS, CAT_TEXT_COLORS } from '../styles/theme';
import { formatDate } from '../utils/helpers';

export default function TransactionItem({ item, onPress }) {
  const { colors, darkMode } = useTheme();
  const { formatAmount } = useCurrency();
  
  const isExpense = item.type === 'expense';
  const categoryKey = item.category?.toLowerCase() || 'other';
  
  // In dark mode, we might want slightly different icon backgrounds
  const iconBg = CAT_COLORS[categoryKey] || (darkMode ? '#262624' : '#F1EFE8');
  const iconColor = CAT_TEXT_COLORS[categoryKey] || (darkMode ? '#A1A19A' : '#5F5E5A');
  const icon = CAT_ICONS[categoryKey] || '📦';

  const s = StyleSheet.create({
    container: {
      backgroundColor: colors.bg,
      borderWidth: 0.5,
      borderColor: colors.border,
      borderRadius: RADIUS.lg,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    },
    iconBox: {
      width: 40,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconText: { fontSize: 18 },
    info: { flex: 1 },
    title: { fontSize: 14, fontWeight: '500', color: colors.text },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    date: { fontSize: 12, color: colors.text2 },
    dot: { fontSize: 12, color: colors.text2 },
    badge: {
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: RADIUS.full,
    },
    badgeExpense: { backgroundColor: colors.redLight },
    badgeIncome: { backgroundColor: colors.greenLight },
    badgeText: { fontSize: 11, fontWeight: '500' },
    amount: { fontSize: 15, fontWeight: '600' },
    amountNeg: { color: colors.red },
    amountPos: { color: colors.green },
  });

  return (
    <TouchableOpacity 
      style={s.container} 
      onPress={() => onPress && onPress(item)} 
      activeOpacity={0.7} 
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={[s.iconBox, { backgroundColor: iconBg }]}>
        <Text style={s.iconText}>{icon}</Text>
      </View>
      <View style={s.info}>
        <Text style={s.title} numberOfLines={1}>{item.title}</Text>
        <View style={s.metaRow}>
          <Text style={s.date}>{formatDate(item.date)}</Text>
          <Text style={s.dot}> · </Text>
          <View style={[s.badge, isExpense ? s.badgeExpense : s.badgeIncome]}>
            <Text style={[s.badgeText, { color: isExpense ? colors.red : colors.greenDark }]}>
              {item.category}
            </Text>
          </View>
        </View>
      </View>
      <Text style={[s.amount, isExpense ? s.amountNeg : s.amountPos]}>
        {isExpense ? '-' : '+'}{formatAmount(item.amount)}
      </Text>
    </TouchableOpacity>
  );
}
