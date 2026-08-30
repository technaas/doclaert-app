/** Calendar-date helpers for expiry math. Storage is YYYY-MM-DD. */

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_RE = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;

function isValidCalendarParts(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const dt = new Date(year, month - 1, day);
  return dt.getFullYear() === year && dt.getMonth() === month - 1 && dt.getDate() === day;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function toIsoDate(year: number, month: number, day: number): string | null {
  if (!isValidCalendarParts(year, month, day)) return null;
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function parseIsoDate(value: string | null | undefined): {
  year: number;
  month: number;
  day: number;
} | null {
  const raw = (value ?? '').trim().slice(0, 10);
  const m = ISO_RE.exec(raw);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (!isValidCalendarParts(year, month, day)) return null;
  return { year, month, day };
}

function parseDisplayDate(value: string | null | undefined): string | null {
  const raw = (value ?? '').trim();
  if (!raw) return null;
  const m = DISPLAY_RE.exec(raw);
  if (!m) return null;
  return toIsoDate(Number(m[3]), Number(m[2]), Number(m[1]));
}

/** Accepts DD/MM/YYYY or YYYY-MM-DD. Returns YYYY-MM-DD or null. */
export function toDatabaseDate(value: string | null | undefined): string | null {
  const raw = (value ?? '').trim();
  if (!raw) return null;
  if (ISO_RE.test(raw.slice(0, 10)) && raw.length >= 10) {
    return parseIsoDate(raw) ? raw.slice(0, 10) : null;
  }
  return parseDisplayDate(raw);
}

/**
 * Shift a calendar date by whole months, clipping the day to the last day of
 * the target month (matches web passport operational date).
 */
export function addCalendarMonths(
  iso: string | null | undefined,
  months: number,
): string | null {
  const parts = parseIsoDate(toDatabaseDate(iso));
  if (!parts) return null;
  const target = new Date(parts.year, parts.month - 1 + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  const day = Math.min(parts.day, lastDay);
  return toIsoDate(target.getFullYear(), target.getMonth() + 1, day);
}
