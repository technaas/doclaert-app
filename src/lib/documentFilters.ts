import { getDocumentLabel } from '@/src/constants/documents';
import {
  daysRemainingForDocument,
  isSummaryExpiring,
  matchesStatusFilter,
  uiStatusForDocument,
} from '@/src/lib/documentStatus';
import { isDocumentInventoryRow } from '@/src/lib/operationalExpiry';
import type {
  DocumentFilters,
  DocumentListItem,
  DocumentRecord,
} from '@/src/types/documents';
import type { Branch, Brand, StaffMember } from '@/src/types/staff';

type LookupContext = {
  staffById: Map<string, StaffMember>;
  branchById: Map<string, Branch>;
  brandById: Map<string, Brand>;
};

function pushItem(
  items: DocumentListItem[],
  doc: DocumentRecord,
  fields: Omit<DocumentListItem, 'id' | 'documentName' | 'documentLabel' | 'expiryDate' | 'daysRemaining' | 'displayStatus'>,
) {
  items.push({
    ...fields,
    id: doc.id,
    documentName: doc.document_name,
    documentLabel: getDocumentLabel(doc.document_name),
    expiryDate: doc.expiry_date,
    daysRemaining: daysRemainingForDocument(doc),
    displayStatus: uiStatusForDocument(doc),
  });
}

export function buildDocumentListItems(
  documents: DocumentRecord[],
  context: LookupContext,
): DocumentListItem[] {
  const items: DocumentListItem[] = [];

  for (const doc of documents) {
    if (!isDocumentInventoryRow(doc)) continue;

    if (doc.type === 'staff' && doc.staff_id) {
      const staff = context.staffById.get(doc.staff_id);
      const branch = staff ? context.branchById.get(staff.branch_id) : undefined;
      const brand = branch
        ? context.brandById.get(branch.brand_id)
        : staff
          ? context.brandById.get(staff.brand_id)
          : undefined;

      pushItem(items, doc, {
        kind: 'staff',
        linkedTo: staff?.name ?? '—',
        ownerId: doc.staff_id,
        brandId: brand?.id ?? '',
        brandName: brand?.name ?? '—',
        branchId: branch?.id ?? '',
        branchName: branch?.name ?? '—',
      });
    } else if (doc.type === 'branch' && doc.branch_id) {
      const branch = context.branchById.get(doc.branch_id);
      const brand = branch ? context.brandById.get(branch.brand_id) : undefined;

      pushItem(items, doc, {
        kind: 'branch',
        linkedTo: branch?.name ?? '—',
        ownerId: doc.branch_id,
        brandId: brand?.id ?? '',
        brandName: brand?.name ?? '—',
        branchId: branch?.id ?? '',
        branchName: branch?.name ?? '—',
      });
    }
  }

  return items.sort((a, b) => (a.expiryDate ?? '').localeCompare(b.expiryDate ?? ''));
}

export function filterDocumentList(
  items: DocumentListItem[],
  filters: DocumentFilters,
): DocumentListItem[] {
  const search = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.tab === 'staff' && item.kind !== 'staff') return false;
    if (filters.tab === 'branch' && item.kind !== 'branch') return false;
    if (filters.tab === 'vehicle' && item.kind !== 'vehicle') return false;
    if (filters.brandId !== 'all' && item.brandId !== filters.brandId) return false;
    if (filters.branchId !== 'all' && item.branchId !== filters.branchId) return false;
    if (!matchesStatusFilter(item.displayStatus, filters.status)) return false;

    if (!search) return true;

    return (
      item.documentLabel.toLowerCase().includes(search) ||
      item.linkedTo.toLowerCase().includes(search) ||
      item.brandName.toLowerCase().includes(search) ||
      item.branchName.toLowerCase().includes(search) ||
      (item.plateNumber?.toLowerCase().includes(search) ?? false) ||
      (item.vehicleMake?.toLowerCase().includes(search) ?? false) ||
      (item.vehicleModel?.toLowerCase().includes(search) ?? false)
    );
  });
}

export function countDocumentSummary(items: DocumentListItem[]): {
  valid: number;
  expiringSoon: number;
  expired: number;
} {
  let valid = 0;
  let expiringSoon = 0;
  let expired = 0;
  for (const item of items) {
    if (item.displayStatus === 'expired') expired += 1;
    else if (isSummaryExpiring(item.displayStatus)) expiringSoon += 1;
    else if (item.displayStatus === 'valid' || item.displayStatus === 'non_expiring') {
      valid += 1;
    }
  }
  return { valid, expiringSoon, expired };
}
