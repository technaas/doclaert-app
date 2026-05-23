import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { sendExpoPushRaw } from "./expo.ts";
import { insertNotificationLog } from "./logs.ts";
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

export interface TestModeResult {
  mode: "test";
  success: boolean;
  device: {
    id: string;
    company_id: string;
    user_id: string;
    device_name: string | null;
    platform: string | null;
  } | null;
  expo_push_token: string | null;
  expo_response: unknown;
  error?: string;
}

export async function runTestMode(
  admin: SupabaseClient,
  filterCompanyId: string | null,
): Promise<TestModeResult> {
  let deviceQ = admin
    .from("mobile_devices")
    .select(
      "id, company_id, user_id, expo_push_token, device_name, platform, is_active",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(50);

  if (filterCompanyId) {
    deviceQ = deviceQ.eq("company_id", filterCompanyId);
  }

  const { data: rows, error: devErr } = await deviceQ;
  if (devErr) {
    const result: TestModeResult = {
      mode: "test",
      success: false,
      device: null,
      expo_push_token: null,
      expo_response: null,
      error: devErr.message,
    };
    console.log("[mobile-expiry:test]", JSON.stringify(result, null, 2));
    return result;
  }

  const device = (rows ?? []).find((r) =>
    isValidExpoToken((r as MobileDeviceRow).expo_push_token)
  ) as MobileDeviceRow | undefined;

  if (!device) {
    const result: TestModeResult = {
      mode: "test",
      success: false,
      device: null,
      expo_push_token: null,
      expo_response: null,
      error: filterCompanyId
        ? "No active device with a valid Expo push token for this company"
        : "No active device with a valid Expo push token found",
    };
    console.log("[mobile-expiry:test]", JSON.stringify(result, null, 2));
    return result;
  }

  const token = device.expo_push_token!;
  const message: ExpoPushMessage = {
    to: token,
    title: TEST_PUSH.title,
    body: TEST_PUSH.body,
    data: { ...TEST_PUSH.data },
  };

  console.log("[mobile-expiry:test] selected device:", {
    id: device.id,
    company_id: device.company_id,
    user_id: device.user_id,
    device_name: device.device_name,
    platform: device.platform,
  });
  console.log("[mobile-expiry:test] expo_push_token:", token);

  let expoResponse: unknown;
  let success = false;
  let error: string | undefined;
  let ticketId: string | undefined;

  try {
    const raw = await sendExpoPushRaw([message]);
    expoResponse = raw;
    console.log(
      "[mobile-expiry:test] Expo API response:",
      JSON.stringify(raw, null, 2),
    );

    const ticket = raw.tickets[0];
    if (raw.httpOk && ticket?.ok) {
      success = true;
      ticketId = ticket.ticketId;
      console.log("[mobile-expiry:test] success");
    } else {
      error = ticket?.error ?? raw.httpError ?? "Expo push failed";
      console.log("[mobile-expiry:test] failure:", error);
    }
  } catch (e) {
    error = (e as Error).message;
    expoResponse = { error };
    console.log("[mobile-expiry:test] failure:", error);
  }

  try {
    await insertNotificationLog(admin, {
      companyId: device.company_id,
      userId: device.user_id,
      device,
      category: "test",
      status: success ? "sent" : "failed",
      error,
      expoTicketId: ticketId,
    });
  } catch (logErr) {
    console.log(
      "[mobile-expiry:test] log insert failed:",
      (logErr as Error).message,
    );
  }

  const result: TestModeResult = {
    mode: "test",
    success,
    device: {
      id: device.id,
      company_id: device.company_id,
      user_id: device.user_id,
      device_name: device.device_name,
      platform: device.platform,
    },
    expo_push_token: token,
    expo_response: expoResponse,
    ...(error ? { error } : {}),
  };

  console.log("[mobile-expiry:test] result:", JSON.stringify(result, null, 2));
  return result;
}
