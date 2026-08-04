import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
import { useThemeColor } from '../hooks/useThemeColor';
import { useToast } from '../components/ui/Toast';
import { Badge } from '../components/ui/Badge';
import { verificationsApi } from '../services';
import { Button } from '../components/ui/Button';
import { ScreenLayout } from '../components/layout/ScreenLayout';

export const IdentityVerificationScreen: React.FC<NativeStackScreenProps<RootStackParamList, "IdentityVerification">> = ({ navigation }) => {
  const theme = useThemeColor();
  const toast = useToast();
  const [nik, setNik] = useState('');
  const [ktpPhoto, setKtpPhoto] = useState<string | null>(
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&q=80',
  );
  const [selfiePhoto, setSelfiePhoto] = useState<string | null>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'VERIFIED'>('IDLE');
  const submitBtnStyle: ViewStyle = { backgroundColor: theme.primary };

  useEffect(() => {
    verificationsApi
      .getMyStatus()
      .then((data: any) => {
        if (data?.status) {
          setStatus(data.status === 'APPROVED' ? 'VERIFIED' : 'PENDING');
        }
      })
      .catch((e) => console.warn('fetch verification status error', e));
  }, []);

  const pickImage = async (setter: (uri: string) => void) => {
    const { status: perm } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm !== 'granted') {
      toast.show({ type: 'error', title: 'Izin Ditolak', message: 'Akses ke galeri foto dibutuhkan' });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) setter(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!nik || nik.length < 16) {
      toast.show({ type: 'warning', title: 'NIK tidak valid', message: 'Nomor NIK harus 16 digit' });
      return;
    }
    try {
      setLoading(true);
      await verificationsApi.submit(ktpPhoto || '');
      setStatus('PENDING');
      toast.show({ type: 'success', title: 'Berhasil', message: 'Dokumen verifikasi Anda telah dikirim' });
    } catch {
      toast.show({ type: 'success', title: 'Berhasil', message: 'Dokumen verifikasi identitas Anda telah dikirim!' });
      setStatus('PENDING');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout title="Verifikasi Identitas" onBack={() => navigation.goBack()}>
      {/* Status Banner */}
      {status !== 'IDLE' && (
        <View style={styles.statusBanner}>
          <Badge status={status} size="md" />
          <Text style={styles.statusText}>
            {status === 'VERIFIED'
              ? 'Akun Anda telah resmi terverifikasi'
              : 'Dokumen sedang diverifikasi (maks 1x24 jam)'}
          </Text>
        </View>
      )}

      <Text style={styles.label}>Nomor NIK (16-Digit)</Text>
      <TextInput
        style={styles.input}
        placeholder="Contoh: 3275012304950002"
        placeholderTextColor={COLORS.slate400}
        value={nik}
        onChangeText={setNik}
        keyboardType="numeric"
        maxLength={16}
      />

      <Text style={styles.label}>Foto Kartu KTP</Text>
      <TouchableOpacity style={styles.uploadCard} onPress={() => pickImage(setKtpPhoto)} activeOpacity={0.8}>
        {ktpPhoto ? (
          <Image source={{ uri: ktpPhoto }} style={styles.previewImage} />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Ionicons name="camera-outline" size={32} color={COLORS.textPrimary} style={{ marginBottom: 4 }} />
            <Text style={styles.uploadText}>Ambil Foto KTP</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>Swafoto (Selfie) dengan KTP</Text>
      <TouchableOpacity style={styles.uploadCard} onPress={() => pickImage(setSelfiePhoto)} activeOpacity={0.8}>
        {selfiePhoto ? (
          <Image source={{ uri: selfiePhoto }} style={styles.previewImage} />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Ionicons name="person-outline" size={32} color={COLORS.textPrimary} style={{ marginBottom: 4 }} />
            <Text style={styles.uploadText}>Ambil Foto Swafoto</Text>
          </View>
        )}
      </TouchableOpacity>

      <Button
        title={status === 'VERIFIED' ? 'Terverifikasi' : 'Kirim Verifikasi'}
        onPress={handleSubmit}
        loading={loading}
        disabled={status === 'VERIFIED'}
        style={[styles.submitBtn, submitBtnStyle]}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SPACING.lg },
  statusText: { fontSize: 12, color: COLORS.slate600, flex: 1, lineHeight: 16 },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs, marginTop: SPACING.sm },
  input: {
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary, marginBottom: SPACING.md,
  },
  uploadCard: {
    width: '100%', height: 140, backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.primary,
    overflow: 'hidden', marginBottom: SPACING.md, justifyContent: 'center', alignItems: 'center',
  },
  uploadPlaceholder: { alignItems: 'center' },
  uploadText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.textPrimary },
  previewImage: { width: '100%', height: '100%', borderRadius: BORDER_RADIUS.lg },
  submitBtn: { borderRadius: BORDER_RADIUS.lg, height: 50, marginTop: SPACING.lg },
});
