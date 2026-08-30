export const PASSPORT_CUSTODY_LABEL = {
  with_staff: 'Passport with Staff',
  with_company: 'Passport with Company',
} as const;

export type PassportCustody = keyof typeof PASSPORT_CUSTODY_LABEL;

export function displayPassportCustody(value: string | null | undefined): string {
  if (value === 'with_staff' || value === 'with_company') {
    return PASSPORT_CUSTODY_LABEL[value];
  }
  return 'Not specified';
}
