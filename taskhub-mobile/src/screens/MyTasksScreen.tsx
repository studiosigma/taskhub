import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types";
import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { TaskCard } from '../components/ui/TaskCard';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { tasksApi } from '../services';
import { useThemeColor } from '../hooks/useThemeColor';
import { ScreenLayout } from '../components/layout/ScreenLayout';

type TabKey = 'owned' | 'applications' | 'completed';

export const MyTasksScreen: React.FC<NativeStackScreenProps<RootStackParamList, "MyTasks">> = ({ navigation }) => {
  const theme = useThemeColor();
  const [activeTab, setActiveTab] = useState<TabKey>('owned');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [activeTab]);

  useFocusEffect(useCallback(() => { fetchTasks(); }, [fetchTasks]));

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'owned', label: 'Task Saya' },
    { key: 'applications', label: 'Lamaran' },
    { key: 'completed', label: 'Selesai' },
  ];

  const emptyStates: Record<TabKey, { icon: string; title: string; message: string }> = {
    owned: { icon: '📋', title: 'Belum ada task', message: 'Cari task terdekat di halaman Beranda' },
    applications: { icon: '📝', title: 'Belum ada lamaran', message: 'Lamar task yang menarik di halaman Beranda' },
    completed: { icon: '✅', title: 'Belum ada task selesai', message: 'Task yang diselesaikan akan muncul di sini' },
  };

  return (
    <ScreenLayout title="Task Saya" onBack={() => navigation.goBack()}>
      {/* Tab Bar */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, active && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, active && { color: '#0B0B0B', fontWeight: '900' }]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <TaskCard task={item} onPress={(t) => navigation.navigate('TaskDetail', { taskId: t.id })} />
            <View style={{ paddingLeft: 4, marginTop: -6, marginBottom: 6 }}>
              <Badge status={item.status} size="sm" />
            </View>
          </View>
        )}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); fetchTasks(); }}
        ListEmptyComponent={<EmptyState {...emptyStates[activeTab]} />}
        showsVerticalScrollIndicator={false}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: SPACING.md, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabText: { fontSize: 13, color: '#71717A', fontWeight: '600' },
  list: { paddingBottom: 80 },
});
