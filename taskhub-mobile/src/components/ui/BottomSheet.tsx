import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
  PanResponder,
  ScrollView,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
const SHEET_TOP_OFFSET = 80; // How far from top the sheet can open

interface BottomSheetOption {
  label: string;
  value: string;
  icon?: string;
  description?: string;
}

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  snapPoints?: number; // 0-1 fraction, default 0.5
  children?: React.ReactNode;
  options?: BottomSheetOption[];
  selected?: string;
  onSelect?: (value: string) => void;
  style?: ViewStyle;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  title,
  snapPoints = 0.5,
  children,
  options,
  selected,
  onSelect,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetHeight = Math.min(WINDOW_HEIGHT - SHEET_TOP_OFFSET, WINDOW_HEIGHT * snapPoints);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(0);
      backdropOpacity.setValue(0);
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 80 || gesture.vy > 0.5) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            damping: 20,
            stiffness: 200,
          }).start();
        }
      },
    }),
  ).current;

  const handleClose = useCallback(() => {
    Animated.timing(translateY, {
      toValue: sheetHeight,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [sheetHeight, onClose]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.5],
          }) }]}
        >
          <TouchableOpacity style={{ flex: 1 }} onPress={handleClose} activeOpacity={1} />
        </Animated.View>

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              height: sheetHeight,
              paddingBottom: insets.bottom + 8,
              transform: [{ translateY }],
            },
            style,
          ]}
          {...panResponder.panHandlers}
        >
          {/* Drag Handle */}
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          {/* Title */}
          {title && (
            <View style={styles.titleRow}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Options or Custom Children */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {options
              ? options.map((opt) => {
                  const isSelected = opt.value === selected;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                      onPress={() => {
                        onSelect?.(opt.value);
                        handleClose();
                      }}
                      activeOpacity={0.7}
                    >
                      {opt.icon && (
                        <Ionicons
                          name={opt.icon as any}
                          size={20}
                          color={isSelected ? COLORS.primary : COLORS.textSecondary}
                          style={{ marginRight: 12 }}
                        />
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.optionLabel, isSelected && { fontWeight: '900', color: COLORS.textPrimary }]}>
                          {opt.label}
                        </Text>
                        {opt.description && (
                          <Text style={styles.optionDesc}>{opt.description}</Text>
                        )}
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })
              : children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.black,
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 16,
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    borderRadius: 14,
    marginBottom: 4,
  },
  optionRowSelected: {
    backgroundColor: COLORS.warmYellowLight,
  },
  optionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  optionDesc: {
    fontSize: 11,
    color: COLORS.slate400,
    marginTop: 2,
  },
});
