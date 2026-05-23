import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/src/lib/queryKeys';
import { fetchCompanyOrgData } from '@/src/services/orgData';

export function useCompanyOrgQuery(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.org(companyId ?? ''),
    queryFn: () => fetchCompanyOrgData(companyId!),
    enabled: Boolean(companyId),
  });
}
