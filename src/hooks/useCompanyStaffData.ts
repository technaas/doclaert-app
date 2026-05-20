import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchCompanyStaffData } from '@/src/services/staff';
import type { Branch, Brand, StaffMember } from '@/src/types/staff';

export function useCompanyStaffData(companyId: string | undefined) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!companyId) {
        setError('Company not found on your profile.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await fetchCompanyStaffData(companyId);
        setBrands(data.brands);
        setBranches(data.branches);
        setStaff(data.staff);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load staff data. Please try again.';
        setError(message);
        if (!isRefresh) {
          setBrands([]);
          setBranches([]);
          setStaff([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [companyId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const brandMap = useMemo(() => {
    const map = new Map<string, string>();
    brands.forEach((b) => map.set(b.id, b.name));
    return map;
  }, [brands]);

  const branchMap = useMemo(() => {
    const map = new Map<string, string>();
    branches.forEach((b) => map.set(b.id, b.name));
    return map;
  }, [branches]);

  const branchToBrandId = useMemo(() => {
    const map = new Map<string, string>();
    branches.forEach((b) => map.set(b.id, b.brand_id));
    return map;
  }, [branches]);

  const roles = useMemo(() => {
    const set = new Set<string>();
    staff.forEach((s) => {
      if (s.role?.trim()) set.add(s.role.trim());
    });
    return Array.from(set).sort();
  }, [staff]);

  return {
    brands,
    branches,
    staff,
    brandMap,
    branchMap,
    branchToBrandId,
    roles,
    loading,
    refreshing,
    error,
    refresh: () => load(true),
    retry: () => load(false),
  };
}
