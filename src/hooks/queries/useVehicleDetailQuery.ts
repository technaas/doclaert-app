import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/src/lib/queryKeys';
import { fetchAlertThresholdDays } from '@/src/services/documents';
import { fetchVehicleById } from '@/src/services/vehicles';
import { fetchCompanyStaffData } from '@/src/services/staff';

export function useVehicleDetailQuery(
  companyId: string | undefined,
  vehicleId: string | undefined,
) {
  return useQuery({
    queryKey: queryKeys.vehicle(companyId ?? '', vehicleId ?? ''),
    queryFn: async () => {
      const [vehicle, lookups, alertThresholdDays] = await Promise.all([
        fetchVehicleById(companyId!, vehicleId!),
        fetchCompanyStaffData(companyId!),
        fetchAlertThresholdDays(companyId!),
      ]);

      return {
        vehicle,
        brands: lookups.brands,
        branches: lookups.branches,
        alertThresholdDays,
      };
    },
    enabled: Boolean(companyId && vehicleId),
  });
}
