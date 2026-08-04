import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, SHADOWS, BORDER_RADIUS } from '../../constants';

interface SkeletonCardProps {
  /** Stagger delay in ms — pass index * 100 for cascading effect */
  staggerDelay?: number;
}

const SkeletonCard_C: React.FC<SkeletonCardProps> = ({ staggerDelay = 0 }) => {
  const pulseAnim = useRef(new Animated.Value(0.35)).current;
  const slideAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Pulse loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.75,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.35,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      // Slide in once
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, staggerDelay);

    return () => clearTimeout(timer);
  }, []);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.leftContent}>
        <View style={styles.badgeRow}>
          <Animated.View style={[styles.badge, { opacity: pulseAnim }]} />
          <Animated.View style={[styles.badgeSmall, { opacity: pulseAnim }]} />
        </View>
        <Animated.View style={[styles.titleLine, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.titleLineShort, { opacity: pulseAnim }]} />
        <Animated.View style={[styles.pricePill, { opacity: pulseAnim }]} />
      </View>
      <Animated.View style={[styles.thumbnail, { opacity: pulseAnim }]} />
    </Animated.View>
  );
};

export const SkeletonCard = React.memo(SkeletonCard_C);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS['2xl'],
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.slate100,
    ...SHADOWS.md,
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
    backgroundColor: COLORS.slate200,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeSmall: {
    height: 18,
    width: 50,
    backgroundColor: COLORS.slate200,
    borderRadius: BORDER_RADIUS.sm,
  },
  titleLine: {
    height: 16,
    width: '90%',
    backgroundColor: COLORS.slate200,
    borderRadius: 6,
    marginBottom: 6,
  },
  titleLineShort: {
    height: 16,
    width: '60%',
    backgroundColor: COLORS.slate200,
    borderRadius: 6,
    marginBottom: 10,
  },
  pricePill: {
    height: 24,
    width: 100,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.sm,
  },
  thumbnail: {
    width: 92,
    height: 92,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: COLORS.slate200,
  },
});
