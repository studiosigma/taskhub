import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps, useNavigation } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainTabParamList, RootStackParamList } from "../types";
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useThemeColor } from '../hooks/useThemeColor';
import { tasksApi } from '../services';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, activeRole, toggleRole, logout } = useAuth();
  const theme = useThemeColor();
  const isHelper = activeRole === 'HELPER';
  const [createdCount, setCreatedCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      const list: any[] = await tasksApi.getMyTasks();
      setCreatedCount(Array.isArray(list) ? list.length : 0);
      setInProgressCount(Array.isArray(list) ? list.filter((t: any) => t.status === 'IN_PROGRESS').length : 0);
      setCompletedCount(Array.isArray(list) ? list.filter((t: any) => t.status === 'COMPLETED').length : 0);
    } catch (e) { console.log(e); }
  }, []);

  useFocusEffect(useCallback(() => { fetchStats(); }, [fetchStats]));

  const menuItems = [
    { icon: 'swap-horizontal', label: `Beralih ke ${isHelper ? 'Mode Owner' : 'Mode Helper'}`, color: theme.primary, onPress: toggleRole },
    { icon: 'shield-checkmark-outline', label: 'Verifikasi KTP & Identitas', onPress: () => navigation.navigate('IdentityVerification') },
    { icon: 'clipboard-outline', label: 'Task Saya', onPress: () => navigation.navigate('MyTasks') },
    { icon: 'time-outline', label: 'Riwayat Task', onPress: () => navigation.navigate('MyTasks') },
    { icon: 'heart-outline', label: 'Favorite Helper', onPress: () => {} },
    { icon: 'location-outline', label: 'Alamat Saya', onPress: () => {} },
    { icon: 'card-outline', label: 'Metode Pembayaran', onPress: () => {} },
    { icon: 'heart', label: 'Dukung TaskHub', color: '#EB5757', onPress: () => navigation.navigate('Support') },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Hero Header */}
      <View style={[styles.heroHeader, { backgroundColor: theme.primary }]}>
        <View style={styles.headerTopBar}>
          <TouchableOpacity
            style={[styles.roleBadge, { backgroundColor: isHelper ? 'rgba(11,11,11,0.15)' : 'rgba(255,255,255,0.2)' }]}
            onPress={toggleRole}
            activeOpacity={0.8}
          >
            <Ionicons name={isHelper ? 'construct' : 'person-circle'} size={14} color={theme.text} style={{ marginRight: 4 }} />
            <Text style={[styles.roleBadgeText, { color: theme.text }]}>{isHelper ? 'Mode Helper' : 'Mode Owner'}</Text>
            <Ionicons name="swap-horizontal" size={14} color={theme.text} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Support')}>
            <Ionicons name="settings-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Text style={[styles.avatarLetter, { color: theme.primary }]}>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'M'}
            </Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={12} color="#0B0B0B" />
          </View>
        </View>

        <Text style={[styles.userName, { color: theme.text }]}>{user?.fullName || 'Muis'}</Text>

        <View style={[styles.ratingPill, { backgroundColor: isHelper ? 'rgba(11,11,11,0.1)' : 'rgba(255,255,255,0.2)' }]}>
          <Ionicons name="star" size={12} color={theme.text} style={{ marginRight: 4 }} />
          <Text style={[styles.ratingText, { color: theme.text }]}>{(user?.rating || 5.0).toFixed(1)} Rating</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { value: createdCount, label: 'Task Dibuat' },
            { value: inProgressCount, label: 'Berjalan' },
            { value: completedCount, label: 'Selesai' },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statCol}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        {menuItems.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.menuRow}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon as any} size={20} color={item.color || '#0B0B0B'} style={{ marginRight: 12 }} />
              <Text style={[styles.menuLabel, item.color === '#EB5757' && { color: '#EB5757' }]}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#71717A" />
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.menuRow, { borderBottomWidth: 0 }]} onPress={logout} activeOpacity={0.7}>
          <View style={styles.menuLeft}>
            <Ionicons name="log-out-outline" size={20} color="#EB5757" style={{ marginRight: 12 }} />
            <Text style={[styles.menuLabel, { color: '#EB5757' }]}>Keluar Akun</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  heroHeader: {
    paddingTop: 54,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTopBar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  roleBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  roleBadgeText: { fontSize: 11, fontWeight: '800' },
  avatarWrapper: { position: 'relative', marginBottom: 8 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  avatarLetter: { fontSize: FONT_SIZES['3xl'], fontWeight: '900' },
  verifiedBadge: { position: 'absolute', bottom: 2, right: 2, backgroundColor: COLORS.warmYellow, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.surface },
  userName: { fontSize: FONT_SIZES.xl, fontWeight: '900', marginBottom: 4 },
  ratingPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: SPACING.lg },
  ratingText: { fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', width: '100%', backgroundColor: COLORS.surface, borderRadius: 20, paddingVertical: SPACING.md, shadowColor: COLORS.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, justifyContent: 'space-around', alignItems: 'center' },
  statCol: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: COLORS.textPrimary },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600', marginTop: 2 },
  statDivider: { width: 1, height: 24, backgroundColor: COLORS.border },
  menuSection: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surface, paddingVertical: 14, paddingHorizontal: SPACING.md, borderRadius: 16, marginBottom: SPACING.xs, borderWidth: 1, borderColor: COLORS.border },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuLabel: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textPrimary },
});
