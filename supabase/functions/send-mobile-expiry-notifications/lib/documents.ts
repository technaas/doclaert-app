import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  addDaysYmd,
  isExpired,
  isExpiringSoon,
  todayKuwaitYmd,
} from "./expiry.ts";
import type { CategoryCounts, DocumentRow } from "./types.ts";

export function normalizeThresholdDays(raw: unknown): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.min(365, Math.floor(n)) : 30;
}

export function normalizeRepeatDays(raw: unknown): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.min(30, Math.floor(n)) : 2;
}

/**
 * Alert window (Kuwait calendar day):
 * - expiry_date < today (expired), OR
 * - today <= expiry_date <= today + alert_threshold_days (expiring soon)
 */
export function isDocumentInAlertWindow(
  expiryDate: string,
  todayYmd: string,
  thresholdDays: number,
): boolean {
  return isExpired(expiryDate, todayYmd) ||
    isExpiringSoon(expiryDate, todayYmd, thresholdDays);
}

export function countByCategory(
  docs: DocumentRow[],
  thresholdDays: number,
  todayYmd: string,
): { staff: CategoryCounts; branch: CategoryCounts } {
  const empty = (): CategoryCounts => ({ total: 0, expired: 0, expiring: 0 });
  const staff = empty();
  const branch = empty();

  for (const doc of docs) {
    const expiry = doc.expiry_date;
    if (!isDocumentInAlertWindow(expiry, todayYmd, thresholdDays)) continue;

    const expired = isExpired(expiry, todayYmd);
    const expiring = isExpiringSoon(expiry, todayYmd, thresholdDays);

    const bucket = doc.type === "staff"
      ? staff
      : doc.type === "branch"
      ? branch
      : null;
    if (!bucket) continue;

    bucket.total += 1;
    if (expired) bucket.expired += 1;
    if (expiring) bucket.expiring += 1;
  }

  return { staff, branch };
}

export async function fetchAlertDocuments(
  admin: SupabaseClient,
  companyId: string,
  thresholdDays: number,
): Promise<{ docs: DocumentRow[]; error?: string }> {
  const todayYmd = todayKuwaitYmd();
  // expiry_date <= today + threshold includes expired (expiry < today) and expiring window.
  const thresholdEnd = addDaysYmd(todayYmd, thresholdDays);

  const { data, error } = await admin
    .from("documents")
    .select(
      "id, company_id, type, staff_id, branch_id, document_name, expiry_date, status",
    )
    .eq("company_id", companyId)
    .lte("expiry_date", thresholdEnd);

  if (error) return { docs: [], error: error.message };
  return { docs: (data ?? []) as DocumentRow[] };
}
