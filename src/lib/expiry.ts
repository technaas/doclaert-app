export type DocStatus = 'expired' | 'expiring' | 'valid';

const TZ = 'Asia/Kuwait';

function toKuwaitYMD(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const y = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const m = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';
  return `${y}-${m}-${day}`;
}

function ymdToUtcEpoch(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, (m ?? 1) - 1, d ?? 1);
}

export function daysUntilExpiry(expiry: string): number {
  const expiryYmd = expiry.slice(0, 10);
  const todayYmd = toKuwaitYMD(new Date());
  const diffMs = ymdToUtcEpoch(expiryYmd) - ymdToUtcEpoch(todayYmd);
  return Math.round(diffMs / 86_400_000);
}

export function isExpired(expiry: string): boolean {
  return daysUntilExpiry(expiry) < 0;
}

export function isExpiringSoon(expiry: string, thresholdDays: number): boolean {
  const days = daysUntilExpiry(expiry);
  return days >= 0 && days <= thresholdDays;
}

export function computeStatus(expiry: string, thresholdDays = 30): DocStatus {
  const days = daysUntilExpiry(expiry);
  if (days < 0) return 'expired';
  if (days <= thresholdDays) return 'expiring';
  return 'valid';
}

export const DOC_STATUS_LABEL: Record<DocStatus, string> = {
  expired: 'Expired',
  expiring: 'Expiring Soon',
  valid: 'Valid',
};
