import { daysUntilExpiry } from '@/src/lib/expiry';
import type { DocumentDisplayStatus } from '@/src/types/documents';

const DEFAULT_THRESHOLD_DAYS = 30;

export function getDocumentDisplayStatus(
  expiry: string | null,
  thresholdDays = DEFAULT_THRESHOLD_DAYS,
): DocumentDisplayStatus {
  if (!expiry) return 'active';

  const days = daysUntilExpiry(expiry);
  if (days < 0) return 'expired';
  if (days <= thresholdDays) return 'expiring';
  return 'active';
}

export const DOCUMENT_STATUS_LABEL: Record<DocumentDisplayStatus, string> = {
  active: 'Active',
  expiring: 'Expiring Soon',
  expired: 'Expired',
};

export function formatDaysRemaining(days: number | null): string {
  if (days === null) return '—';
  if (days < 0) return `${Math.abs(days)}d ago`;
  if (days === 0) return 'Today';
  return `${days}d left`;
}

export function statusBadgeTone(
  status: DocumentDisplayStatus,
): 'success' | 'warning' | 'danger' {
  if (status === 'expired') return 'danger';
  if (status === 'expiring') return 'warning';
  return 'success';
}
