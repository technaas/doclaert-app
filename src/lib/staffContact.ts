const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function formatStaffEmail(value: string | null | undefined): string {
  const trimmed = (value ?? '').trim();
  if (!trimmed || !EMAIL_RE.test(trimmed)) return trimmed;
  return trimmed;
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

export function normalizeKuwaitLocalDigits(value: string): string {
  const digits = digitsOnly(value);
  if (digits.length === 11 && digits.startsWith('965')) return digits.slice(3);
  if (digits.length === 13 && digits.startsWith('00965')) return digits.slice(5);
  return digits;
}

export function formatKuwaitContact(localDigits: string | null | undefined): string {
  const local = normalizeKuwaitLocalDigits(localDigits ?? '');
  if (!local) return '';
  return `+965 ${local}`;
}

export function normalizeIndiaLocalDigits(value: string): string {
  const digits = digitsOnly(value);
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 14 && digits.startsWith('0091')) return digits.slice(4);
  return digits;
}

export function normalizeCountryCode(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const digits = trimmed.replace(/^\++/, '').replace(/\D/g, '');
  if (!digits) return '';
  return `+${digits.slice(0, 4)}`;
}

export function normalizeNativeLocalDigits(value: string): string {
  return digitsOnly(value).slice(0, 15);
}

export type NativeContactFields = {
  native_contact_country_code?: string | null;
  native_contact_number?: string | null;
  india_contact_number?: string | null;
};

export function formatNativeContact(
  countryCode: string | null | undefined,
  localDigits: string | null | undefined,
): string {
  const c = normalizeCountryCode(countryCode ?? '');
  const n = normalizeNativeLocalDigits(localDigits ?? '');
  if (!c && !n) return '';
  if (c && n) return `${c} ${n}`;
  return c || n;
}

export function formatNativeContactFromStaff(row: NativeContactFields): string {
  const code = normalizeCountryCode(row.native_contact_country_code ?? '');
  const num = normalizeNativeLocalDigits(row.native_contact_number ?? '');
  if (code || num) return formatNativeContact(code, num);
  const india = normalizeIndiaLocalDigits(row.india_contact_number ?? '');
  if (india) return formatNativeContact('+91', india);
  return '';
}
