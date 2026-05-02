import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { RADIUS } from '../styles/theme';
import { categoriesAPI } from '../services/api';
import { PrimaryButton } from '../components/UI';

export default function CategoriesScreen({ navigation }) {
  const { colors } = useTheme();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('expense');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.data);
    } catch (err) {
      console.log('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingCat(null);
    setFormName('');
    setFormType('expense');
    setFormError('');
    setModalVisible(true);
  };

  const openEditModal = (cat) => {
    if (cat.isDefault) return;
    setEditingCat(cat);
    setFormName(cat.name);
    setFormType(cat.type);
    setFormError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      setFormError('Category name is required');
      return;
    }
    
    setFormLoading(true);
    setFormError('');
    
    try {
      if (editingCat) {
        await categoriesAPI.update(editingCat._id, { name: formName, type: formType });
      } else {
        await categoriesAPI.create({ name: formName, type: formType });
      }
      setModalVisible(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (cat) => {
    if (cat.isDefault) return;
    
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${cat.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await categoriesAPI.delete(cat._id);
              fetchCategories();
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
      paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
    },
    backBtn: { padding: 4 },
    topbarTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
    addBtn: { color: colors.green, fontWeight: '600', fontSize: 16 },
    content: { padding: 16, paddingBottom: 40 },
    card: {
      backgroundColor: colors.bg, borderWidth: 0.5, borderColor: colors.border,
      borderRadius: RADIUS.lg, marginBottom: 16, overflow: 'hidden',
    },
    row: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      padding: 16, borderBottomWidth: 0.5, borderBottomColor: colors.border,
    },
    info: { flex: 1 },
    name: { fontSize: 15, color: colors.text, fontWeight: '500' },
    type: { fontSize: 12, color: colors.text2, marginTop: 4, textTransform: 'capitalize' },
    actions: { flexDirection: 'row', gap: 16 },
    actionText: { fontSize: 14, color: colors.green },
    deleteText: { color: colors.red },
    defaultTag: {
      fontSize: 10, backgroundColor: colors.bg2, color: colors.text2,
      paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, overflow: 'hidden'
    },
    
    // Modal Styles
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalBox: { backgroundColor: colors.bg, borderRadius: RADIUS.lg, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 16 },
    label: { fontSize: 13, color: colors.text2, marginBottom: 6, marginTop: 12 },
    input: {
      borderWidth: 0.5, borderColor: colors.border, borderRadius: RADIUS.md,
      paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
      color: colors.text, backgroundColor: colors.bg,
    },
    typeRow: { flexDirection: 'row', gap: 10 },
    typeBtn: {
      flex: 1, paddingVertical: 9, borderRadius: RADIUS.md,
      borderWidth: 0.5, borderColor: colors.border, alignItems: 'center', backgroundColor: colors.bg2,
    },
    typeBtnActive: { backgroundColor: colors.green, borderColor: colors.green },
    typeBtnText: { fontSize: 14, color: colors.text2, fontWeight: '500' },
    typeBtnTextActive: { color: colors.white },
    error: { color: colors.red, fontSize: 13, marginTop: 8 },
    btnRow: { flexDirection: 'row', gap: 10, marginTop: 24 },
    cancelBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: RADIUS.md, backgroundColor: colors.bg2 },
  });

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={{ fontSize: 20, color: colors.text }}>←</Text>
        </TouchableOpacity>
        <Text style={s.topbarTitle}>Categories</Text>
        <TouchableOpacity onPress={openAddModal}>
          <Text style={s.addBtn}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.green} style={{ marginTop: 40 }} />
        ) : (
          <View style={s.card}>
            {categories.map((cat, idx) => (
              <View key={cat._id} style={[s.row, idx === categories.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={s.info}>
                  <Text style={s.name}>{cat.name}</Text>
                  <Text style={s.type}>{cat.type}</Text>
                </View>
                
                {cat.isDefault ? (
                  <Text style={s.defaultTag}>Default</Text>
                ) : (
                  <View style={s.actions}>
                    <TouchableOpacity onPress={() => openEditModal(cat)}>
                      <Text style={s.actionText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(cat)}>
                      <Text style={[s.actionText, s.deleteText]}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={s.overlay}>
          <View style={s.modalBox}>
            <Text style={s.modalTitle}>{editingCat ? 'Edit Category' : 'Add Category'}</Text>
            
            <Text style={s.label}>Type</Text>
            <View style={s.typeRow}>
              {['expense', 'income'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[s.typeBtn, formType === t && s.typeBtnActive]}
                  onPress={() => setFormType(t)}
                >
                  <Text style={[s.typeBtnText, formType === t && s.typeBtnTextActive]}>
                    {t === 'expense' ? '↓ Expense' : '↑ Income'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.label}>Name *</Text>
            <TextInput
              style={s.input}
              placeholder="e.g. Shopping, Salary..."
              placeholderTextColor={colors.text2}
              value={formName}
              onChangeText={setFormName}
            />

            {formError ? <Text style={s.error}>{formError}</Text> : null}

            <View style={s.btnRow}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <PrimaryButton 
                title={editingCat ? 'Update' : 'Save'} 
                onPress={handleSave} 
                loading={formLoading} 
                style={{ flex: 1 }} 
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
