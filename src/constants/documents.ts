export { getDocumentLabel } from '@/src/lib/documentTypes';

/** Legacy fallbacks kept for callers that still import DOCUMENT_LABELS. */
export const DOCUMENT_LABELS: Record<string, string> = {
  civil_id: 'Civil ID',
  passport: 'Passport',
  baladiya_medical: 'Baladiya Medical',
  work_permit: 'Work Permit',
  insurance: 'Insurance (Optional)',
  daftar: 'Vehicle Daftar',
  vehicle_daftar: 'Vehicle Daftar',
};
