import type { DocumentDisplayStatus } from '@/src/types/documents';
import type { AlertUrgencyGroup } from '@/src/types/alerts';
import { isAlertStatus, isSummaryExpiring } from '@/src/lib/documentStatus';
import { CRITICAL_DAYS } from '@/src/lib/expiry';

export const URGENCY_GROUP_LABELS: Record<AlertUrgencyGroup, string> = {
  expired: 'Expired',
  due_today: 'Due today',
  days_1_3: '1–3 days',
  days_4_7: '4–7 days',
  days_8_plus: '8+ days',
};

export const EXPIRING_GROUP_ORDER: AlertUrgencyGroup[] = [
  'due_today',
  'days_1_3',
  'days_4_7',
  'days_8_plus',
];

export function getUrgencyGroup(
  days: number | null,
  displayStatus: DocumentDisplayStatus,
): AlertUrgencyGroup | null {
  if (displayStatus === 'expired') return 'expired';
  if (days === null || !isSummaryExpiring(displayStatus)) return null;
  if (days === 0) return 'due_today';
  if (days >= 1 && days <= 3) return 'days_1_3';
  if (days >= 4 && days <= 7) return 'days_4_7';
  if (days >= 8) return 'days_8_plus';
  return null;
}

export function getAlertCardTone(
  displayStatus: DocumentDisplayStatus,
  days: number | null,
): 'danger' | 'warning' | 'critical' {
  if (displayStatus === 'expired') return 'danger';
  if (displayStatus === 'critical' || (days !== null && days >= 0 && days <= CRITICAL_DAYS)) {
    return 'critical';
  }
  return 'warning';
}

export function getAlertStatusLabel(
  displayStatus: DocumentDisplayStatus,
  _days: number | null,
): string {
  if (displayStatus === 'expired') return 'Expired';
  if (displayStatus === 'critical') return 'Critical';
  if (isAlertStatus(displayStatus)) return 'Expiring Soon';
  return 'Expiring Soon';
}
