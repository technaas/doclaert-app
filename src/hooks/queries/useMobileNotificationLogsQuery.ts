import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/src/lib/queryKeys';
import { fetchMobileNotificationLogs } from '@/src/services/mobileNotificationLogs';
import type {
  MobileNotificationLogStatusFilter,
  MobileNotificationLogTypeFilter,
} from '@/src/types/mobileNotificationLogs';

export function useMobileNotificationLogsQuery(
  companyId: string | undefined,
  statusFilter: MobileNotificationLogStatusFilter,
  typeFilter: MobileNotificationLogTypeFilter,
) {
  return useQuery({
    queryKey: queryKeys.notificationLogs(
      companyId ?? '',
      statusFilter,
      typeFilter,
    ),
    queryFn: () =>
      fetchMobileNotificationLogs({
        companyId: companyId!,
        statusFilter,
        typeFilter,
      }),
    enabled: Boolean(companyId),
  });
}
