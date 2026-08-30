import { supabase } from '@/src/lib/supabase';

export const DOCUMENT_LIST_COLUMNS =
  'id,type,staff_id,branch_id,document_name,expiry_date,expiry_status,file_url,status';

export const DOCUMENT_LIST_COLUMNS_LEGACY =
  'id,type,staff_id,branch_id,document_name,expiry_date,file_url,status';

export const DOCUMENT_DETAIL_COLUMNS = `${DOCUMENT_LIST_COLUMNS},notes`;

export const DASHBOARD_DOCUMENT_COLUMNS =
  'id, type, staff_id, branch_id, document_name, expiry_date, expiry_status, file_url';

export const DASHBOARD_DOCUMENT_COLUMNS_LEGACY =
  'id, type, staff_id, branch_id, document_name, expiry_date, file_url';

export const STAFF_DOCUMENT_COLUMNS =
  'id,document_name,expiry_date,expiry_status,status,file_url';

export const STAFF_DOCUMENT_COLUMNS_LEGACY =
  'id,document_name,expiry_date,status,file_url';

export function isMissingColumnError(message: string | undefined, column: string): boolean {
  return (message ?? '').includes(column);
}

export async function withExpiryStatusFallback<T extends { error: { message: string } | null }>(
  primary: PromiseLike<T>,
  fallback: () => PromiseLike<T>,
): Promise<T> {
  const first = await primary;
  if (first.error && isMissingColumnError(first.error.message, 'expiry_status')) {
    return fallback();
  }
  return first;
}

export function queryCompanyDocuments(companyId: string) {
  return withExpiryStatusFallback(
    supabase.from('documents').select(DOCUMENT_LIST_COLUMNS).eq('company_id', companyId),
    () =>
      supabase
        .from('documents')
        .select(DOCUMENT_LIST_COLUMNS_LEGACY)
        .eq('company_id', companyId),
  );
}

export function queryDashboardDocuments(companyId: string) {
  return withExpiryStatusFallback(
    supabase.from('documents').select(DASHBOARD_DOCUMENT_COLUMNS).eq('company_id', companyId),
    () =>
      supabase
        .from('documents')
        .select(DASHBOARD_DOCUMENT_COLUMNS_LEGACY)
        .eq('company_id', companyId),
  );
}

export function queryStaffDocuments(companyId: string, staffId: string) {
  return withExpiryStatusFallback(
    supabase
      .from('documents')
      .select(STAFF_DOCUMENT_COLUMNS)
      .eq('company_id', companyId)
      .eq('type', 'staff')
      .eq('staff_id', staffId)
      .order('expiry_date', { ascending: true }),
    () =>
      supabase
        .from('documents')
        .select(STAFF_DOCUMENT_COLUMNS_LEGACY)
        .eq('company_id', companyId)
        .eq('type', 'staff')
        .eq('staff_id', staffId)
        .order('expiry_date', { ascending: true }),
  );
}
