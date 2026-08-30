import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { colors } from '@/src/constants/theme';
import {
  isPushRuntimeSupported,
  PUSH_USER_UNAVAILABLE,
} from '@/src/lib/pushAvailability';
import { pushLog } from '@/src/lib/pushLog';
import type {
  DeviceRegistrationInfo,
  MobileDevicePlatform,
  NotificationPermissionStatus,
} from '@/src/types/notifications';

export { parseNotificationPayload } from '@/src/lib/notificationNavigation';

const ANDROID_DEFAULT_CHANNEL_ID = 'default';

type NotificationsModule = typeof import('expo-notifications');

let configured = false;
let notificationsModule: NotificationsModule | null | undefined;

function loadNotificationsModule(): NotificationsModule | null {
  if (!isPushRuntimeSupported()) {
    return null;
  }

  if (notificationsModule !== undefined) {
    return notificationsModule;
  }

  try {
    // Loaded only after auth gates, and never in Expo Go (avoids Expo Go error toasts).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    notificationsModule = require('expo-notifications') as NotificationsModule;
    return notificationsModule;
  } catch (error) {
    notificationsModule = null;
    pushLog('Native notifications module unavailable', error);
    return null;
  }
}

export function configureNotifications(): void {
  if (configured) {
    return;
  }

  const Notifications = loadNotificationsModule();
  if (!Notifications) {
    configured = true;
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
      lightColor: colors.accent,
    }).catch((error: unknown) => {
      pushLog('Notification channel setup skipped', error);
    });
  }

  configured = true;
}

export function isPhysicalDevice(): boolean {
  return Device.isDevice;
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  const Notifications = loadNotificationsModule();
  if (!Notifications) {
    return 'unavailable';
  }

  try {
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
  } catch (error) {
    pushLog('Permission status check failed', error);
    return 'unavailable';
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  const Notifications = loadNotificationsModule();
  if (!Notifications) {
    pushLog('Permission request skipped — push runtime unsupported');
    return 'unavailable';
  }

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

  if (current === 'unavailable') {
    return 'unavailable';
  }

  try {
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
  } catch (error) {
    pushLog('Permission request failed', error);
    return 'unavailable';
  }
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
  const Notifications = loadNotificationsModule();
  if (!Notifications) {
    throw new Error(PUSH_USER_UNAVAILABLE);
  }

  pushLog('Expo token generation start');

  const projectId = resolveProjectId();
  pushLog('Expo projectId resolved', {
    hasProjectId: Boolean(projectId && projectId !== 'YOUR_EAS_PROJECT_ID'),
  });

  if (!projectId || projectId === 'YOUR_EAS_PROJECT_ID') {
    throw new Error(PUSH_USER_UNAVAILABLE);
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenResponse.data;
    pushLog('Expo token generated', {
      platform: Platform.OS,
      length: token.length,
    });
    return token;
  } catch (err) {
    pushLog('Expo token generation failed', err);
    throw new Error(PUSH_USER_UNAVAILABLE);
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
  onForegroundNotification?: (notification: unknown) => void;
  onNotificationOpened?: (response: unknown) => void;
}): NotificationListenerCleanup {
  const noop = {
    removeForegroundSubscription: () => undefined,
    removeResponseSubscription: () => undefined,
  };

  const Notifications = loadNotificationsModule();
  if (!Notifications) {
    return noop;
  }

  try {
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
      .catch((error: unknown) => {
        pushLog('Last notification response unavailable', error);
      });

    return {
      removeForegroundSubscription: () => foregroundSubscription.remove(),
      removeResponseSubscription: () => responseSubscription.remove(),
    };
  } catch (error) {
    pushLog('Notification listeners setup skipped', error);
    return noop;
  }
}

export const PERMISSION_DENIED_MESSAGE =
  'Notifications are turned off. You can enable them in your device settings to receive document expiry alerts.';
