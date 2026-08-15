import { useMemo } from 'react';

import { useVehicleDetailQuery } from '@/src/hooks/queries/useVehicleDetailQuery';
import { resolveDocumentFileUrl } from '@/src/lib/documentFile';
import { getQueryScreenState } from '@/src/lib/queryScreenState';

export function useVehicleDetailData(
  companyId: string | undefined,
  vehicleId: string | undefined,
) {
  const query = useVehicleDetailQuery(companyId, vehicleId);
  const { isInitialLoading, errorMessage } = getQueryScreenState(query);

  const vehicle = query.data?.vehicle ?? null;
  const thresholdDays = query.data?.alertThresholdDays ?? 30;

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

  const daftarFileUrl = resolveDocumentFileUrl(vehicle?.daftar_file_url);

  return {
    vehicle,
    brandName,
    branchName,
    daftarFileUrl,
    thresholdDays,
    loading: isInitialLoading,
    error: companyId ? errorMessage : 'Company not found on your profile.',
    retry: () => query.refetch(),
  };
}
