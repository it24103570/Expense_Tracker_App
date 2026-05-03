import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, TextInput, Alert, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usersAPI, SERVER_URL } from '../services/api';
import { RADIUS } from '../styles/theme';
import { PrimaryButton, Toast, FormInput } from '../components/UI';
import { formatJoinDate } from '../utils/helpers';

export default function ProfileScreen({ navigation }) {
  const { user, logout, updateUser } = useAuth();
  const { colors } = useTheme();
  
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [pwModalVisible, setPwModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });

  const showToast = (msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: msg, visible: false }), 2500);
  };

  const openEditProfile = () => {
    setNameInput(user?.name || '');
    setEmailInput(user?.email || '');
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!nameInput.trim() || !emailInput.trim()) {
      showToast('Fill all fields'); return;
    }
    setSaving(true);
    try {
      const res = await usersAPI.updateProfile(nameInput.trim(), emailInput.trim());
      await updateUser(res.data.user);
      showToast('Profile updated!');
      setEditModalVisible(false);
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) { showToast('Fill all fields'); return; }
    if (newPw.length < 8) { showToast('New password must be 8+ characters'); return; }
    setSaving(true);
    try {
      await usersAPI.changePassword(currentPw, newPw);
      showToast('Password changed!');
      setPwModalVisible(false);
      setCurrentPw(''); setNewPw('');
    } catch (err) {
      showToast(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const onPressAvatar = () => {
    if (user?.profilePicture) {
      Alert.alert('Profile Picture', 'What would you like to do?', [
        { text: 'Change Picture', onPress: pickImage },
        { text: 'Remove Picture', style: 'destructive', onPress: handleRemoveAvatar },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      pickImage();
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      handleUpload(result.assets[0].uri);
    }
  };

  const handleRemoveAvatar = async () => {
    setUploading(true);
    try {
      const res = await usersAPI.removeAvatar();
      await updateUser(res.data.user);
      showToast('Profile picture removed!');
    } catch (err) {
      showToast(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (uri) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';

      formData.append('avatar', {
        uri: uri,
        name: filename || 'avatar.jpg',
        type: type || 'image/jpeg',
      });

      const res = await usersAPI.uploadAvatar(formData);
      await updateUser(res.data.user);
      showToast('Profile picture updated!');
    } catch (err) {
      showToast(err.message);
    } finally {
      setUploading(false);
    }
  };

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || 'U';

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg3 },
    topbar: {
      backgroundColor: colors.bg, borderBottomWidth: 0.5,
      borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 12,
    },
    topbarTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
    scroll: { flex: 1 },
    content: { padding: 16, paddingBottom: 32 },

    avatarWrap: { alignItems: 'center', marginBottom: 24 },
    avatarBtn: { position: 'relative' },
    avatar: {
      width: 84, height: 84, borderRadius: 42,
      backgroundColor: colors.greenLight,
      alignItems: 'center', justifyContent: 'center', marginBottom: 10,
      overflow: 'hidden', borderWidth: 3, borderColor: colors.bg,
      elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1, shadowRadius: 4,
    },
    avatarImg: { width: '100%', height: '100%' },
    avatarText: { fontSize: 32, fontWeight: '600', color: colors.greenDark },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center', alignItems: 'center',
    },
    editBadge: {
      position: 'absolute', bottom: 10, right: 0,
      backgroundColor: colors.bg, width: 28, height: 28,
      borderRadius: 14, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: colors.border,
      elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2, shadowRadius: 2,
    },
    editBadgeText: { fontSize: 14 },
    profileName: { fontSize: 18, fontWeight: '600', color: colors.text },
    profileEmail: { fontSize: 14, color: colors.text2, marginTop: 2 },

    card: {
      backgroundColor: colors.bg, borderWidth: 0.5, borderColor: colors.border,
      borderRadius: RADIUS.lg, marginBottom: 12, overflow: 'hidden',
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    rowIcon: { fontSize: 18, width: 24, textAlign: 'center' },
    rowLabel: { flex: 1, fontSize: 14, color: colors.text },
    rowVal: { fontSize: 14, color: colors.text2 },
    divider: { height: 0.5, backgroundColor: colors.border, marginLeft: 50 },

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
    label: { fontSize: 13, color: colors.text2, marginBottom: 6, marginTop: 4 },
    input: {
      borderWidth: 0.5, borderColor: colors.border, borderRadius: RADIUS.md,
      paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
      color: colors.text, backgroundColor: colors.bg, marginBottom: 14,
    },
  });

  return (
    <SafeAreaView style={s.safe}>
      <Toast message={toast.message} visible={toast.visible} />

      <View style={s.topbar}>
        <Text style={s.topbarTitle}>Profile</Text>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        {/* Avatar + Name */}
        <View style={s.avatarWrap}>
          <TouchableOpacity style={s.avatarBtn} onPress={onPressAvatar} disabled={uploading}>
            <View style={s.avatar}>
              {user?.profilePicture ? (
                <Image source={{ uri: `${SERVER_URL}${user.profilePicture}` }} style={s.avatarImg} />
              ) : (
                <Text style={s.avatarText}>{avatarLetter}</Text>
              )}
              {uploading && (
                <View style={s.loadingOverlay}>
                  <ActivityIndicator color={colors.bg} />
                </View>
              )}
            </View>
            <View style={s.editBadge}>
              <Text style={s.editBadgeText}>📸</Text>
            </View>
          </TouchableOpacity>
          <Text style={s.profileName}>{user?.name}</Text>
          <Text style={s.profileEmail}>{user?.email}</Text>
        </View>

        {/* Stats Card */}
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.rowIcon}>📅</Text>
            <Text style={s.rowLabel}>Member since</Text>
            <Text style={s.rowVal}>{user?.joinDate ? formatJoinDate(user.joinDate) : '—'}</Text>
          </View>
        </View>

        {/* Settings Card */}
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={openEditProfile}>
            <Text style={s.rowIcon}>✏️</Text>
            <Text style={s.rowLabel}>Edit Profile</Text>
            <Text style={s.rowVal}>›</Text>
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.row} onPress={() => { setCurrentPw(''); setNewPw(''); setPwModalVisible(true); }}>
            <Text style={s.rowIcon}>🔑</Text>
            <Text style={s.rowLabel}>Change Password</Text>
            <Text style={s.rowVal}>›</Text>
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity style={s.row} onPress={() => navigation.navigate('Settings')}>
            <Text style={s.rowIcon}>⚙️</Text>
            <Text style={s.rowLabel}>App Settings</Text>
            <Text style={s.rowVal}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={s.card}>
          <TouchableOpacity style={s.row} onPress={handleLogout}>
            <Text style={s.rowIcon}>🚪</Text>
            <Text style={[s.rowLabel, { color: colors.red }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide" onRequestClose={() => setEditModalVisible(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setEditModalVisible(false)} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.sheetTitle}>Edit Profile</Text>
          <Text style={s.label}>Full Name</Text>
          <TextInput style={s.input} value={nameInput} onChangeText={setNameInput} placeholderTextColor={colors.text2} />
          <Text style={s.label}>Email</Text>
          <TextInput style={s.input} value={emailInput} onChangeText={setEmailInput} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.text2} />
          <PrimaryButton title="Update Profile" onPress={handleSaveProfile} loading={saving} />
        </View>
      </Modal>

      {/* Change Password Modal.. */}
      <Modal visible={pwModalVisible} transparent animationType="slide" onRequestClose={() => setPwModalVisible(false)}>
        <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setPwModalVisible(false)} />
        <View style={s.sheet}>
          <View style={s.handle} />
          <Text style={s.sheetTitle}>Change Password</Text>
          <FormInput
            label="Current Password"
            value={currentPw}
            onChangeText={setCurrentPw}
            secureTextEntry
            placeholder="••••••••"
          />
          <FormInput
            label="New Password"
            value={newPw}
            onChangeText={setNewPw}
            secureTextEntry
            placeholder="Min 8 characters"
          />
          <PrimaryButton title="Change Password" onPress={handleChangePassword} loading={saving} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
