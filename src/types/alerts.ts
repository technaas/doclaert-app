import type { DocumentDisplayStatus, DocumentKind } from '@/src/types/documents';

export type AlertUrgencyGroup =
  | 'expired'
  | 'due_today'
  | 'days_1_3'
  | 'days_4_7'
  | 'days_8_plus';

export type AlertListItem = {
  id: string;
  kind: DocumentKind;
  documentLabel: string;
  typeLabel: string;
  linkedTo: string;
  brandId: string;
  brandName: string;
  branchId: string;
  branchName: string;
  expiryDate: string | null;
  daysRemaining: number | null;
  displayStatus: DocumentDisplayStatus;
  urgencyGroup: AlertUrgencyGroup;
  plateNumber?: string | null;
};

export type AlertFilters = {
  search: string;
  tab: 'all' | 'staff' | 'branch' | 'vehicle';
  brandId: string;
  branchId: string;
  status: 'all' | 'expiring' | 'expired';
};

export const DEFAULT_ALERT_FILTERS: AlertFilters = {
  search: '',
  tab: 'all',
  brandId: 'all',
  branchId: 'all',
  status: 'all',
};
