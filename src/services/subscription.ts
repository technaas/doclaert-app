import { supabase } from '@/src/lib/supabase';
import type { SubscriptionRecord } from '@/src/lib/subscription';

export async function fetchCompanySubscription(
  companyId: string,
): Promise<SubscriptionRecord | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('status,end_date')
    .eq('company_id', companyId)
    .order('end_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as SubscriptionRecord | null) ?? null;
}
