import type { MobileNotificationLogType } from '@/src/types/mobileNotificationLogs';

export type NotificationLogDisplay = {
  title: string;
  body: string;
  typeLabel: string;
};

const DISPLAY_BY_TYPE: Record<MobileNotificationLogType, NotificationLogDisplay> = {
  staff: {
    title: 'Staff Documents Expiring',
    body: 'Staff document expiry summary notification.',
    typeLabel: 'Staff Documents',
  },
  branch: {
    title: 'Branch Licenses Expiring',
    body: 'Branch license expiry summary notification.',
    typeLabel: 'Branch Licenses',
  },
  test: {
    title: 'DocAlert Test Notification',
    body: 'Push notifications are working successfully.',
    typeLabel: 'Test',
  },
};

export function getNotificationLogDisplay(
  notificationType: string,
): NotificationLogDisplay {
  const key = notificationType as MobileNotificationLogType;
  if (key in DISPLAY_BY_TYPE) {
    return DISPLAY_BY_TYPE[key];
  }
  return {
    title: 'Document alert',
    body: 'Expiry notification.',
    typeLabel: notificationType,
  };
}

export function formatNotificationLogDateTime(sentAt: string): string {
  try {
    return new Date(sentAt).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return sentAt;
  }
}
