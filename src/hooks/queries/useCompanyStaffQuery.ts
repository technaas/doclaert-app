import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/src/context/AuthContext';
import { useAccessScope } from '@/src/hooks/useAccessScope';
import { queryKeys } from '@/src/lib/queryKeys';
import { canViewSalary } from '@/src/lib/permissions';
import { scopeStaffMembers } from '@/src/lib/scopeCompanyData';
import { fetchCompanyStaffData } from '@/src/services/staff';

export function useCompanyStaffQuery(companyId: string | null | undefined) {
  const { profile } = useAuth();
  const scope = useAccessScope();
  const includeSalary = canViewSalary(profile?.role);

  return useQuery({
    queryKey: queryKeys.staff(companyId ?? '', scope.cacheKey, includeSalary),
    queryFn: async () => {
      const data = await fetchCompanyStaffData(companyId!, { includeSalary });
      return {
        ...data,
        brands: scope.filterBrands(data.brands),
        branches: scope.filterBranches(data.branches),
        staff: scopeStaffMembers(data.staff, scope),
      };
    },
    enabled: Boolean(companyId) && scope.ready,
  });
}
