import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/src/lib/queryKeys';
import { fetchDashboardStats } from '@/src/services/dashboard';

export function useDashboardQuery(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.dashboard(companyId ?? ''),
    queryFn: () => fetchDashboardStats(companyId!),
    enabled: Boolean(companyId),
  });
}
