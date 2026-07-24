import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useThemeColor } from '../hooks/useThemeColor';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login } = useAuth();
  const theme = useThemeColor();
  const toast = useToast();
  const buttonStyle: ViewStyle = { backgroundColor: theme.primary };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.show({ type: 'error', title: 'Validasi', message: 'Email dan password wajib diisi' });
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
    } catch (e: any) {
      toast.show({
        type: 'error',
        title: 'Login gagal',
        message: e.response?.data?.message || 'Periksa kembali email dan password Anda',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Text style={styles.logo}>🚹</Text>
        <Text style={styles.title}>TaskHub</Text>
        <Text style={styles.subtitle}>Masuk untuk melanjutkan</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#94A3B8"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#94A3B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title="Masuk"
          onPress={handleLogin}
          loading={loading}
          style={[styles.button, buttonStyle]}
        />

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>
            Belum punya akun?{' '}
            <Text style={{ fontWeight: '800', color: theme.primary }}>Daftar</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING['2xl'] },
  logo: { fontSize: 64, textAlign: 'center', marginBottom: SPACING.sm },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: '900', textAlign: 'center', color: '#0B0B0B' },
  subtitle: { fontSize: FONT_SIZES.sm, textAlign: 'center', color: '#71717A', marginBottom: SPACING['2xl'] },
  input: {
    backgroundColor: '#F8F8FA',
    borderWidth: 1,
    borderColor: '#F4F4F5',
    borderRadius: 14,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.base,
    marginBottom: SPACING.md,
    color: '#0B0B0B',
  },
  button: { marginTop: SPACING.md, borderRadius: 16, height: 50 },
  link: { textAlign: 'center', color: '#71717A', marginTop: SPACING.lg, fontSize: FONT_SIZES.sm },
});
