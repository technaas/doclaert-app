export type SubscriptionRecord = {
  status: string | null;
  end_date: string | null;
  plan_name: string | null;
};

/**
 * Lifetime software licensing is stored on the existing subscriptions row.
 * plan_name "Lifetime" (any casing) or status "lifetime" means the software
 * license does not expire. There is no separate support or AMC column;
 * end_date remains the recorded subscription end and is not treated as the
 * software expiry for a lifetime plan.
 */
export function isLifetimeSubscription(
  sub: SubscriptionRecord | null | undefined,
): boolean {
  if (!sub) return false;
  const plan = sub.plan_name?.trim().toLowerCase() ?? '';
  const status = sub.status?.trim().toLowerCase() ?? '';
  return plan === 'lifetime' || status === 'lifetime';
}

export function formatSubscriptionEnd(
  sub: SubscriptionRecord | null | undefined,
): string {
  if (!sub) return '—';
  if (isLifetimeSubscription(sub)) return 'Lifetime';
  const endDate = sub.end_date?.trim();
  return endDate ? endDate : '—';
}

export function isSubscriptionAllowed(
  sub: SubscriptionRecord | null | undefined,
): boolean {
  if (!sub) return false;
  const status = sub.status?.trim().toLowerCase() ?? '';
  const statusOk = status === 'active' || status === 'trial' || status === 'lifetime';
  if (!statusOk) return false;
  if (isLifetimeSubscription(sub)) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOk = sub.end_date ? new Date(sub.end_date) >= today : false;
  return endOk;
}
