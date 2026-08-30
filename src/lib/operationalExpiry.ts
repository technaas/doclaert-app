import { addCalendarMonths, toDatabaseDate } from '@/src/lib/calendarDate';
import {
  computeAlertStatus,
  daysUntilExpiry,
  type AlertStatus,
} from '@/src/lib/expiry';
import {
  computeDocumentLifecycleStatus,
  inferExpiryStatus,
  resolvedExpiryDate,
  type DocumentLifecycleStatus,
  type ExpiryStatus,
} from '@/src/lib/documentExpiry';
import { hasUploadedDocumentFile } from '@/src/lib/documentFile';

export const PASSPORT_DOCUMENT_SLUG = 'passport';
export const PASSPORT_PRIOR_MONTHS = 14;

export function isPassportDocumentSlug(
  documentName: string | null | undefined,
): boolean {
  return documentName === PASSPORT_DOCUMENT_SLUG;
}

export function passportPriorDate(expiry: string | null | undefined): string | null {
  const iso = toDatabaseDate(expiry);
  if (!iso) return null;
  return addCalendarMonths(iso, -PASSPORT_PRIOR_MONTHS);
}

/**
 * Stored expiry_date remains the legal date.
 * Passport compliance uses actual minus 14 months.
 */
export function operationalExpiryDate(
  documentName: string | null | undefined,
  expiryStatus: ExpiryStatus,
  storedExpiryDate: string | null | undefined,
): string | null {
  const stored = resolvedExpiryDate(expiryStatus, storedExpiryDate);
  if (!stored) return null;
  if (isPassportDocumentSlug(documentName)) return passportPriorDate(stored);
  return stored;
}

export function lifecycleStatusForDocument(
  documentName: string | null | undefined,
  expiryStatus: ExpiryStatus,
  storedExpiryDate: string | null | undefined,
): DocumentLifecycleStatus {
  const operational = operationalExpiryDate(documentName, expiryStatus, storedExpiryDate);
  return computeDocumentLifecycleStatus(expiryStatus, operational);
}

export function daysUntilDocumentExpiry(
  documentName: string | null | undefined,
  expiryStatus: ExpiryStatus,
  storedExpiryDate: string | null | undefined,
): number | null {
  const operational = operationalExpiryDate(documentName, expiryStatus, storedExpiryDate);
  if (!operational) return null;
  return daysUntilExpiry(operational);
}

export function alertStatusForDocument(
  documentName: string | null | undefined,
  expiryStatus: ExpiryStatus,
  storedExpiryDate: string | null | undefined,
): AlertStatus | null {
  const operational = operationalExpiryDate(documentName, expiryStatus, storedExpiryDate);
  if (!operational) return null;
  return computeAlertStatus(operational);
}

export function isDocumentInventoryRow(row: {
  id?: string;
  file_url?: string | null;
}): boolean {
  if (row.id?.startsWith('missing-')) return false;
  return hasUploadedDocumentFile(row.file_url);
}

export function inferAndLifecycle(
  documentName: string | null | undefined,
  storedExpiryDate: string | null | undefined,
  expiryStatus?: string | null,
): DocumentLifecycleStatus {
  const mode = inferExpiryStatus(storedExpiryDate, expiryStatus);
  return lifecycleStatusForDocument(documentName, mode, storedExpiryDate);
}
