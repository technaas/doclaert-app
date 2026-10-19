import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import { countByCategory } from "./documents.ts";
import type { CategoryCounts, DocumentRow, VehicleRow } from "./types.ts";

type NeededPermission = "expiry_alerts" | "staff_view" | "doc_view" | "vehicles";

const NEEDED: NeededPermission[] = [
  "expiry_alerts",
  "staff_view",
  "doc_view",
  "vehicles",
];

const DEFAULT_PERMISSIONS: Record<string, Record<NeededPermission, boolean>> = {
  technaas_super_admin: { expiry_alerts: true, staff_view: true, doc_view: true, vehicles: true },
  owner: { expiry_alerts: true, staff_view: true, doc_view: true, vehicles: true },
  operations_manager: { expiry_alerts: true, staff_view: true, doc_view: true, vehicles: true },
  brand_manager: { expiry_alerts: true, staff_view: true, doc_view: true, vehicles: true },
  branch_manager: { expiry_alerts: true, staff_view: true, doc_view: true, vehicles: true },
  mandoop: { expiry_alerts: false, staff_view: false, doc_view: false, vehicles: false },
  viewer: { expiry_alerts: true, staff_view: false, doc_view: true, vehicles: true },
};

export interface PushRecipient {
  userId: string;
  canStaff: boolean;
  canBranchDocs: boolean;
  canVehicles: boolean;
  allBrands: boolean;
  allBranches: boolean;
  brandIds: Set<string>;
  branchIds: Set<string>;
}

export interface CompanyLookups {
  staff: { id: string; branch_id: string | null }[];
  branches: { id: string; brand_id: string | null }[];
}

function canBranch(
  recipient: PushRecipient,
  branchId: string | null | undefined,
  brandId: string | null | undefined,
): boolean {
  if (!branchId) return false;
  if (recipient.allBrands && recipient.allBranches) return true;
  if (recipient.allBranches) {
    if (!brandId) return false;
    return recipient.allBrands || recipient.brandIds.has(brandId);
  }
  return recipient.branchIds.has(branchId);
}

function permissionsForRole(
  role: string,
  overrides: Map<string, Map<string, boolean>>,
): Record<NeededPermission, boolean> {
  const base = {
    ...(DEFAULT_PERMISSIONS[role] ?? {
      expiry_alerts: false,
      staff_view: false,
      doc_view: false,
      vehicles: false,
    }),
  };
  if (role === "technaas_super_admin") return base;
  const stored = overrides.get(role);
  if (!stored) return base;
  for (const key of NEEDED) {
    if (stored.has(key)) base[key] = stored.get(key) === true;
  }
  if (!stored.has("staff_view") && (stored.get("staff_create") || stored.get("staff_edit"))) {
    base.staff_view = true;
  }
  return base;
}

export async function loadPushRecipients(
  admin: SupabaseClient,
  companyId: string,
  userIds: string[],
  recipientRoles: string[],
): Promise<Map<string, PushRecipient>> {
  const uniqueIds = Array.from(new Set(userIds.filter(Boolean)));
  const allowedRoles = new Set(recipientRoles.map((role) => role.trim()).filter(Boolean));
  const recipients = new Map<string, PushRecipient>();
  if (!uniqueIds.length || allowedRoles.size === 0) return recipients;

  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("id, company_id, role, is_active, access_all_brands, access_all_branches")
    .in("id", uniqueIds)
    .eq("company_id", companyId);
  if (profileError) {
    throw new Error(`profiles(${companyId}): ${profileError.message}`);
  }

  const { data: permissionRows, error: permissionError } = await admin
    .from("company_role_permissions")
    .select("role, permission_key, enabled")
    .eq("company_id", companyId);
  if (permissionError) {
    throw new Error(`company_role_permissions(${companyId}): ${permissionError.message}`);
  }

  const overrides = new Map<string, Map<string, boolean>>();
  for (const row of permissionRows ?? []) {
    const role = String((row as { role?: string }).role ?? "");
    const key = String((row as { permission_key?: string }).permission_key ?? "");
    if (!role || !key) continue;
    const bucket = overrides.get(role) ?? new Map<string, boolean>();
    bucket.set(key, (row as { enabled?: boolean }).enabled === true);
    overrides.set(role, bucket);
  }

  const eligible = (profiles ?? []).filter((profile) => {
    const role = String((profile as { role?: string }).role ?? "").trim();
    return (profile as { is_active?: boolean }).is_active !== false && allowedRoles.has(role);
  });

  const scopedIds = eligible
    .filter((profile) =>
      (profile as { access_all_brands?: boolean }).access_all_brands === false ||
      (profile as { access_all_branches?: boolean }).access_all_branches === false
    )
    .map((profile) => String((profile as { id: string }).id));

  const brandIdsByUser = new Map<string, Set<string>>();
  const branchIdsByUser = new Map<string, Set<string>>();
  if (scopedIds.length) {
    const [{ data: brandRows, error: brandError }, { data: branchRows, error: branchError }] =
      await Promise.all([
        admin.from("profile_brand_access").select("user_id, brand_id").in("user_id", scopedIds),
        admin.from("profile_branch_access").select("user_id, branch_id").in("user_id", scopedIds),
      ]);
    if (brandError) throw new Error(`profile_brand_access(${companyId}): ${brandError.message}`);
    if (branchError) {
      throw new Error(`profile_branch_access(${companyId}): ${branchError.message}`);
    }
    for (const row of brandRows ?? []) {
      const userId = String((row as { user_id: string }).user_id);
      const set = brandIdsByUser.get(userId) ?? new Set<string>();
      set.add(String((row as { brand_id: string }).brand_id));
      brandIdsByUser.set(userId, set);
    }
    for (const row of branchRows ?? []) {
      const userId = String((row as { user_id: string }).user_id);
      const set = branchIdsByUser.get(userId) ?? new Set<string>();
      set.add(String((row as { branch_id: string }).branch_id));
      branchIdsByUser.set(userId, set);
    }
  }

  for (const profile of eligible) {
    const userId = String((profile as { id: string }).id);
    const role = String((profile as { role?: string }).role ?? "").trim();
    const permissions = permissionsForRole(role, overrides);
    if (!permissions.expiry_alerts) continue;
    const allBrands = (profile as { access_all_brands?: boolean }).access_all_brands !== false;
    const allBranches = (profile as { access_all_branches?: boolean }).access_all_branches !== false;
    recipients.set(userId, {
      userId,
      canStaff: permissions.staff_view || permissions.doc_view,
      canBranchDocs: permissions.doc_view,
      canVehicles: permissions.vehicles,
      allBrands,
      allBranches,
      brandIds: brandIdsByUser.get(userId) ?? new Set<string>(),
      branchIds: branchIdsByUser.get(userId) ?? new Set<string>(),
    });
  }

  return recipients;
}

export function countsForRecipient(
  recipient: PushRecipient,
  docs: DocumentRow[],
  vehicles: VehicleRow[],
  lookups: CompanyLookups,
  thresholdDays: number,
  todayYmd: string,
): { staff: CategoryCounts; branch: CategoryCounts; vehicle: CategoryCounts } {
  const staffById = new Map(lookups.staff.map((row) => [row.id, row]));
  const branchBrand = new Map(lookups.branches.map((row) => [row.id, row.brand_id]));

  const visibleDocs = docs.filter((doc) => {
    if (doc.type === "staff") {
      if (!recipient.canStaff || !doc.staff_id) return false;
      const staff = staffById.get(doc.staff_id);
      if (!staff) return false;
      return canBranch(
        recipient,
        staff.branch_id,
        staff.branch_id ? branchBrand.get(staff.branch_id) ?? null : null,
      );
    }
    if (doc.type === "branch") {
      if (!recipient.canBranchDocs) return false;
      return canBranch(
        recipient,
        doc.branch_id,
        doc.branch_id ? branchBrand.get(doc.branch_id) ?? null : null,
      );
    }
    return false;
  });

  const visibleVehicles = vehicles.filter((vehicle) =>
    recipient.canVehicles &&
    canBranch(recipient, vehicle.branch_id, vehicle.brand_id)
  );

  return countByCategory(visibleDocs, visibleVehicles, thresholdDays, todayYmd);
}
