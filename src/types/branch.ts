import type { DocumentDisplayStatus } from './documents';

export type BranchRecord = {
  id: string;
  company_id: string;
  brand_id: string;
  name: string;
  governorate: string | null;
  area: string | null;
  location: string | null;
  full_address: string | null;
  manager_name: string | null;
  manager_contact: string | null;
  status: string | null;
};

export type BranchListItem = BranchRecord & {
  brandName: string;
  staffCount: number;
  licensesCount: number;
  expiringLicensesCount: number;
  expiredLicensesCount: number;
};

export type BranchDetailData = BranchRecord & {
  brandName: string;
  staffCount: number;
  licensesCount: number;
  expiringLicensesCount: number;
  expiredLicensesCount: number;
  staff: Array<{ id: string; name: string; role: string | null; status: string | null }>;
  licenses: Array<{
    id: string;
    document_name: string;
    documentLabel: string;
    expiry_date: string | null;
    file_url: string | null;
    displayStatus: DocumentDisplayStatus;
  }>;
};
