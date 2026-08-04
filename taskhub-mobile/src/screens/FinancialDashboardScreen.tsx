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
import type { RootStackParamList } from '../types';
import { COLORS, FONT_SIZES, SPACING, SHADOWS, BORDER_RADIUS } from '../constants';
import { ScreenLayout } from '../components/layout/ScreenLayout';
import { EmptyState } from '../components/ui/EmptyState';
import { ScalePress } from '../components/ui/ScalePress';
import { usersApi } from '../services';
import { useAuth } from '../hooks/useAuth';

type FilterType = 'ALL' | 'EARNING' | 'EXPENSE';

export const FinancialDashboardScreen: React.FC<
  NativeStackScreenProps<RootStackParamList, 'FinancialDashboard'>
> = ({ navigation }) => {
  const { activeRole } = useAuth();
  const isHelper = activeRole === 'HELPER';

  const [filter, setFilter] = useState<FilterType>('ALL');
  const [summary, setSummary] = useState<any>({
    totalEarnings: 0,
    totalSpent: 0,
    completedAsHelperCount: 0,
    completedAsOwnerCount: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFinancialSummary = useCallback(async () => {
    try {
      setLoading(true);
      const data = await usersApi.getFinancialSummary();
      if (data) {
        setSummary(data);
      }
    } catch (e) {
      console.log('fetchFinancialSummary error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchFinancialSummary();
    }, [fetchFinancialSummary])
  );

  const formatCurrency = (val: number) => {
    return `Rp ${Number(val || 0).toLocaleString('id-ID')}`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredTransactions = (summary.recentTransactions || []).filter((tx: any) => {
    if (filter === 'EARNING') return tx.type === 'EARNING';
    if (filter === 'EXPENSE') return tx.type === 'EXPENSE';
    return true;
  });

  return (
    <ScreenLayout title="Dashboard Keuangan" onBack={() => navigation.goBack()}>
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchFinancialSummary();
            }}
            tintColor={COLORS.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            {/* Hero Main Balance Card */}
            <View style={styles.heroCard}>
              <Text style={styles.heroCardLabel}>
                {isHelper ? 'Total Pendapatan (Helper)' : 'Total Pengeluaran (Owner)'}
              </Text>
              <Text style={styles.heroCardAmount}>
                {formatCurrency(isHelper ? summary.totalEarnings : summary.totalSpent)}
              </Text>

              <View style={styles.heroCardFooterRow}>
                <View style={styles.heroSubStat}>
                  <Text style={styles.subStatLabel}>Pengerjaan Selesai</Text>
                  <Text style={styles.subStatValue}>
                    {isHelper ? summary.completedAsHelperCount : summary.completedAsOwnerCount} Tugas
                  </Text>
                </View>

                <View style={styles.heroSubStatRight}>
                  <Text style={styles.subStatLabel}>
                    {isHelper ? 'Pengeluaran Owner' : 'Pendapatan Helper'}
                  </Text>
                  <Text style={styles.subStatValue}>
                    {formatCurrency(isHelper ? summary.totalSpent : summary.totalEarnings)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Ionicons name="wallet-outline" size={20} color={COLORS.mintGreen} style={{ marginBottom: 4 }} />
                <Text style={styles.statBoxTitle}>Pendapatan</Text>
                <Text style={[styles.statBoxValue, { color: COLORS.mintGreen }]}>
                  {formatCurrency(summary.totalEarnings)}
                </Text>
              </View>

              <View style={styles.statBox}>
                <Ionicons name="card-outline" size={20} color={COLORS.coralRed} style={{ marginBottom: 4 }} />
                <Text style={styles.statBoxTitle}>Pengeluaran</Text>
                <Text style={[styles.statBoxValue, { color: COLORS.coralRed }]}>
                  {formatCurrency(summary.totalSpent)}
                </Text>
              </View>
            </View>

            {/* Filter Tabs */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Riwayat Transaksi</Text>
            </View>

            <View style={styles.filterPillsRow}>
              {[
                { key: 'ALL', label: 'Semua' },
                { key: 'EARNING', label: 'Pendapatan' },
                { key: 'EXPENSE', label: 'Pengeluaran' },
              ].map((f) => {
                const active = filter === f.key;
                return (
                  <ScalePress key={f.key} onPress={() => setFilter(f.key as FilterType)}>
                    <View style={[styles.filterPill, active && styles.activeFilterPill]}>
                      <Text style={[styles.filterPillText, active && styles.activeFilterPillText]}>
                        {f.label}
                      </Text>
                    </View>
                  </ScalePress>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              icon="cash-outline"
              title="Belum ada transaksi"
              message="Transaksi pengerjaan tugas yang telah selesai akan tercatat di sini"
            />
          ) : null
        }
        renderItem={({ item }) => {
          const isEarning = item.type === 'EARNING';
          return (
            <View style={styles.txRowCard}>
              <View style={[styles.iconCircle, isEarning ? styles.earningIconBg : styles.expenseIconBg]}>
                <Ionicons
                  name={isEarning ? 'arrow-down' : 'arrow-up'}
                  size={18}
                  color={isEarning ? COLORS.mintGreen : COLORS.coralRed}
                />
              </View>

              <View style={styles.txInfo}>
                <Text style={styles.txTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.txSubtitle}>
                  {item.category} • {formatDate(item.date)}
                </Text>
              </View>

              <View style={styles.txRight}>
                <Text style={[styles.txAmount, isEarning ? styles.earningText : styles.expenseText]}>
                  {isEarning ? '+' : '-'} {formatCurrency(item.amount)}
                </Text>
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>SELESAI</Text>
                </View>
              </View>
            </View>
          );
        }}
      />
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 80,
  },
  headerWrapper: {
    marginBottom: SPACING.md,
  },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  heroCardLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
    opacity: 0.85,
    textTransform: 'uppercase',
  },
  heroCardAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginVertical: 8,
  },
  heroCardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(11, 11, 11, 0.1)',
  },
  heroSubStat: {},
  heroSubStatRight: {
    alignItems: 'flex-end',
  },
  subStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textPrimary,
    opacity: 0.8,
  },
  subStatValue: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  statBoxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  statBoxValue: {
    fontSize: 15,
    fontWeight: '900',
    marginTop: 2,
  },
  sectionHeaderRow: {
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: SPACING.sm,
  },
  filterPill: {
    paddingHorizontal: 14,
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
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  activeFilterPillText: {
    color: COLORS.white,
  },
  txRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  earningIconBg: {
    backgroundColor: '#DCFCE7',
  },
  expenseIconBg: {
    backgroundColor: '#FEE2E2',
  },
  txInfo: {
    flex: 1,
    marginRight: 8,
  },
  txTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  txSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
  },
  earningText: {
    color: COLORS.mintGreen,
  },
  expenseText: {
    color: COLORS.coralRed,
  },
  completedBadge: {
    backgroundColor: COLORS.slate100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    marginTop: 4,
  },
  completedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.slate600,
  },
});
