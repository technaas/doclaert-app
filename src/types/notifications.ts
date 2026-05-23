export type NotificationPermissionStatus =
  | 'undetermined'
  | 'granted'
  | 'denied'
  | 'unavailable';

export type TokenSyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export type MobileDevicePlatform = 'ios' | 'android' | 'web' | 'unknown';

export type MobileDeviceRecord = {
  id: string;
  company_id: string;
  user_id: string;
  expo_push_token: string;
  device_name: string | null;
  platform: string;
  app_version: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type NotificationPayload = {
  document_id?: string;
  /** Expo push data: `screen` (e.g. "alerts") */
  screen?: string;
  /** Expo push data: `type` — staff | branch | test */
  type?: string;
  /** Optional filter: expiring | expired (mixed → show all) */
  status?: 'expiring' | 'expired';
  /** @deprecated Use `screen: "alerts"` — kept for older payloads */
  alert_screen?: boolean | string;
};

export type DeviceRegistrationInfo = {
  expoPushToken: string;
  deviceName: string;
  platform: MobileDevicePlatform;
  appVersion: string;
};
