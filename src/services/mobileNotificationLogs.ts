import { logSupabaseError } from '@/src/lib/supabaseError';
import { supabase } from '@/src/lib/supabase';
import type {
  MobileNotificationLogRecord,
  MobileNotificationLogStatusFilter,
  MobileNotificationLogTypeFilter,
} from '@/src/types/mobileNotificationLogs';
import { MOBILE_NOTIFICATION_LOGS_LIMIT } from '@/src/types/mobileNotificationLogs';

const LOG_SELECT =
  'id, company_id, user_id, mobile_device_id, notification_type, status, device_name, platform, error, expo_ticket_id, sent_at';

export type FetchMobileNotificationLogsParams = {
  companyId: string;
  statusFilter?: MobileNotificationLogStatusFilter;
  typeFilter?: MobileNotificationLogTypeFilter;
  limit?: number;
};

export async function fetchMobileNotificationLogs(
  params: FetchMobileNotificationLogsParams,
): Promise<MobileNotificationLogRecord[]> {
  const {
    companyId,
    statusFilter = 'all',
    typeFilter = 'all',
    limit = MOBILE_NOTIFICATION_LOGS_LIMIT,
  } = params;

  let query = supabase
    .from('mobile_notification_logs')
    .select(LOG_SELECT)
    .eq('company_id', companyId)
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  if (typeFilter !== 'all') {
    query = query.eq('notification_type', typeFilter);
  }

  const { data, error } = await query;

  if (error) {
    logSupabaseError('fetchMobileNotificationLogs', error);
    throw new Error(error.message);
  }

  return (data ?? []) as MobileNotificationLogRecord[];
}
