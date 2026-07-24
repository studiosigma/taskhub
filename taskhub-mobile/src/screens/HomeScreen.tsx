import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { tasksApi, categoriesApi } from '../services';
import { Task, Category } from '../types';
import { TaskCard } from '../components/ui/TaskCard';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useAuth } from '../hooks/useAuth';
import { useThemeColor } from '../hooks/useThemeColor';
import { useDebounce } from '../hooks/useDebounce';
import type { MainTabParamList, RootStackParamList } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, activeRole, toggleRole } = useAuth();
  const theme = useThemeColor();
  const isHelper = activeRole === 'HELPER';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<'all' | 'nearby' | 'urgent' | 'high_budget'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const params: any = {};
      if (selectedCategory) params.categoryId = selectedCategory;
      if (searchQuery) params.search = debouncedSearch;

      const data = await tasksApi.getAll(params);
      let list: Task[] = Array.isArray(data) ? data : [];

      if (quickFilter === 'nearby') {
        list = list.filter((t) => (t?.id ? (t.id.charCodeAt(0) % 3) + 1 : 1) <= 2);
      } else if (quickFilter === 'urgent') {
        list = list.filter(
          (t) =>
            t?.duration?.toLowerCase().includes('jam') ||
            (t?.title && t.title.toLowerCase().includes('bantu')),
        );
      } else if (quickFilter === 'high_budget') {
        list = list.filter((t) => Number(t?.budget || 0) >= 200000);
      }

      setTasks(list);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery, quickFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    categoriesApi
      .getAll()
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch((e) => console.warn('fetch categories error', e));
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const categoriesWithAll = useMemo(
    () => [
      { id: 'all', name: 'Semua', iconName: 'grid-outline' },
      ...categories.map((c) => {
        const cName = c?.name ? c.name.toLowerCase() : '';
        return {
          ...c,
          iconName: cName.includes('rumah') || cName.includes('bersih')
            ? 'sparkles-outline'
            : cName.includes('pindah')
            ? 'car-outline'
            : cName.includes('food')
            ? 'fast-food-outline'
            : cName.includes('life')
            ? 'heart-outline'
            : cName.includes('event')
            ? 'calendar-outline'
            : 'laptop-outline',
        };
      }),
    ],
    [categories],
  );

  // -- ListHeaderComponent: everything above the task feed --
  const ListHeader = useMemo(
    () => (
      <View>
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>
            Halo, {user?.fullName?.split(' ')[0] || 'Muis'} 👋
          </Text>
          <Text style={styles.greetingSubtitle}>
            {isHelper
              ? 'Temukan pekerjaan terdekat & dapatkan penghasilan!'
              : 'Ada task yang ingin diselesaikan hari ini?'}
          </Text>
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
          <Ionicons name="search" size={18} color="#71717A" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={isHelper ? 'Cari job terdekat...' : 'Cari task, contoh: bersih rumah...'}
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
                  quickFilter === f.key && { backgroundColor: '#0B0B0B', borderColor: '#0B0B0B' },
                ]}
                onPress={() => setQuickFilter(f.key)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={f.icon}
                  size={14}
                  color={quickFilter === f.key ? theme.primary : '#71717A'}
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
                    color={isSelected ? theme.text : '#71717A'}
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
            <Text style={[styles.taskCountBadge, { color: theme.primary }]}>({tasks.length})</Text>
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
    <View style={styles.topHeaderBar}>
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
        data={loading ? [] : tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard task={item} onPress={(t) => navigation.navigate('TaskDetail', { taskId: t.id })} />
        )}
        ListHeaderComponent={loading ? (
          <View>
            {ListHeader}
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : ListHeader}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="🏝️"
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
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F8FA' },
  listContentContainer: { paddingBottom: 100 },

  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: 54,
    paddingBottom: SPACING.xs,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F4F4F5',
  },
  headerLeftGroup: { flexDirection: 'row', alignItems: 'center' },
  brandTitleWrap: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  brandIconBg: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  brandLogoText: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: COLORS.textPrimary, letterSpacing: -0.5 },
  iconBtn: { padding: 4 },
  roleSwitcherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleSwitcherText: { fontSize: 11, fontWeight: '800' },

  greetingSection: { paddingHorizontal: SPACING.lg, marginTop: SPACING.lg, marginBottom: SPACING.md },
  greetingTitle: { fontSize: FONT_SIZES['2xl'], fontWeight: '900', color: '#0B0B0B', letterSpacing: -0.5 },
  greetingSubtitle: { fontSize: FONT_SIZES.sm, color: '#71717A', fontWeight: '500', marginTop: 4 },

  heroBtnContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  postingTaskBtn: {
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  postingTaskBtnText: { fontSize: FONT_SIZES.base, fontWeight: '900' },
  postingTaskSubtext: { fontSize: 11, fontWeight: '600', opacity: 0.85 },

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: 14,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderWidth: 1,
    borderColor: '#F4F4F5',
  },
  searchInput: { flex: 1, fontSize: FONT_SIZES.sm, color: '#0B0B0B' },

  quickFilterWrapper: { marginBottom: SPACING.md },
  quickFilterContent: { paddingHorizontal: SPACING.lg, gap: 8 },
  quickFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F4F4F5',
  },
  quickFilterText: { fontSize: 11, fontWeight: '700', color: '#71717A' },

  categoriesWrapper: { marginBottom: SPACING.lg, height: 40 },
  categoriesContent: { paddingHorizontal: SPACING.lg, alignItems: 'center' },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F4F4F5',
  },
  categoryText: { fontSize: FONT_SIZES.xs, color: '#71717A', fontWeight: '600' },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: '#0B0B0B' },
  taskCountBadge: { fontSize: FONT_SIZES.xs, fontWeight: '800' },
  seeAllLink: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#71717A' },
});
