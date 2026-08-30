import { supabase } from '@/src/lib/supabase';
import { queryCompanyDocuments } from '@/src/services/documentSelect';
import type { BrandRecord } from '@/src/types/brand';
import type { BranchRecord } from '@/src/types/branch';
import type { DocumentRecord } from '@/src/types/documents';
import type { StaffMember } from '@/src/types/staff';

export type CompanyOrgData = {
  brands: BrandRecord[];
  branches: BranchRecord[];
  staff: StaffMember[];
  documents: DocumentRecord[];
};

export async function fetchCompanyOrgData(companyId: string): Promise<CompanyOrgData> {
  const [brandsResult, branchesResult, staffResult, documentsResult] = await Promise.all([
    supabase
      .from('brands')
      .select('id,company_id,name,contact_number,status')
      .eq('company_id', companyId)
      .order('name'),
    supabase
      .from('branches')
      .select(
        'id,company_id,brand_id,name,governorate,area,location,full_address,manager_name,manager_contact,status',
      )
      .eq('company_id', companyId)
      .order('name'),
    supabase
      .from('staff')
      .select('id,company_id,brand_id,branch_id,name,role,status')
      .eq('company_id', companyId),
    queryCompanyDocuments(companyId),
  ]);

  if (brandsResult.error) throw new Error(brandsResult.error.message);
  if (branchesResult.error) throw new Error(branchesResult.error.message);
  if (staffResult.error) throw new Error(staffResult.error.message);
  if (documentsResult.error) throw new Error(documentsResult.error.message);

  return {
    brands: (brandsResult.data ?? []) as BrandRecord[],
    branches: (branchesResult.data ?? []) as BranchRecord[],
    staff: (staffResult.data ?? []) as StaffMember[],
    documents: (documentsResult.data ?? []).map((row) => {
      const record = row as Record<string, unknown>;
      return {
        id: String(record.id),
        type: record.type as DocumentRecord['type'],
        staff_id: (record.staff_id as string | null) ?? null,
        branch_id: (record.branch_id as string | null) ?? null,
        document_name: String(record.document_name ?? ''),
        expiry_date: (record.expiry_date as string | null) ?? null,
        expiry_status: (record.expiry_status as string | null) ?? null,
        file_url: (record.file_url as string | null) ?? null,
        status: (record.status as string | null) ?? null,
        notes: null,
      };
    }),
  };
}

export function resolveBrandIdForStaff(
  staff: StaffMember,
  branchToBrandId: Map<string, string>,
): string {
  return branchToBrandId.get(staff.branch_id) ?? staff.brand_id ?? '';
}
