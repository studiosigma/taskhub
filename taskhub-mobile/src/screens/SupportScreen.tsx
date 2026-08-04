import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
import { useThemeColor } from '../hooks/useThemeColor';
import { useToast } from '../components/ui/Toast';
import { supportApi } from '../services';
import { Button } from '../components/ui/Button';
import { ScreenLayout } from '../components/layout/ScreenLayout';

// @ts-ignore
import QRIS_IMAGE from '../../assets/Qris_taskhub.jpeg';
import { Asset } from 'expo-asset';

export const SupportScreen: React.FC<NativeStackScreenProps<RootStackParamList, "Support">> = ({ navigation }) => {
  const theme = useThemeColor();
  const toast = useToast();
  const donateBtnStyle: ViewStyle = { backgroundColor: theme.primary };
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownloadQRIS = async () => {
    try {
      const asset = Asset.fromModule(QRIS_IMAGE);
      await asset.downloadAsync();

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(asset.localUri || asset.uri);
      } else {
        Alert.alert('Info', 'Sharing tidak didukung di perangkat ini');
      }
    } catch (error) {
      console.error(error);
      toast.show({ type: 'error', title: 'Gagal', message: 'Gagal membagikan QRIS' });
    }
  };

  const handleDonate = async () => {
    if (!amount || parseInt(amount) < 1000) {
      toast.show({ type: 'warning', title: 'Minimal donasi Rp1.000', message: 'Masukkan nominal donasi yang valid' });
      return;
    }
    try {
      setLoading(true);
      await supportApi.createDonation(parseInt(amount), 'QRIS', message);
      toast.show({ type: 'success', title: 'Terima kasih!', message: 'Donasi Anda sangat berarti untuk TaskHub' });
      setAmount('');
      setMessage('');
    } catch (e: any) {
      toast.show({ type: 'error', title: 'Gagal', message: e.response?.data?.message || 'Gagal membuat donasi' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout title="Dukung TaskHub" onBack={() => navigation.goBack()} scrollable={true}>
      <View style={styles.heartCircle}>
        <Ionicons name="heart" size={44} color={COLORS.coralRed} />
      </View>
      <Text style={styles.title}>Dukung TaskHub</Text>
      <Text style={styles.description}>
        TaskHub gratis tanpa komisi. Dukung kami agar terus berjalan!
      </Text>

      <View style={styles.qrisBox}>
        <Image source={QRIS_IMAGE} style={{ width: 260, height: 260, marginBottom: SPACING.md }} contentFit="contain" />
        <Button
          title="Simpan/Bagikan QRIS"
          onPress={handleDownloadQRIS}
          variant="secondary"
          style={styles.downloadBtn}
        />
      </View>

      <Text style={styles.label}>Nominal Donasi (Rp)</Text>
      <TextInput
        style={styles.input}
        placeholder="Nominal bebas"
        placeholderTextColor={COLORS.slate400}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Pesan (opsional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Semangat terus!"
        placeholderTextColor={COLORS.slate400}
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <Button
        title="Kirim Donasi"
        onPress={handleDonate}
        loading={loading}
        style={[styles.donateBtn, donateBtnStyle]}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  heartCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.red50,
    justifyContent: 'center', alignItems: 'center', alignSelf: 'center',
    marginTop: 20, marginBottom: SPACING.md,
  },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: '900', textAlign: 'center', color: COLORS.textPrimary },
  description: { fontSize: FONT_SIZES.sm, textAlign: 'center', color: COLORS.textSecondary, marginBottom: SPACING.xl, marginTop: SPACING.xs },
  qrisBox: {
    width: '100%', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl, alignItems: 'center', marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed',
  },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.xs },
  input: {
    width: '100%', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary, marginBottom: SPACING.md,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  donateBtn: { width: '100%', borderRadius: BORDER_RADIUS.lg, height: 50, marginTop: SPACING.md },
  downloadBtn: { width: '100%', borderRadius: BORDER_RADIUS.lg, height: 45, marginBottom: 0 },
});
