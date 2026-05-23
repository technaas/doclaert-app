import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type * as Notifications from 'expo-notifications';

import { useAuth } from '@/src/context/AuthContext';
import {
  configureNotifications,
  getDeviceRegistrationInfo,
  getNotificationPermissionStatus,
  parseNotificationPayload,
  PERMISSION_DENIED_MESSAGE,
  registerNotificationListeners,
  requestNotificationPermission,
} from '@/src/lib/notifications';
import { pushLog } from '@/src/lib/pushLog';
import {
  runPushRegistrationTest,
  type PushRegistrationTestResult,
} from '@/src/lib/pushRegistration';
import {
  isValidExpoPushToken,
  logRegistrationContext,
} from '@/src/lib/pushValidation';
import {
  flushPendingNotificationNavigation,
  navigateFromNotification,
} from '@/src/navigation/navigationRef';
import { startupLog } from '@/src/lib/startup';
import {
  deactivateMobileDevice,
  syncMobileDevice,
} from '@/src/services/mobileDevices';
import type {
  NotificationPermissionStatus,
  TokenSyncStatus,
} from '@/src/types/notifications';

type NotificationContextValue = {
  permissionStatus: NotificationPermissionStatus;
  pushEnabled: boolean;
  syncStatus: TokenSyncStatus;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  permissionMessage: string | null;
  devicePlatform: string | null;
  deviceName: string | null;
  appVersion: string | null;
  expoPushToken: string | null;
  isRegistering: boolean;
  lastForegroundReceivedAt: string | null;
  recheckPermission: () => Promise<void>;
  retryTokenSync: () => Promise<void>;
  testPushRegistration: () => Promise<PushRegistrationTestResult>;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { session, user, profile } = useAuth();

  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>('undetermined');
  const [syncStatus, setSyncStatus] = useState<TokenSyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);
  const [devicePlatform, setDevicePlatform] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState<string | null>(null);
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [lastForegroundReceivedAt, setLastForegroundReceivedAt] = useState<string | null>(
    null,
  );

  const registrationInFlight = useRef(false);
  const activeUserIdRef = useRef<string | null>(null);

  const handleNotificationOpened = useCallback(
    (response: Notifications.NotificationResponse) => {
      const payload = parseNotificationPayload(
        response.notification.request.content.data as Record<string, unknown>,
      );
      navigateFromNotification(payload, {
        notificationId: response.notification.request.identifier,
      });
    },
    [],
  );

  useEffect(() => {
    if (!session) {
      return;
    }
    flushPendingNotificationNavigation();
  }, [session]);

  useEffect(() => {
    startupLog('Notification listeners setup started');

    try {
      configureNotifications();
      const cleanup = registerNotificationListeners({
        onForegroundNotification: () => {
          setLastForegroundReceivedAt(new Date().toISOString());
        },
        onNotificationOpened: handleNotificationOpened,
      });

      startupLog('Notification listeners ready');

      return () => {
        cleanup.removeForegroundSubscription();
        cleanup.removeResponseSubscription();
      };
    } catch (error) {
      startupLog('Notification listeners setup failed (non-blocking)', error);
      pushLog('Notification listeners setup failed', error);
      return undefined;
    }
  }, [handleNotificationOpened]);

  const refreshPermissionStatus = useCallback(async () => {
    try {
      const status = await getNotificationPermissionStatus();
      setPermissionStatus(status);

      if (status === 'denied') {
        setPermissionMessage(PERMISSION_DENIED_MESSAGE);
        setExpoPushToken(null);
      } else if (status === 'unavailable') {
        setPermissionMessage('Push notifications are not available on this device.');
        setExpoPushToken(null);
      } else {
        setPermissionMessage(null);
      }

      return status;
    } catch (error) {
      pushLog('Permission status check failed', error);
      console.error('[DocAlert push] Permission status check failed', error);
      setPermissionStatus('unavailable');
      setPermissionMessage('Unable to check notification permission.');
      return 'unavailable' as NotificationPermissionStatus;
    }
  }, []);

  const registerDevice = useCallback(async () => {
    pushLog('registerDevice called', {
      hasUser: Boolean(user?.id),
      hasCompany: Boolean(profile?.company_id),
      inFlight: registrationInFlight.current,
    });

    if (!user?.id || !profile?.company_id) {
      pushLog('registerDevice skipped — missing user or company_id', {
        user_id: user?.id ?? null,
        company_id: profile?.company_id ?? null,
      });
      return;
    }

    if (registrationInFlight.current) {
      pushLog('registerDevice skipped — already in flight');
      return;
    }

    const context = logRegistrationContext(user.id, profile.company_id);
    if (!context.ok) {
      const msg = 'Invalid user_id or company_id on profile.';
      setSyncStatus('error');
      setLastSyncError(msg);
      pushLog('registerDevice aborted', { message: msg });
      return;
    }

    registrationInFlight.current = true;
    setIsRegistering(true);
    setLastSyncError(null);

    try {
      pushLog('Registration started after login');
      startupLog('Device registration started');

      const status = await requestNotificationPermission();
      setPermissionStatus(status);

      if (status === 'denied') {
        pushLog('Registration stopped — permission denied');
        setPermissionMessage(PERMISSION_DENIED_MESSAGE);
        setExpoPushToken(null);
        setSyncStatus('error');
        setLastSyncError('Notification permission denied.');
        return;
      }

      if (status !== 'granted') {
        const msg = `Notification permission not granted (status: ${status}).`;
        pushLog('Registration stopped — permission not granted', { status });
        setSyncStatus('error');
        setLastSyncError(msg);
        setPermissionMessage(msg);
        return;
      }

      setPermissionMessage(null);
      setSyncStatus('syncing');

      const device = await getDeviceRegistrationInfo();

      if (!isValidExpoPushToken(device.expoPushToken)) {
        throw new Error('Generated Expo push token failed validation.');
      }

      pushLog('Token ready for Supabase sync', {
        platform: device.platform,
        device_name: device.deviceName,
        tokenValid: true,
      });

      setExpoPushToken(device.expoPushToken);
      setDevicePlatform(device.platform);
      setDeviceName(device.deviceName);
      setAppVersion(device.appVersion);

      const syncResult = await syncMobileDevice({
        companyId: profile.company_id,
        userId: user.id,
        device,
      });

      pushLog('Sync completed', syncResult);

      setSyncStatus('success');
      setLastSyncedAt(new Date().toISOString());
      activeUserIdRef.current = user.id;
      pushLog('Registration complete — mobile_devices synced');
      startupLog('Device registration complete');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to register device for push.';
      pushLog('Registration failed', { message, err });
      console.error('[DocAlert push] Registration failed', err);
      startupLog('Device registration failed (non-blocking)', err);
      setSyncStatus('error');
      setLastSyncError(message);
    } finally {
      registrationInFlight.current = false;
      setIsRegistering(false);
    }
  }, [profile?.company_id, user?.id]);

  const testPushRegistration = useCallback(async (): Promise<PushRegistrationTestResult> => {
    registrationInFlight.current = false;
    pushLog('=== TEST PUSH REGISTRATION (manual) ===');

    if (!user?.id || !profile?.company_id) {
      const result: PushRegistrationTestResult = {
        success: false,
        message: 'Not logged in or profile missing company_id.',
      };
      pushLog('Test aborted', result);
      return result;
    }

    setIsRegistering(true);
    setLastSyncError(null);

    try {
      const result = await runPushRegistrationTest({
        companyId: profile.company_id,
        userId: user.id,
      });

      if (result.success && result.tokenPreview) {
        setExpoPushToken(result.tokenPreview);
        setDevicePlatform(result.devicePlatform ?? null);
        setDeviceName(result.deviceName ?? null);
        setSyncStatus('success');
        setLastSyncedAt(new Date().toISOString());
        setPermissionStatus(result.permissionStatus ?? 'granted');
      } else {
        setSyncStatus('error');
        setLastSyncError(result.message);
      }

      pushLog('=== TEST PUSH REGISTRATION RESULT ===', result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const result: PushRegistrationTestResult = {
        success: false,
        message,
        error: message,
      };
      pushLog('=== TEST PUSH REGISTRATION FAILED ===', result);
      console.error('[DocAlert push] Test registration failed', err);
      setSyncStatus('error');
      setLastSyncError(message);
      return result;
    } finally {
      setIsRegistering(false);
      registrationInFlight.current = false;
    }
  }, [profile?.company_id, user?.id]);

  const recheckPermission = useCallback(async () => {
    const status = await refreshPermissionStatus();

    if (status === 'granted' && user?.id && profile?.company_id) {
      await registerDevice();
    }
  }, [profile?.company_id, refreshPermissionStatus, registerDevice, user?.id]);

  const retryTokenSync = useCallback(async () => {
    registrationInFlight.current = false;
    await registerDevice();
  }, [registerDevice]);

  useEffect(() => {
    if (!session?.user?.id || !profile?.company_id) {
      pushLog('Auto-register skipped — no session or company_id yet', {
        sessionUserId: session?.user?.id ?? null,
        companyId: profile?.company_id ?? null,
      });
      return;
    }

    pushLog('Auto-register scheduled (post-login)', {
      user_id: session.user.id,
      company_id: profile.company_id,
    });
    startupLog('Scheduling deferred notification registration');

    const timer = setTimeout(() => {
      void (async () => {
        try {
          pushLog('Auto-register running now');
          await refreshPermissionStatus();
          await registerDevice();
          pushLog('Auto-register finished');
        } catch (error) {
          pushLog('Deferred notification registration failed', error);
          console.error('[DocAlert push] Deferred registration failed', error);
          startupLog('Deferred notification registration failed', error);
        }
      })();
    }, 800);

    return () => clearTimeout(timer);
  }, [session?.user?.id, profile?.company_id, refreshPermissionStatus, registerDevice]);

  useEffect(() => {
    if (session?.user?.id) {
      return;
    }

    const deactivate = async () => {
      const previousUserId = activeUserIdRef.current;
      if (!previousUserId) {
        return;
      }

      try {
        await deactivateMobileDevice({
          userId: previousUserId,
          platform: devicePlatform ?? 'unknown',
          deviceName: deviceName ?? 'Unknown device',
          expoPushToken,
        });
      } catch (err) {
        pushLog('Deactivate on logout failed (non-blocking)', err);
      } finally {
        activeUserIdRef.current = null;
        setExpoPushToken(null);
        setSyncStatus('idle');
        setLastSyncedAt(null);
        setLastSyncError(null);
        setPermissionStatus('undetermined');
        setPermissionMessage(null);
      }
    };

    void deactivate();
  }, [session?.user?.id, devicePlatform, deviceName, expoPushToken]);

  const pushEnabled = permissionStatus === 'granted' && Boolean(expoPushToken);

  const value = useMemo(
    () => ({
      permissionStatus,
      pushEnabled,
      syncStatus,
      lastSyncedAt,
      lastSyncError,
      permissionMessage,
      devicePlatform,
      deviceName,
      appVersion,
      expoPushToken,
      isRegistering,
      lastForegroundReceivedAt,
      recheckPermission,
      retryTokenSync,
      testPushRegistration,
    }),
    [
      permissionStatus,
      pushEnabled,
      syncStatus,
      lastSyncedAt,
      lastSyncError,
      permissionMessage,
      devicePlatform,
      deviceName,
      appVersion,
      expoPushToken,
      isRegistering,
      lastForegroundReceivedAt,
      recheckPermission,
      retryTokenSync,
      testPushRegistration,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }

  return context;
}
