export type MobileNotificationLogStatus = 'sent' | 'failed';

export type MobileNotificationLogType = 'staff' | 'branch' | 'test';

export type MobileNotificationLogRecord = {
  id: string;
  company_id: string;
  user_id: string;
  mobile_device_id: string | null;
  notification_type: string;
  status: MobileNotificationLogStatus;
  device_name: string | null;
  platform: string | null;
  error: string | null;
  expo_ticket_id: string | null;
  sent_at: string;
};

export type MobileNotificationLogStatusFilter = 'all' | MobileNotificationLogStatus;

export type MobileNotificationLogTypeFilter = 'all' | 'staff' | 'branch';

export const MOBILE_NOTIFICATION_LOGS_LIMIT = 20;
