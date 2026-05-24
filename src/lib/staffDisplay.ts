export function formatStaffType(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed || 'Full Time';
}

export function formatSalaryType(value: string | null | undefined): string {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized === 'cash') return 'Cash';
  if (normalized === 'bank') return 'Bank';
  if (!normalized) return '—';
  return value!.trim();
}

export function formatContactNumber(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
}

export function displayField(value: string | null | undefined, fallback = '—'): string {
  const trimmed = value?.trim();
  return trimmed || fallback;
}
