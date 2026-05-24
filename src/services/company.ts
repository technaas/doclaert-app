import { supabase } from '@/src/lib/supabase';
import type { CompanyProfile } from '@/src/types/company';

const COMPANY_PROFILE_FIELDS = [
  'name',
  'business_type',
  'country',
  'contact_person',
  'contact_number',
  'email',
] as const;

export async function fetchCompanyName(companyId: string): Promise<string | null> {
  const profile = await fetchCompanyProfile(companyId);
  return profile.name;
}

export async function fetchCompanyProfile(
  companyId: string,
): Promise<CompanyProfile> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', companyId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return {
      name: null,
      business_type: null,
      country: null,
      contact_person: null,
      contact_number: null,
      email: null,
    };
  }

  const row = data as Record<string, unknown>;

  const readField = (key: (typeof COMPANY_PROFILE_FIELDS)[number]): string | null => {
    const value = row[key];
    return typeof value === 'string' ? value.trim() || null : null;
  };

  return {
    name: readField('name'),
    business_type: readField('business_type'),
    country: readField('country'),
    contact_person: readField('contact_person'),
    contact_number: readField('contact_number'),
    email: readField('email'),
  };
}
