import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { SPACING } from '../../constants';

const SkeletonCard_C: React.FC = () => {
  const opacity = React.useRef(new Animated.Value(0.35)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.75,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <View style={styles.card}>
      <View style={styles.leftContent}>
        <View style={styles.badgeRow}>
          <Animated.View style={[styles.badge, { opacity }]} />
          <Animated.View style={[styles.badgeSmall, { opacity }]} />
        </View>
        <Animated.View style={[styles.titleLine, { opacity }]} />
        <Animated.View style={[styles.titleLineShort, { opacity }]} />
        <Animated.View style={[styles.pricePill, { opacity }]} />
      </View>
      <Animated.View style={[styles.thumbnail, { opacity }]} />
    </View>
  );
};

export const SkeletonCard = React.memo(SkeletonCard_C);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: 22,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
    marginRight: SPACING.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  badge: {
    height: 18,
    width: 60,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  badgeSmall: {
    height: 18,
    width: 50,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  titleLine: {
    height: 16,
    width: '90%',
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginBottom: 6,
  },
  titleLineShort: {
    height: 16,
    width: '60%',
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    marginBottom: 10,
  },
  pricePill: {
    height: 24,
    width: 100,
    backgroundColor: '#FFE185',
    borderRadius: 8,
    opacity: 0.6,
  },
  thumbnail: {
    width: 92,
    height: 92,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
  },
});
