import { getDocumentDisplayStatus } from '@/src/lib/documentStatus';
import { supabase } from '@/src/lib/supabase';
import { fetchAlertThresholdDays } from '@/src/services/documents';
import type { BrandRecord } from '@/src/types/brand';
import type { BranchRecord } from '@/src/types/branch';
import type { DocumentRecord } from '@/src/types/documents';
import type { StaffMember } from '@/src/types/staff';

export type CompanyOrgData = {
  brands: BrandRecord[];
  branches: BranchRecord[];
  staff: StaffMember[];
  documents: DocumentRecord[];
  alertThresholdDays: number;
};

export async function fetchCompanyOrgData(companyId: string): Promise<CompanyOrgData> {
  const [brandsResult, branchesResult, staffResult, documentsResult, alertThresholdDays] =
    await Promise.all([
      supabase
        .from('brands')
        .select('id,company_id,name,contact_number,status')
        .eq('company_id', companyId)
        .order('name'),
      supabase
        .from('branches')
        .select(
          'id,company_id,brand_id,name,location,full_address,manager_name,manager_contact,status',
        )
        .eq('company_id', companyId)
        .order('name'),
      supabase
        .from('staff')
        .select('id,company_id,brand_id,branch_id,name,role,status')
        .eq('company_id', companyId),
      supabase
        .from('documents')
        .select('id,type,staff_id,branch_id,document_name,expiry_date,file_url,status')
        .eq('company_id', companyId),
      fetchAlertThresholdDays(companyId),
    ]);

  if (brandsResult.error) throw new Error(brandsResult.error.message);
  if (branchesResult.error) throw new Error(branchesResult.error.message);
  if (staffResult.error) throw new Error(staffResult.error.message);
  if (documentsResult.error) throw new Error(documentsResult.error.message);

  return {
    brands: (brandsResult.data ?? []) as BrandRecord[],
    branches: (branchesResult.data ?? []) as BranchRecord[],
    staff: (staffResult.data ?? []) as StaffMember[],
    documents: (documentsResult.data ?? []).map((row) => ({
      id: String((row as { id: string }).id),
      type: (row as { type: 'staff' | 'branch' }).type,
      staff_id: (row as { staff_id: string | null }).staff_id ?? null,
      branch_id: (row as { branch_id: string | null }).branch_id ?? null,
      document_name: String((row as { document_name: string }).document_name ?? ''),
      expiry_date: (row as { expiry_date: string | null }).expiry_date ?? null,
      file_url: (row as { file_url: string | null }).file_url ?? null,
      status: (row as { status: string | null }).status ?? null,
      notes: null,
    })),
    alertThresholdDays,
  };
}

export function resolveBrandIdForStaff(
  staff: StaffMember,
  branchToBrandId: Map<string, string>,
): string {
  return branchToBrandId.get(staff.branch_id) ?? staff.brand_id ?? '';
}

export function countDocStatus(
  expiry: string | null,
  thresholdDays: number,
): 'active' | 'expiring' | 'expired' | null {
  if (!expiry) return null;
  return getDocumentDisplayStatus(expiry, thresholdDays);
}
