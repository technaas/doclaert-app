export const VISA_WORKING_TYPE_LABEL = {
  same_company: 'Visa under same company',
  different_company: 'Visa under different company',
} as const;

export type VisaWorkingType = keyof typeof VISA_WORKING_TYPE_LABEL;

export function isVisaWorkingType(value: string | null | undefined): value is VisaWorkingType {
  return value === 'same_company' || value === 'different_company';
}

export function normalizeVisaWorkingType(
  value: string | null | undefined,
  legacyStaffType?: string | null,
): VisaWorkingType {
  if (isVisaWorkingType(value)) return value;
  if (legacyStaffType === 'Part Time' || legacyStaffType === 'Both') {
    return 'different_company';
  }
  return 'same_company';
}

export function displayVisaWorkingType(
  value: string | null | undefined,
  legacyStaffType?: string | null,
): string {
  return VISA_WORKING_TYPE_LABEL[normalizeVisaWorkingType(value, legacyStaffType)];
}

export function isDifferentCompanyVisa(
  value: string | null | undefined,
  legacyStaffType?: string | null,
): boolean {
  return normalizeVisaWorkingType(value, legacyStaffType) === 'different_company';
}
