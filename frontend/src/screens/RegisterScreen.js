import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { FormInput, PrimaryButton } from '../components/UI';
import { COLORS } from '../styles/theme';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
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

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>💰</Text>
            </View>
            <Text style={styles.appName}>Create Account</Text>
            <Text style={styles.tagline}>Start tracking your expenses</Text>
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

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton title="Create Account" onPress={handleRegister} loading={loading} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already registered? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 36 },
  logoIcon: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: COLORS.greenLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoEmoji: { fontSize: 28 },
  appName: { fontSize: 24, fontWeight: '600', color: COLORS.text },
  tagline: { fontSize: 14, color: COLORS.text2, marginTop: 4 },
  error: { color: COLORS.red, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  footerText: { fontSize: 14, color: COLORS.text2 },
  footerLink: { fontSize: 14, color: COLORS.green, fontWeight: '500' },
});
