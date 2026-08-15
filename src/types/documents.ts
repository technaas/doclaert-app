export type DocumentKind = 'staff' | 'branch' | 'vehicle';

export type DocumentTab = 'all' | 'staff' | 'branch' | 'vehicle';

export type DocumentDisplayStatus = 'active' | 'expiring' | 'expired';

export type DocumentRecord = {
  id: string;
  type: DocumentKind;
  staff_id: string | null;
  branch_id: string | null;
  document_name: string;
  expiry_date: string | null;
  file_url: string | null;
  status: string | null;
  notes: string | null;
};

export type DocumentListItem = {
  id: string;
  kind: DocumentKind;
  documentName: string;
  documentLabel: string;
  linkedTo: string;
  ownerId: string;
  brandId: string;
  brandName: string;
  branchId: string;
  branchName: string;
  expiryDate: string | null;
  daysRemaining: number | null;
  displayStatus: DocumentDisplayStatus;
  plateNumber?: string | null;
  vehicleMake?: string | null;
  vehicleModel?: string | null;
};

export type DocumentFilters = {
  brandId: string;
  branchId: string;
  status: string;
  search: string;
  tab: DocumentTab;
};

export const DEFAULT_DOCUMENT_FILTERS: DocumentFilters = {
  brandId: 'all',
  branchId: 'all',
  status: 'all',
  search: '',
  tab: 'all',
};
