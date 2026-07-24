import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ViewStyle,
  ScrollViewProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColor } from '../../hooks/useThemeColor';
import { FONT_SIZES, SPACING } from '../../constants';

type HeaderAction = {
  icon: string;
  onPress: () => void;
  badge?: number;
};

interface ScreenLayoutProps {
  title?: string;
  children: React.ReactNode;
  scrollable?: boolean;
  scrollProps?: ScrollViewProps;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Pass a navigation.goBack function for the default back button */
  onBack?: () => void;
  leftAction?: 'back' | 'menu' | React.ReactNode;
  rightActions?: HeaderAction[];
  bottom?: React.ReactNode;
  headerColor?: string;
  contentStyle?: ViewStyle;
  stickyBottom?: React.ReactNode;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  title,
  children,
  scrollable = true,
  scrollProps,
  refreshing,
  onRefresh,
  onBack,
  leftAction = 'back',
  rightActions,
  headerColor,
  contentStyle,
  stickyBottom,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useThemeColor();
  const bg = headerColor || '#FFFFFF';

  const renderLeftAction = () => {
    if (!leftAction) return <View style={styles.headerPlaceholder} />;

    if (leftAction === 'back') {
      return (
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={onBack || (() => {})}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#0B0B0B" />
        </TouchableOpacity>
      );
    }

    if (leftAction === 'menu') {
      return (
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={24} color="#0B0B0B" />
        </TouchableOpacity>
      );
    }

    return leftAction;
  };

  const renderRightActions = () => {
    if (!rightActions?.length) return <View style={styles.headerPlaceholder} />;

    return (
      <View style={styles.headerRightGroup}>
        {rightActions.map((action, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.headerBtn}
            onPress={action.onPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name={action.icon as any} size={22} color="#0B0B0B" />
            {action.badge ? (
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>
                  {action.badge > 9 ? '9+' : action.badge}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const header = (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 8,
          backgroundColor: bg,
          borderBottomColor: '#F4F4F5',
        },
      ]}
    >
      <View style={styles.headerRow}>
        {renderLeftAction()}
        {title ? (
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {renderRightActions()}
      </View>
    </View>
  );

  const wrapperStyle: ViewStyle = {
    flex: 1,
    backgroundColor: '#F8F8FA',
    paddingBottom: insets.bottom,
  };

  if (scrollable) {
    return (
      <View style={wrapperStyle}>
        {header}
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: stickyBottom ? 120 : 40 + insets.bottom },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={!!refreshing}
                onRefresh={onRefresh}
                tintColor={theme.primary}
              />
            ) : undefined
          }
          {...scrollProps}
        >
          {children}
        </ScrollView>
        {stickyBottom && (
          <View style={[styles.stickyBottom, { paddingBottom: insets.bottom + 8 }]}>
            {stickyBottom}
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={wrapperStyle}>
      {header}
      <View style={[styles.nonScrollContent, contentStyle]}>{children}</View>
      {stickyBottom && (
        <View style={[styles.stickyBottom, { paddingBottom: insets.bottom + 8 }]}>
          {stickyBottom}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    minHeight: 52,
  },
  headerTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '900',
    color: '#0B0B0B',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headerPlaceholder: {
    width: 36,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#EB5757',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  nonScrollContent: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  stickyBottom: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#F4F4F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
});
