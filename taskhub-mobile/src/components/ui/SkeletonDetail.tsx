import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';

export const SkeletonDetail: React.FC = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const slideAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
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
        ]),
      ),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          transform: [{ translateY }],
        },
      ]}
    >
      {/* Hero Banner */}
      <View style={styles.bannerWrapper}>
        <Animated.View style={[styles.bannerImage, { opacity }]} />
      </View>

      <View style={styles.bodyContent}>
        {/* Badge */}
        <Animated.View style={[styles.badge, { opacity }]} />

        {/* Title */}
        <Animated.View style={[styles.titleLine, { opacity }]} />
        <Animated.View style={[styles.titleLineShort, { opacity }]} />

        {/* Price Pill */}
        <Animated.View style={[styles.pricePill, { opacity }]} />

        {/* Trust Shield */}
        <Animated.View style={[styles.trustShield, { opacity }]} />

        {/* Meta Rows */}
        <View style={styles.metaRow}>
          <Animated.View style={[styles.metaLine, { opacity }]} />
          <Animated.View style={[styles.metaLine, { opacity }]} />
        </View>

        {/* Description */}
        <Animated.View style={[styles.sectionHeader, { opacity }]} />
        <Animated.View style={[styles.descLine, { opacity }]} />
        <Animated.View style={[styles.descLine, { opacity }]} />
        <Animated.View style={[styles.descLineShort, { opacity }]} />

        {/* Gallery */}
        <Animated.View style={[styles.sectionHeader, { opacity }]} />
        <View style={styles.galleryRow}>
          <Animated.View style={[styles.galleryThumb, { opacity }]} />
          <Animated.View style={[styles.galleryThumb, { opacity }]} />
          <Animated.View style={[styles.galleryThumb, { opacity }]} />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  bannerWrapper: {
    paddingHorizontal: SPACING.lg,
    marginTop: 4,
  },
  bannerImage: {
    height: 190,
    borderRadius: BORDER_RADIUS['2xl'],
    backgroundColor: COLORS.slate200,
  },
  bodyContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  badge: {
    height: 22,
    width: 70,
    backgroundColor: COLORS.slate200,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  titleLine: {
    height: 24,
    width: '85%',
    backgroundColor: COLORS.slate200,
    borderRadius: 6,
    marginBottom: 6,
  },
  titleLineShort: {
    height: 20,
    width: '50%',
    backgroundColor: COLORS.slate200,
    borderRadius: 6,
    marginBottom: SPACING.md,
  },
  pricePill: {
    height: 28,
    width: 140,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  trustShield: {
    height: 60,
    width: '100%',
    backgroundColor: COLORS.slate200,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: SPACING.xl,
  },
  metaLine: {
    height: 16,
    width: 120,
    backgroundColor: COLORS.slate200,
    borderRadius: 4,
  },
  sectionHeader: {
    height: 18,
    width: 80,
    backgroundColor: COLORS.slate200,
    borderRadius: 4,
    marginBottom: SPACING.sm,
    marginTop: SPACING.xs,
  },
  descLine: {
    height: 14,
    width: '100%',
    backgroundColor: COLORS.slate200,
    borderRadius: 4,
    marginBottom: 6,
  },
  descLineShort: {
    height: 14,
    width: '65%',
    backgroundColor: COLORS.slate200,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  galleryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  galleryThumb: {
    width: 68,
    height: 68,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.slate200,
  },
});
