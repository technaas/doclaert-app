import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/src/lib/queryKeys';
import { fetchCompanyStaffData } from '@/src/services/staff';

export function useCompanyStaffQuery(companyId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.staff(companyId ?? ''),
    queryFn: () => fetchCompanyStaffData(companyId!),
    enabled: Boolean(companyId),
  });
}
