import { useQuery } from '@tanstack/react-query';

import { useAccessScope } from '@/src/hooks/useAccessScope';
import { queryKeys } from '@/src/lib/queryKeys';
import { scopeVehicles } from '@/src/lib/scopeCompanyData';
import { fetchCompanyVehiclesData } from '@/src/services/vehicles';

export function useCompanyVehiclesQuery(companyId: string | null | undefined) {
  const scope = useAccessScope();

  return useQuery({
    queryKey: queryKeys.vehicles(companyId ?? '', scope.cacheKey),
    queryFn: async () => {
      const data = await fetchCompanyVehiclesData(companyId!);
      return {
        ...data,
        brands: scope.filterBrands(data.brands),
        branches: scope.filterBranches(data.branches),
        vehicles: scopeVehicles(data.vehicles, scope),
      };
    },
    enabled: Boolean(companyId) && scope.ready,
  });
}
