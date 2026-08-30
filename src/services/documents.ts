import { supabase } from '@/src/lib/supabase';
import {
  DOCUMENT_DETAIL_COLUMNS,
  DOCUMENT_LIST_COLUMNS,
  DOCUMENT_LIST_COLUMNS_LEGACY,
  isMissingColumnError,
  queryCompanyDocuments,
  withExpiryStatusFallback,
} from '@/src/services/documentSelect';
import { fetchCompanyVehicles } from '@/src/services/vehicles';
import type { DocumentRecord } from '@/src/types/documents';
import type { Branch, Brand, StaffMember } from '@/src/types/staff';
import type { VehicleRecord } from '@/src/types/vehicles';
import { fetchCompanyStaffData } from '@/src/services/staff';

const DEFAULT_ALERT_THRESHOLD_DAYS = 30;

function normalizeFileUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function mapDocumentRecord(row: Record<string, unknown>): DocumentRecord {
  return {
    id: String(row.id),
    type: row.type as DocumentRecord['type'],
    staff_id: (row.staff_id as string | null) ?? null,
    branch_id: (row.branch_id as string | null) ?? null,
    document_name: String(row.document_name ?? ''),
    expiry_date: (row.expiry_date as string | null) ?? null,
    expiry_status: (row.expiry_status as string | null) ?? null,
    file_url: normalizeFileUrl(row.file_url),
    status: (row.status as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
  };
}

export type CompanyDocumentsData = {
  documents: DocumentRecord[];
  vehicles: VehicleRecord[];
  brands: Brand[];
  branches: Branch[];
  staff: StaffMember[];
};

/** Reminder-notification threshold only. Do not use for UI/document status. */
export async function fetchAlertThresholdDays(companyId: string): Promise<number> {
  const { data, error } = await supabase
    .from('email_notification_settings')
    .select('alert_threshold_days')
    .eq('company_id', companyId)
    .maybeSingle();

  if (error) return DEFAULT_ALERT_THRESHOLD_DAYS;

  const raw = data?.alert_threshold_days;
  if (typeof raw === 'number' && raw > 0) {
    return Math.min(365, Math.floor(raw));
  }

  return DEFAULT_ALERT_THRESHOLD_DAYS;
}

export async function fetchCompanyDocumentsData(
  companyId: string,
): Promise<CompanyDocumentsData> {
  const [lookups, documentsResult, vehicles] = await Promise.all([
    fetchCompanyStaffData(companyId),
    queryCompanyDocuments(companyId),
    fetchCompanyVehicles(companyId),
  ]);

  if (documentsResult.error) {
    throw new Error(documentsResult.error.message);
  }

  const documents = (documentsResult.data ?? []).map((row) =>
    mapDocumentRecord(row as Record<string, unknown>),
  );

  return {
    documents,
    vehicles,
    brands: lookups.brands,
    branches: lookups.branches,
    staff: lookups.staff,
  };
}

async function fetchDocumentRow(companyId: string, documentId: string) {
  const withNotes = await withExpiryStatusFallback(
    supabase
      .from('documents')
      .select(DOCUMENT_DETAIL_COLUMNS)
      .eq('company_id', companyId)
      .eq('id', documentId)
      .maybeSingle(),
    () =>
      supabase
        .from('documents')
        .select(`${DOCUMENT_LIST_COLUMNS_LEGACY},notes`)
        .eq('company_id', companyId)
        .eq('id', documentId)
        .maybeSingle(),
  );

  if (!withNotes.error) {
    return withNotes;
  }

  if (isMissingColumnError(withNotes.error.message, 'notes')) {
    return withExpiryStatusFallback(
      supabase
        .from('documents')
        .select(DOCUMENT_LIST_COLUMNS)
        .eq('company_id', companyId)
        .eq('id', documentId)
        .maybeSingle(),
      () =>
        supabase
          .from('documents')
          .select(DOCUMENT_LIST_COLUMNS_LEGACY)
          .eq('company_id', companyId)
          .eq('id', documentId)
          .maybeSingle(),
    );
  }

  return withNotes;
}

export async function fetchDocumentById(
  companyId: string,
  documentId: string,
): Promise<DocumentRecord | null> {
  const { data, error } = await fetchDocumentRow(companyId, documentId);

  if (error) throw new Error(error.message);
  if (!data) return null;

  return mapDocumentRecord(data as Record<string, unknown>);
}
