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
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../constants';
import { tasksApi, categoriesApi } from '../services';
import { Task, Category } from '../types';
import { TaskCard } from '../components/ui/TaskCard';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { ScalePress } from '../components/ui/ScalePress';
import { TaskMapView } from '../components/ui/TaskMapView';
import { useDebounce } from '../hooks/useDebounce';
import { useLocation } from '../hooks/useLocation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCategoryIconName } from '../utils/iconMapping';

type ExploreProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Explore'>,
  NativeStackScreenProps<RootStackParamList>
>;

type ViewMode = 'list' | 'map';

export const ExploreScreen: React.FC<ExploreProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { location } = useLocation();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTaskOnMap, setSelectedTaskOnMap] = useState<Task | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const params: any = {};
      if (selectedCategory) params.categoryId = selectedCategory;
      if (location) {
        params.lat = location.latitude;
        params.lng = location.longitude;
      }

      const data = await tasksApi.getAll(params);
      let list: Task[] = Array.isArray(data) ? data : [];
      if (debouncedSearch) {
        list = list.filter((t) =>
          t.title?.toLowerCase().includes(debouncedSearch.toLowerCase())
        );
      }
      setTasks(list);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, debouncedSearch, location]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    categoriesApi
      .getAll()
      .then((data: any) => setCategories(Array.isArray(data) ? data : []))
      .catch((e) => console.warn('fetch categories error', e));
  }, []);

  const ListHeader = useMemo(
    () => (
      <View>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari task, contoh: pindahan rumah..."
            placeholderTextColor={COLORS.slate400}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Kategori Pekerjaan</Text>
          {selectedCategory && (
            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
              <Text style={styles.resetFilterText}>Reset Filter</Text>
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
                <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                  <Ionicons
                    name={getCategoryIconName(c.name) as any}
                    size={22}
                    color={isSelected ? COLORS.textPrimary : COLORS.secondary}
                  />
                </View>
                <Text style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Task Counter Divider */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Daftar Task Terdekat ({tasks.length})</Text>
          <View style={styles.dividerLine} />
        </View>
      </View>
    ),
    [searchQuery, categories, selectedCategory, tasks.length]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with View Toggle */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Jelajahi Tugas</Text>
          <Text style={styles.headerSubtitle}>Temukan tugas terdekat di sekitarmu</Text>
        </View>

        {/* View Switcher: List vs Map */}
        <View style={styles.viewToggleContainer}>
          <ScalePress
            style={[styles.viewToggleBtn, viewMode === 'list' && styles.activeViewToggleBtn]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={16} color={viewMode === 'list' ? COLORS.textPrimary : COLORS.textSecondary} />
          </ScalePress>
          <ScalePress
            style={[styles.viewToggleBtn, viewMode === 'map' && styles.activeViewToggleBtn]}
            onPress={() => setViewMode('map')}
          >
            <Ionicons name="map" size={16} color={viewMode === 'map' ? COLORS.textPrimary : COLORS.textSecondary} />
          </ScalePress>
        </View>
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={loading ? [] : tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard task={item} onPress={(t) => navigation.navigate('TaskDetail', { taskId: t.id })} />
          )}
          ListHeaderComponent={
            loading ? (
              <View>
                {ListHeader}
                <SkeletonCard staggerDelay={0} />
                <SkeletonCard staggerDelay={100} />
              </View>
            ) : (
              ListHeader
            )
          }
          ListEmptyComponent={
            !loading ? (
              <EmptyState icon="search-outline" title="Task tidak ditemukan" message="Coba kata kunci lain atau reset filter" />
            ) : null
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchTasks();
              }}
              tintColor={COLORS.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <TaskMapView
            latitude={location?.latitude || -6.2088}
            longitude={location?.longitude || 106.8456}
            title="Lokasi Anda"
            address="Peta Tugas Terdekat"
          />

          {/* Selected Task Preview Card on Map */}
          {selectedTaskOnMap && (
            <View style={styles.mapPreviewCardContainer}>
              <TaskCard
                task={selectedTaskOnMap}
                onPress={(t) => navigation.navigate('TaskDetail', { taskId: t.id })}
              />
            </View>
          )}
        </View>
      )}
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
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '900', color: COLORS.textPrimary },
  headerSubtitle: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '500', marginTop: 2 },
  viewToggleContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.slate100,
    borderRadius: BORDER_RADIUS.md,
    padding: 3,
  },
  viewToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.sm,
  },
  activeViewToggleBtn: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },
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
    ...SHADOWS.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textPrimary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.base, fontWeight: '900', color: COLORS.textPrimary },
  resetFilterText: { fontSize: FONT_SIZES.xs, fontWeight: '800', color: COLORS.blue600 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  categoryCard: {
    width: '31%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryCardSelected: { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconCircleSelected: { backgroundColor: COLORS.secondary },
  categoryName: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center' },
  categoryNameSelected: { fontWeight: '900' },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.xs,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginHorizontal: SPACING.md,
    textAlign: 'center',
  },
  mapPreviewCardContainer: {
    position: 'absolute',
    bottom: 20,
    left: SPACING.lg,
    right: SPACING.lg,
  },
});
