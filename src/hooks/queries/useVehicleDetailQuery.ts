import { useQuery } from '@tanstack/react-query';

import { useAccessScope } from '@/src/hooks/useAccessScope';
import { queryKeys } from '@/src/lib/queryKeys';
import { fetchVehicleById } from '@/src/services/vehicles';
import { fetchCompanyStaffData } from '@/src/services/staff';

export function useVehicleDetailQuery(
  companyId: string | null | undefined,
  vehicleId: string | undefined,
) {
  const scope = useAccessScope();

  return useQuery({
    queryKey: queryKeys.vehicle(companyId ?? '', vehicleId ?? '', scope.cacheKey),
    queryFn: async () => {
      const [vehicle, lookups] = await Promise.all([
        fetchVehicleById(companyId!, vehicleId!),
        fetchCompanyStaffData(companyId!),
      ]);

      if (
        vehicle &&
        !scope.canBranch(vehicle.branch_id, vehicle.brand_id)
      ) {
        return { vehicle: null, brands: lookups.brands, branches: lookups.branches };
      }

      return {
        vehicle,
        brands: scope.filterBrands(lookups.brands),
        branches: scope.filterBranches(lookups.branches),
      };
    },
    enabled: Boolean(companyId && vehicleId) && scope.ready,
  });
}
