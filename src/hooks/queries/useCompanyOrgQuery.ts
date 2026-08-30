import { useQuery } from '@tanstack/react-query';

import { useAccessScope } from '@/src/hooks/useAccessScope';
import { queryKeys } from '@/src/lib/queryKeys';
import { scopeDocuments, scopeStaffMembers } from '@/src/lib/scopeCompanyData';
import { fetchCompanyOrgData } from '@/src/services/orgData';

export function useCompanyOrgQuery(companyId: string | null | undefined) {
  const scope = useAccessScope();

  return useQuery({
    queryKey: queryKeys.org(companyId ?? '', scope.cacheKey),
    queryFn: async () => {
      const data = await fetchCompanyOrgData(companyId!);
      const staff = scopeStaffMembers(data.staff, scope);
      const branches = scope.filterBranches(data.branches);
      return {
        ...data,
        brands: scope.filterBrands(data.brands),
        branches,
        staff,
        documents: scopeDocuments(data.documents, scope, data.staff, data.branches),
      };
    },
    enabled: Boolean(companyId) && scope.ready,
  });
}
