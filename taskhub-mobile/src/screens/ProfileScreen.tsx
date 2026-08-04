import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  TextInput,
  RefreshControl,
} from 'react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../types';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { tasksApi, usersApi } from '../services';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { ScalePress } from '../components/ui/ScalePress';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

interface ProfileStats {
  created: number;
  completed: number;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, activeRole, toggleRole, logout } = useAuth();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const isHelper = activeRole === 'HELPER';

  const [stats, setStats] = useState<ProfileStats>({ created: 0, completed: 0 });
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const list: any[] = await tasksApi.getMyTasks();
      const created = Array.isArray(list) ? list.length : 0;
      const completed = Array.isArray(list) ? list.filter((t: any) => t.status === 'COMPLETED').length : 0;
      setStats({ created, completed });
    } catch (e) {
      console.log(e);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const profile = await usersApi.getProfile();
      if (profile) {
        setEditName(profile.fullName || '');
        setEditBio(profile.bio || '');
        if (profile.avatar) setAvatar(profile.avatar);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
      fetchProfile();
    }, [fetchStats, fetchProfile])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    await fetchProfile();
    setRefreshing(false);
  }, [fetchStats, fetchProfile]);

  const handleSaveProfile = async () => {
    try {
      setUploading(true);
      await usersApi.updateProfile({
        fullName: editName,
        bio: editBio,
      });
      if (avatar && avatar.startsWith('file://')) {
        const formData = new FormData();
        const filename = avatar.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append('file', { uri: avatar, name: filename, type } as any);
        await usersApi.uploadAvatar(formData);
      }
      toast.show({ type: 'success', title: 'Berhasil', message: 'Profil berhasil diperbarui!' });
      setEditing(false);
    } catch (e: any) {
      toast.show({ type: 'error', title: 'Gagal', message: e.response?.data?.message || 'Gagal menyimpan profil' });
    } finally {
      setUploading(false);
    }
  };

  const pickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Akses ke galeri foto dibutuhkan');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setAvatar(result.assets[0].uri);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleLogout = () => {
    Alert.alert('Keluar Akun', 'Apakah Anda yakin ingin keluar dari akun TaskHub?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    {
      icon: 'swap-horizontal',
      label: `Beralih ke ${isHelper ? 'Mode Owner (Buat Task)' : 'Mode Helper (Cari Kerja)'}`,
      badge: isHelper ? 'Helper' : 'Owner',
      color: COLORS.primaryDark,
      onPress: toggleRole,
    },
    {
      icon: 'shield-checkmark-outline',
      label: 'Verifikasi Profil & Kontak',
      badge: user?.isVerified ? 'Terverifikasi' : 'Belum',
      badgeColor: user?.isVerified ? COLORS.success : COLORS.amber800,
      onPress: () => navigation.navigate('IdentityVerification'),
    },
    {
      icon: 'clipboard-outline',
      label: 'Kelola Tugas Saya',
      onPress: () => navigation.navigate('MyTasks'),
    },
    {
      icon: 'cash-outline',
      label: isHelper ? 'Dashboard Penghasilan' : 'Dashboard Pengeluaran',
      color: COLORS.mintGreen,
      onPress: () => navigation.navigate('FinancialDashboard'),
    },
    {
      icon: 'star-outline',
      label: 'Rating & Ulasan Saya',
      onPress: () => navigation.navigate('Reviews'),
    },
    {
      icon: 'location-outline',
      label: 'Alamat Simpanan',
      onPress: () => navigation.navigate('Addresses'),
    },
    {
      icon: 'shield-outline',
      label: 'Keamanan & Akun',
      onPress: () => navigation.navigate('Security'),
    },
    {
      icon: 'help-circle-outline',
      label: 'Bantuan & Dukungan',
      onPress: () => navigation.navigate('Support'),
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* Hero Header */}
      <View style={[styles.heroHeader, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTopBar}>
          <TouchableOpacity style={styles.roleBadge} onPress={toggleRole} activeOpacity={0.8}>
            <Ionicons
              name={isHelper ? 'construct' : 'person-circle'}
              size={14}
              color={COLORS.textPrimary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.roleBadgeText}>{isHelper ? 'Mode Helper' : 'Mode Owner'}</Text>
            <Ionicons name="swap-horizontal" size={14} color={COLORS.textPrimary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.editIconBtn} onPress={() => setEditing(!editing)}>
            <Ionicons name={editing ? 'close' : 'create-outline'} size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Avatar & Info */}
        <View style={styles.avatarWrapper}>
          <TouchableOpacity style={styles.avatarCircle} onPress={editing ? pickAvatar : undefined} activeOpacity={0.8}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarLetter}>
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            )}
            {editing && (
              <View style={styles.editAvatarOverlay}>
                <Ionicons name="camera" size={16} color={COLORS.white} />
              </View>
            )}
          </TouchableOpacity>

          {user?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color={COLORS.white} />
            </View>
          )}
        </View>

        <Text style={styles.userName}>{user?.fullName || 'Pengguna TaskHub'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        {user?.bio && <Text style={styles.userBio}>{user.bio}</Text>}

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Ionicons name="checkmark-circle" size={22} color={COLORS.mintGreen} style={{ marginBottom: 2 }} />
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Task Selesai</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Ionicons name="star" size={22} color={COLORS.primaryDark} style={{ marginBottom: 2 }} />
            <Text style={styles.statValue}>{(user?.rating || 5.0).toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating Bintang</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Ionicons name="clipboard" size={22} color={COLORS.skyBlue} style={{ marginBottom: 2 }} />
            <Text style={styles.statValue}>{stats.created}</Text>
            <Text style={styles.statLabel}>Total Task</Text>
          </View>
        </View>
      </View>

      {/* Edit Form Modal/Card */}
      {editing && (
        <View style={styles.editFormCard}>
          <Text style={styles.editFormTitle}>Edit Data Profil</Text>
          <Text style={styles.inputLabel}>Nama Lengkap</Text>
          <TextInput
            style={styles.editInput}
            value={editName}
            onChangeText={setEditName}
            placeholder="Nama Lengkap"
          />
          <Text style={styles.inputLabel}>Bio Singkat</Text>
          <TextInput
            style={[styles.editInput, { height: 80 }]}
            value={editBio}
            onChangeText={setEditBio}
            placeholder="Tuliskan bio atau pengalaman Anda..."
            multiline
          />
          <View style={styles.editActionsRow}>
            <Button title="Batal" variant="secondary" onPress={() => setEditing(false)} style={{ flex: 1 }} />
            <Button title="Simpan" onPress={handleSaveProfile} loading={uploading} style={{ flex: 1 }} />
          </View>
        </View>
      )}

      {/* Menu List Section */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionHeader}>Pengaturan Akun</Text>

        {menuItems.map((item, idx) => (
          <ScalePress key={idx} onPress={item.onPress}>
            <View style={styles.menuRow}>
              <View style={styles.menuLeft}>
                <View style={styles.iconCircle}>
                  <Ionicons name={item.icon as any} size={20} color={item.color || COLORS.textPrimary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>

              <View style={styles.menuRight}>
                {item.badge && (
                  <View style={[styles.menuBadgePill, item.badgeColor ? { backgroundColor: item.badgeColor } : null]}>
                    <Text style={styles.menuBadgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={18} color={COLORS.slate400} />
              </View>
            </View>
          </ScalePress>
        ))}

        {/* Logout Row */}
        <ScalePress onPress={handleLogout}>
          <View style={[styles.menuRow, styles.logoutRow]}>
            <View style={styles.menuLeft}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.red50 }]}>
                <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
              </View>
              <Text style={[styles.menuLabel, { color: COLORS.danger }]}>Keluar dari Akun</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.danger} />
          </View>
        </ScalePress>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  heroHeader: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl + 8,
    alignItems: 'center',
    borderBottomLeftRadius: BORDER_RADIUS['2xl'],
    borderBottomRightRadius: BORDER_RADIUS['2xl'],
    ...SHADOWS.md,
  },
  headerTopBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(11, 11, 11, 0.12)',
  },
  roleBadgeText: { fontSize: 11, fontWeight: '800', color: COLORS.textPrimary },
  editIconBtn: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(11, 11, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarWrapper: { position: 'relative', marginBottom: 10 },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.surface,
    ...SHADOWS.md,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 44 },
  avatarLetter: { fontSize: FONT_SIZES['3xl'], fontWeight: '900', color: COLORS.textPrimary },
  editAvatarOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.mintGreen,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  userName: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 2 },
  userEmail: { fontSize: FONT_SIZES.xs, color: COLORS.textPrimary, opacity: 0.85, fontWeight: '600' },
  userBio: { fontSize: FONT_SIZES.xs, color: COLORS.textPrimary, textAlign: 'center', marginTop: 6, opacity: 0.9, paddingHorizontal: SPACING.md },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    marginTop: SPACING.lg,
    ...SHADOWS.md,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statCol: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: COLORS.textPrimary },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '700', marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.border },
  editFormCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
  },
  editFormTitle: { fontSize: FONT_SIZES.base, fontWeight: '900', color: COLORS.textPrimary, marginBottom: SPACING.md },
  inputLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 4 },
  editInput: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  editActionsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  menuSection: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg },
  menuSectionHeader: { fontSize: FONT_SIZES.sm, fontWeight: '900', color: COLORS.textSecondary, marginBottom: SPACING.sm, marginLeft: 4 },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  logoutRow: { marginTop: SPACING.sm, borderColor: COLORS.red50 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.textPrimary },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.slate200,
  },
  menuBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.white },
});