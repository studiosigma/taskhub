import React, { useEffect, useState, useCallback } from 'react';
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
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../constants';
import { tasksApi, reviewsApi } from '../services';
import { Task } from '../types';
import { SkeletonDetail } from '../components/ui/SkeletonDetail';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ErrorState } from '../components/ui/ErrorState';
import { RatingModal } from '../components/ui/RatingModal';
import { ReportModal } from '../components/ui/ReportModal';
import { ImageModalViewer } from '../components/ui/ImageModalViewer';
import { ScalePress } from '../components/ui/ScalePress';
import { TaskMapView } from '../components/ui/TaskMapView';
import { useToast } from '../components/ui/Toast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';

export const TaskDetailScreen: React.FC<{ route: any; navigation: any }> = ({
  route,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { user } = useAuth();
  const { taskId } = route.params || {};

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Gallery viewer state
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const fetchTask = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await tasksApi.getById(taskId);
      setTask(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat detail tugas');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId, fetchTask]);

  const handleShare = async () => {
    if (!task) return;
    try {
      await Share.share({
        message: `Lihat tugas "${task.title}" di TaskHub! Budget: Rp ${Number(task.budget).toLocaleString('id-ID')}`,
      });
    } catch (e) {
      // ignored
    }
  };

  const openGallery = (index: number) => {
    setViewerIndex(index);
    setViewerVisible(true);
  };

  const getRelativeTime = (dateStr: string) => {
    const diffHours = Math.round((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Baru saja';
    if (diffHours < 24) return `${diffHours} jam lalu`;
    return `${Math.floor(diffHours / 24)} hari lalu`;
  };

  const renderHeader = (showShare = false) => (
    <View style={[styles.navBarHeader, { paddingTop: insets.top + 8 }]}>
      <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
      </TouchableOpacity>
      <Text style={styles.navTitle}>Detail Task</Text>
      {showShare ? (
        <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
          <Ionicons name="share-social-outline" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 36 }} />
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <SkeletonDetail />
      </View>
    );
  }

  if (error || !task) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <ErrorState title="Gagal Memuat" message={error || 'Tugas tidak ditemukan'} onRetry={fetchTask} />
      </View>
    );
  }

  const formattedBudget = Number(task.budget).toLocaleString('id-ID');
  const photosRaw = task.photos || [];
  const photos: string[] = photosRaw.map((p: any) => typeof p === 'string' ? p : (p?.imageUrl || ''));
  const owner = task.owner;
  const isOwner = user?.id === task.ownerId;

  return (
    <View style={styles.container}>
      {renderHeader(true)}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <View style={styles.bannerWrapper}>
          <ScalePress onPress={() => openGallery(0)}>
            <View style={styles.roundedImageCard}>
              <Image
                source={{ uri: photos[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80' }}
                style={styles.heroImage}
                contentFit="cover"
              />
              <View style={styles.imageOverlayDistanceBadge}>
                <Ionicons name="location-sharp" size={12} color={COLORS.textPrimary} style={{ marginRight: 3 }} />
                <Text style={styles.imageOverlayDistanceText}>{task.address || '2 km'}</Text>
              </View>
            </View>
          </ScalePress>

          <View style={styles.subImageBar}>
            <Text style={styles.subImageLeftText}>
              <Ionicons name="location" size={11} color={COLORS.textSecondary} /> {task.address || 'Lokasi terdekat'}
            </Text>
            <Text style={styles.subImageRightText}>{getRelativeTime(task.createdAt)}</Text>
          </View>
        </View>

        {/* Body Content */}
        <View style={styles.bodyContent}>
          {/* Status & Title */}
          <View style={styles.statusTitleRow}>
            <Badge status={task.status} />
            <Text style={styles.categoryTag}>{task.category?.name || 'Kategori'}</Text>
          </View>

          <Text style={styles.taskTitle}>{task.title}</Text>

          {/* Price Pill */}
          <View style={styles.priceRow}>
            <View style={styles.yellowPricePill}>
              <Text style={styles.priceValue}>Rp {formattedBudget}</Text>
              <Text style={styles.priceUnit}> / total</Text>
            </View>
          </View>

          {/* Owner Card */}
          {owner && (
            <View style={styles.ownerCard}>
              <Image
                source={{ uri: owner.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${owner.fullName}` }}
                style={styles.ownerAvatar}
              />
              <View style={styles.ownerInfo}>
                <View style={styles.ownerNameRow}>
                  <Text style={styles.ownerName}>{owner.fullName}</Text>
                  {owner.isVerified && (
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} style={{ marginLeft: 4 }} />
                  )}
                </View>
                <View style={styles.ownerMetaRow}>
                  <Ionicons name="star" size={14} color={COLORS.primary} />
                  <Text style={styles.ownerRatingText}>
                    {owner.rating ? owner.rating.toFixed(1) : '5.0'} ({owner.completedTask || 0} selesai)
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.chatOwnerBtn}
                onPress={() => navigation.navigate('ChatDetail', { partnerId: owner.id, taskTitle: task.title })}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={20} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Meta Details List */}
          <View style={styles.metaListContainer}>
            <View style={styles.twoColumnMetaRow}>
              <View style={styles.metaRowItem}>
                <Ionicons name="time-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.metaText}>Est. {task.duration || '3 jam'}</Text>
              </View>
              <View style={styles.metaRowItem}>
                <Ionicons name="people-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.metaText}>Butuh {task.helperNeeded || 1} Helper</Text>
              </View>
            </View>
          </View>

          {/* Map Preview */}
          <TaskMapView
            latitude={task.latitude || -6.2088}
            longitude={task.longitude || 106.8456}
            title={task.title}
            address={task.address || 'Jakarta, Indonesia'}
          />

          {/* Trust Shield Banner */}
          <View style={styles.trustShieldBox}>
            <Ionicons name="shield-checkmark" size={24} color={COLORS.success} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.trustShieldTitle}>Garansi Pengerjaan Aman</Text>
              <Text style={styles.trustShieldSub}>Pembayaran dilakukan langsung secara tunai/transparan setelah tugas selesai.</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowReportModal(true)}
              style={{ paddingLeft: 8 }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="flag-outline" size={18} color={COLORS.coralRed} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.sectionHeader}>Deskripsi Tugas</Text>
          <Text style={styles.descriptionText}>{task.description}</Text>

          {/* Gallery */}
          {photos.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>Foto Pendukung</Text>
              <View style={styles.galleryRow}>
                {photos.slice(0, 3).map((url, idx) => (
                  <ScalePress key={idx} onPress={() => openGallery(idx)}>
                    <Image source={{ uri: url }} style={styles.galleryThumb} />
                  </ScalePress>
                ))}
                {photos.length > 3 && (
                  <ScalePress onPress={() => openGallery(3)}>
                    <View style={styles.morePhotosThumb}>
                      <Image source={{ uri: photos[3] }} style={styles.galleryThumb} />
                      <View style={styles.moreOverlay}>
                        <Text style={styles.moreCountText}>+{photos.length - 3}</Text>
                      </View>
                    </View>
                  </ScalePress>
                )}
              </View>
            </>
          )}
        </View>

        {/* Rate Completed Task Button */}
        {task.status === 'COMPLETED' && (
          <TouchableOpacity
            style={styles.rateTaskBtn}
            onPress={() => setShowRatingModal(true)}
          >
            <Ionicons name="star" size={18} color={COLORS.textPrimary} style={{ marginRight: 6 }} />
            <Text style={styles.rateTaskBtnText}>Berikan Penilaian / Ulasan</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.stickyBottomBar, { paddingBottom: Math.max(insets.bottom, SPACING.md) }]}>
        {isOwner ? (
          <Button
            title="Kelola Tugas Saya"
            onPress={() => navigation.navigate('MyTasks')}
            style={styles.ajukanDiriBtn}
          />
        ) : task.status === 'OPEN' ? (
          <Button
            title="Ajukan Diri Sebagai Helper"
            onPress={() => toast.show({ type: 'success', title: 'Berhasil', message: 'Berhasil mengajukan diri!' })}
            style={styles.ajukanDiriBtn}
          />
        ) : (
          <Button
            title={`Status: ${task.status}`}
            onPress={() => {}}
            disabled
            style={styles.disabledBtn}
          />
        )}
      </View>

      {/* Image Modal Viewer */}
      <ImageModalViewer
        visible={viewerVisible}
        images={photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&q=80']}
        initialIndex={viewerIndex}
        onClose={() => setViewerVisible(false)}
      />

      {/* Rating Modal */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={async (rating, comment) => {
          try {
            await reviewsApi.create(task.id, rating, comment);
            toast.show({ type: 'success', title: 'Berhasil', message: 'Ulasan berhasil dikirim!' });
            setShowRatingModal(false);
          } catch (e: any) {
            toast.show({ type: 'error', title: 'Gagal', message: e?.response?.data?.message || 'Gagal mengirim ulasan' });
          }
        }}
      />
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
    ...SHADOWS.sm,
  },
  navBtn: { padding: 4 },
  navTitle: { fontSize: FONT_SIZES.base, fontWeight: '900', color: COLORS.textPrimary },
  scrollContent: { paddingBottom: 110 },
  bannerWrapper: { paddingHorizontal: SPACING.lg, marginTop: 8 },
  roundedImageCard: { height: 210, borderRadius: BORDER_RADIUS['2xl'], overflow: 'hidden', position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  imageOverlayDistanceBadge: {
    position: 'absolute', bottom: 12, left: 12, backgroundColor: COLORS.surface,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center',
    ...SHADOWS.sm,
  },
  imageOverlayDistanceText: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary },
  subImageBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  subImageLeftText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  subImageRightText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' },
  bodyContent: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.md },
  statusTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  categoryTag: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, backgroundColor: COLORS.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: BORDER_RADIUS.sm },
  taskTitle: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.textPrimary, lineHeight: 28, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: SPACING.md },
  yellowPricePill: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: COLORS.primaryLight, paddingHorizontal: 14, paddingVertical: 8, borderRadius: BORDER_RADIUS.md },
  priceValue: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.textPrimary },
  priceUnit: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textPrimary },
  ownerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ownerAvatar: { width: 44, height: 44, borderRadius: BORDER_RADIUS.full, marginRight: 12 },
  ownerInfo: { flex: 1 },
  ownerNameRow: { flexDirection: 'row', alignItems: 'center' },
  ownerName: { fontSize: FONT_SIZES.base, fontWeight: '800', color: COLORS.textPrimary },
  ownerMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ownerRatingText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600', marginLeft: 4 },
  chatOwnerBtn: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  trustShieldBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryBg, borderWidth: 1, borderColor: COLORS.primaryLight, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg, marginTop: SPACING.md },
  trustShieldTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 2 },
  trustShieldSub: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '500' },
  metaListContainer: { marginBottom: SPACING.md, gap: 8 },
  twoColumnMetaRow: { flexDirection: 'row', gap: 24 },
  metaRowItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: FONT_SIZES.sm, color: COLORS.textPrimary, fontWeight: '700' },
  sectionHeader: { fontSize: FONT_SIZES.base, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 8, marginTop: 6 },
  descriptionText: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SPACING.xl },
  galleryRow: { flexDirection: 'row', gap: 10 },
  galleryThumb: { width: 72, height: 72, borderRadius: BORDER_RADIUS.md },
  morePhotosThumb: { width: 72, height: 72, borderRadius: BORDER_RADIUS.md, position: 'relative', overflow: 'hidden' },
  moreOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(11, 11, 11, 0.7)', justifyContent: 'center', alignItems: 'center' },
  moreCountText: { color: COLORS.white, fontWeight: '900', fontSize: 16 },
  stickyBottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: SPACING.lg, paddingTop: SPACING.sm, backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOWS.lg },
  ajukanDiriBtn: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg, height: 50 },
  disabledBtn: { borderRadius: BORDER_RADIUS.lg, height: 50, backgroundColor: COLORS.slate200 },
  rateTaskBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primaryLight, marginHorizontal: SPACING.lg, marginTop: SPACING.md, paddingVertical: 12, borderRadius: 14 },
  rateTaskBtnText: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: COLORS.textPrimary },
});
