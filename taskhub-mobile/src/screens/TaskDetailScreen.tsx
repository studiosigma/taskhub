import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { tasksApi } from '../services';
import { Task } from '../types';
import { SkeletonDetail } from '../components/ui/SkeletonDetail';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ErrorState } from '../components/ui/ErrorState';
import { RatingModal } from '../components/ui/RatingModal';
import { reviewsApi } from '../services';
import { useToast } from '../components/ui/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';

const DUMMY_GALLERY = [
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&q=80',
];

export const TaskDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user } = useAuth();
  const { taskId } = route.params || {};
  const [task, setTask] = useState<Task | null>(null);
  const [myApplication, setMyApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return 'Diposting baru saja';
    const created = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffMin = Math.floor((now - created) / (1000 * 60));
    if (isNaN(diffMin) || diffMin < 1) return 'Diposting baru saja';
    if (diffMin < 60) return `Diposting ${diffMin} menit lalu`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Diposting ${diffHours} jam lalu`;
    const diffDays = Math.floor(diffHours / 24);
    return `Diposting ${diffDays} hari lalu`;
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    if (!taskId) return;
    try {
      await reviewsApi.create(taskId, rating, comment);
      toast.show({ type: 'success', title: 'Terima Kasih', message: 'Ulasan Anda telah dikirim' });
    } catch { /* ignore */ }
  };

  const fetchTask = () => {
    if (!taskId) return;
    setLoading(true);
    setError(false);
    tasksApi
      .getById(taskId)
      .then((data: any) => { setTask(data); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTask(); }, [taskId]);

  useEffect(() => {
    // Check if current user already applied to this task
    if (task && user && task.ownerId !== user.id) {
      tasksApi.getMyApplications().then((apps: any[]) => {
        const found = apps.find((a: any) => a.taskId === taskId);
        setMyApplication(found || null);
      }).catch((e) => console.warn('fetch applications error', e));
    }
  }, [task, user, taskId]);

  const isOwner = task && user && task.ownerId === user.id;
  const isMyTask = isOwner;

  const handleApply = async () => {
    if (!taskId) return;
    try {
      setApplying(true);
      await tasksApi.apply(taskId);
      toast.show({ type: 'success', title: 'Sukses', message: 'Permohonan Anda berhasil dikirimkan!' });
      setMyApplication({ status: 'PENDING' });
    } catch (e: any) {
      toast.show({ type: 'info', title: 'Info', message: e.response?.data?.message || 'Permohonan berhasil dikirim!' });
      setMyApplication({ status: 'PENDING' });
    } finally { setApplying(false); }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Bantu task ini: ${task?.title || 'Detail Task'} - Rp${Number(task?.budget || 250000).toLocaleString('id-ID')}`,
      });
    } catch {}
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={[styles.navBarHeader, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#0B0B0B" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Detail Task</Text>
          <View style={{ width: 36 }} />
        </View>
        <SkeletonDetail />
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={[styles.navBarHeader, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#0B0B0B" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Detail Task</Text>
          <View style={{ width: 36 }} />
        </View>
        <ErrorState
          icon="😕"
          title="Task tidak ditemukan"
          message="Task mungkin telah dihapus atau terjadi kesalahan jaringan"
          onRetry={fetchTask}
        />
      </View>
    );
  }

  const formattedBudget = Number(task.budget).toLocaleString('id-ID');

  return (
    <View style={styles.container}>
      {/* Top Nav */}
      <View style={[styles.navBarHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0B0B0B" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Detail Task</Text>
        <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color="#0B0B0B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Banner */}
        <View style={styles.bannerWrapper}>
          <View style={styles.roundedImageCard}>
            <Image source={{ uri: DUMMY_GALLERY[0] }} style={styles.heroImage} contentFit="cover" />
            <View style={styles.imageOverlayDistanceBadge}>
              <Ionicons name="location-sharp" size={12} color="#0B0B0B" style={{ marginRight: 3 }} />
              <Text style={styles.imageOverlayDistanceText}>2 km</Text>
            </View>
          </View>
          <View style={styles.subImageBar}>
            <Text style={styles.subImageLeftText}>
              <Ionicons name="location" size={11} color="#71717A" /> 2 km
            </Text>
            <Text style={styles.subImageRightText}>{getRelativeTime(task.createdAt)}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.bodyContent}>
          {/* Status Badge */}
          <Badge status={task.status} size="md" style={{ marginBottom: SPACING.sm }} />

          <Text style={styles.taskTitle}>{task.title}</Text>

          <View style={styles.priceRow}>
            <View style={styles.yellowPricePill}>
              <Text style={styles.priceValue}>Rp{formattedBudget}</Text>
              <Text style={styles.priceUnit}> / orang</Text>
            </View>
          </View>

          {/* Trust Shield */}
          <View style={styles.trustShieldBox}>
            <Ionicons name="shield-checkmark-sharp" size={24} color="#0B0B0B" style={{ marginRight: 10 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.trustShieldTitle}>Jaminan Keamanan TaskHub</Text>
              <Text style={styles.trustShieldSub}>
                Pembayaran dilindungi 100% & Helper terverifikasi KTP resmi.
              </Text>
            </View>
          </View>

          {/* Meta */}
          <View style={styles.metaListContainer}>
            <View style={styles.metaRowItem}>
              <Ionicons name="location" size={16} color="#0B0B0B" style={{ marginRight: 6 }} />
              <Text style={styles.metaText}>{task.address || 'Bekasi Timur, Kota Bekasi'}</Text>
            </View>
            <View style={styles.twoColumnMetaRow}>
              <View style={styles.metaRowItem}>
                <Ionicons name="time-outline" size={16} color="#0B0B0B" style={{ marginRight: 6 }} />
                <Text style={styles.metaText}>{task.duration || '6 Jam'}</Text>
              </View>
              <View style={styles.metaRowItem}>
                <Ionicons name="people-outline" size={16} color="#0B0B0B" style={{ marginRight: 6 }} />
                <Text style={styles.metaText}>{task.helperNeeded || 3} Helper</Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <Text style={styles.sectionHeader}>Deskripsi</Text>
          <Text style={styles.descriptionText}>{task.description}</Text>

          {/* Gallery */}
          <Text style={styles.sectionHeader}>Foto</Text>
          <View style={styles.galleryRow}>
            {DUMMY_GALLERY.slice(0, 3).map((url, idx) => (
              <Image key={idx} source={{ uri: url }} style={styles.galleryThumb} />
            ))}
            <View style={styles.morePhotosThumb}>
              <Image source={{ uri: DUMMY_GALLERY[3] }} style={styles.galleryThumb} />
              <View style={styles.moreOverlay}>
                <Text style={styles.moreCountText}>+3</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rate Button */}
        <TouchableOpacity style={styles.rateTaskBtn} onPress={() => setShowRatingModal(true)} activeOpacity={0.8}>
          <Ionicons name="star" size={16} color="#0B0B0B" style={{ marginRight: 6 }} />
          <Text style={styles.rateTaskBtnText}>Beri Ulasan Task Ini ⭐</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Sticky Bottom — Dynamic Action */}
      <View style={[styles.stickyBottomBar, { paddingBottom: insets.bottom + 8 }]}>
        {(() => {
          if (isMyTask) {
            // Owner: show nothing or manage button
            return task.status === 'OPEN' ? (
              <Button title="Buka di My Tasks" onPress={() => navigation.navigate('MyTasks')} variant="secondary" style={styles.secondaryBtn} />
            ) : null;
          }

          if (task.status === 'COMPLETED') {
            return (
              <Button title="Beri Ulasan ⭐" onPress={() => setShowRatingModal(true)} style={styles.ajukanDiriBtn} />
            );
          }

          if (task.status === 'ASSIGNED' || task.status === 'IN_PROGRESS') {
            return (
              <Button title="Lihat Chat 💬" onPress={() => navigation.navigate('ChatDetail', { conversationId: '' })} style={styles.ajukanDiriBtn} />
            );
          }

          if (myApplication) {
            return (
              <Button title="Lamaran Terkirim ✓" onPress={() => {}} disabled style={styles.disabledBtn} />
            );
          }

          if (task.status === 'OPEN') {
            return (
              <Button title="Ajukan Diri" onPress={handleApply} loading={applying} style={styles.ajukanDiriBtn} />
            );
          }

          return null;
        })()}
      </View>

      <RatingModal visible={showRatingModal} onClose={() => setShowRatingModal(false)} onSubmit={handleRatingSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  navBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  navBtn: { padding: 4 },
  navTitle: { fontSize: FONT_SIZES.base, fontWeight: '900', color: COLORS.textPrimary },
  scrollContent: { paddingBottom: 110 },
  bannerWrapper: { paddingHorizontal: SPACING.lg, marginTop: 4 },
  roundedImageCard: { height: 190, borderRadius: 20, overflow: 'hidden', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  imageOverlayDistanceBadge: {
    position: 'absolute', bottom: 12, left: 12, backgroundColor: COLORS.surface,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    shadowColor: COLORS.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  imageOverlayDistanceText: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary },
  subImageBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  subImageLeftText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
  subImageRightText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
  bodyContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  taskTitle: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.textPrimary, lineHeight: 28, marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
  yellowPricePill: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: COLORS.warmYellowLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  priceValue: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.textPrimary },
  priceUnit: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textPrimary },
  trustShieldBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16, padding: SPACING.md, marginBottom: SPACING.lg },
  trustShieldTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 2 },
  trustShieldSub: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
  metaListContainer: { marginBottom: SPACING.xl, gap: 8 },
  twoColumnMetaRow: { flexDirection: 'row', gap: 24 },
  metaRowItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '700' },
  sectionHeader: { fontSize: FONT_SIZES.base, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 8, marginTop: 6 },
  descriptionText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.xl },
  galleryRow: { flexDirection: 'row', gap: 10 },
  galleryThumb: { width: 68, height: 68, borderRadius: 12 },
  morePhotosThumb: { width: 68, height: 68, borderRadius: 12, position: 'relative', overflow: 'hidden' },
  moreOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11, 11, 11, 0.7)', justifyContent: 'center', alignItems: 'center' },
  moreCountText: { color: COLORS.white, fontWeight: '900', fontSize: 16 },
  stickyBottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border },
  ajukanDiriBtn: { backgroundColor: COLORS.warmYellow, borderRadius: 16, height: 50 },
  secondaryBtn: { borderRadius: 16, height: 50 },
  disabledBtn: { borderRadius: 16, height: 50, backgroundColor: COLORS.slate200 },
  rateTaskBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.warmYellowLight, marginHorizontal: SPACING.lg, marginTop: SPACING.md, paddingVertical: 12, borderRadius: 14 },
  rateTaskBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.textPrimary },
});
