export type DocumentTypeCategory = 'staff' | 'branch' | 'vehicle';

export type DocumentTypeRecord = {
  id: string;
  company_id: string;
  category: DocumentTypeCategory;
  slug: string;
  name: string;
  is_active: boolean;
  is_required: boolean;
  sort_order?: number | null;
};

export const DEFAULT_STAFF_DOCUMENT_TYPES: Omit<
  DocumentTypeRecord,
  'id' | 'company_id'
>[] = [
  { category: 'staff', slug: 'civil_id', name: 'Civil ID', is_active: true, is_required: false, sort_order: 10 },
  { category: 'staff', slug: 'passport', name: 'Passport', is_active: true, is_required: false, sort_order: 20 },
  { category: 'staff', slug: 'baladiya_medical', name: 'Baladiya Medical', is_active: true, is_required: false, sort_order: 30 },
  { category: 'staff', slug: 'work_permit', name: 'Work Permit', is_active: true, is_required: true, sort_order: 40 },
  { category: 'staff', slug: 'insurance', name: 'Insurance (Optional)', is_active: true, is_required: false, sort_order: 900 },
];

export const DEFAULT_BRANCH_DOCUMENT_TYPES: Omit<
  DocumentTypeRecord,
  'id' | 'company_id'
>[] = [
  { category: 'branch', slug: 'commercial_license', name: 'Commercial License', is_active: true, is_required: false },
  { category: 'branch', slug: 'commercial_license_regulatory_approvals_annex', name: 'Commercial License – Regulatory Approvals Annex', is_active: true, is_required: false },
  { category: 'branch', slug: 'trademark_registration_certificate', name: 'TradeMark Registration Certificate', is_active: true, is_required: false },
  { category: 'branch', slug: 'food_nutrition_license', name: 'Food & Nutrition License', is_active: true, is_required: false },
  { category: 'branch', slug: 'food_nutrition_inspection_report', name: 'Food & Nutrition Inspection Report', is_active: true, is_required: false },
  { category: 'branch', slug: 'signboard_license', name: 'Signboard License', is_active: true, is_required: false },
  { category: 'branch', slug: 'waste_oil_collection_agreement', name: 'Waste Oil Collection Agreement', is_active: true, is_required: false },
  { category: 'branch', slug: 'fire_safety_license', name: 'Fire Safety License', is_active: true, is_required: false },
  { category: 'branch', slug: 'fire_extinguisher_license_renewal_payment_receipt', name: 'Fire Extinguisher License Renewal – Payment Receipt', is_active: true, is_required: false },
  { category: 'branch', slug: 'attendance_working_hours_regulation', name: 'Attendance/Working Hours Regulation', is_active: true, is_required: false },
  { category: 'branch', slug: 'working_hours_regulation_wagt_al_shai', name: 'Working Hours Regulation – Wagt Al Shai', is_active: true, is_required: false },
  { category: 'branch', slug: 'work_injury_insurance_certificate', name: 'Work Injury Insurance Certificate', is_active: true, is_required: false },
  { category: 'branch', slug: 'employer_insurance_guarantee_certificate', name: 'Employer Insurance/Guarantee Certificate', is_active: true, is_required: false },
  { category: 'branch', slug: 'schedule_of_penalties', name: 'Schedule of Penalties', is_active: true, is_required: false },
];

export const DEFAULT_VEHICLE_DOCUMENT_TYPES: Omit<
  DocumentTypeRecord,
  'id' | 'company_id'
>[] = [{ category: 'vehicle', slug: 'daftar', name: 'Vehicle Daftar', is_active: true, is_required: true }];

const STAFF_SLUG_ORDER = ['civil_id', 'passport', 'baladiya_medical', 'work_permit'] as const;

const FALLBACK_LABELS: Record<string, string> = {
  civil_id: 'Civil ID',
  passport: 'Passport',
  baladiya_medical: 'Baladiya Medical',
  work_permit: 'Work Permit',
  insurance: 'Insurance (Optional)',
  daftar: 'Vehicle Daftar',
  vehicle_daftar: 'Vehicle Daftar',
};

let runtimeLabels: Record<string, string> = {};

export function setRuntimeDocumentTypeLabels(map: Record<string, string>): void {
  runtimeLabels = map;
}

export function humanizeDocumentSlug(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function staffDocumentTypeDisplayName(slug: string, name: string): string {
  if (slug === 'insurance' && !/optional/i.test(name)) return 'Insurance (Optional)';
  return name.trim() || humanizeDocumentSlug(slug);
}

function staffTypeSortKey(row: {
  category: string;
  slug: string;
  sort_order?: number | null;
}): number {
  if (row.category === 'staff') {
    if (row.slug === 'insurance') return 900;
    const i = STAFF_SLUG_ORDER.indexOf(row.slug as (typeof STAFF_SLUG_ORDER)[number]);
    if (i !== -1) return (i + 1) * 10;
  }
  if (typeof row.sort_order === 'number') return row.sort_order;
  return 100;
}

export function sortDocumentTypes<
  T extends { category: string; slug: string; name: string; sort_order?: number | null },
>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const d = staffTypeSortKey(a) - staffTypeSortKey(b);
    if (d !== 0) return d;
    return a.name.localeCompare(b.name);
  });
}

export function mergeMissingStaffDocumentTypes(
  rows: DocumentTypeRecord[],
  companyId = '',
): DocumentTypeRecord[] {
  const have = new Set(rows.filter((r) => r.category === 'staff').map((r) => r.slug));
  const extras: DocumentTypeRecord[] = [];
  for (const d of DEFAULT_STAFF_DOCUMENT_TYPES) {
    if (have.has(d.slug)) continue;
    extras.push({
      id: `virtual-staff-${d.slug}`,
      company_id: companyId,
      ...d,
    });
  }
  return [...rows, ...extras];
}

export function buildDocumentTypeLabelMap(rows: DocumentTypeRecord[]): Record<string, string> {
  const map: Record<string, string> = { ...FALLBACK_LABELS };
  for (const d of DEFAULT_STAFF_DOCUMENT_TYPES) {
    map[d.slug] = d.name;
  }
  for (const d of DEFAULT_BRANCH_DOCUMENT_TYPES) {
    map[d.slug] = d.name;
  }
  for (const d of DEFAULT_VEHICLE_DOCUMENT_TYPES) {
    map[d.slug] = d.name;
  }
  for (const r of rows) {
    map[r.slug] = staffDocumentTypeDisplayName(r.slug, r.name);
  }
  return map;
}

export function getDocumentLabel(slug: string | null | undefined): string {
  const key = (slug ?? '').trim();
  if (!key) return 'Document';
  return (
    runtimeLabels[key] ??
    FALLBACK_LABELS[key] ??
    humanizeDocumentSlug(key)
  );
}

export function documentTypeSortValue(
  slug: string,
  types: DocumentTypeRecord[],
): number {
  const match = types.find((t) => t.slug === slug);
  if (match) return staffTypeSortKey(match);
  return staffTypeSortKey({ category: 'staff', slug, sort_order: null });
}
