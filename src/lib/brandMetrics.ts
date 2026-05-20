import { countDocStatus, resolveBrandIdForStaff } from '@/src/services/orgData';
import type { BrandListItem, BrandRecord } from '@/src/types/brand';
import type { BranchRecord } from '@/src/types/branch';
import type { DocumentRecord } from '@/src/types/documents';
import type { StaffMember } from '@/src/types/staff';

type OrgContext = {
  branches: BranchRecord[];
  staff: StaffMember[];
  documents: DocumentRecord[];
  thresholdDays: number;
};

function getBrandBranchIds(brandId: string, branches: BranchRecord[]): Set<string> {
  return new Set(branches.filter((b) => b.brand_id === brandId).map((b) => b.id));
}

function getBrandStaffIds(
  brandId: string,
  staff: StaffMember[],
  branchToBrandId: Map<string, string>,
): Set<string> {
  const ids = new Set<string>();
  staff.forEach((member) => {
    if (resolveBrandIdForStaff(member, branchToBrandId) === brandId) {
      ids.add(member.id);
    }
  });
  return ids;
}

function countBrandDocuments(
  brandId: string,
  context: OrgContext,
  branchToBrandId: Map<string, string>,
): { expiring: number; expired: number } {
  const branchIds = getBrandBranchIds(brandId, context.branches);
  const staffIds = getBrandStaffIds(brandId, context.staff, branchToBrandId);

  let expiring = 0;
  let expired = 0;

  for (const doc of context.documents) {
    if (!doc.expiry_date) continue;

    const matchesStaff = doc.type === 'staff' && doc.staff_id && staffIds.has(doc.staff_id);
    const matchesBranch =
      doc.type === 'branch' && doc.branch_id && branchIds.has(doc.branch_id);

    if (!matchesStaff && !matchesBranch) continue;

    const status = countDocStatus(doc.expiry_date, context.thresholdDays);
    if (status === 'expired') expired += 1;
    else if (status === 'expiring') expiring += 1;
  }

  return { expiring, expired };
}

export function buildBrandListItems(
  brands: BrandRecord[],
  context: OrgContext,
): BrandListItem[] {
  const branchToBrandId = new Map(context.branches.map((b) => [b.id, b.brand_id]));

  return brands.map((brand) => {
    const branchIds = getBrandBranchIds(brand.id, context.branches);
    const staffIds = getBrandStaffIds(brand.id, context.staff, branchToBrandId);
    const docCounts = countBrandDocuments(brand.id, context, branchToBrandId);

    return {
      ...brand,
      branchCount: branchIds.size,
      staffCount: staffIds.size,
      expiringDocsCount: docCounts.expiring,
      expiredDocsCount: docCounts.expired,
    };
  });
}

export function filterBrands(
  items: BrandListItem[],
  search: string,
  status: string,
): BrandListItem[] {
  const query = search.trim().toLowerCase();
  return items.filter((brand) => {
    if (status !== 'all' && (brand.status ?? '') !== status) return false;
    if (!query) return true;
    return brand.name.toLowerCase().includes(query);
  });
}
