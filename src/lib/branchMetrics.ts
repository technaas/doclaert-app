import { getDocumentLabel } from '@/src/constants/documents';
import { countDocStatus } from '@/src/services/orgData';
import type { BranchListItem, BranchRecord } from '@/src/types/branch';
import type { DocumentRecord } from '@/src/types/documents';
import type { StaffMember } from '@/src/types/staff';

type OrgContext = {
  staff: StaffMember[];
  documents: DocumentRecord[];
  thresholdDays: number;
};

function countBranchLicenses(
  branchId: string,
  documents: DocumentRecord[],
  thresholdDays: number,
): { total: number; expiring: number; expired: number } {
  let total = 0;
  let expiring = 0;
  let expired = 0;

  for (const doc of documents) {
    if (doc.type !== 'branch' || doc.branch_id !== branchId) continue;
    total += 1;
    if (!doc.expiry_date) continue;

    const status = countDocStatus(doc.expiry_date, thresholdDays);
    if (status === 'expired') expired += 1;
    else if (status === 'expiring') expiring += 1;
  }

  return { total, expiring, expired };
}

export function buildBranchListItems(
  branches: BranchRecord[],
  brandMap: Map<string, string>,
  context: OrgContext,
): BranchListItem[] {
  const staffByBranch = new Map<string, number>();
  context.staff.forEach((member) => {
    if (!member.branch_id) return;
    staffByBranch.set(member.branch_id, (staffByBranch.get(member.branch_id) ?? 0) + 1);
  });

  return branches.map((branch) => {
    const licenseCounts = countBranchLicenses(
      branch.id,
      context.documents,
      context.thresholdDays,
    );

    return {
      ...branch,
      brandName: brandMap.get(branch.brand_id) ?? '—',
      staffCount: staffByBranch.get(branch.id) ?? 0,
      licensesCount: licenseCounts.total,
      expiringLicensesCount: licenseCounts.expiring,
      expiredLicensesCount: licenseCounts.expired,
    };
  });
}

export function filterBranches(
  items: BranchListItem[],
  search: string,
  brandId: string,
  status: string,
): BranchListItem[] {
  const query = search.trim().toLowerCase();
  return items.filter((branch) => {
    if (brandId !== 'all' && branch.brand_id !== brandId) return false;
    if (status !== 'all' && (branch.status ?? '') !== status) return false;
    if (!query) return true;
    return (
      branch.name.toLowerCase().includes(query) ||
      (branch.location ?? '').toLowerCase().includes(query) ||
      branch.brandName.toLowerCase().includes(query)
    );
  });
}

export function getBranchDetailLicenses(
  branchId: string,
  documents: DocumentRecord[],
  thresholdDays: number,
) {
  return documents
    .filter((doc) => doc.type === 'branch' && doc.branch_id === branchId)
    .map((doc) => {
      const displayStatus = doc.expiry_date
        ? countDocStatus(doc.expiry_date, thresholdDays) ?? 'active'
        : 'active';
      return {
        id: doc.id,
        document_name: doc.document_name,
        documentLabel: getDocumentLabel(doc.document_name),
        expiry_date: doc.expiry_date,
        displayStatus: displayStatus as 'active' | 'expiring' | 'expired',
      };
    })
    .sort((a, b) => (a.expiry_date ?? '').localeCompare(b.expiry_date ?? ''));
}
