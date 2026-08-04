import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
import { useThemeColor } from '../hooks/useThemeColor';
import { useToast } from '../components/ui/Toast';
import { Badge } from '../components/ui/Badge';
import { verificationsApi } from '../services';
import { Button } from '../components/ui/Button';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { useAuth } from '../hooks/useAuth';

export const IdentityVerificationScreen: React.FC<
  NativeStackScreenProps<RootStackParamList, "IdentityVerification">
> = ({ navigation }) => {
  const theme = useThemeColor();
  const toast = useToast();
  const { user } = useAuth();

  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(
    user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'
  );
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'PENDING' | 'APPROVED' | 'REJECTED'>('IDLE');
  const [rejectedReason, setRejectedReason] = useState<string | null>(null);

  const submitBtnStyle: ViewStyle = { backgroundColor: theme.primary };

  useEffect(() => {
    verificationsApi
      .getMyStatus()
      .then((data: any) => {
        if (data?.status) {
          setStatus(data.status);
          if (data.rejectedReason) setRejectedReason(data.rejectedReason);
        }
      })
      .catch((e) => console.warn('fetch verification status error', e));
  }, []);

  const pickImage = async () => {
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
    if (!result.canceled && result.assets?.[0]) setProfilePhoto(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!phone || phone.length < 10) {
      toast.show({ type: 'warning', title: 'Nomor HP Tidak Valid', message: 'Masukkan nomor WhatsApp/HP aktif' });
      return;
    }
    try {
      setLoading(true);
      await verificationsApi.submit(profilePhoto || '');
      setStatus('PENDING');
      toast.show({
        type: 'success',
        title: 'Verifikasi Dikirim',
        message: 'Data kelengkapan profil Anda telah berhasil dikirim!',
      });
    } catch (e: any) {
      toast.show({
        type: 'error',
        title: 'Gagal Pengajuan',
        message: e?.response?.data?.message || 'Gagal memperbarui verifikasi profil',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout title="Verifikasi Profil & Kontak" onBack={() => navigation.goBack()}>
      {/* Status Banner */}
      {status !== 'IDLE' && (
        <View
          style={[
            styles.statusBanner,
            status === 'APPROVED' && styles.statusBannerApproved,
            status === 'REJECTED' && styles.statusBannerRejected,
          ]}
        >
          <Badge status={status} size="md" />
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitleText}>
              {status === 'APPROVED'
                ? 'Profil Resmi Terverifikasi 🎉'
                : status === 'PENDING'
                ? 'Profil Sedang Diverifikasi ⏳'
                : 'Pengajuan Ditolak ⚠️'}
            </Text>
            <Text style={styles.statusText}>
              {status === 'APPROVED'
                ? 'Selamat! Badge profil terverifikasi aktif di akun Anda.'
                : status === 'PENDING'
                ? 'Tim TaskHub sedang memproses kelengkapan profil Anda.'
                : rejectedReason || 'Informasi kontak kurang jelas, silakan ajukan ulang.'}
            </Text>
          </View>
        </View>
      )}

      {/* Form Fields */}
      <Text style={styles.label}>Nomor WhatsApp / Telepon Aktif</Text>
      <TextInput
        style={styles.input}
        placeholder="Contoh: 081234567890"
        placeholderTextColor={COLORS.slate400}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        maxLength={15}
        editable={status !== 'APPROVED'}
      />

      <Text style={styles.label}>Deskripsi Singkat / Bio Profil</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Contoh: Siap membantu pekerjaan kebersihan rumah & pertukangan ringan secara profesional."
        placeholderTextColor={COLORS.slate400}
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={3}
        editable={status !== 'APPROVED'}
      />

      <Text style={styles.label}>Foto Profil Resmi (Avatar)</Text>
      <TouchableOpacity
        style={styles.uploadCard}
        onPress={() => status !== 'APPROVED' && pickImage()}
        activeOpacity={0.8}
      >
        {profilePhoto ? (
          <Image source={{ uri: profilePhoto }} style={styles.previewImage} />
        ) : (
          <View style={styles.uploadPlaceholder}>
            <Ionicons name="camera-outline" size={32} color={COLORS.textPrimary} style={{ marginBottom: 4 }} />
            <Text style={styles.uploadText}>Pilih Foto Profil</Text>
          </View>
        )}
      </TouchableOpacity>

      <Button
        title={status === 'APPROVED' ? 'Profil Terverifikasi ✅' : 'Verifikasi Profil Saya'}
        onPress={handleSubmit}
        loading={loading}
        disabled={status === 'APPROVED'}
        style={[styles.submitBtn, submitBtnStyle]}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusBannerApproved: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  statusBannerRejected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  statusTitleText: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  statusText: {
    fontSize: 11,
    color: COLORS.slate600,
    lineHeight: 16,
    fontWeight: '500',
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  uploadCard: {
    width: '100%',
    height: 140,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholder: { alignItems: 'center' },
  uploadText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.textPrimary },
  previewImage: { width: '100%', height: '100%', borderRadius: BORDER_RADIUS.lg },
  submitBtn: { borderRadius: BORDER_RADIUS.lg, height: 50, marginTop: SPACING.lg },
});
