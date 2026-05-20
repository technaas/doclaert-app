import type { StaffFilters } from '@/src/types/filters';
import type { StaffListItem, StaffMember } from '@/src/types/staff';

type LookupMaps = {
  branchToBrandId: Map<string, string>;
};

export function filterStaffList(
  staff: StaffMember[],
  filters: StaffFilters,
  maps: LookupMaps,
): StaffMember[] {
  const search = filters.search.trim().toLowerCase();

  return staff.filter((member) => {
    if (filters.brandId !== 'all') {
      const brandId = maps.branchToBrandId.get(member.branch_id);
      if (brandId !== filters.brandId) return false;
    }
    if (filters.branchId !== 'all' && member.branch_id !== filters.branchId) {
      return false;
    }
    if (filters.status !== 'all' && (member.status ?? '') !== filters.status) {
      return false;
    }
    if (filters.staffType !== 'all' && (member.staff_type ?? 'Full Time') !== filters.staffType) {
      return false;
    }
    if (filters.role !== 'all' && (member.role ?? '') !== filters.role) {
      return false;
    }
    if (!search) return true;

    return (
      member.name.toLowerCase().includes(search) ||
      (member.staff_id ?? '').toLowerCase().includes(search)
    );
  });
}

export function enrichStaffList(
  staff: StaffMember[],
  brandMap: Map<string, string>,
  branchMap: Map<string, string>,
  branchToBrandId: Map<string, string>,
): StaffListItem[] {
  return staff.map((member) => ({
    ...member,
    brandName: brandMap.get(branchToBrandId.get(member.branch_id) ?? member.brand_id) ?? '—',
    branchName: branchMap.get(member.branch_id) ?? '—',
    partTimeBrandName: member.part_time_brand_id
      ? (brandMap.get(member.part_time_brand_id) ?? '—')
      : null,
    partTimeBranchName: member.part_time_branch_id
      ? (branchMap.get(member.part_time_branch_id) ?? '—')
      : null,
  }));
}

export function isPartTimeType(staffType: string | null | undefined): boolean {
  const type = staffType ?? 'Full Time';
  return type === 'Part Time' || type === 'Both';
}
