import type { AlertFilters } from '@/src/types/alerts';
import type { NotificationPayload } from '@/src/types/notifications';

export type NotificationNavigationTarget =
  | { screen: 'DocumentDetail'; documentId: string }
  | {
      screen: 'Alerts';
      tab: AlertFilters['tab'];
      status: AlertFilters['status'];
    };

function normalizeScreen(data: Record<string, unknown>): string | undefined {
  const screen = data.screen ?? data.alert_screen;
  if (typeof screen === 'string' && screen.length > 0) {
    return screen.toLowerCase();
  }
  if (
    screen === true ||
    screen === 'true' ||
    screen === 1 ||
    screen === '1'
  ) {
    return 'alerts';
  }
  return undefined;
}

function normalizeType(data: Record<string, unknown>): string | undefined {
  const type = data.type;
  if (typeof type === 'string' && type.length > 0) {
    return type.toLowerCase();
  }
  return undefined;
}

function normalizeAlertStatus(
  raw: unknown,
): NotificationPayload['status'] {
  if (typeof raw !== 'string') return undefined;
  const status = raw.toLowerCase();
  if (status === 'expiring' || status === 'expired') return status;
  return undefined;
}

export function resolveNotificationNavigationTarget(
  payload: NotificationPayload,
): NotificationNavigationTarget | null {
  if (payload.document_id) {
    return { screen: 'DocumentDetail', documentId: payload.document_id };
  }

  const screen = payload.screen;
  const type = payload.type;
  const shouldOpenAlerts =
    screen === 'alerts' ||
    payload.alert_screen === true ||
    type === 'staff' ||
    type === 'branch' ||
    type === 'vehicle' ||
    type === 'test';

  if (!shouldOpenAlerts) {
    return null;
  }

  const tab: AlertFilters['tab'] =
    type === 'staff' || type === 'branch' || type === 'vehicle' ? type : 'all';
  const status = payload.status ?? 'all';

  return { screen: 'Alerts', tab, status };
}

export function parseNotificationPayload(
  data: Record<string, unknown> | undefined,
): NotificationPayload {
  if (!data) {
    return {};
  }

  const payload: NotificationPayload = {};

  const documentId = data.document_id;
  if (typeof documentId === 'string' && documentId.length > 0) {
    payload.document_id = documentId;
  }

  const screen = normalizeScreen(data);
  if (screen) {
    payload.screen = screen;
  }

  const type = normalizeType(data);
  if (type) {
    payload.type = type;
  }

  const status = normalizeAlertStatus(data.status);
  if (status) {
    payload.status = status;
  }

  const alertScreen = data.alert_screen;
  if (
    alertScreen === true ||
    alertScreen === 'true' ||
    alertScreen === 1 ||
    alertScreen === '1'
  ) {
    payload.alert_screen = true;
    if (!payload.screen) {
      payload.screen = 'alerts';
    }
  }

  return payload;
}

export function alertFiltersFromNavigationTarget(
  target: Extract<NotificationNavigationTarget, { screen: 'Alerts' }>,
): Partial<AlertFilters> {
  const patch: Partial<AlertFilters> = {};
  if (target.tab !== 'all') {
    patch.tab = target.tab;
  }
  if (target.status !== 'all') {
    patch.status = target.status;
  }
  return patch;
}

export function describeNavigationTarget(
  target: NotificationNavigationTarget,
): string {
  if (target.screen === 'DocumentDetail') {
    return `DocumentDetail(documentId=${target.documentId})`;
  }
  const parts = ['Alerts'];
  if (target.tab !== 'all') {
    parts.push(`tab=${target.tab}`);
  }
  if (target.status !== 'all') {
    parts.push(`status=${target.status}`);
  }
  return parts.join(', ');
}
