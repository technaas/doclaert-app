import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/src/context/AuthContext';
import {
  companyWideAccessScope,
  emptyAccessScope,
  makeAccessScope,
  type AccessScope,
} from '@/src/lib/accessScope';
import { queryKeys } from '@/src/lib/queryKeys';
import { fetchProfileAccessMappings } from '@/src/services/accessMappings';

export function useAccessScope(): AccessScope {
  const { profile, user } = useAuth();
  const userId = user?.id ?? profile?.id ?? null;
  const allBrands = profile?.access_all_brands !== false;
  const allBranches = profile?.access_all_branches !== false;
  const companyWide = allBrands && allBranches;

  const mappingsQuery = useQuery({
    queryKey: queryKeys.accessMappings(userId ?? ''),
    enabled: Boolean(userId) && Boolean(profile) && !companyWide,
    queryFn: () => fetchProfileAccessMappings(userId!),
  });

  if (!userId || !profile) return emptyAccessScope(false);
  if (companyWide) return companyWideAccessScope();
  if (mappingsQuery.isPending) return emptyAccessScope(false);
  if (mappingsQuery.isError || !mappingsQuery.data) {
    return makeAccessScope({
      ready: true,
      allBrands: false,
      allBranches,
      brandIds: new Set(),
      branchIds: new Set(),
    });
  }

  return makeAccessScope({
    ready: true,
    allBrands,
    allBranches,
    brandIds: new Set(mappingsQuery.data.brandIds),
    branchIds: new Set(mappingsQuery.data.branchIds),
  });
}
