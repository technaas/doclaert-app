import {
  countDocumentsByStatus,
  countVehicleDaftarByStatus,
  mergeDocumentCountBreakdowns,
} from '@/src/lib/documentCounts';
import type { AccessScope } from '@/src/lib/accessScope';
import { scopeDocuments, scopeStaffMembers, scopeVehicles } from '@/src/lib/scopeCompanyData';
import { mapVehicleRecord } from '@/src/lib/vehicleFields';
import { supabase } from '@/src/lib/supabase';
import { queryDashboardDocuments } from '@/src/services/documentSelect';
import type { DashboardStats } from '@/src/types/dashboard';
import type { DocumentRecord } from '@/src/types/documents';
import type { StaffMember } from '@/src/types/staff';

async function fetchCompanyName(companyId: string): Promise<string | null> {
  const { data } = await supabase
    .from('companies')
    .select('name')
    .eq('id', companyId)
    .maybeSingle();

  const name = data?.name?.trim();
  return name || null;
}

export async function fetchDashboardStats(
  companyId: string,
  options: { scope: AccessScope; includeSalary: boolean },
): Promise<DashboardStats> {
  const staffQuery = options.includeSalary
    ? supabase
        .from('staff')
        .select('id, brand_id, branch_id, status, salary')
        .eq('company_id', companyId)
        .eq('status', 'active')
    : supabase
        .from('staff')
        .select('id, brand_id, branch_id, status')
        .eq('company_id', companyId)
        .eq('status', 'active');

  const [companyName, brandsResult, branchesResult, staffResult, documentsResult, vehiclesResult] =
    await Promise.all([
      fetchCompanyName(companyId),
      supabase.from('brands').select('id').eq('company_id', companyId),
      supabase.from('branches').select('id, brand_id').eq('company_id', companyId),
      staffQuery,
      queryDashboardDocuments(companyId),
      supabase.from('vehicles').select('*').eq('company_id', companyId),
    ]);

  if (brandsResult.error) throw new Error(brandsResult.error.message);
  if (branchesResult.error) throw new Error(branchesResult.error.message);
  if (staffResult.error) throw new Error(staffResult.error.message);
  if (documentsResult.error) throw new Error(documentsResult.error.message);

  const vehicleRows = vehiclesResult.error ? [] : (vehiclesResult.data ?? []);
  const brands = options.scope.filterBrands(brandsResult.data ?? []);
  const branches = options.scope.filterBranches(branchesResult.data ?? []);
  const staff = scopeStaffMembers(
    ((staffResult.data ?? []) as unknown as StaffMember[]),
    options.scope,
  );
  const documents = scopeDocuments(
    (documentsResult.data ?? []) as DocumentRecord[],
    options.scope,
    staff,
    branches,
  );
  const vehicles = scopeVehicles(
    vehicleRows.map((row) => mapVehicleRecord(row as Record<string, unknown>)),
    options.scope,
  );

  const totalPay = options.includeSalary
    ? staff.reduce((sum, row) => sum + (typeof row.salary === 'number' ? row.salary : 0), 0)
    : 0;

  const documentCounts = mergeDocumentCountBreakdowns(
    countDocumentsByStatus(documents),
    countVehicleDaftarByStatus(vehicles),
  );

  return {
    brandsCount: brands.length,
    branchesCount: branches.length,
    activeStaffCount: staff.length,
    totalPay,
    vehiclesCount: vehicles.length,
    validDocuments: documentCounts.valid,
    expiringSoon: documentCounts.expiringSoon,
    expired: documentCounts.expired,
    criticalDocuments: documentCounts.critical,
    nonExpiringDocuments: documentCounts.nonExpiring,
    pendingVerificationDocuments: documentCounts.pendingVerification,
    companyName,
  };
}
