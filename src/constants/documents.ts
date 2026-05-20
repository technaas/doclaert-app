export const DOCUMENT_LABELS: Record<string, string> = {
  civil_id: 'Civil ID',
  passport: 'Passport',
  baladiya_medical: 'Baladiya Medical',
  insurance: 'Insurance',
  branch_license: 'Branch License',
  municipality_license: 'Municipality License',
  fire_safety: 'Fire Safety Certificate',
  civil_defense: 'Civil Defense Certificate',
  tenancy_contract: 'Tenancy Contract',
  paci_certificate: 'PACI Certificate',
  other: 'Other',
};

export function getDocumentLabel(key: string): string {
  return DOCUMENT_LABELS[key] ?? key;
}
