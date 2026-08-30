import {
  getDeviceRegistrationInfo,
  getExpoPushToken,
  requestNotificationPermission,
} from '@/src/lib/notifications';
import { pushLog } from '@/src/lib/pushLog';
import {
  isValidExpoPushToken,
  logRegistrationContext,
} from '@/src/lib/pushValidation';
import {
  syncMobileDevice,
  testInsertMobileDevice,
} from '@/src/services/mobileDevices';
import type { NotificationPermissionStatus } from '@/src/types/notifications';

export type PushRegistrationInput = {
  companyId: string;
  userId: string;
};

export type PushRegistrationTestResult = {
  success: boolean;
  message: string;
  permissionStatus?: NotificationPermissionStatus;
  tokenPreview?: string;
  tokenValid?: boolean;
  syncAction?: 'insert' | 'update';
  rowId?: string;
  devicePlatform?: string;
  deviceName?: string;
  insertPayload?: Record<string, unknown>;
  supabaseResponse?: unknown;
  error?: string;
};

export async function runPushRegistrationTest(
  input: PushRegistrationInput,
  options?: { useDirectInsertOnly?: boolean },
): Promise<PushRegistrationTestResult> {
  const context = logRegistrationContext(input.userId, input.companyId);
  if (!context.ok || !context.userId || !context.companyId) {
    return {
      success: false,
      message: 'Invalid user_id or company_id — check Auth profile.',
    };
  }

  try {
    pushLog('Permission request start');
    const permissionStatus = await requestNotificationPermission();

    if (permissionStatus === 'granted') {
      pushLog('Permission granted');
    } else if (permissionStatus === 'denied') {
      pushLog('Permission denied');
      return {
        success: false,
        message: 'Notification permission denied.',
        permissionStatus,
      };
    } else {
      pushLog('Permission not granted', { permissionStatus });
      return {
        success: false,
        message: `Permission status: ${permissionStatus}. Grant notifications and retry.`,
        permissionStatus,
      };
    }

    pushLog('Expo token generation start');
    const device = await getDeviceRegistrationInfo();
    const tokenValid = isValidExpoPushToken(device.expoPushToken);

    pushLog('Expo token generated', {
      tokenPreview: `${device.expoPushToken.slice(0, 30)}…`,
      tokenValid,
      platform: device.platform,
      device_name: device.deviceName,
    });

    if (!tokenValid) {
      return {
        success: false,
        message: 'Expo push token format looks invalid.',
        permissionStatus,
        tokenPreview: device.expoPushToken,
        tokenValid: false,
      };
    }

    const payload = {
      company_id: context.companyId,
      user_id: context.userId,
      expo_push_token: device.expoPushToken,
      device_name: device.deviceName,
      platform: device.platform,
      app_version: device.appVersion,
      is_active: true,
    };

    pushLog('Insert payload', payload);

    if (options?.useDirectInsertOnly) {
      const raw = await testInsertMobileDevice({
        companyId: context.companyId,
        userId: context.userId,
        device,
      });

      return {
        success: !raw.error,
        message: raw.error ? raw.error.message : 'Direct insert succeeded.',
        permissionStatus,
        tokenPreview: device.expoPushToken,
        tokenValid: true,
        insertPayload: payload,
        supabaseResponse: raw,
        error: raw.error?.message,
      };
    }

    const syncResult = await syncMobileDevice({
      companyId: context.companyId,
      userId: context.userId,
      device,
    });

    return {
      success: true,
      message: `Synced via ${syncResult.action}. Row id: ${syncResult.rowId ?? 'unknown'}`,
      permissionStatus,
      tokenPreview: device.expoPushToken,
      tokenValid: true,
      syncAction: syncResult.action,
      rowId: syncResult.rowId,
      devicePlatform: device.platform,
      deviceName: device.deviceName,
      insertPayload: payload,
    };
  } catch (err) {
    pushLog('Registration test failed', err);
    return {
      success: false,
      message: 'Could not enable push alerts right now. You can keep using the app as usual.',
    };
  }
}

/** Regenerate token only (for debugging). */
export async function regenerateExpoPushTokenForTest(): Promise<string> {
  pushLog('Expo token generation start (regenerate only)');
  const token = await getExpoPushToken();
  pushLog('Expo token generated', {
    tokenPreview: `${token.slice(0, 30)}…`,
    valid: isValidExpoPushToken(token),
  });
  return token;
}
