import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import {
  addCalendarMonths,
  addDaysYmd,
  isExpired,
  isExpiringSoon,
  todayKuwaitYmd,
} from "./expiry.ts";
import type { CategoryCounts, DocumentRow, VehicleRow } from "./types.ts";

export function normalizeThresholdDays(raw: unknown): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.min(365, Math.floor(n)) : 30;
}

export function normalizeRepeatDays(raw: unknown): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.min(30, Math.floor(n)) : 2;
}

export function isDocumentInAlertWindow(
  expiryDate: string,
  todayYmd: string,
  thresholdDays: number,
): boolean {
  return isExpired(expiryDate, todayYmd) ||
    isExpiringSoon(expiryDate, todayYmd, thresholdDays);
}

function hasUploadedFile(fileUrl: unknown): boolean {
  return typeof fileUrl === "string" && fileUrl.trim().length > 0;
}

function inferExpiryStatus(
  expiryDate: string | null | undefined,
  expiryStatus: string | null | undefined,
): "has_expiry" | "no_expiry" | "pending_verification" {
  if (
    expiryStatus === "has_expiry" ||
    expiryStatus === "no_expiry" ||
    expiryStatus === "pending_verification"
  ) {
    return expiryStatus;
  }
  if (expiryDate && String(expiryDate).trim()) return "has_expiry";
  return "pending_verification";
}

function operationalExpiryDate(
  documentName: string | null | undefined,
  storedExpiry: string | null | undefined,
): string | null {
  const stored = (storedExpiry ?? "").trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(stored)) return null;
  if (documentName === "passport") return addCalendarMonths(stored, -14);
  return stored;
}

function vehicleDaftarExpiry(row: VehicleRow): string | null {
  const raw = (row.duftar_expiry_date ?? row.daftar_expiry_date ?? "").trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

export function countByCategory(
  docs: DocumentRow[],
  vehicles: VehicleRow[],
  thresholdDays: number,
  todayYmd: string,
): { staff: CategoryCounts; branch: CategoryCounts; vehicle: CategoryCounts } {
  const empty = (): CategoryCounts => ({ total: 0, expired: 0, expiring: 0 });
  const staff = empty();
  const branch = empty();
  const vehicle = empty();

  for (const doc of docs) {
    if (typeof doc.id === "string" && doc.id.startsWith("missing-")) continue;
    if (!hasUploadedFile(doc.file_url)) continue;

    const mode = inferExpiryStatus(doc.expiry_date, doc.expiry_status);
    if (mode === "no_expiry" || mode === "pending_verification") continue;

    const expiry = operationalExpiryDate(doc.document_name, doc.expiry_date);
    if (!expiry) continue;
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

  for (const row of vehicles) {
    const expiry = vehicleDaftarExpiry(row);
    if (!expiry) continue;
    if (!isDocumentInAlertWindow(expiry, todayYmd, thresholdDays)) continue;

    vehicle.total += 1;
    if (isExpired(expiry, todayYmd)) vehicle.expired += 1;
    if (isExpiringSoon(expiry, todayYmd, thresholdDays)) vehicle.expiring += 1;
  }

  return { staff, branch, vehicle };
}

export async function fetchAlertDocuments(
  admin: SupabaseClient,
  companyId: string,
  thresholdDays: number,
): Promise<{ docs: DocumentRow[]; vehicles: VehicleRow[]; error?: string }> {
  const todayYmd = todayKuwaitYmd();
  const thresholdEnd = addDaysYmd(todayYmd, thresholdDays);
  const fetchUntil = addCalendarMonths(thresholdEnd, 14) ?? thresholdEnd;

  const { data, error } = await admin
    .from("documents")
    .select(
      "id, company_id, type, staff_id, branch_id, document_name, expiry_date, expiry_status, file_url, status",
    )
    .eq("company_id", companyId)
    .not("expiry_date", "is", null)
    .lte("expiry_date", fetchUntil);

  if (error) return { docs: [], vehicles: [], error: error.message };

  const { data: vehicleData, error: vehicleError } = await admin
    .from("vehicles")
    .select(
      "id, brand_id, branch_id, vehicle_make, model, registration_number, duftar_expiry_date, duftar_file_url, status",
    )
    .eq("company_id", companyId);

  if (vehicleError) {
    return {
      docs: (data ?? []) as DocumentRow[],
      vehicles: [],
      error: vehicleError.message,
    };
  }

  return {
    docs: (data ?? []) as DocumentRow[],
    vehicles: (vehicleData ?? []) as VehicleRow[],
  };
}
