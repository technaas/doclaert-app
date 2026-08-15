import { getDocumentDisplayStatus } from '@/src/lib/documentStatus';
import { daysUntilExpiry } from '@/src/lib/expiry';
import { getDocumentLabel } from '@/src/constants/documents';
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
  thresholdDays: number;
};

export function buildDocumentListItems(
  documents: DocumentRecord[],
  context: LookupContext,
): DocumentListItem[] {
  const items: DocumentListItem[] = [];

  for (const doc of documents) {
    if (doc.type === 'staff' && doc.staff_id) {
      const staff = context.staffById.get(doc.staff_id);
      const branch = staff ? context.branchById.get(staff.branch_id) : undefined;
      const brand = branch
        ? context.brandById.get(branch.brand_id)
        : staff
          ? context.brandById.get(staff.brand_id)
          : undefined;

      const displayStatus = getDocumentDisplayStatus(doc.expiry_date, context.thresholdDays);

      items.push({
        id: doc.id,
        kind: 'staff',
        documentName: doc.document_name,
        documentLabel: getDocumentLabel(doc.document_name),
        linkedTo: staff?.name ?? '—',
        ownerId: doc.staff_id,
        brandId: brand?.id ?? '',
        brandName: brand?.name ?? '—',
        branchId: branch?.id ?? '',
        branchName: branch?.name ?? '—',
        expiryDate: doc.expiry_date,
        daysRemaining: doc.expiry_date ? daysUntilExpiry(doc.expiry_date) : null,
        displayStatus,
      });
    } else if (doc.type === 'branch' && doc.branch_id) {
      const branch = context.branchById.get(doc.branch_id);
      const brand = branch ? context.brandById.get(branch.brand_id) : undefined;
      const displayStatus = getDocumentDisplayStatus(doc.expiry_date, context.thresholdDays);

      items.push({
        id: doc.id,
        kind: 'branch',
        documentName: doc.document_name,
        documentLabel: getDocumentLabel(doc.document_name),
        linkedTo: branch?.name ?? '—',
        ownerId: doc.branch_id,
        brandId: brand?.id ?? '',
        brandName: brand?.name ?? '—',
        branchId: branch?.id ?? '',
        branchName: branch?.name ?? '—',
        expiryDate: doc.expiry_date,
        daysRemaining: doc.expiry_date ? daysUntilExpiry(doc.expiry_date) : null,
        displayStatus,
      });
    } else if (doc.type === 'vehicle') {
      const displayStatus = getDocumentDisplayStatus(doc.expiry_date, context.thresholdDays);
      items.push({
        id: doc.id,
        kind: 'vehicle',
        documentName: doc.document_name,
        documentLabel: getDocumentLabel(doc.document_name),
        linkedTo: '—',
        ownerId: doc.staff_id ?? doc.branch_id ?? doc.id,
        brandId: '',
        brandName: '—',
        branchId: doc.branch_id ?? '',
        branchName: '—',
        expiryDate: doc.expiry_date,
        daysRemaining: doc.expiry_date ? daysUntilExpiry(doc.expiry_date) : null,
        displayStatus,
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
    if (filters.status !== 'all' && item.displayStatus !== filters.status) return false;

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
