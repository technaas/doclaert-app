import {
  CommonActions,
  createNavigationContainerRef,
} from '@react-navigation/native';

import {
  describeNavigationTarget,
  resolveNotificationNavigationTarget,
} from '@/src/lib/notificationNavigation';
import type { AppStackParamList } from '@/src/navigation/AppStack';
import type { NotificationPayload } from '@/src/types/notifications';

export const navigationRef = createNavigationContainerRef<AppStackParamList>();

let pendingNotificationTarget: ReturnType<
  typeof resolveNotificationNavigationTarget
> | null = null;

let lastHandledNotificationId: string | null = null;

const AUTH_ROUTE_NAMES = new Set(['Login']);

function isAppAuthenticatedRoute(): boolean {
  const routeName = navigationRef.getCurrentRoute()?.name;
  if (!routeName) {
    return false;
  }
  return !AUTH_ROUTE_NAMES.has(routeName);
}

function logPushNavigation(message: string, detail?: unknown): void {
  if (detail !== undefined) {
    console.log(`[DocAlert push] ${message}`, detail);
  } else {
    console.log(`[DocAlert push] ${message}`);
  }
}

function dispatchNavigationTarget(
  target: NonNullable<ReturnType<typeof resolveNotificationNavigationTarget>>,
): void {
  if (target.screen === 'DocumentDetail') {
    navigationRef.dispatch(
      CommonActions.navigate({
        name: 'DocumentDetail',
        params: { documentId: target.documentId },
      }),
    );
    return;
  }

  const params: AppStackParamList['Alerts'] = {};
  if (target.tab !== 'all') {
    params.tab = target.tab;
  }
  if (target.status !== 'all') {
    params.status = target.status;
  }

  navigationRef.dispatch(
    CommonActions.navigate({
      name: 'Alerts',
      params: Object.keys(params).length > 0 ? params : undefined,
      merge: true,
    }),
  );
}

export function flushPendingNotificationNavigation(): void {
  if (!pendingNotificationTarget || !navigationRef.isReady()) {
    return;
  }

  if (!isAppAuthenticatedRoute()) {
    logPushNavigation('navigation flush deferred (auth or loading)');
    return;
  }

  const target = pendingNotificationTarget;
  pendingNotificationTarget = null;
  logPushNavigation('navigation target (flushed pending)', describeNavigationTarget(target));
  dispatchNavigationTarget(target);
}

export function navigateFromNotification(
  payload: NotificationPayload,
  options?: { notificationId?: string },
): void {
  if (
    options?.notificationId &&
    options.notificationId === lastHandledNotificationId
  ) {
    logPushNavigation('notification already handled, skipping', {
      notificationId: options.notificationId,
    });
    return;
  }

  if (options?.notificationId) {
    lastHandledNotificationId = options.notificationId;
  }

  logPushNavigation('notification tapped');
  logPushNavigation('payload received', payload);

  const target = resolveNotificationNavigationTarget(payload);
  if (!target) {
    logPushNavigation('navigation target', 'none (no matching route)');
    return;
  }

  logPushNavigation('navigation target', describeNavigationTarget(target));

  if (!navigationRef.isReady()) {
    pendingNotificationTarget = target;
    logPushNavigation('navigation deferred until NavigationContainer is ready');
    return;
  }

  dispatchNavigationTarget(target);
}
