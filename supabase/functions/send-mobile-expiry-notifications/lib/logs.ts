import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import type { MobileDeviceRow, NotificationCategory } from "./types.ts";

/**
 * mobile_notification_logs.check currently allows staff | branch | test.
 * Vehicle Daftar pushes are logged as branch until that constraint is widened.
 */
function logTypeForCategory(category: NotificationCategory): "staff" | "branch" | "test" {
  if (category === "vehicle") return "branch";
  if (category === "test") return "test";
  return category;
}

/**
 * Returns true when a successful push of this category was sent fewer than
 * repeat_interval_days ago — cron should skip until the interval elapses.
 * First alert in a new window has no prior log and is always allowed.
 */
export async function wasSentWithinRepeatInterval(
  admin: SupabaseClient,
  companyId: string,
  deviceId: string,
  category: NotificationCategory,
  repeatDays: number,
): Promise<boolean> {
  const { data: lastLog, error } = await admin
    .from("mobile_notification_logs")
    .select("sent_at")
    .eq("company_id", companyId)
    .eq("mobile_device_id", deviceId)
    .eq("notification_type", logTypeForCategory(category))
    .eq("status", "sent")
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`log-check(${category}): ${error.message}`);
  if (!lastLog?.sent_at) return false;

  const ageDays =
    (Date.now() - new Date(lastLog.sent_at as string).getTime()) / 86_400_000;
  return ageDays < repeatDays;
}

export async function insertNotificationLog(
  admin: SupabaseClient,
  params: {
    companyId: string;
    userId: string;
    device: MobileDeviceRow;
    category: NotificationCategory;
    status: "sent" | "failed";
    error?: string;
    expoTicketId?: string;
  },
): Promise<void> {
  const { error } = await admin.from("mobile_notification_logs").insert({
    company_id: params.companyId,
    user_id: params.userId,
    mobile_device_id: params.device.id,
    notification_type: logTypeForCategory(params.category),
    status: params.status,
    device_name: params.device.device_name,
    platform: params.device.platform,
    error: params.error ?? null,
    expo_ticket_id: params.expoTicketId ?? null,
  });

  if (error) {
    throw new Error(`log-insert: ${error.message}`);
  }
}
