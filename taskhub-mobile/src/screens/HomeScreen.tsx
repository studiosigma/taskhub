import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZES, SPACING, SHADOWS } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { useThemeColor } from '../hooks/useThemeColor';
import { useDebounce } from '../hooks/useDebounce';
import { useTasks, useCategories } from '../hooks/useTasks';
import { Task, Category } from '../types';
import { TaskCard } from '../components/ui/TaskCard';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { getCategoryIconName } from '../utils/iconMapping';
import type { MainTabParamList, RootStackParamList } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, activeRole, toggleRole } = useAuth();
  const theme = useThemeColor();
  const insets = useSafeAreaInsets();
  const isHelper = activeRole === 'HELPER';

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<'all' | 'nearby' | 'urgent' | 'high_budget'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [refreshing, setRefreshing] = useState(false);

  const { data: tasksData, isLoading: tasksLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useTasks({
    categoryId: selectedCategory ?? undefined,
    search: debouncedSearch,
  });

  const { data: categories } = useCategories();

  const onRefresh = () => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  };

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage]);

  const tasks = tasksData?.pages.flatMap((page: any) => page.data ?? page) ?? [];
  const isLoading = tasksLoading;

  // Apply quick filters client-side
  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (quickFilter === 'high_budget') {
      result = [...result].sort((a, b) => Number(b.budget) - Number(a.budget));
    } else if (quickFilter === 'urgent') {
      // Sort by most recently created
      result = [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // 'nearby' would need geo-query support from backend — kept as visual label for now
    return result;
  }, [tasks, quickFilter]);

  const categoriesWithAll = useMemo(
    () => [
      { id: 'all', name: 'Semua', iconName: 'grid-outline' },
      ...(categories?.map((c: Category) => ({
        ...c,
        iconName: c?.name ? getCategoryIconName(c.name) : 'laptop-outline',
      })) ?? []),
    ],
    [categories],
  );

  // -- ListHeaderComponent: everything above the task feed --
  const ListHeader = useMemo(
    () => (
      <View>
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <View style={styles.greetingHeaderRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.greetingTitle}>
                Halo, {user?.fullName?.split(' ')[0] || 'Muis'} 👋
              </Text>
              <Text style={styles.greetingSubtitle}>
                {isHelper
                  ? 'Temukan pekerjaan terdekat & dapatkan penghasilan!'
                  : 'Ada task yang ingin diselesaikan hari ini?'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.notificationBellBtn}
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.8}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.textPrimary} />
              <View style={styles.notificationBellBadge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero CTA */}
        <View style={styles.heroBtnContainer}>
          <TouchableOpacity
            style={[styles.postingTaskBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate(isHelper ? 'Explore' : 'CreateTask')}
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
              <Ionicons
                name={isHelper ? 'flash' : 'add-circle'}
                size={20}
                color={theme.text}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.postingTaskBtnText, { color: theme.text }]}>
                {isHelper ? 'Cari Pekerjaan Terdekat' : 'Posting Task Baru'}
              </Text>
            </View>
            <Text style={[styles.postingTaskSubtext, { color: theme.text }]}>
              {isHelper
                ? 'Lamarkan diri Anda ke task aktif & raih income harian'
                : 'Dapatkan bantuan helper terpercaya dalam hitungan menit'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBarContainer}>
          <Ionicons name="search" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={isHelper ? 'Cari job terdekat...' : 'Cari task, contoh: bersih rumah...'}
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

        {/* Quick Filter Chips */}
        <View style={styles.quickFilterWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFilterContent}>
            {([
              { key: 'all', icon: 'sparkles', label: 'Semua Task' },
              { key: 'nearby', icon: 'location-outline', label: 'Terdekat' },
              { key: 'urgent', icon: 'flash-outline', label: 'Urgent' },
              { key: 'high_budget', icon: 'cash-outline', label: 'Budget Tinggi' },
            ] as const).map((f) => (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.quickFilterPill,
                  quickFilter === f.key && { backgroundColor: COLORS.secondary, borderColor: COLORS.secondary },
                ]}
                onPress={() => setQuickFilter(f.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={f.icon}
                  size={14}
                  color={quickFilter === f.key ? theme.primary : COLORS.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.quickFilterText,
                    quickFilter === f.key && { color: theme.primary, fontWeight: '900' },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category Pills */}
        <View style={styles.categoriesWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
            {categoriesWithAll.map((item: any) => {
              const isSelected =
                (item.id === 'all' && selectedCategory === null) || selectedCategory === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.categoryPill,
                    isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setSelectedCategory(item.id === 'all' ? null : item.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={item.iconName || 'grid-outline'}
                    size={16}
                    color={isSelected ? theme.text : COLORS.textSecondary}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && { color: theme.text, fontWeight: '900' },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleWrap}>
            <Text style={styles.sectionTitle}>
              {isHelper ? 'Pekerjaan Tersedia' : 'Task Terbaru'}
            </Text>
            <Text style={[styles.taskCountBadge, { color: theme.primary }]}>({filteredTasks.length})</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setSelectedCategory(null);
              setQuickFilter('all');
              setSearchQuery('');
            }}
          >
            <Text style={styles.seeAllLink}>Reset filter</Text>
          </TouchableOpacity>
        </View>
      </View>
    ),
    [
      user,
      isHelper,
      theme,
      navigation,
      searchQuery,
      quickFilter,
      categoriesWithAll,
      selectedCategory,
      tasks.length,
    ],
  );

  // -- Top header (outside FlatList) --
  const renderHeader = () => (
    <View style={[styles.topHeaderBar, { paddingTop: insets.top + 8 }]}>
      <View style={styles.headerLeftGroup}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="menu" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.brandTitleWrap}>
          <View style={[styles.brandIconBg, { backgroundColor: theme.primary }]}>
            <Ionicons name="briefcase" size={16} color={theme.text} />
          </View>
          <Text style={styles.brandLogoText}>TaskHub</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.roleSwitcherPill, { backgroundColor: theme.primary }]}
        onPress={toggleRole}
        activeOpacity={0.85}
      >
        <Ionicons
          name={isHelper ? 'construct-outline' : 'person-circle-outline'}
          size={14}
          color={theme.text}
          style={{ marginRight: 4 }}
        />
        <Text style={[styles.roleSwitcherText, { color: theme.text }]}>
          {isHelper ? 'Helper' : 'Owner'}
        </Text>
        <Ionicons name="swap-horizontal" size={14} color={theme.text} style={{ marginLeft: 4 }} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      <FlatList
        data={isLoading ? [] : filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard task={item} onPress={(t) => navigation.navigate('TaskDetail', { taskId: t.id })} />
        )}
        ListHeaderComponent={isLoading ? (
          <View>
            {ListHeader}
            <SkeletonCard staggerDelay={0} />
            <SkeletonCard staggerDelay={100} />
            <SkeletonCard staggerDelay={200} />
          </View>
        ) : ListHeader}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="sunny-outline"
              title="Belum Ada Task"
              message={
                searchQuery
                  ? `Tidak ada task dengan kata kunci "${searchQuery}"`
                  : isHelper
                  ? 'Belum ada pekerjaan di sekitar Anda. Coba reset filter.'
                  : 'Klik "Posting Task Baru" di atas untuk membuat task pertama!'
              }
            />
          ) : null
        }
        contentContainerStyle={styles.listContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={theme.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  listContentContainer: { paddingBottom: 100 },

  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.sm,
  },
  headerLeftGroup: { flexDirection: 'row', alignItems: 'center' },
  brandTitleWrap: { flexDirection: 'row', alignItems: 'center', marginLeft: 10 },
  brandIconBg: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  brandLogoText: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  iconBtn: { padding: 4 },
  roleSwitcherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    ...SHADOWS.sm,
  },
  roleSwitcherText: { fontSize: 11, fontWeight: '800' },

  greetingSection: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg, marginBottom: SPACING.md },
  greetingHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notificationBellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  notificationBellBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.coralRed,
  },
  greetingTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  greetingSubtitle: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, fontWeight: '500', marginTop: 4 },

  heroBtnContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  postingTaskBtn: {
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  postingTaskBtnText: { fontSize: FONT_SIZES.base, fontWeight: '900' },
  postingTaskSubtext: { fontSize: 11, fontWeight: '600', opacity: 0.85 },

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm, color: COLORS.textPrimary },

  quickFilterWrapper: { marginBottom: SPACING.md },
  quickFilterContent: { paddingHorizontal: SPACING.lg, gap: 8 },
  quickFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickFilterText: { fontSize: 11, fontWeight: '700', color: COLORS.textSecondary },

  categoriesWrapper: { marginBottom: SPACING.lg, height: 40 },
  categoriesContent: { paddingHorizontal: SPACING.lg, alignItems: 'center' },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryText: { fontSize: FONT_SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: COLORS.textPrimary },
  taskCountBadge: { fontSize: FONT_SIZES.xs, fontWeight: '800' },
  seeAllLink: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: COLORS.textSecondary },
});
