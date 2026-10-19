import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const ADMIN_ROLES = new Set(["owner", "technaas_super_admin"]);

export interface Administrator {
  userId: string;
  companyId: string | null;
  role: "owner" | "technaas_super_admin";
}

export type AuthFailure = { ok: false; status: number; error: string };
export type AuthSuccess = { ok: true; administrator: Administrator };

function constantTimeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  const length = Math.max(aa.length, bb.length);
  let diff = aa.length === bb.length ? 0 : 1;
  for (let i = 0; i < length; i++) {
    diff |= (aa[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return diff === 0;
}

/** Scheduled company-wide runs require the mobile cron secret. Fail closed. */
export function isAuthorizedCron(req: Request): boolean {
  const expected = (Deno.env.get("MOBILE_CRON_SECRET") ?? "").trim();
  const provided = req.headers.get("x-cron-secret") ?? "";
  if (!expected || !provided) return false;
  return constantTimeEqual(provided, expected);
}

function bearerToken(req: Request): string | null {
  const header = req.headers.get("Authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  return match?.[1] ?? null;
}

export async function resolveAdministrator(
  admin: SupabaseClient,
  req: Request,
): Promise<AuthSuccess | AuthFailure> {
  const token = bearerToken(req);
  if (!token) {
    return { ok: false, status: 401, error: "Administrator sign-in is required." };
  }

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) {
    return { ok: false, status: 401, error: "Administrator sign-in is required." };
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, company_id, role, is_active")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { ok: false, status: 403, error: "Administrator profile was not found." };
  }

  if (profile.is_active === false) {
    return { ok: false, status: 403, error: "This administrator account is disabled." };
  }

  const role = String(profile.role ?? "").trim();
  if (!ADMIN_ROLES.has(role)) {
    return { ok: false, status: 403, error: "This account cannot send a test notification." };
  }

  return {
    ok: true,
    administrator: {
      userId: String(profile.id),
      companyId: profile.company_id ? String(profile.company_id) : null,
      role: role as Administrator["role"],
    },
  };
}
