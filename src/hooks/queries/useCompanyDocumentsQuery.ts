import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/src/lib/queryKeys';
import { fetchCompanyDocumentsData } from '@/src/services/documents';

export function useCompanyDocumentsQuery(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.documents(companyId ?? ''),
    queryFn: () => fetchCompanyDocumentsData(companyId!),
    enabled: Boolean(companyId),
  });
}
