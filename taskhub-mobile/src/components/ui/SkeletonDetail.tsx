import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING } from '../../constants';

export const SkeletonDetail: React.FC = () => {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Animated.View style={[styles.titleLine, { opacity }]} />
        <Animated.View style={[styles.titleLineShort, { opacity }]} />
        <View style={styles.row}>
          <Animated.View style={[styles.budgetBlock, { opacity }]} />
          <Animated.View style={[styles.durationBlock, { opacity }]} />
        </View>
      </View>

      {/* Description Section Skeleton */}
      <View style={styles.section}>
        <Animated.View style={[styles.sectionHeader, { opacity }]} />
        <Animated.View style={[styles.descLine, { opacity }]} />
        <Animated.View style={[styles.descLine, { opacity }]} />
        <Animated.View style={[styles.descLineShort, { opacity }]} />
      </View>

      {/* Info Grid Skeleton */}
      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <Animated.View style={[styles.labelLine, { opacity }]} />
          <Animated.View style={[styles.valueLine, { opacity }]} />
        </View>
        <View style={styles.gridItem}>
          <Animated.View style={[styles.labelLine, { opacity }]} />
          <Animated.View style={[styles.valueLine, { opacity }]} />
        </View>
        <View style={styles.gridItem}>
          <Animated.View style={[styles.labelLine, { opacity }]} />
          <Animated.View style={[styles.valueLine, { opacity }]} />
        </View>
        <View style={styles.gridItem}>
          <Animated.View style={[styles.labelLine, { opacity }]} />
          <Animated.View style={[styles.valueLine, { opacity }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  titleLine: {
    height: 24,
    width: '85%',
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  titleLineShort: {
    height: 24,
    width: '50%',
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginBottom: SPACING.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetBlock: {
    height: 28,
    width: 120,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginRight: SPACING.lg,
  },
  durationBlock: {
    height: 20,
    width: 80,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
  },
  section: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    height: 18,
    width: 100,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  descLine: {
    height: 14,
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  descLineShort: {
    height: 14,
    width: '65%',
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  gridItem: {
    width: '50%',
    marginBottom: SPACING.md,
  },
  labelLine: {
    height: 12,
    width: 70,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    marginBottom: 6,
  },
  valueLine: {
    height: 16,
    width: 110,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
  },
});
