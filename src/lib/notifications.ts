import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { pushLog } from '@/src/lib/pushLog';
import { parseNotificationPayload } from '@/src/lib/notificationNavigation';
import type {
  DeviceRegistrationInfo,
  MobileDevicePlatform,
  NotificationPermissionStatus,
} from '@/src/types/notifications';

export { parseNotificationPayload } from '@/src/lib/notificationNavigation';

const ANDROID_DEFAULT_CHANNEL_ID = 'default';

let configured = false;

export function configureNotifications(): void {
  if (configured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    void Notifications.setNotificationChannelAsync(ANDROID_DEFAULT_CHANNEL_ID, {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#2563EB',
    });
  }

  configured = true;
}

export function isPhysicalDevice(): boolean {
  return Device.isDevice;
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const { status, ios } = await Notifications.getPermissionsAsync();

  pushLog('Permission status read', {
    status,
    isDevice: Device.isDevice,
    platform: Platform.OS,
  });

  if (status === Notifications.PermissionStatus.GRANTED) {
    return 'granted';
  }

  if (status === Notifications.PermissionStatus.DENIED) {
    return 'denied';
  }

  if (
    Platform.OS === 'ios' &&
    ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return 'granted';
  }

  return 'undetermined';
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  pushLog('Permission request start', {
    isDevice: Device.isDevice,
    platform: Platform.OS,
  });

  const current = await getNotificationPermissionStatus();

  if (current === 'granted') {
    pushLog('Permission granted (already)');
    return 'granted';
  }

  if (current === 'denied') {
    pushLog('Permission denied (already)');
    return 'denied';
  }

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: true,
      allowSound: true,
    },
  });

  pushLog('Permission request result', { status });

  if (status === Notifications.PermissionStatus.GRANTED) {
    pushLog('Permission granted');
    return 'granted';
  }

  if (status === Notifications.PermissionStatus.DENIED) {
    pushLog('Permission denied');
    return 'denied';
  }

  pushLog('Permission undetermined', { status });
  return 'undetermined';
}

function resolvePlatform(): MobileDevicePlatform {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  if (Platform.OS === 'web') return 'web';
  return 'unknown';
}

function resolveAppVersion(): string {
  return (
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    '1.0.0'
  );
}

function resolveProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId
  );
}

export async function getExpoPushToken(): Promise<string> {
  pushLog('Expo token generation start');

  const projectId = resolveProjectId();
  pushLog('Expo projectId resolved', {
    projectId: projectId ?? null,
    valid: Boolean(projectId && projectId !== 'YOUR_EAS_PROJECT_ID'),
  });

  if (!projectId || projectId === 'YOUR_EAS_PROJECT_ID') {
    throw new Error(
      'Expo project ID is missing or placeholder. Set a real extra.eas.projectId in app.json (EAS project UUID).',
    );
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResponse.data;
    pushLog('Expo token generated', {
      tokenPreview: `${token.slice(0, 30)}…`,
      platform: Platform.OS,
      length: token.length,
    });
    return token;
  } catch (err) {
    pushLog('Expo token generation failed', err);
    console.error('[DocAlert push] Expo token generation failed', err);
    throw err;
  }
}

export async function getDeviceRegistrationInfo(): Promise<DeviceRegistrationInfo> {
  const expoPushToken = await getExpoPushToken();

  const deviceName =
    Device.deviceName?.trim() ||
    Device.modelName?.trim() ||
    Constants.deviceName?.trim() ||
    'Unknown device';

  return {
    expoPushToken,
    deviceName,
    platform: resolvePlatform(),
    appVersion: resolveAppVersion(),
  };
}

export type NotificationListenerCleanup = {
  removeForegroundSubscription: () => void;
  removeResponseSubscription: () => void;
};

export function registerNotificationListeners(handlers: {
  onForegroundNotification?: (notification: Notifications.Notification) => void;
  onNotificationOpened?: (response: Notifications.NotificationResponse) => void;
}): NotificationListenerCleanup {
  const foregroundSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      handlers.onForegroundNotification?.(notification);
    },
  );

  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      pushLog('Notification response received (tap)', {
        identifier: response.notification.request.identifier,
      });
      handlers.onNotificationOpened?.(response);
    },
  );

  void Notifications.getLastNotificationResponseAsync()
    .then((response) => {
      if (response) {
        handlers.onNotificationOpened?.(response);
      }
    })
    .catch(() => {
      // Non-blocking — cold start without notification response
    });

  return {
    removeForegroundSubscription: () => foregroundSubscription.remove(),
    removeResponseSubscription: () => responseSubscription.remove(),
  };
}

export const PERMISSION_DENIED_MESSAGE =
  'Notifications are turned off. You can enable them in your device settings to receive document expiry alerts.';
