import { supabase } from '@/src/lib/supabase';
import { queryStaffDocuments } from '@/src/services/documentSelect';
import type { Branch, Brand, StaffDocument, StaffMember } from '@/src/types/staff';

const STAFF_COLUMNS_BASE =
  'id,company_id,brand_id,branch_id,name,role,staff_id,contact_number,email,photo_url,kuwait_contact_number,india_contact_number,native_contact_country_code,native_contact_number,civil_id_number,passport_custody,passport_code_number,visa_working_type,visa_company_name,status,staff_type,part_time_license_expiry_date,part_time_note,part_time_brand_id,part_time_branch_id,part_time_license_file_url';

const STAFF_COLUMNS_WITH_SALARY = `${STAFF_COLUMNS_BASE},salary,salary_type`;

function staffSelect(includeSalary: boolean): string {
  return includeSalary ? STAFF_COLUMNS_WITH_SALARY : STAFF_COLUMNS_BASE;
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function mapStaffMember(row: Record<string, unknown>): StaffMember {
  return {
    ...(row as StaffMember),
    email: asNullableString(row.email),
    photo_url: asNullableString(row.photo_url),
    kuwait_contact_number: asNullableString(row.kuwait_contact_number),
    india_contact_number: asNullableString(row.india_contact_number),
    native_contact_country_code: asNullableString(row.native_contact_country_code),
    native_contact_number: asNullableString(row.native_contact_number),
    civil_id_number: asNullableString(row.civil_id_number),
    passport_custody: asNullableString(row.passport_custody),
    passport_code_number: asNullableString(row.passport_code_number),
    visa_working_type: asNullableString(row.visa_working_type),
    visa_company_name: asNullableString(row.visa_company_name),
    salary: typeof row.salary === 'number' ? row.salary : null,
    salary_type: (row.salary_type as string | null) ?? null,
  };
}

export type CompanyStaffData = {
  brands: Brand[];
  branches: Branch[];
  staff: StaffMember[];
};

export async function fetchCompanyStaffData(
  companyId: string,
  options: { includeSalary?: boolean } = {},
): Promise<CompanyStaffData> {
  const includeSalary = options.includeSalary === true;
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
      .select(staffSelect(includeSalary) as '*')
      .eq('company_id', companyId)
      .order('name'),
  ]);

  if (brandsResult.error) throw new Error(brandsResult.error.message);
  if (branchesResult.error) throw new Error(branchesResult.error.message);
  if (staffResult.error) throw new Error(staffResult.error.message);

  return {
    brands: (brandsResult.data ?? []) as Brand[],
    branches: (branchesResult.data ?? []) as Branch[],
    staff: (staffResult.data ?? []).map((row) =>
      mapStaffMember(row as unknown as Record<string, unknown>),
    ),
  };
}

export async function fetchStaffDocuments(
  companyId: string,
  staffId: string,
): Promise<StaffDocument[]> {
  const { data, error } = await queryStaffDocuments(companyId, staffId);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const record = row as StaffDocument;
    return {
      ...record,
      expiry_status: record.expiry_status ?? null,
    };
  });
}

export async function fetchStaffMember(
  companyId: string,
  staffId: string,
  options: { includeSalary?: boolean } = {},
): Promise<StaffMember | null> {
  const { data, error } = await supabase
    .from('staff')
    .select(staffSelect(options.includeSalary === true) as '*')
    .eq('company_id', companyId)
    .eq('id', staffId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapStaffMember(data as unknown as Record<string, unknown>);
}
