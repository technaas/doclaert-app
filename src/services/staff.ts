import { supabase } from '@/src/lib/supabase';
import type { Branch, Brand, StaffDocument, StaffMember } from '@/src/types/staff';

export type CompanyStaffData = {
  brands: Brand[];
  branches: Branch[];
  staff: StaffMember[];
};

export async function fetchCompanyStaffData(companyId: string): Promise<CompanyStaffData> {
  const [brandsResult, branchesResult, staffResult] = await Promise.all([
    supabase
      .from('brands')
      .select('id,name')
      .eq('company_id', companyId)
      .order('name'),
    supabase
      .from('branches')
      .select('id,name,brand_id')
      .eq('company_id', companyId)
      .order('name'),
    supabase
      .from('staff')
      .select(
        'id,company_id,brand_id,branch_id,name,role,staff_id,contact_number,status,salary,staff_type,part_time_license_expiry_date,part_time_note,part_time_brand_id,part_time_branch_id,part_time_license_file_url',
      )
      .eq('company_id', companyId)
      .order('name'),
  ]);

  if (brandsResult.error) throw new Error(brandsResult.error.message);
  if (branchesResult.error) throw new Error(branchesResult.error.message);
  if (staffResult.error) throw new Error(staffResult.error.message);

  return {
    brands: (brandsResult.data ?? []) as Brand[],
    branches: (branchesResult.data ?? []) as Branch[],
    staff: (staffResult.data ?? []) as StaffMember[],
  };
}

export async function fetchStaffDocuments(
  companyId: string,
  staffId: string,
): Promise<StaffDocument[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('id,document_name,expiry_date,status')
    .eq('company_id', companyId)
    .eq('type', 'staff')
    .eq('staff_id', staffId)
    .order('expiry_date', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as StaffDocument[];
}

export async function fetchStaffMember(
  companyId: string,
  staffId: string,
): Promise<StaffMember | null> {
  const { data, error } = await supabase
    .from('staff')
    .select(
      'id,company_id,brand_id,branch_id,name,role,staff_id,contact_number,status,salary,staff_type,part_time_license_expiry_date,part_time_note,part_time_brand_id,part_time_branch_id,part_time_license_file_url',
    )
    .eq('company_id', companyId)
    .eq('id', staffId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as StaffMember | null) ?? null;
}
