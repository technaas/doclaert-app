import { useMemo } from 'react';

import { useCompanyDocumentsQuery } from '@/src/hooks/queries/useCompanyDocumentsQuery';
import { getQueryScreenState } from '@/src/lib/queryScreenState';
import type { DocumentRecord } from '@/src/types/documents';
import type { Branch, Brand, StaffMember } from '@/src/types/staff';

const EMPTY_DOCS: DocumentRecord[] = [];
const EMPTY_BRANDS: Brand[] = [];
const EMPTY_BRANCHES: Branch[] = [];
const EMPTY_STAFF: StaffMember[] = [];

export function useDocumentsData(companyId: string | undefined) {
  const query = useCompanyDocumentsQuery(companyId);
  const { isInitialLoading, isRefreshing, errorMessage } = getQueryScreenState(query);
  const data = query.data;

  const staffById = useMemo(() => {
    const map = new Map<string, StaffMember>();
    (data?.staff ?? EMPTY_STAFF).forEach((s) => map.set(s.id, s));
    return map;
  }, [data?.staff]);

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
    documents: data?.documents ?? EMPTY_DOCS,
    brands: data?.brands ?? EMPTY_BRANDS,
    branches: data?.branches ?? EMPTY_BRANCHES,
    staffById,
    branchById,
    brandById,
    alertThresholdDays: data?.alertThresholdDays ?? 30,
    loading: isInitialLoading,
    refreshing: isRefreshing,
    error: companyId ? errorMessage : 'Company not found on your profile.',
    refresh: () => query.refetch(),
    retry: () => query.refetch(),
  };
}
