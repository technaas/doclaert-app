import { supabase } from '@/src/lib/supabase';
import {
  mergeTenantPermissionRows,
  setRuntimeRolePermissions,
  type AppPermission,
  type AppRole,
} from '@/src/lib/permissions';

export async function loadRuntimeRolePermissions(
  companyId: string | null | undefined,
): Promise<void> {
  if (!companyId) {
    setRuntimeRolePermissions(null);
    return;
  }

  const { data, error } = await supabase
    .from('company_role_permissions')
    .select('role,permission_key,enabled')
    .eq('company_id', companyId);

  if (error || !data || data.length === 0) {
    setRuntimeRolePermissions(null);
    return;
  }

  const rows = data as {
    role: string;
    permission_key: string;
    enabled: boolean;
  }[];

  setRuntimeRolePermissions(
    mergeTenantPermissionRows(
      rows.map((row) => ({
        role: row.role as AppRole,
        permission_key: row.permission_key as AppPermission,
        enabled: row.enabled,
      })),
    ),
  );
}
