import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { useThemeColor } from '../hooks/useThemeColor';
import { useToast } from '../components/ui/Toast';
import { supportApi } from '../services';
import { Button } from '../components/ui/Button';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { ScalePress } from '../components/ui/ScalePress';

// @ts-ignore
import QRIS_IMAGE from '../../assets/Qris_taskhub.jpeg';
import { Asset } from 'expo-asset';

const QUICK_AMOUNTS = [10000, 25000, 50000, 100000];

export const SupportScreen: React.FC<NativeStackScreenProps<RootStackParamList, "Support">> = ({ navigation }) => {
  const theme = useThemeColor();
  const toast = useToast();
  const donateBtnStyle: ViewStyle = { backgroundColor: theme.primary };

  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [myDonations, setMyDonations] = useState<any[]>([]);

  const fetchMyDonations = useCallback(async () => {
    try {
      const data = await supportApi.getDonations();
      if (Array.isArray(data)) setMyDonations(data);
    } catch (e) {
      console.log('fetchMyDonations error', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMyDonations();
    }, [fetchMyDonations])
  );

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
      toast.show({ type: 'warning', title: 'Minimal Donasi Rp1.000', message: 'Masukkan nominal donasi yang valid' });
      return;
    }
    try {
      setLoading(true);
      await supportApi.createDonation(parseInt(amount), 'QRIS', message);
      toast.show({ type: 'success', title: 'Terima kasih!', message: 'Dukungan Anda sangat berarti untuk kemajuan TaskHub' });
      setAmount('');
      setMessage('');
      fetchMyDonations();
    } catch (e: any) {
      toast.show({ type: 'error', title: 'Gagal', message: e.response?.data?.message || 'Gagal membuat donasi' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => `Rp ${Number(val || 0).toLocaleString('id-ID')}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <ScreenLayout title="Dukung TaskHub" onBack={() => navigation.goBack()} scrollable={true}>
      <View style={styles.heartCircle}>
        <Ionicons name="heart" size={44} color={COLORS.coralRed} />
      </View>
      <Text style={styles.title}>Dukung TaskHub</Text>
      <Text style={styles.description}>
        TaskHub gratis tanpa komisi. Dukung kami agar terus melayani masyarakat Indonesia!
      </Text>

      <View style={styles.qrisBox}>
        <Image source={QRIS_IMAGE} style={{ width: 240, height: 240, marginBottom: SPACING.md }} contentFit="contain" />
        <Button
          title="Simpan / Bagikan Kode QRIS"
          onPress={handleDownloadQRIS}
          variant="secondary"
          style={styles.downloadBtn}
        />
      </View>

      <Text style={styles.label}>Pilih Nominal Donasi Cepat</Text>
      <View style={styles.quickPillsRow}>
        {QUICK_AMOUNTS.map((val) => {
          const active = amount === String(val);
          return (
            <ScalePress key={val} onPress={() => setAmount(String(val))}>
              <View style={[styles.quickPill, active && styles.activeQuickPill]}>
                <Text style={[styles.quickPillText, active && styles.activeQuickPillText]}>
                  {formatCurrency(val)}
                </Text>
              </View>
            </ScalePress>
          );
        })}
      </View>

      <Text style={styles.label}>Atau Masukkan Nominal Lain (Rp)</Text>
      <TextInput
        style={styles.input}
        placeholder="Contoh: 50000"
        placeholderTextColor={COLORS.slate400}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Pesan Apresiasi (Opsional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Semangat terus tim TaskHub!"
        placeholderTextColor={COLORS.slate400}
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <Button
        title="Kirim Donasi & Apresiasi"
        onPress={handleDonate}
        loading={loading}
        style={[styles.donateBtn, donateBtnStyle]}
      />

      {/* History Section */}
      {myDonations.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Riwayat Dukungan Anda</Text>
          {myDonations.map((item) => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <Ionicons name="heart-circle" size={32} color={COLORS.coralRed} style={{ marginRight: 10 }} />
                <View>
                  <Text style={styles.historyAmount}>{formatCurrency(item.amount)}</Text>
                  {item.message ? <Text style={styles.historyMessage}>{item.message}</Text> : null}
                </View>
              </View>
              <Text style={styles.historyDate}>{formatDate(item.createdAt)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  heartCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.red50,
    justifyContent: 'center', alignItems: 'center', alignSelf: 'center',
    marginTop: 10, marginBottom: SPACING.md,
  },
  title: { fontSize: FONT_SIZES['2xl'], fontWeight: '900', textAlign: 'center', color: COLORS.textPrimary },
  description: { fontSize: FONT_SIZES.sm, textAlign: 'center', color: COLORS.textSecondary, marginBottom: SPACING.lg, marginTop: SPACING.xs },
  qrisBox: {
    width: '100%', backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.lg,
    borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed', ...SHADOWS.sm,
  },
  label: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.textPrimary, marginBottom: SPACING.xs, marginTop: SPACING.xs },
  quickPillsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: SPACING.md },
  quickPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
  },
  activeQuickPill: { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
  quickPillText: { fontSize: 12, fontWeight: '800', color: COLORS.textSecondary },
  activeQuickPillText: { color: COLORS.white },
  input: {
    width: '100%', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg, padding: SPACING.lg, fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary, marginBottom: SPACING.md,
  },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  donateBtn: { width: '100%', borderRadius: BORDER_RADIUS.lg, height: 50, marginTop: SPACING.sm, marginBottom: SPACING.xl },
  downloadBtn: { width: '100%', borderRadius: BORDER_RADIUS.lg, height: 45, marginBottom: 0 },
  historySection: { marginTop: SPACING.sm, paddingBottom: 60 },
  historyTitle: { fontSize: FONT_SIZES.base, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.md },
  historyCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.xs, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.sm,
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  historyAmount: { fontSize: FONT_SIZES.sm, fontWeight: '900', color: COLORS.textPrimary },
  historyMessage: { fontSize: 11, color: COLORS.slate600, marginTop: 2, fontWeight: '500' },
  historyDate: { fontSize: 10, color: COLORS.slate400, fontWeight: '700' },
});
