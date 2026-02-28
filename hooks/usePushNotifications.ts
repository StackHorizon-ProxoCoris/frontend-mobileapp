// ============================================================
// Hook — Push Notifications
// Request permission, get ExpoPushToken, listen for notifications
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// Konfigurasi handler default: tampilkan notif saat app terbuka
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface PushNotificationState {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  error: string | null;
}

/**
 * Custom hook untuk push notifications
 * - Request permission
 * - Get ExpoPushToken
 * - Listen incoming & response notifications
 */
export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const [error, setError] = useState<string | null>(null);

  const notificationListener = useRef<{ remove: () => void }>(undefined);
  const responseListener = useRef<{ remove: () => void }>(undefined);

  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
    // Push notifications hanya bisa di perangkat fisik
    if (!Device.isDevice) {
      setError('Push notifications memerlukan perangkat fisik.');
      return null;
    }

    // Cek dan minta izin
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      setError('Izin notifikasi tidak diberikan.');
      return null;
    }

    // Setup notification channel untuk Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'SIAGA Notifikasi',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#082a4c',
        sound: 'default',
      });
    }

    // Ambil Expo Push Token
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: undefined, // Akan otomatis pakai projectId dari app.json
      });
      const token = tokenData.data;
      setExpoPushToken(token);
      setError(null);
      return token;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mendapatkan push token.';
      setError(message);
      return null;
    }
  }, []);

  useEffect(() => {
    // Listen untuk incoming notifications (saat app terbuka)
    notificationListener.current = Notifications.addNotificationReceivedListener((notif) => {
      setNotification(notif);
    });

    // Listen untuk user tap pada notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      // Bisa dipakai untuk navigasi ke halaman tertentu
      console.log('Notification tapped:', response.notification.request.content.data);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return {
    expoPushToken,
    notification,
    error,
    registerForPushNotifications,
  };
}
