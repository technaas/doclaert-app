const TZ = "Asia/Kuwait";

export function todayKuwaitYmd(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value ?? "1970";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

function ymdToUtcEpoch(ymd: string): number {
  const [y, m, d] = ymd.split("-").map(Number);
  return Date.UTC(y, (m ?? 1) - 1, d ?? 1);
}

export function daysUntilExpiry(expiry: string, todayYmd: string): number {
  const expiryYmd = expiry.slice(0, 10);
  const diffMs = ymdToUtcEpoch(expiryYmd) - ymdToUtcEpoch(todayYmd);
  return Math.round(diffMs / 86_400_000);
}

export function addDaysYmd(ymd: string, days: number): string {
  const epoch = ymdToUtcEpoch(ymd);
  const next = new Date(epoch + days * 86_400_000);
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addCalendarMonths(iso: string, months: number): string | null {
  const raw = iso.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0))
    .getUTCDate();
  const clipped = Math.min(day, lastDay);
  const y = target.getUTCFullYear();
  const m = String(target.getUTCMonth() + 1).padStart(2, "0");
  const d = String(clipped).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isExpired(expiry: string, todayYmd: string): boolean {
  return daysUntilExpiry(expiry, todayYmd) < 0;
}

export function isExpiringSoon(
  expiry: string,
  todayYmd: string,
  thresholdDays: number,
): boolean {
  const days = daysUntilExpiry(expiry, todayYmd);
  return days >= 0 && days <= thresholdDays;
}
