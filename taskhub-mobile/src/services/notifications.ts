import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Configure how notifications are shown when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  /**
   * Register for push notifications.
   * Returns Expo Push Token string, or null if permission denied / unavailable.
   */
  async registerForPushNotifications(): Promise<string | null> {
    // Skip on web or simulators without push support
    if (Platform.OS === 'web') {
      console.log('[Push] Web platform — push notifications not supported');
      return null;
    }

    if (!Device.isDevice) {
      console.log('[Push] Running on simulator — using mock token');
      return 'expo-push-token-mock-12345';
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Push] Permission not granted');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      console.log('[Push] Expo push token:', token);
      return token;
    } catch (e) {
      console.warn('[Push] Error getting push token:', e);
      return null;
    }
  },

  /**
   * Show a local notification (falls back to Alert for web).
   */
  showLocalNotification(title: string, body: string) {
    if (Platform.OS === 'web') {
      console.log(`[Notification] ${title}: ${body}`);
    }

    Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null, // immediately
    }).catch(() => {
      // fallback: noop
    });
  },
};
