import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { RootStackParamList, NotificationItem } from '../types';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../constants';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { EmptyState } from '../components/ui/EmptyState';
import { notificationsApi } from '../services';
import { useToast } from '../components/ui/Toast';

export const NotificationsScreen: React.FC<
  NativeStackScreenProps<RootStackParamList, 'Notifications'>
> = ({ navigation }) => {
  const toast = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await notificationsApi.getAll();
      const list = Array.isArray(res) ? res : res?.data || [];
      setNotifications(list);
    } catch (e) {
      console.log('fetchNotifications error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const handleMarkRead = async (item: NotificationItem) => {
    if (item.isRead) return;
    try {
      await notificationsApi.markRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
    } catch (e) {
      console.log('markRead error', e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.show({
        type: 'success',
        title: 'Berhasil',
        message: 'Semua notifikasi telah ditandai dibaca',
      });
    } catch (e) {
      toast.show({
        type: 'error',
        title: 'Gagal',
        message: 'Gagal menandai notifikasi',
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <ScreenLayout title="Pemberitahuan" onBack={() => navigation.goBack()}>
      {/* Action Header */}
      {notifications.length > 0 && (
        <View style={styles.topActionRow}>
          <Text style={styles.unreadSummaryText}>
            {unreadCount > 0 ? `${unreadCount} Belum Dibaca` : 'Semua Sudah Dibaca'}
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllRead} activeOpacity={0.7}>
              <Text style={styles.markAllBtnText}>Tandai Semua Dibaca</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchNotifications();
            }}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="notifications-off-outline"
              title="Belum ada notifikasi"
              message="Pemberitahuan mengenai status tugas, lamaran, dan akun akan muncul di sini"
            />
          ) : null
        }
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              style={[
                styles.notificationCard,
                !item.isRead && styles.unreadCardBg,
              ]}
              onPress={() => handleMarkRead(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconTitleRow}>
                  <Ionicons
                    name="notifications-outline"
                    size={20}
                    color={!item.isRead ? COLORS.primaryDark : COLORS.slate500}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>

              <Text style={styles.cardDesc}>{item.description}</Text>

              <Text style={styles.cardTime}>{formatDate(item.createdAt)}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  topActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  unreadSummaryText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.slate600,
  },
  markAllBtnText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  listContent: {
    paddingBottom: 80,
  },
  notificationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  unreadCardBg: {
    backgroundColor: '#FFFDF0',
    borderColor: COLORS.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.coralRed,
  },
  cardDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.slate600,
    lineHeight: 18,
    marginBottom: 6,
    fontWeight: '400',
  },
  cardTime: {
    fontSize: 10,
    color: COLORS.slate400,
    fontWeight: '600',
  },
});
