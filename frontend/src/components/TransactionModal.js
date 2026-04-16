import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, TextInput, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, CATEGORIES } from '../styles/theme';
import { PrimaryButton } from './UI';

const TYPE_OPTIONS = ['expense', 'income'];

export default function TransactionModal({ visible, onClose, onSave, editItem }) {
  const { colors } = useTheme();
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editItem) {
      setType(editItem.type);
      setTitle(editItem.title);
      setAmount(String(editItem.amount));
      setCategory(editItem.category);
      setDate(editItem.date?.split('T')[0] || new Date().toISOString().split('T')[0]);
      setNote(editItem.note || '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setCategory('food');
      setDate(new Date().toISOString().split('T')[0]);
      setNote('');
    }
    setError('');
  }, [editItem, visible]);

  const handleSave = async () => {
    if (!title.trim() || !amount || parseFloat(amount) <= 0 || !date) {
      setError('Please fill in all required fields correctly.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await onSave({ type, title: title.trim(), amount: parseFloat(amount), category, date, note: note.trim() });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
    sheet: {
      backgroundColor: colors.bg, borderTopLeftRadius: 20, borderTopRightRadius: 20,
      padding: 20, paddingBottom: 40, maxHeight: '85%',
    },
    handle: {
      width: 40, height: 4, backgroundColor: colors.border,
      borderRadius: 2, alignSelf: 'center', marginBottom: 16,
    },
    title: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 16 },
    label: { fontSize: 13, color: colors.text2, marginBottom: 6, marginTop: 4 },
    input: {
      borderWidth: 0.5, borderColor: colors.border, borderRadius: RADIUS.md,
      paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
      color: colors.text, backgroundColor: colors.bg, marginBottom: 12,
    },
    typeRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    typeBtn: {
      flex: 1, paddingVertical: 9, borderRadius: RADIUS.md,
      borderWidth: 0.5, borderColor: colors.border,
      alignItems: 'center', backgroundColor: colors.bg2,
    },
    typeBtnActive: { backgroundColor: colors.green, borderColor: colors.green },
    typeBtnText: { fontSize: 14, color: colors.text2, fontWeight: '500' },
    typeBtnTextActive: { color: colors.white },
    catScroll: { marginBottom: 12, height: 48 },
    catPill: {
      paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full,
      borderWidth: 0.5, borderColor: colors.border, marginRight: 8,
      backgroundColor: colors.bg,
    },
    catPillActive: { backgroundColor: colors.green, borderColor: colors.green },
    catPillText: { fontSize: 13, color: colors.text2 },
    catPillTextActive: { color: colors.white },
    error: { color: colors.red, fontSize: 13, marginBottom: 8 },
    saveBtn: { marginTop: 4 },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose} />
      <View style={s.sheet}>
        <View style={s.handle} />
        <Text style={s.title}>{editItem ? 'Edit Transaction' : 'Add Transaction'}</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Type Selector */}
          <Text style={s.label}>Type</Text>
          <View style={s.typeRow}>
            {TYPE_OPTIONS.map((t) => (
              <TouchableOpacity
                key={t}
                style={[s.typeBtn, type === t && s.typeBtnActive]}
                onPress={() => setType(t)}
              >
                <Text style={[s.typeBtnText, type === t && s.typeBtnTextActive]}>
                  {t === 'expense' ? '↓ Expense' : '↑ Income'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Title */}
          <Text style={s.label}>Title *</Text>
          <TextInput
            style={s.input}
            placeholder="e.g. Lunch, Salary..."
            placeholderTextColor={colors.text2}
            value={title}
            onChangeText={setTitle}
          />

          {/* Amount */}
          <Text style={s.label}>Amount (LKR) *</Text>
          <TextInput
            style={s.input}
            placeholder="0.00"
            placeholderTextColor={colors.text2}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />

          {/* Category */}
          <Text style={s.label}>Category</Text>
          <View style={{ height: 48, marginBottom: 12 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll}>
              {CATEGORIES.filter(c => type === 'income' ? true : c.value !== 'salary').map((c) => (
                <TouchableOpacity
                  key={c.value}
                  style={[s.catPill, category === c.value && s.catPillActive]}
                  onPress={() => setCategory(c.value)}
                >
                  <Text style={[s.catPillText, category === c.value && s.catPillTextActive]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Date */}
          <Text style={s.label}>Date *</Text>
          <TextInput
            style={s.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.text2}
            value={date}
            onChangeText={setDate}
          />

          {/* Note */}
          <Text style={s.label}>Note (optional)</Text>
          <TextInput
            style={s.input}
            placeholder="Add a note..."
            placeholderTextColor={colors.text2}
            value={note}
            onChangeText={setNote}
          />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <PrimaryButton
            title={editItem ? 'Update Transaction' : 'Save Transaction'}
            onPress={handleSave}
            loading={saving}
            style={s.saveBtn}
          />
        </ScrollView>
      </View>
    </Modal>
  );
}
