import { supabase } from '@/src/lib/supabase';
import type { DocumentRecord } from '@/src/types/documents';
import type { Branch, Brand, StaffMember } from '@/src/types/staff';
import { fetchCompanyStaffData } from '@/src/services/staff';

const DEFAULT_ALERT_THRESHOLD_DAYS = 30;

const DOCUMENT_COLUMNS =
  'id,type,staff_id,branch_id,document_name,expiry_date,file_url,status';

const DOCUMENT_DETAIL_COLUMNS = `${DOCUMENT_COLUMNS},notes`;

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
    file_url: normalizeFileUrl(row.file_url),
    status: (row.status as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
  };
}

export type CompanyDocumentsData = {
  documents: DocumentRecord[];
  brands: Brand[];
  branches: Branch[];
  staff: StaffMember[];
  alertThresholdDays: number;
};

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
  const [lookups, documentsResult, alertThresholdDays] = await Promise.all([
    fetchCompanyStaffData(companyId),
    supabase.from('documents').select(DOCUMENT_COLUMNS).eq('company_id', companyId),
    fetchAlertThresholdDays(companyId),
  ]);

  if (documentsResult.error) {
    throw new Error(documentsResult.error.message);
  }

  const documents = (documentsResult.data ?? []).map((row) =>
    mapDocumentRecord(row as Record<string, unknown>),
  );

  return {
    documents,
    brands: lookups.brands,
    branches: lookups.branches,
    staff: lookups.staff,
    alertThresholdDays,
  };
}

async function fetchDocumentRow(companyId: string, documentId: string) {
  const withNotes = await supabase
    .from('documents')
    .select(DOCUMENT_DETAIL_COLUMNS)
    .eq('company_id', companyId)
    .eq('id', documentId)
    .maybeSingle();

  if (!withNotes.error) {
    return withNotes;
  }

  if (withNotes.error.message.includes('notes')) {
    return supabase
      .from('documents')
      .select(DOCUMENT_COLUMNS)
      .eq('company_id', companyId)
      .eq('id', documentId)
      .maybeSingle();
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

export function getDocumentFileUrl(document: DocumentRecord | null | undefined): string | null {
  return document?.file_url ?? null;
}
