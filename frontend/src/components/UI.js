import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { RADIUS } from '../styles/theme';

// ─── Primary Button ───────────────────────────────────────────────────────────
export const PrimaryButton = ({ title, onPress, loading, style }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[{ backgroundColor: colors.green, paddingVertical: 13, borderRadius: RADIUS.md, alignItems: 'center', marginTop: 8 }, style]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={{ color: colors.white, fontSize: 15, fontWeight: '600' }}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

// ─── Form Input ───────────────────────────────────────────────────────────────
export const FormInput = ({ label, error, style, ...props }) => {
  const { colors } = useTheme();
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {label ? <Text style={{ fontSize: 13, color: colors.text2, marginBottom: 6 }}>{label}</Text> : null}
      <TextInput
        style={[
          { borderWidth: 0.5, borderColor: colors.border, borderRadius: RADIUS.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: colors.text, backgroundColor: colors.bg },
          error ? { borderColor: colors.red } : null
        ]}
        placeholderTextColor={colors.text2}
        {...props}
      />
      {error ? <Text style={{ color: colors.red, fontSize: 12, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
export const Toast = ({ message, visible }) => {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(1800),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, message]);

  if (!message) return null;

  return (
    <Animated.View style={[
      { position: 'absolute', top: 60, alignSelf: 'center', backgroundColor: colors.bg === '#FFFFFF' ? '#2C2C2A' : '#444', paddingHorizontal: 18, paddingVertical: 10, borderRadius: RADIUS.full, zIndex: 999 },
      { opacity }
    ]}>
      <Text style={{ color: '#FFF', fontSize: 13 }}>{message}</Text>
    </Animated.View>
  );
};

// ─── Section Header ───────────────────────────────────────────────────────────
export const SectionHeader = ({ title, actionLabel, onAction }) => {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, marginTop: 4 }}>
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ fontSize: 13, color: colors.green }}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, message }) => {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40 }}>
      <Text style={{ fontSize: 40, marginBottom: 12 }}>{icon}</Text>
      <Text style={{ fontSize: 14, color: colors.text2, textAlign: 'center' }}>{message}</Text>
    </View>
  );
};
