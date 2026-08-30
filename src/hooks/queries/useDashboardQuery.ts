import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/src/context/AuthContext';
import { useAccessScope } from '@/src/hooks/useAccessScope';
import { queryKeys } from '@/src/lib/queryKeys';
import { canViewSalary } from '@/src/lib/permissions';
import { fetchDashboardStats } from '@/src/services/dashboard';

export function useDashboardQuery(companyId: string | null | undefined) {
  const { profile } = useAuth();
  const scope = useAccessScope();
  const includeSalary = canViewSalary(profile?.role);

  return useQuery({
    queryKey: queryKeys.dashboard(companyId ?? '', scope.cacheKey, includeSalary),
    queryFn: () => fetchDashboardStats(companyId!, { scope, includeSalary }),
    enabled: Boolean(companyId) && scope.ready,
  });
}
