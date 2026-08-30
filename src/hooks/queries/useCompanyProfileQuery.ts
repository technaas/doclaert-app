import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/src/lib/queryKeys';
import { fetchCompanyProfile } from '@/src/services/company';

export function useCompanyProfileQuery(companyId: string | null | undefined) {
  return useQuery({
    queryKey: queryKeys.companyProfile(companyId ?? ''),
    queryFn: () => fetchCompanyProfile(companyId!),
    enabled: Boolean(companyId),
  });
}
