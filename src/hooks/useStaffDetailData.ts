import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/src/context/AuthContext';
import { useAccessScope } from '@/src/hooks/useAccessScope';
import { useCompanyStaffQuery } from '@/src/hooks/queries/useCompanyStaffQuery';
import { queryKeys } from '@/src/lib/queryKeys';
import { canViewSalary } from '@/src/lib/permissions';
import { getQueryScreenState } from '@/src/lib/queryScreenState';
import {
  fetchStaffDocuments,
  fetchStaffMember,
} from '@/src/services/staff';

export function useStaffDetailData(
  companyId: string | null | undefined,
  staffId: string,
) {
  const { profile } = useAuth();
  const scope = useAccessScope();
  const includeSalary = canViewSalary(profile?.role);
  const lookupsQuery = useCompanyStaffQuery(companyId);

  const memberQuery = useQuery({
    queryKey: queryKeys.staffMember(companyId ?? '', staffId, includeSalary),
    queryFn: () => fetchStaffMember(companyId!, staffId, { includeSalary }),
    enabled: Boolean(companyId) && scope.ready,
  });

  const documentsQuery = useQuery({
    queryKey: queryKeys.staffDocuments(companyId ?? '', staffId),
    queryFn: () => fetchStaffDocuments(companyId!, staffId),
    enabled: Boolean(companyId),
  });

  const lookupsState = getQueryScreenState(lookupsQuery);
  const memberState = getQueryScreenState(memberQuery);

  const isInitialLoading =
    (lookupsState.isInitialLoading || memberState.isInitialLoading) &&
    !memberQuery.data;
  const staff = memberQuery.data ?? null;
  const outOfScope =
    Boolean(staff) &&
    scope.ready &&
    !scope.canBranch(staff?.branch_id, staff?.brand_id);

  const errorMessage =
    !companyId
      ? 'Company not found.'
      : outOfScope
        ? 'Your role does not include this record.'
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
    staff: outOfScope ? null : staff,
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
