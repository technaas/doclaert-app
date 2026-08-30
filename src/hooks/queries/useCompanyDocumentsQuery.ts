import { useQuery } from '@tanstack/react-query';

import { useAccessScope } from '@/src/hooks/useAccessScope';
import { queryKeys } from '@/src/lib/queryKeys';
import { scopeDocuments, scopeStaffMembers, scopeVehicles } from '@/src/lib/scopeCompanyData';
import { fetchCompanyDocumentsData } from '@/src/services/documents';

export function useCompanyDocumentsQuery(companyId: string | null | undefined) {
  const scope = useAccessScope();

  return useQuery({
    queryKey: queryKeys.documents(companyId ?? '', scope.cacheKey),
    queryFn: async () => {
      const data = await fetchCompanyDocumentsData(companyId!);
      const staff = scopeStaffMembers(data.staff, scope);
      const branches = scope.filterBranches(data.branches);
      return {
        ...data,
        brands: scope.filterBrands(data.brands),
        branches,
        staff,
        documents: scopeDocuments(data.documents, scope, data.staff, data.branches),
        vehicles: scopeVehicles(data.vehicles, scope),
      };
    },
    enabled: Boolean(companyId) && scope.ready,
  });
}
