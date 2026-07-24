import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { MainTabParamList, RootStackParamList } from "../types";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { tasksApi, categoriesApi } from '../services';
import { Task, Category } from '../types';
import { TaskCard } from '../components/ui/TaskCard';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useDebounce } from '../hooks/useDebounce';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const getIconName = (name: string): string => {
  const cName = name?.toLowerCase() || '';
  if (cName.includes('rumah') || cName.includes('bersih')) return 'sparkles-outline';
  if (cName.includes('pindah')) return 'car-outline';
  if (cName.includes('food')) return 'fast-food-outline';
  if (cName.includes('life')) return 'heart-outline';
  if (cName.includes('event')) return 'calendar-outline';
  return 'laptop-outline';
};

type ExploreProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Explore'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const ExploreScreen: React.FC<ExploreProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const data = await tasksApi.getAll(selectedCategory ? { categoryId: selectedCategory } : {});
      let list: Task[] = Array.isArray(data) ? data : [];
      if (debouncedSearch) {
        list = list.filter((t) => t.title?.toLowerCase().includes(debouncedSearch.toLowerCase()));
      }
      setTasks(list);
    } catch (e) { console.log(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, [selectedCategory, debouncedSearch]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    categoriesApi.getAll()
      .then((data: any) => setCategories(Array.isArray(data) ? data : []))
      .catch((e) => console.warn('fetch categories error', e));
  }, []);

  const ListHeader = useMemo(() => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#71717A" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari task, contoh: bersih rumah..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#71717A" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Categories */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kategori Pekerjaan</Text>
        {selectedCategory && (
          <TouchableOpacity onPress={() => setSelectedCategory(null)}>
            <Text style={styles.resetFilterText}>Lihat Semua</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.categoryGrid}>
        {categories.map((c) => {
          const isSelected = selectedCategory === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
              onPress={() => setSelectedCategory(isSelected ? null : c.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, isSelected && { backgroundColor: COLORS.secondary }]}>
                <Ionicons name={getIconName(c.name) as any} size={22} color={isSelected ? COLORS.warmYellow : COLORS.secondary} />
              </View>
              <Text style={[styles.categoryName, isSelected && { fontWeight: '900', color: COLORS.textPrimary }]}>
                {c.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task List Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daftar Task</Text>
        <Text style={styles.taskCountBadge}>({tasks.length})</Text>
      </View>
    </View>
  ), [searchQuery, categories, selectedCategory, tasks.length]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jelajahi Task</Text>
        <TouchableOpacity style={styles.bellBtn} activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={22} color="#0B0B0B" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={loading ? [] : tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard task={item} onPress={(t) => navigation.navigate('TaskDetail', { taskId: t.id })} />
        )}
        ListHeaderComponent={loading ? (
          <View>
            {ListHeader}
            <SkeletonCard /><SkeletonCard />
          </View>
        ) : ListHeader}
        ListEmptyComponent={!loading ? (
          <EmptyState icon="🔍" title="Task tidak ditemukan" message="Coba keyword lain atau reset filter" />
        ) : null}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchTasks(); }} tintColor="#FFCA27" />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  listContent: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.textPrimary },
  bellBtn: { padding: 4 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textPrimary },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm, marginTop: SPACING.xs },
  sectionTitle: { fontSize: FONT_SIZES.base, fontWeight: '900', color: COLORS.textPrimary },
  taskCountBadge: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.textSecondary },
  resetFilterText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.blue600 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: SPACING.lg },
  categoryCard: {
    width: '31%', backgroundColor: COLORS.surface, borderRadius: 18, paddingVertical: SPACING.md,
    alignItems: 'center', marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
  },
  categoryCardSelected: { backgroundColor: COLORS.warmYellowLight, borderColor: COLORS.warmYellow },
  iconCircle: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.warmYellowLight,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  categoryName: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
});
