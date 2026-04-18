import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FormInput, PrimaryButton } from '../components/UI';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are required.'); return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.'); return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const s = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.bg },
    container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
    logoWrap: { alignItems: 'center', marginBottom: 36 },
    logoIcon: {
      width: 64, height: 64, borderRadius: 18,
      backgroundColor: colors.greenLight,
      alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    },
    logoEmoji: { fontSize: 28 },
    appName: { fontSize: 24, fontWeight: '600', color: colors.text },
    tagline: { fontSize: 14, color: colors.text2, marginTop: 4 },
    error: { color: colors.red, fontSize: 13, marginBottom: 8, textAlign: 'center' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footerText: { fontSize: 14, color: colors.text2 },
    footerLink: { fontSize: 14, color: colors.green, fontWeight: '500' },
  });

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
          <View style={s.logoWrap}>
            <View style={s.logoIcon}>
              <Text style={s.logoEmoji}>💰</Text>
            </View>
            <Text style={s.appName}>Create Account</Text>
            <Text style={s.tagline}>Start tracking your expenses</Text>
          </View>

          <FormInput label="Full Name" placeholder="Your name" value={name} onChangeText={setName} />
          <FormInput
            label="Email" placeholder="you@email.com" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none"
          />
          <FormInput
            label="Password" placeholder="Min 8 characters" value={password}
            onChangeText={setPassword} secureTextEntry
          />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <PrimaryButton title="Create Account" onPress={handleRegister} loading={loading} />

          <View style={s.footer}>
            <Text style={s.footerText}>Already registered? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={s.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
