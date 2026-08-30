import { useMemo } from 'react';

import { useCompanyStaffQuery } from '@/src/hooks/queries/useCompanyStaffQuery';
import { getQueryScreenState } from '@/src/lib/queryScreenState';
import type { Branch, Brand, StaffMember } from '@/src/types/staff';

const EMPTY_BRANDS: Brand[] = [];
const EMPTY_BRANCHES: Branch[] = [];
const EMPTY_STAFF: StaffMember[] = [];

export function useCompanyStaffData(companyId: string | null | undefined) {
  const query = useCompanyStaffQuery(companyId);
  const { isInitialLoading, isRefreshing, errorMessage } = getQueryScreenState(query);
  const data = query.data;

  const brands = data?.brands ?? EMPTY_BRANDS;
  const branches = data?.branches ?? EMPTY_BRANCHES;
  const staff = data?.staff ?? EMPTY_STAFF;

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
    loading: isInitialLoading,
    refreshing: isRefreshing,
    error: companyId ? errorMessage : 'Company not found on your profile.',
    refresh: () => query.refetch(),
    retry: () => query.refetch(),
  };
}
