import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/src/lib/queryKeys';
import { isSubscriptionAllowed, type SubscriptionRecord } from '@/src/lib/subscription';
import { fetchCompanySubscription } from '@/src/services/subscription';

export function useSubscriptionGate(companyId: string | null | undefined, enabled: boolean) {
  const query = useQuery({
    queryKey: queryKeys.subscription(companyId ?? ''),
    queryFn: () => fetchCompanySubscription(companyId!),
    enabled: enabled && Boolean(companyId),
  });

  const subscription: SubscriptionRecord | null = query.data ?? null;
  const allowed = isSubscriptionAllowed(subscription);

  return {
    loading: enabled && Boolean(companyId) && query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    subscription,
    allowed,
    retry: () => query.refetch(),
  };
}
