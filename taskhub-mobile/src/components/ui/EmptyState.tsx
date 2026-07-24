import React from 'react';
import { View, Text, StyleSheet, ImageSourcePropType } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = '📭', title, message }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING['2xl'],
    minHeight: 200,
  },
  icon: { fontSize: 48, marginBottom: SPACING.lg },
  title: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' },
  message: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, textAlign: 'center', marginTop: SPACING.sm },
});
