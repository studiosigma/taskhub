import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

interface TaskMapViewProps {
  latitude?: number;
  longitude?: number;
  title?: string;
  address?: string;
}

export const TaskMapView: React.FC<TaskMapViewProps> = ({
  latitude = -6.2088,
  longitude = 106.8456,
  title = 'Lokasi Task',
  address,
}) => {
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01}%2C${latitude - 0.01}%2C${longitude + 0.01}%2C${latitude + 0.01}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📍 Lokasi Tugas</Text>
      {address ? <Text style={styles.addressText}>{address}</Text> : null}
      <View style={styles.mapWrapper}>
        <iframe
          title={title}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={osmUrl}
          style={{ border: 0, borderRadius: 12 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  mapWrapper: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
});
