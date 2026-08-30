import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

/** Shown in Settings when push cannot run (Expo Go, web, missing native support). */
export const PUSH_USER_UNAVAILABLE =
  'Push alerts are not available on this device. You can keep using the app as usual.';

export const PUSH_USER_SYNC_FAILED =
  'Could not enable push alerts right now. You can keep using the app as usual.';

export function isExpoGoRuntime(): boolean {
  try {
    return isRunningInExpoGo();
  } catch {
    return false;
  }
}

/** Native remote push is supported in EAS/dev/production builds, not Expo Go or web. */
export function isPushRuntimeSupported(): boolean {
  if (Platform.OS === 'web') {
    return false;
  }

  return !isExpoGoRuntime();
}

export function isTechnicalPushMessage(message: string): boolean {
  return /expo-notifications|expo go|dev-client|ExponentPushToken|ExpoPushToken|projectId|FCM|APNs|Firebase|EAS project/i.test(
    message,
  );
}
