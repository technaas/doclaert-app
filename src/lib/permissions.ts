// Client-side mirror of web role permissions. RLS remains the security boundary.

export type AppRole =
  | 'technaas_super_admin'
  | 'owner'
  | 'operations_manager'
  | 'brand_manager'
  | 'branch_manager'
  | 'mandoop'
  | 'viewer';

export type AppPermission =
  | 'dashboard'
  | 'brand_view'
  | 'brand_create'
  | 'brand_edit'
  | 'branch_view'
  | 'branch_create'
  | 'branch_edit'
  | 'staff_view'
  | 'staff_create'
  | 'staff_edit'
  | 'outside_staff_view'
  | 'outside_staff_create'
  | 'outside_staff_edit'
  | 'vehicles'
  | 'vehicle_create'
  | 'vehicle_edit'
  | 'doc_view'
  | 'doc_upload'
  | 'doc_edit'
  | 'doc_delete'
  | 'expiry_alerts'
  | 'reports'
  | 'settings'
  | 'salary_view'
  | 'salary_edit'
  | 'audit_view';

export const LEGACY_COMBINED_PERMISSIONS = {
  brands: ['brand_create', 'brand_edit'],
  branches: ['branch_create', 'branch_edit'],
  staff: ['staff_create', 'staff_edit'],
} as const;

const ALL_TRUE: Record<AppPermission, boolean> = {
  dashboard: true,
  brand_view: true,
  brand_create: true,
  brand_edit: true,
  branch_view: true,
  branch_create: true,
  branch_edit: true,
  staff_view: true,
  staff_create: true,
  staff_edit: true,
  outside_staff_view: true,
  outside_staff_create: true,
  outside_staff_edit: true,
  vehicles: true,
  vehicle_create: true,
  vehicle_edit: true,
  doc_view: true,
  doc_upload: true,
  doc_edit: true,
  doc_delete: true,
  expiry_alerts: true,
  reports: true,
  settings: true,
  salary_view: true,
  salary_edit: true,
  audit_view: true,
};

export const ROLE_PERMISSIONS: Record<AppRole, Record<AppPermission, boolean>> = {
  technaas_super_admin: { ...ALL_TRUE },
  owner: { ...ALL_TRUE },
  operations_manager: {
    ...ALL_TRUE,
    doc_delete: false,
    settings: false,
  },
  brand_manager: {
    dashboard: true,
    brand_view: false,
    brand_create: false,
    brand_edit: false,
    branch_view: false,
    branch_create: false,
    branch_edit: false,
    staff_view: true,
    staff_create: true,
    staff_edit: true,
    outside_staff_view: false,
    outside_staff_create: false,
    outside_staff_edit: false,
    vehicles: true,
    vehicle_create: true,
    vehicle_edit: true,
    doc_view: true,
    doc_upload: true,
    doc_edit: true,
    doc_delete: false,
    expiry_alerts: true,
    reports: true,
    settings: false,
    salary_view: true,
    salary_edit: false,
    audit_view: false,
  },
  branch_manager: {
    dashboard: true,
    brand_view: false,
    brand_create: false,
    brand_edit: false,
    branch_view: false,
    branch_create: false,
    branch_edit: false,
    staff_view: true,
    staff_create: true,
    staff_edit: true,
    outside_staff_view: false,
    outside_staff_create: false,
    outside_staff_edit: false,
    vehicles: true,
    vehicle_create: true,
    vehicle_edit: true,
    doc_view: true,
    doc_upload: true,
    doc_edit: true,
    doc_delete: false,
    expiry_alerts: true,
    reports: true,
    settings: false,
    salary_view: true,
    salary_edit: false,
    audit_view: false,
  },
  mandoop: {
    dashboard: true,
    brand_view: false,
    brand_create: false,
    brand_edit: false,
    branch_view: false,
    branch_create: false,
    branch_edit: false,
    staff_view: false,
    staff_create: false,
    staff_edit: false,
    outside_staff_view: false,
    outside_staff_create: false,
    outside_staff_edit: false,
    vehicles: false,
    vehicle_create: false,
    vehicle_edit: false,
    doc_view: false,
    doc_upload: true,
    doc_edit: true,
    doc_delete: false,
    expiry_alerts: false,
    reports: false,
    settings: false,
    salary_view: false,
    salary_edit: false,
    audit_view: false,
  },
  viewer: {
    dashboard: true,
    brand_view: false,
    brand_create: false,
    brand_edit: false,
    branch_view: false,
    branch_create: false,
    branch_edit: false,
    staff_view: false,
    staff_create: false,
    staff_edit: false,
    outside_staff_view: false,
    outside_staff_create: false,
    outside_staff_edit: false,
    vehicles: true,
    vehicle_create: false,
    vehicle_edit: false,
    doc_view: true,
    doc_upload: false,
    doc_edit: false,
    doc_delete: false,
    expiry_alerts: true,
    reports: true,
    settings: false,
    salary_view: false,
    salary_edit: false,
    audit_view: false,
  },
};

export const APP_PERMISSION_KEYS: AppPermission[] = [
  'dashboard',
  'brand_view',
  'brand_create',
  'brand_edit',
  'branch_view',
  'branch_create',
  'branch_edit',
  'staff_view',
  'staff_create',
  'staff_edit',
  'outside_staff_view',
  'outside_staff_create',
  'outside_staff_edit',
  'vehicles',
  'vehicle_create',
  'vehicle_edit',
  'doc_view',
  'doc_upload',
  'doc_edit',
  'doc_delete',
  'expiry_alerts',
  'reports',
  'settings',
  'salary_view',
  'salary_edit',
  'audit_view',
];

export const TENANT_EDITABLE_ROLES: AppRole[] = [
  'owner',
  'operations_manager',
  'brand_manager',
  'branch_manager',
  'mandoop',
  'viewer',
];

export const OWNER_LOCKED_PERMISSIONS: AppPermission[] = ['dashboard', 'settings'];

export function cloneRolePermissions(
  source: Record<AppRole, Record<AppPermission, boolean>> = ROLE_PERMISSIONS,
): Record<AppRole, Record<AppPermission, boolean>> {
  return JSON.parse(JSON.stringify(source)) as Record<
    AppRole,
    Record<AppPermission, boolean>
  >;
}

function requireViewForWrites(
  next: Record<AppPermission, boolean>,
  view: AppPermission,
  create: AppPermission,
  edit: AppPermission,
) {
  if (next[create] || next[edit]) next[view] = true;
  if (!next[view]) {
    next[create] = false;
    next[edit] = false;
  }
}

export const MODULE_VIEW_WRITE_DEPS: {
  view: AppPermission;
  create: AppPermission;
  edit: AppPermission;
}[] = [
  { view: 'brand_view', create: 'brand_create', edit: 'brand_edit' },
  { view: 'branch_view', create: 'branch_create', edit: 'branch_edit' },
  { view: 'staff_view', create: 'staff_create', edit: 'staff_edit' },
  {
    view: 'outside_staff_view',
    create: 'outside_staff_create',
    edit: 'outside_staff_edit',
  },
];

export function applyPermissionDependencies(
  row: Record<AppPermission, boolean>,
): Record<AppPermission, boolean> {
  const next = { ...row };
  for (const m of MODULE_VIEW_WRITE_DEPS) {
    requireViewForWrites(next, m.view, m.create, m.edit);
  }
  if (next.salary_edit) next.salary_view = true;
  if (!next.salary_view) next.salary_edit = false;
  return next;
}

export function applyOwnerLocks(
  role: string,
  row: Record<AppPermission, boolean>,
): Record<AppPermission, boolean> {
  if (role !== 'owner') return row;
  return { ...row, dashboard: true, settings: true };
}

export function mergeTenantPermissionRows(
  rows: { role: string; permission_key: string; enabled: boolean }[],
): Record<AppRole, Record<AppPermission, boolean>> {
  const merged = cloneRolePermissions();
  const storedKeys = new Map<AppRole, Set<string>>();
  for (const row of rows) {
    const role = row.role as AppRole;
    if (!merged[role] || role === 'technaas_super_admin') continue;
    const set = storedKeys.get(role) ?? new Set<string>();
    set.add(row.permission_key);
    storedKeys.set(role, set);
    const legacy =
      LEGACY_COMBINED_PERMISSIONS[
        row.permission_key as keyof typeof LEGACY_COMBINED_PERMISSIONS
      ];
    if (legacy) {
      for (const perm of legacy) merged[role][perm] = row.enabled;
    }
  }
  for (const row of rows) {
    const role = row.role as AppRole;
    const perm = row.permission_key as AppPermission;
    if (!merged[role] || !APP_PERMISSION_KEYS.includes(perm)) continue;
    if (role === 'technaas_super_admin') continue;
    merged[role][perm] = row.enabled;
  }
  for (const role of TENANT_EDITABLE_ROLES) {
    const keys = storedKeys.get(role);
    for (const { view, create, edit } of MODULE_VIEW_WRITE_DEPS) {
      if (!keys?.has(view)) {
        merged[role][view] = !!(merged[role][create] || merged[role][edit]);
      }
    }
    merged[role] = applyOwnerLocks(role, applyPermissionDependencies(merged[role]));
  }
  return merged;
}

let runtimePermissions: Record<AppRole, Record<AppPermission, boolean>> | null = null;

export function setRuntimeRolePermissions(
  matrix: Record<AppRole, Record<AppPermission, boolean>> | null,
): void {
  runtimePermissions = matrix;
}

export function getRuntimeRolePermissions(): Record<
  AppRole,
  Record<AppPermission, boolean>
> {
  return runtimePermissions ?? ROLE_PERMISSIONS;
}

export function hasPermission(
  role: string | null | undefined,
  perm: AppPermission,
): boolean {
  if (!role) return false;
  const matrix = getRuntimeRolePermissions();
  const r = matrix[role as AppRole] ?? ROLE_PERMISSIONS[role as AppRole];
  if (!r) return false;
  return !!r[perm];
}

export function hasAnyPermission(
  role: string | null | undefined,
  perms: AppPermission[],
): boolean {
  return perms.some((perm) => hasPermission(role, perm));
}

export function canViewSalary(role: string | null | undefined): boolean {
  return hasPermission(role, 'salary_view');
}

export function canViewBrand(role: string | null | undefined): boolean {
  return hasPermission(role, 'brand_view');
}

export function canViewBranch(role: string | null | undefined): boolean {
  return hasPermission(role, 'branch_view');
}

export function canViewStaff(role: string | null | undefined): boolean {
  return hasPermission(role, 'staff_view');
}

export function canViewDocuments(role: string | null | undefined): boolean {
  return hasAnyPermission(role, ['doc_view', 'doc_upload', 'doc_edit']);
}

export function canViewVehicles(role: string | null | undefined): boolean {
  return hasAnyPermission(role, ['vehicles', 'vehicle_create', 'vehicle_edit']);
}

export function canViewAlerts(role: string | null | undefined): boolean {
  return hasPermission(role, 'expiry_alerts');
}

export function canViewDashboard(role: string | null | undefined): boolean {
  return hasPermission(role, 'dashboard');
}
