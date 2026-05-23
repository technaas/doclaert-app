import { supabase } from '@/src/lib/supabase';

export async function fetchCompanyName(companyId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('companies')
    .select('name')
    .eq('id', companyId)
    .maybeSingle();

  if (error) {
    return null;
  }

  const name = data?.name?.trim();
  return name || null;
}
