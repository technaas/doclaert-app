import type { StatusBadgeTone } from '@/src/components/ui/StatusBadge';
import { computeAlertStatus, daysUntilExpiry, type AlertStatus } from '@/src/lib/expiry';
import { inferExpiryStatus } from '@/src/lib/documentExpiry';
import {
  alertStatusForDocument,
  daysUntilDocumentExpiry,
  lifecycleStatusForDocument,
} from '@/src/lib/operationalExpiry';
import type { DocumentDisplayStatus } from '@/src/types/documents';

export const DOCUMENT_STATUS_LABEL: Record<DocumentDisplayStatus, string> = {
  valid: 'Valid',
  expiring: 'Expiring Soon',
  critical: 'Critical',
  expired: 'Expired',
  non_expiring: 'Non-Expiring',
  pending_verification: 'Pending Verification',
};

export function formatDaysRemaining(days: number | null): string {
  if (days === null) return '—';
  if (days < 0) return `${Math.abs(days)}d ago`;
  if (days === 0) return 'Today';
  return `${days}d left`;
}

export function statusBadgeTone(status: DocumentDisplayStatus): StatusBadgeTone {
  if (status === 'expired') return 'danger';
  if (status === 'critical') return 'critical';
  if (status === 'expiring') return 'warning';
  if (status === 'pending_verification') return 'muted';
  if (status === 'non_expiring') return 'muted';
  return 'success';
}

export function listCardTone(
  status: DocumentDisplayStatus,
): 'danger' | 'warning' | 'default' {
  if (status === 'expired' || status === 'critical') return 'danger';
  if (status === 'expiring') return 'warning';
  return 'default';
}

function alertStatusToDisplay(status: AlertStatus): DocumentDisplayStatus {
  if (status === 'active') return 'valid';
  return status;
}

export function uiStatusFromAlertAndLifecycle(
  documentName: string | null | undefined,
  expiryDate: string | null | undefined,
  expiryStatus?: string | null,
): DocumentDisplayStatus {
  const inferred = inferExpiryStatus(expiryDate, expiryStatus);
  const lifecycle = lifecycleStatusForDocument(documentName, inferred, expiryDate);
  if (lifecycle === 'non_expiring') return 'non_expiring';
  if (lifecycle === 'pending_verification') return 'pending_verification';
  const alert = alertStatusForDocument(documentName, inferred, expiryDate);
  if (!alert) return 'pending_verification';
  return alertStatusToDisplay(alert);
}

export function getDocumentDisplayStatus(
  expiry: string | null | undefined,
): DocumentDisplayStatus {
  return uiStatusFromAlertAndLifecycle(undefined, expiry, undefined);
}

export function uiStatusForDocument(doc: {
  document_name?: string | null;
  expiry_date?: string | null;
  expiry_status?: string | null;
}): DocumentDisplayStatus {
  return uiStatusFromAlertAndLifecycle(doc.document_name, doc.expiry_date, doc.expiry_status);
}

export function daysRemainingForDocument(doc: {
  document_name?: string | null;
  expiry_date?: string | null;
  expiry_status?: string | null;
}): number | null {
  const inferred = inferExpiryStatus(doc.expiry_date, doc.expiry_status);
  return daysUntilDocumentExpiry(doc.document_name, inferred, doc.expiry_date);
}

export function uiStatusForVehicleDaftar(
  expiryDate: string | null | undefined,
): DocumentDisplayStatus {
  if (!expiryDate?.trim()) return 'pending_verification';
  return alertStatusToDisplay(computeAlertStatus(expiryDate));
}

export function daysRemainingForVehicleDaftar(
  expiryDate: string | null | undefined,
): number | null {
  if (!expiryDate?.trim()) return null;
  return daysUntilExpiry(expiryDate);
}

export function isSummaryValid(status: DocumentDisplayStatus): boolean {
  return status === 'valid' || status === 'non_expiring';
}

export function isSummaryExpiring(status: DocumentDisplayStatus): boolean {
  return status === 'expiring' || status === 'critical';
}

export function isAlertStatus(status: DocumentDisplayStatus): boolean {
  return status === 'expired' || status === 'expiring' || status === 'critical';
}

/**
 * Filter matching:
 * - valid / active: Valid + Non-Expiring (dashboard Valid card)
 * - expiring: Expiring Soon + Critical (dashboard Expiring card)
 * - other values: exact
 */
export function matchesStatusFilter(
  status: DocumentDisplayStatus,
  filter: string,
): boolean {
  if (filter === 'all' || !filter) return true;
  if (filter === 'active' || filter === 'valid') return isSummaryValid(status);
  if (filter === 'expiring') return isSummaryExpiring(status);
  return status === filter;
}
