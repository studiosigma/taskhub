import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ViewStyle } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
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
      <View style={styles.accentBar} />
      <View style={styles.content}>
        <Ionicons name="briefcase" size={64} color={COLORS.primary} style={{ marginBottom: SPACING.sm }} />
        <Text style={styles.title}>TaskHub</Text>
        <Text style={styles.subtitle}>Masuk untuk melanjutkan</Text>

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
          placeholder="Password"
          placeholderTextColor={COLORS.slate400}
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
  link: { textAlign: 'center', color: COLORS.textSecondary, marginTop: SPACING.lg, fontSize: FONT_SIZES.sm },
});
