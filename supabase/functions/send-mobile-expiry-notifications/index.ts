// Supabase Edge Function: send-mobile-expiry-notifications
//
// Scheduled once daily (single cron — NOT per company). This function loops all
// rows in email_notification_settings and applies each company's:
//   enabled, alert_threshold_days, repeat_interval_days
//
// Per active device: max 1 staff + 1 branch + 1 vehicle summary per repeat_interval_days.
//
// Required env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Production: POST {} — see supabase/scheduled/cron-send-mobile-expiry-notifications.sql
// Manual test: POST ?test=true
// Manual one company: POST { "company_id": "<uuid>" }

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  countByCategory,
  fetchAlertDocuments,
} from "./lib/documents.ts";
import { todayKuwaitYmd } from "./lib/expiry.ts";
import { sendExpoPush } from "./lib/expo.ts";
import {
  insertNotificationLog,
  wasSentWithinRepeatInterval,
} from "./lib/logs.ts";
import { buildPushMessage } from "./lib/messages.ts";
import {
  type CompanyNotificationSettings,
  parseCompanyNotificationSettings,
} from "./lib/settings.ts";
import { runTestMode } from "./lib/test.ts";
import type {
  MobileDeviceRow,
  NotificationCategory,
  RunStats,
  SendJob,
} from "./lib/types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SETTINGS_SELECT =
  "company_id, enabled, alert_threshold_days, repeat_interval_days";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function emptyStats(): RunStats {
  return {
    companies_total: 0,
    companies_skipped_disabled: 0,
    companies_processed: 0,
    processed: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };
}

function isValidExpoToken(token: string | null | undefined): token is string {
  if (!token || !token.trim()) return false;
  return token.startsWith("ExponentPushToken[") ||
    token.startsWith("ExpoPushToken[");
}

async function loadCompanyLookups(
  admin: ReturnType<typeof createClient>,
  companyId: string,
  docs: { staff_id: string | null; branch_id: string | null }[],
) {
  const staffIds = Array.from(
    new Set(docs.map((d) => d.staff_id).filter(Boolean)),
  ) as string[];
  const branchIds = Array.from(
    new Set(docs.map((d) => d.branch_id).filter(Boolean)),
  ) as string[];

  const staffQ = staffIds.length
    ? admin.from("staff").select("id, name, branch_id, company_id").in(
      "id",
      staffIds,
    ).eq("company_id", companyId)
    : { data: [], error: null };

  const { data: staffRows, error: staffErr } = await staffQ;
  if (staffErr) throw new Error(`staff(${companyId}): ${staffErr.message}`);

  const extraBranchIds = new Set<string>(branchIds);
  for (const s of staffRows ?? []) {
    if ((s as any).branch_id) extraBranchIds.add((s as any).branch_id);
  }

  let branchRows: unknown[] = [];
  if (extraBranchIds.size) {
    const { data, error } = await admin
      .from("branches")
      .select("id, name, brand_id, company_id")
      .in("id", Array.from(extraBranchIds))
      .eq("company_id", companyId);
    if (error) throw new Error(`branches(${companyId}): ${error.message}`);
    branchRows = data ?? [];
  }

  const brandIds = Array.from(
    new Set(
      (branchRows as any[]).map((b) => b.brand_id).filter(Boolean),
    ),
  ) as string[];

  let brandRows: unknown[] = [];
  if (brandIds.length) {
    const { data, error } = await admin
      .from("brands")
      .select("id, name, company_id")
      .in("id", brandIds)
      .eq("company_id", companyId);
    if (error) throw new Error(`brands(${companyId}): ${error.message}`);
    brandRows = data ?? [];
  }

  return {
    staff: staffRows ?? [],
    branches: branchRows,
    brands: brandRows,
  };
}

async function fetchActiveDevices(
  admin: ReturnType<typeof createClient>,
  companyId: string,
): Promise<MobileDeviceRow[]> {
  const { data, error } = await admin
    .from("mobile_devices")
    .select(
      "id, company_id, user_id, expo_push_token, device_name, platform, is_active",
    )
    .eq("company_id", companyId)
    .eq("is_active", true);

  if (error) throw new Error(`mobile_devices(${companyId}): ${error.message}`);
  return (data ?? []) as MobileDeviceRow[];
}

async function processCompany(
  admin: ReturnType<typeof createClient>,
  settings: CompanyNotificationSettings,
  stats: RunStats,
): Promise<void> {
  const { companyId, alertThresholdDays, repeatIntervalDays } = settings;

  console.log(
    `[mobile-expiry] company=${companyId} threshold=${alertThresholdDays}d repeat=${repeatIntervalDays}d`,
  );

  const { docs, vehicles, error: docErr } = await fetchAlertDocuments(
    admin,
    companyId,
    alertThresholdDays,
  );
  if (docErr) {
    stats.errors.push(docErr);
    return;
  }

  await loadCompanyLookups(admin, companyId, docs);

  const todayYmd = todayKuwaitYmd();
  const counts = countByCategory(docs, vehicles, alertThresholdDays, todayYmd);

  const categories: {
    key: NotificationCategory;
    counts: typeof counts.staff;
  }[] = [
    { key: "staff", counts: counts.staff },
    { key: "branch", counts: counts.branch },
    { key: "vehicle", counts: counts.vehicle },
  ];

  const hasAlerts = categories.some((c) => c.counts.total > 0);
  if (!hasAlerts) {
    console.log(`[mobile-expiry] company=${companyId} no staff/branch/vehicle alerts after filter`);
    return;
  }

  stats.companies_processed += 1;
  stats.processed += counts.staff.total + counts.branch.total + counts.vehicle.total;

  const devices = await fetchActiveDevices(admin, companyId);
  if (!devices.length) {
    console.log(`[mobile-expiry] company=${companyId} no active mobile devices`);
    return;
  }

  const jobs: SendJob[] = [];

  for (const device of devices) {
    if (!device.is_active || !isValidExpoToken(device.expo_push_token)) {
      stats.skipped++;
      continue;
    }

    for (const cat of categories) {
      if (cat.counts.total <= 0) continue;

      try {
        const withinRepeatInterval = await wasSentWithinRepeatInterval(
          admin,
          companyId,
          device.id,
          cat.key,
          repeatIntervalDays,
        );
        if (withinRepeatInterval) {
          stats.skipped++;
          console.log(
            `[mobile-expiry] skip ${cat.key} device=${device.id} (repeat_interval_days=${repeatIntervalDays})`,
          );
          continue;
        }
      } catch (e) {
        stats.errors.push((e as Error).message);
        continue;
      }

      const template = buildPushMessage(cat.key, cat.counts);
      if (!template) continue;

      jobs.push({
        device,
        category: cat.key,
        message: { ...template, to: device.expo_push_token! },
      });
    }
  }

  if (!jobs.length) return;

  try {
    const results = await sendExpoPush(jobs.map((j) => j.message));

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const result = results[i] ?? { ok: false, error: "No Expo ticket returned" };

      try {
        if (result.ok) {
          await insertNotificationLog(admin, {
            companyId,
            userId: job.device.user_id,
            device: job.device,
            category: job.category,
            status: "sent",
            expoTicketId: result.ticketId,
          });
          stats.sent++;
        } else {
          await insertNotificationLog(admin, {
            companyId,
            userId: job.device.user_id,
            device: job.device,
            category: job.category,
            status: "failed",
            error: result.error,
          });
          stats.failed++;
          stats.errors.push(
            `${job.category} -> ${job.device.id}: ${result.error}`,
          );
        }
      } catch (e) {
        stats.errors.push(`log(${job.category}): ${(e as Error).message}`);
      }
    }
  } catch (e) {
    const msg = (e as Error).message;
    stats.errors.push(`expo-batch: ${msg}`);
    for (const job of jobs) {
      try {
        await insertNotificationLog(admin, {
          companyId,
          userId: job.device.user_id,
          device: job.device,
          category: job.category,
          status: "failed",
          error: msg,
        });
        stats.failed++;
      } catch (logErr) {
        stats.errors.push(`log-fail: ${(logErr as Error).message}`);
      }
    }
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return json({
      ...emptyStats(),
      errors: ["Missing Supabase environment variables"],
    }, 500);
  }

  const url = new URL(req.url);
  const isTestMode = url.searchParams.get("test") === "true";

  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch {
    payload = {};
  }
  const filterCompanyId = payload?.company_id
    ? String(payload.company_id)
    : url.searchParams.get("company_id")
    ? String(url.searchParams.get("company_id"))
    : null;

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (isTestMode) {
    const result = await runTestMode(admin, filterCompanyId);
    return json(result, result.success ? 200 : 500);
  }

  // All companies — enabled flag checked per row (do not filter in SQL).
  let settingsQ = admin.from("email_notification_settings").select(SETTINGS_SELECT);
  if (filterCompanyId) {
    settingsQ = settingsQ.eq("company_id", filterCompanyId);
  }

  const { data: settingsRows, error: setErr } = await settingsQ;
  if (setErr) {
    return json({
      ...emptyStats(),
      errors: [setErr.message],
    }, 500);
  }

  const stats = emptyStats();
  stats.companies_total = settingsRows?.length ?? 0;

  for (const row of settingsRows ?? []) {
    const settings = parseCompanyNotificationSettings(
      row as Record<string, unknown>,
    );

    if (!settings.enabled) {
      stats.companies_skipped_disabled += 1;
      console.log(
        `[mobile-expiry] skip company=${settings.companyId} (enabled=false)`,
      );
      continue;
    }

    try {
      await processCompany(admin, settings, stats);
    } catch (e) {
      stats.errors.push((e as Error).message);
    }
  }

  console.log(
    `[mobile-expiry] companies=${stats.companies_total} skipped_disabled=${stats.companies_skipped_disabled} processed=${stats.companies_processed} docs=${stats.processed} sent=${stats.sent} skipped=${stats.skipped} failed=${stats.failed}`,
  );

  return json(stats);
});
