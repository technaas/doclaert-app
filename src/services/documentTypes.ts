import { supabase } from '@/src/lib/supabase';
import {
  mergeMissingStaffDocumentTypes,
  type DocumentTypeRecord,
} from '@/src/lib/documentTypes';

export async function fetchCompanyDocumentTypes(
  companyId: string,
): Promise<DocumentTypeRecord[]> {
  const { data, error } = await supabase
    .from('document_types')
    .select('id, company_id, category, slug, name, is_active, is_required, sort_order')
    .eq('company_id', companyId)
    .order('sort_order', { ascending: true });

  if (error) {
    return mergeMissingStaffDocumentTypes([], companyId);
  }

  return mergeMissingStaffDocumentTypes((data ?? []) as DocumentTypeRecord[], companyId);
}
