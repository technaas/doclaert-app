import { computeStatus, daysUntilExpiry, type DocStatus } from '@/src/lib/expiry';
import { toDatabaseDate } from '@/src/lib/calendarDate';

export type ExpiryStatus = 'has_expiry' | 'no_expiry' | 'pending_verification';

export type DocumentLifecycleStatus = DocStatus | 'non_expiring' | 'pending_verification';

export const LIFECYCLE_STATUS_LABEL: Record<DocumentLifecycleStatus, string> = {
  valid: 'Valid',
  expiring: 'Expiring Soon',
  expired: 'Expired',
  non_expiring: 'Non-Expiring',
  pending_verification: 'Pending Verification',
};

export function isExpiryStatus(value: unknown): value is ExpiryStatus {
  return value === 'has_expiry' || value === 'no_expiry' || value === 'pending_verification';
}

/**
 * Infer expiry_status for rows written before the column existed.
 * Dated rows are has_expiry. Bare null dates are pending, not no_expiry.
 */
export function inferExpiryStatus(
  expiryDate: string | null | undefined,
  expiryStatus?: string | null,
): ExpiryStatus {
  if (isExpiryStatus(expiryStatus)) return expiryStatus;
  if (expiryDate && String(expiryDate).trim()) return 'has_expiry';
  return 'pending_verification';
}

export function resolvedExpiryDate(
  expiryStatus: ExpiryStatus,
  expiryDate: string | null | undefined,
): string | null {
  if (expiryStatus !== 'has_expiry') return null;
  return toDatabaseDate(expiryDate);
}

export function computeDocumentLifecycleStatus(
  expiryStatus: ExpiryStatus,
  expiryDate: string | null | undefined,
): DocumentLifecycleStatus {
  if (expiryStatus === 'no_expiry') return 'non_expiring';
  if (expiryStatus === 'pending_verification') return 'pending_verification';
  const date = resolvedExpiryDate(expiryStatus, expiryDate);
  if (!date) return 'pending_verification';
  return computeStatus(date);
}

export function participatesInExpiryCalculations(
  expiryStatus: ExpiryStatus,
  expiryDate: string | null | undefined,
): boolean {
  return expiryStatus === 'has_expiry' && !!resolvedExpiryDate(expiryStatus, expiryDate);
}

export function daysUntilExpiryOrNull(
  expiryStatus: ExpiryStatus,
  expiryDate: string | null | undefined,
): number | null {
  if (!participatesInExpiryCalculations(expiryStatus, expiryDate)) return null;
  const date = resolvedExpiryDate(expiryStatus, expiryDate);
  if (!date) return null;
  return daysUntilExpiry(date);
}
