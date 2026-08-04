import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
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
      <View style={styles.accentBar} />
      <View style={styles.content}>
        <Ionicons name="briefcase" size={48} color={COLORS.primary} style={{ marginBottom: SPACING.sm }} />
        <Text style={styles.title}>Buat Akun Baru</Text>
        <Text style={styles.subtitle}>Daftar untuk mulai menggunakan TaskHub</Text>

        <TextInput
          style={styles.input}
          placeholder="Nama Lengkap"
          placeholderTextColor={COLORS.slate400}
          value={fullName}
          onChangeText={setFullName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.slate400}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password (min 6 karakter)"
          placeholderTextColor={COLORS.slate400}
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
  container: { flex: 1, backgroundColor: COLORS.surface },
  accentBar: { height: 4, backgroundColor: COLORS.primary },
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING['2xl'], alignItems: 'center' },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: '900', textAlign: 'center', color: COLORS.textPrimary },
  subtitle: { fontSize: FONT_SIZES.sm, textAlign: 'center', color: COLORS.textSecondary, marginBottom: SPACING['2xl'] },
  input: {
    width: '100%',
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.base,
    marginBottom: SPACING.md,
    color: COLORS.textPrimary,
  },
  button: { width: '100%', marginTop: SPACING.md, borderRadius: BORDER_RADIUS.lg, height: 50 },
});
