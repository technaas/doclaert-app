import { countDocumentsByStatus } from '@/src/lib/documentCounts';
import { supabase } from '@/src/lib/supabase';
import type { DashboardStats } from '@/src/types/dashboard';

const DEFAULT_ALERT_THRESHOLD_DAYS = 30;

async function fetchAlertThresholdDays(companyId: string): Promise<number> {
  const { data, error } = await supabase
    .from('email_notification_settings')
    .select('alert_threshold_days')
    .eq('company_id', companyId)
    .maybeSingle();

  if (error) {
    return DEFAULT_ALERT_THRESHOLD_DAYS;
  }

  const raw = data?.alert_threshold_days;
  if (typeof raw === 'number' && raw > 0) {
    return Math.min(365, Math.floor(raw));
  }

  return DEFAULT_ALERT_THRESHOLD_DAYS;
}

async function fetchCompanyName(companyId: string): Promise<string | null> {
  const { data } = await supabase
    .from('companies')
    .select('name')
    .eq('id', companyId)
    .maybeSingle();

  const name = data?.name?.trim();
  return name || null;
}

export async function fetchDashboardStats(companyId: string): Promise<DashboardStats> {
  const [
    alertThresholdDays,
    companyName,
    brandsResult,
    branchesResult,
    staffResult,
    documentsResult,
  ] = await Promise.all([
    fetchAlertThresholdDays(companyId),
    fetchCompanyName(companyId),
    supabase
      .from('brands')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId),
    supabase
      .from('branches')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId),
    supabase
      .from('staff')
      .select('salary')
      .eq('company_id', companyId)
      .eq('status', 'active'),
    supabase
      .from('documents')
      .select('expiry_date, type')
      .eq('company_id', companyId)
      .not('expiry_date', 'is', null),
  ]);

  if (brandsResult.error) {
    throw new Error(brandsResult.error.message);
  }
  if (branchesResult.error) {
    throw new Error(branchesResult.error.message);
  }
  if (staffResult.error) {
    throw new Error(staffResult.error.message);
  }
  if (documentsResult.error) {
    throw new Error(documentsResult.error.message);
  }

  const activeStaff = staffResult.data ?? [];
  const totalPay = activeStaff.reduce(
    (sum, row) => sum + (typeof row.salary === 'number' ? row.salary : 0),
    0,
  );

  const documentCounts = countDocumentsByStatus(
    documentsResult.data ?? [],
    alertThresholdDays,
  );

  return {
    brandsCount: brandsResult.count ?? 0,
    branchesCount: branchesResult.count ?? 0,
    activeStaffCount: activeStaff.length,
    totalPay,
    validDocuments: documentCounts.valid,
    expiringSoon: documentCounts.expiringSoon,
    expired: documentCounts.expired,
    companyName,
    alertThresholdDays,
  };
}
