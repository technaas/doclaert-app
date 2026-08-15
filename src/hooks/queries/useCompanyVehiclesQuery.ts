import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/src/lib/queryKeys';
import { fetchCompanyVehiclesData } from '@/src/services/vehicles';

export function useCompanyVehiclesQuery(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.vehicles(companyId ?? ''),
    queryFn: () => fetchCompanyVehiclesData(companyId!),
    enabled: Boolean(companyId),
  });
}
