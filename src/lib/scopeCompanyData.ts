import type { AccessScope } from '@/src/lib/accessScope';
import type { DocumentRecord } from '@/src/types/documents';
import type { Branch, StaffMember } from '@/src/types/staff';
import type { VehicleRecord } from '@/src/types/vehicles';

export function scopeStaffMembers(
  staff: StaffMember[],
  scope: AccessScope,
): StaffMember[] {
  return scope.filterByBranch(staff);
}

export function scopeVehicles(
  vehicles: VehicleRecord[],
  scope: AccessScope,
): VehicleRecord[] {
  return scope.filterByBranch(vehicles);
}

export function scopeDocuments(
  documents: DocumentRecord[],
  scope: AccessScope,
  staff: StaffMember[],
  branches: Pick<Branch, 'id' | 'brand_id'>[],
): DocumentRecord[] {
  const staffIds = new Set(scopeStaffMembers(staff, scope).map((row) => row.id));
  const branchBrand = new Map(branches.map((row) => [row.id, row.brand_id]));

  return documents.filter((doc) => {
    if (doc.type === 'staff') {
      return !!doc.staff_id && staffIds.has(doc.staff_id);
    }
    if (doc.type === 'branch') {
      return scope.canBranch(doc.branch_id, branchBrand.get(doc.branch_id ?? '') ?? null);
    }
    return false;
  });
}
