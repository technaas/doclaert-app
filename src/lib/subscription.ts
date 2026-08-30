export type SubscriptionRecord = {
  status: string | null;
  end_date: string | null;
};

export function isSubscriptionAllowed(
  sub: SubscriptionRecord | null | undefined,
): boolean {
  if (!sub) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOk = sub.end_date ? new Date(sub.end_date) >= today : false;
  const statusOk = sub.status === 'active' || sub.status === 'trial';
  return statusOk && endOk;
}
