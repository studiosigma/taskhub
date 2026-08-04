import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';

interface TaskMapViewProps {
  latitude?: number;
  longitude?: number;
  title?: string;
  address?: string;
  helperLocation?: { latitude: number; longitude: number };
}

export const TaskMapView: React.FC<TaskMapViewProps> = ({
  latitude = -6.2088,
  longitude = 106.8456,
  title = 'Lokasi Task',
  address,
  helperLocation,
}) => {
  const initialRegion = {
    latitude,
    longitude,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📍 Lokasi Tugas</Text>
      {address ? <Text style={styles.addressText}>{address}</Text> : null}
      <View style={styles.mapWrapper}>
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={initialRegion}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            title={title}
            description={address}
          />
          {helperLocation && (
            <Marker
              coordinate={helperLocation}
              title="Helper"
              pinColor="blue"
            />
          )}
        </MapView>
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
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
