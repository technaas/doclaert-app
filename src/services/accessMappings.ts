import { supabase } from '@/src/lib/supabase';

export async function fetchProfileAccessMappings(userId: string): Promise<{
  brandIds: string[];
  branchIds: string[];
}> {
  const [{ data: brands, error: brandError }, { data: branches, error: branchError }] =
    await Promise.all([
      supabase.from('profile_brand_access').select('brand_id').eq('user_id', userId),
      supabase.from('profile_branch_access').select('branch_id').eq('user_id', userId),
    ]);

  if (brandError) throw new Error(brandError.message);
  if (branchError) throw new Error(branchError.message);

  return {
    brandIds: (brands ?? []).map((row) => String(row.brand_id)),
    branchIds: (branches ?? []).map((row) => String(row.branch_id)),
  };
}
