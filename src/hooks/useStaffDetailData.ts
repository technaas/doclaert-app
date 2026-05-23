import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useCompanyStaffQuery } from '@/src/hooks/queries/useCompanyStaffQuery';
import { queryKeys } from '@/src/lib/queryKeys';
import { getQueryScreenState } from '@/src/lib/queryScreenState';
import {
  fetchStaffDocuments,
  fetchStaffMember,
} from '@/src/services/staff';

export function useStaffDetailData(
  companyId: string | undefined,
  staffId: string,
) {
  const lookupsQuery = useCompanyStaffQuery(companyId);

  const memberQuery = useQuery({
    queryKey: queryKeys.staffMember(companyId ?? '', staffId),
    queryFn: () => fetchStaffMember(companyId!, staffId),
    enabled: Boolean(companyId),
  });

  const documentsQuery = useQuery({
    queryKey: queryKeys.staffDocuments(companyId ?? '', staffId),
    queryFn: () => fetchStaffDocuments(companyId!, staffId),
    enabled: Boolean(companyId),
  });

  const lookupsState = getQueryScreenState(lookupsQuery);
  const memberState = getQueryScreenState(memberQuery);
  const docsState = getQueryScreenState(documentsQuery);

  const isInitialLoading =
    (lookupsState.isInitialLoading || memberState.isInitialLoading) &&
    !memberQuery.data;
  const errorMessage =
    !companyId
      ? 'Company not found.'
      : memberQuery.data === null && !memberState.isInitialLoading && !memberQuery.isError
        ? 'Staff member not found.'
        : memberQuery.error?.message ??
          lookupsQuery.error?.message ??
          documentsQuery.error?.message ??
          null;

  const brandMap = useMemo(() => {
    const map = new Map<string, string>();
    lookupsQuery.data?.brands.forEach((b) => map.set(b.id, b.name));
    return map;
  }, [lookupsQuery.data?.brands]);

  const branchMap = useMemo(() => {
    const map = new Map<string, string>();
    lookupsQuery.data?.branches.forEach((b) => map.set(b.id, b.name));
    return map;
  }, [lookupsQuery.data?.branches]);

  const branchToBrandId = useMemo(() => {
    const map = new Map<string, string>();
    lookupsQuery.data?.branches.forEach((b) => map.set(b.id, b.brand_id));
    return map;
  }, [lookupsQuery.data?.branches]);

  return {
    staff: memberQuery.data ?? null,
    documents: documentsQuery.data ?? [],
    brandMap,
    branchMap,
    branchToBrandId,
    loading: isInitialLoading,
    error: errorMessage,
    retry: () =>
      Promise.all([
        lookupsQuery.refetch(),
        memberQuery.refetch(),
        documentsQuery.refetch(),
      ]),
  };
}
