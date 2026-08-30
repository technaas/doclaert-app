import { useMemo } from 'react';

import { useCompanyVehiclesQuery } from '@/src/hooks/queries/useCompanyVehiclesQuery';
import { getQueryScreenState } from '@/src/lib/queryScreenState';
import type { Branch, Brand } from '@/src/types/staff';
import type { VehicleRecord } from '@/src/types/vehicles';

const EMPTY_VEHICLES: VehicleRecord[] = [];
const EMPTY_BRANDS: Brand[] = [];
const EMPTY_BRANCHES: Branch[] = [];

export function useCompanyVehiclesData(companyId: string | null | undefined) {
  const query = useCompanyVehiclesQuery(companyId);
  const { isInitialLoading, isRefreshing, errorMessage } = getQueryScreenState(query);
  const data = query.data;

  const branchById = useMemo(() => {
    const map = new Map<string, Branch>();
    (data?.branches ?? EMPTY_BRANCHES).forEach((b) => map.set(b.id, b));
    return map;
  }, [data?.branches]);

  const brandById = useMemo(() => {
    const map = new Map<string, Brand>();
    (data?.brands ?? EMPTY_BRANDS).forEach((b) => map.set(b.id, b));
    return map;
  }, [data?.brands]);

  return {
    vehicles: data?.vehicles ?? EMPTY_VEHICLES,
    brands: data?.brands ?? EMPTY_BRANDS,
    branches: data?.branches ?? EMPTY_BRANCHES,
    branchById,
    brandById,
    loading: isInitialLoading,
    refreshing: isRefreshing,
    error: companyId ? errorMessage : 'Company not found on your profile.',
    refresh: () => query.refetch(),
    retry: () => query.refetch(),
  };
}
