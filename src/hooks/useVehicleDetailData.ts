import { useMemo } from 'react';

import { useVehicleDetailQuery } from '@/src/hooks/queries/useVehicleDetailQuery';
import { getQueryScreenState } from '@/src/lib/queryScreenState';

export function useVehicleDetailData(
  companyId: string | null | undefined,
  vehicleId: string | undefined,
) {
  const query = useVehicleDetailQuery(companyId, vehicleId);
  const { isInitialLoading, errorMessage } = getQueryScreenState(query);

  const vehicle = query.data?.vehicle ?? null;

  const brandName = useMemo(() => {
    if (!vehicle || !query.data) return '—';
    const { brands, branches } = query.data;
    const branch = branches.find((b) => b.id === vehicle.branch_id);
    const brandId = branch?.brand_id ?? vehicle.brand_id;
    return brands.find((b) => b.id === brandId)?.name ?? '—';
  }, [vehicle, query.data]);

  const branchName = useMemo(() => {
    if (!vehicle || !query.data) return '—';
    return query.data.branches.find((b) => b.id === vehicle.branch_id)?.name ?? '—';
  }, [vehicle, query.data]);

  return {
    vehicle,
    brandName,
    branchName,
    daftarFileUrl: vehicle?.daftar_file_url ?? null,
    driverCivilIdFileUrl: vehicle?.driver_civil_id_file_url ?? null,
    loading: isInitialLoading,
    error: companyId ? errorMessage : 'Company not found on your profile.',
    retry: () => query.refetch(),
  };
}
