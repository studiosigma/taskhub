import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationCoords | null>({
    latitude: -6.2088, // Default Jakarta coordinates
    longitude: 106.8456,
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Izin akses lokasi ditolak');
          setLoading(false);
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (err: any) {
        setErrorMsg(err?.message || 'Gagal mengambil posisi GPS');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, errorMsg, loading };
}
