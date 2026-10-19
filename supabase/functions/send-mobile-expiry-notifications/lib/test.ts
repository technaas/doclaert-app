import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import type { Administrator } from "./auth.ts";
import { sendExpoPushRaw } from "./expo.ts";
import { insertNotificationLog } from "./logs.ts";
import { redactSecrets } from "./redact.ts";
import type { ExpoPushMessage, MobileDeviceRow } from "./types.ts";

export const TEST_PUSH = {
  title: "DocAlert Test Notification",
  body: "Push notifications are working successfully.",
  data: { screen: "alerts", type: "test" as const },
};

function isValidExpoToken(token: string | null | undefined): token is string {
  if (!token || !token.trim()) return false;
  return token.startsWith("ExponentPushToken[") ||
    token.startsWith("ExpoPushToken[");
}

export interface DeviceTestResult {
  mode: "test";
  success: boolean;
  httpStatus: number;
  device: {
    id: string;
    company_id: string;
    device_name: string | null;
    platform: string | null;
  } | null;
  error?: string;
}

function denied(message: string, httpStatus = 403): DeviceTestResult {
  return { mode: "test", success: false, httpStatus, device: null, error: message };
}

export async function runDeviceTest(
  admin: SupabaseClient,
  administrator: Administrator,
  deviceId: string,
  requestedCompanyId: string | null,
): Promise<DeviceTestResult> {
  const { data, error } = await admin
    .from("mobile_devices")
    .select(
      "id, company_id, user_id, expo_push_token, device_name, platform, is_active",
    )
    .eq("id", deviceId)
    .maybeSingle();

  if (error) return denied("The selected device could not be loaded.", 500);
  const device = data as MobileDeviceRow | null;
  if (!device) return denied("The selected device was not found.", 404);

  if (requestedCompanyId && requestedCompanyId !== device.company_id) {
    return denied("The selected device is not in the requested company.");
  }

  const sameCompany = administrator.companyId === device.company_id;
  if (administrator.role === "owner" && !sameCompany) {
    return denied("You can test only a device in your company.");
  }
  if (administrator.role === "technaas_super_admin" && !sameCompany && !requestedCompanyId) {
    return denied("Confirm the company before testing a device outside your company.");
  }

  if (!device.is_active) return denied("That device is not active.");
  if (!isValidExpoToken(device.expo_push_token)) {
    return denied("That device does not have a usable Expo push token.");
  }

  const message: ExpoPushMessage = {
    to: device.expo_push_token,
    title: TEST_PUSH.title,
    body: TEST_PUSH.body,
    data: { ...TEST_PUSH.data },
  };

  let success = false;
  let failure: string | undefined;
  let ticketId: string | undefined;

  try {
    const raw = await sendExpoPushRaw([message]);
    const ticket = raw.tickets[0];
    if (raw.httpOk && ticket?.ok) {
      success = true;
      ticketId = ticket.ticketId;
    } else {
      failure = redactSecrets(ticket?.error ?? raw.httpError ?? "Expo push failed");
    }
  } catch (e) {
    failure = redactSecrets((e as Error).message);
  }

  try {
    await insertNotificationLog(admin, {
      companyId: device.company_id,
      userId: device.user_id,
      device,
      category: "test",
      status: success ? "sent" : "failed",
      error: failure,
      expoTicketId: ticketId,
    });
  } catch (logErr) {
    console.log("[mobile-expiry:test] log insert failed:", redactSecrets((logErr as Error).message));
  }

  console.log("[mobile-expiry:test]", {
    success,
    device_id: device.id,
    company_id: device.company_id,
    administrator_id: administrator.userId,
  });

  return {
    mode: "test",
    success,
    httpStatus: success ? 200 : 502,
    device: {
      id: device.id,
      company_id: device.company_id,
      device_name: device.device_name,
      platform: device.platform,
    },
    ...(failure ? { error: failure } : {}),
  };
}
