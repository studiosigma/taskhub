import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useThemeColor } from '../hooks/useThemeColor';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import type { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();
  const theme = useThemeColor();
  const toast = useToast();
  const buttonStyle: ViewStyle = { backgroundColor: theme.primary };
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      toast.show({ type: 'error', title: 'Validasi', message: 'Semua field wajib diisi' });
      return;
    }
    if (password.length < 6) {
      toast.show({ type: 'error', title: 'Validasi', message: 'Password minimal 6 karakter' });
      return;
    }
    try {
      setLoading(true);
      await register({ fullName, email, password });
    } catch (e: any) {
      const rawMsg = e.response?.data?.message;
      const formattedMsg = Array.isArray(rawMsg) ? rawMsg.join('\n') : rawMsg || 'Registrasi gagal';
      toast.show({ type: 'error', title: 'Registrasi gagal', message: formattedMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Text style={styles.title}>Buat Akun Baru</Text>
        <Text style={styles.subtitle}>Daftar untuk mulai menggunakan TaskHub</Text>

        <TextInput
          style={styles.input}
          placeholder="Nama Lengkap"
          placeholderTextColor="#94A3B8"
          value={fullName}
          onChangeText={setFullName}
        />
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
          placeholder="Password (min 6 karakter)"
          placeholderTextColor="#94A3B8"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title="Daftar"
          onPress={handleRegister}
          loading={loading}
          style={[styles.button, buttonStyle]}
        />

        <Button
          title="Sudah punya akun? Masuk"
          onPress={() => navigation.goBack()}
          variant="ghost"
          style={{ marginTop: 12 }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING['2xl'] },
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
});
