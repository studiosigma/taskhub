import { useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { useChatSocket } from './useChatSocket';

interface LocationUpdate {
  latitude: number;
  longitude: number;
}

export const useLocationTracking = (
  conversationId: string,
  userId: string,
  isActive: boolean = false
) => {
  const { emitLocation } = useChatSocket({ conversationId, userId });
  const locationWatcher = useRef<Location.LocationSubscription | null>(null);

  const startTracking = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    locationWatcher.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // 5 detik
        distanceInterval: 10, // 10 meter
      },
      (location) => {
        emitLocation({
          conversationId,
          userId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    );
  }, [conversationId, userId, emitLocation]);

  const stopTracking = useCallback(async () => {
    if (locationWatcher.current) {
      await locationWatcher.current.remove();
      locationWatcher.current = null;
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      startTracking();
    } else {
      stopTracking();
    }
    return () => { stopTracking(); };
  }, [isActive, startTracking, stopTracking]);

  return { stopTracking };
};
