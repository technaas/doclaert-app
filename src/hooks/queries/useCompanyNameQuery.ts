import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/src/lib/queryKeys';
import { fetchCompanyName } from '@/src/services/company';

export function useCompanyNameQuery(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.companyName(companyId ?? ''),
    queryFn: () => fetchCompanyName(companyId!),
    enabled: Boolean(companyId),
  });
}
