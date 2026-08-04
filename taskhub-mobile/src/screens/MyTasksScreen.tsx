import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../constants';
import { TaskCard } from '../components/ui/TaskCard';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ScalePress } from '../components/ui/ScalePress';
import { tasksApi } from '../services';
import { ScreenLayout } from '../components/layout/ScreenLayout';

type TabKey = 'owned' | 'applications' | 'completed';

export const MyTasksScreen: React.FC<NativeStackScreenProps<RootStackParamList, "MyTasks">> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<TabKey>('owned');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      let list: any[] = [];
      if (activeTab === 'owned') list = await tasksApi.getMyTasks();
      else if (activeTab === 'applications') list = await tasksApi.getMyApplications();
      else {
        list = await tasksApi.getAll({ status: 'COMPLETED' });
        list = list.filter((t: any) => t.status === 'COMPLETED');
      }
      setTasks(Array.isArray(list) ? list : []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab]);

  useFocusEffect(useCallback(() => { fetchTasks(); }, [fetchTasks]));

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'owned', label: 'Tugas Saya', icon: 'clipboard' },
    { key: 'applications', label: 'Lamaran Saya', icon: 'paper-plane' },
    { key: 'completed', label: 'Selesai', icon: 'checkmark-circle' },
  ];

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter === 'ALL') return true;
    return task.status === statusFilter;
  });

  const emptyStates: Record<TabKey, { icon: string; title: string; message: string }> = {
    owned: { icon: 'clipboard-outline', title: 'Belum ada tugas yang dibuat', message: 'Tekan tombol + di bawah untuk membuat tugas pertama Anda' },
    applications: { icon: 'document-text-outline', title: 'Belum ada lamaran', message: 'Eksplorasi tugas terdekat dan lamar pengerjaannya' },
    completed: { icon: 'checkmark-circle-outline', title: 'Belum ada tugas selesai', message: 'Tugas yang diselesaikan akan muncul di sini' },
  };

  return (
    <ScreenLayout title="Manajemen Tugas" onBack={() => navigation.goBack()}>
      {/* Animated Segmented Tab Switcher */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <ScalePress
              key={tab.key}
              style={[styles.tabButton, active && styles.activeTabButton]}
              onPress={() => {
                setActiveTab(tab.key);
                setStatusFilter('ALL');
              }}
            >
              <Ionicons
                name={(active ? tab.icon : `${tab.icon}-outline`) as any}
                size={16}
                color={active ? COLORS.textPrimary : COLORS.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabText, active && styles.activeTabText]}>{tab.label}</Text>
            </ScalePress>
          );
        })}
      </View>

      {/* Filter Status Pills */}
      <View style={styles.filterPillRow}>
        {['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED'].map((st) => {
          const active = statusFilter === st;
          const labelMap: Record<string, string> = {
            ALL: 'Semua Status',
            OPEN: 'Terbuka',
            IN_PROGRESS: 'Sedang Jalan',
            COMPLETED: 'Selesai',
          };
          return (
            <TouchableOpacity
              key={st}
              style={[styles.filterPill, active && styles.activeFilterPill]}
              onPress={() => setStatusFilter(st)}
            >
              <Text style={[styles.filterPillText, active && styles.activeFilterPillText]}>
                {labelMap[st]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <TaskCard task={item} onPress={(t) => navigation.navigate('TaskDetail', { taskId: t.id })} />
            <View style={styles.badgeFooter}>
              <Badge status={item.status} size="sm" />
              <Text style={styles.createdDateText}>
                {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); fetchTasks(); }}
        ListEmptyComponent={<EmptyState {...emptyStates[activeTab]} />}
        showsVerticalScrollIndicator={false}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.slate100,
    borderRadius: BORDER_RADIUS.xl,
    padding: 4,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.lg,
  },
  activeTabButton: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  tabText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  activeTabText: {
    color: COLORS.textPrimary,
    fontWeight: '900',
  },
  filterPillRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.md,
    paddingHorizontal: 2,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeFilterPill: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeFilterPillText: {
    color: COLORS.white,
  },
  cardContainer: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  badgeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
    marginTop: -4,
  },
  createdDateText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 90,
  },
});
