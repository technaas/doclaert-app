import { getDocumentDisplayStatus } from '@/src/lib/documentStatus';
import { getUrgencyGroup } from '@/src/lib/alertUrgency';
import { getDocumentLabel } from '@/src/constants/documents';
import { daysUntilExpiry } from '@/src/lib/expiry';
import type { AlertFilters, AlertListItem } from '@/src/types/alerts';
import type { DocumentRecord } from '@/src/types/documents';
import type { Branch, Brand, StaffMember } from '@/src/types/staff';
import type { VehicleRecord } from '@/src/types/vehicles';
import { buildVehicleDaftarAlertItems, countVehicleDaftarAlerts } from '@/src/lib/vehicleDocumentItems';

type LookupContext = {
  staffById: Map<string, StaffMember>;
  branchById: Map<string, Branch>;
  brandById: Map<string, Brand>;
  thresholdDays: number;
};

export function buildAlertListItems(
  documents: DocumentRecord[],
  context: LookupContext,
): AlertListItem[] {
  const items: AlertListItem[] = [];

  for (const doc of documents) {
    if (!doc.expiry_date) continue;

    const displayStatus = getDocumentDisplayStatus(doc.expiry_date, context.thresholdDays);
    if (displayStatus !== 'expired' && displayStatus !== 'expiring') continue;

    const daysRemaining = daysUntilExpiry(doc.expiry_date);
    const urgencyGroup = getUrgencyGroup(daysRemaining, displayStatus);
    if (!urgencyGroup) continue;

    if (doc.type === 'staff' && doc.staff_id) {
      const staff = context.staffById.get(doc.staff_id);
      const branch = staff ? context.branchById.get(staff.branch_id) : undefined;
      const brand = branch
        ? context.brandById.get(branch.brand_id)
        : staff
          ? context.brandById.get(staff.brand_id)
          : undefined;

      items.push({
        id: doc.id,
        kind: 'staff',
        documentLabel: getDocumentLabel(doc.document_name),
        typeLabel: 'Staff Document',
        linkedTo: staff?.name ?? '—',
        brandId: brand?.id ?? '',
        brandName: brand?.name ?? '—',
        branchId: branch?.id ?? '',
        branchName: branch?.name ?? '—',
        expiryDate: doc.expiry_date,
        daysRemaining,
        displayStatus,
        urgencyGroup,
      });
    } else if (doc.type === 'branch' && doc.branch_id) {
      const branch = context.branchById.get(doc.branch_id);
      const brand = branch ? context.brandById.get(branch.brand_id) : undefined;

      items.push({
        id: doc.id,
        kind: 'branch',
        documentLabel: getDocumentLabel(doc.document_name),
        typeLabel: 'Branch License',
        linkedTo: branch?.name ?? '—',
        brandId: brand?.id ?? '',
        brandName: brand?.name ?? '—',
        branchId: branch?.id ?? '',
        branchName: branch?.name ?? '—',
        expiryDate: doc.expiry_date,
        daysRemaining,
        displayStatus,
        urgencyGroup,
      });
    } else if (doc.type === 'vehicle') {
      items.push({
        id: doc.id,
        kind: 'vehicle',
        documentLabel: getDocumentLabel(doc.document_name),
        typeLabel: 'Vehicle Daftar',
        linkedTo: '—',
        brandId: '',
        brandName: '—',
        branchId: doc.branch_id ?? '',
        branchName: '—',
        expiryDate: doc.expiry_date,
        daysRemaining,
        displayStatus,
        urgencyGroup,
      });
    }
  }

  return items.sort((a, b) => {
    const dayA = a.daysRemaining ?? 9999;
    const dayB = b.daysRemaining ?? 9999;
    return dayA - dayB;
  });
}

export function buildAllAlertListItems(
  documents: DocumentRecord[],
  vehicles: VehicleRecord[],
  context: LookupContext,
): AlertListItem[] {
  const documentAlerts = buildAlertListItems(documents, context);
  const vehicleAlerts = buildVehicleDaftarAlertItems(vehicles, context);
  return [...documentAlerts, ...vehicleAlerts].sort((a, b) => {
    const dayA = a.daysRemaining ?? 9999;
    const dayB = b.daysRemaining ?? 9999;
    return dayA - dayB;
  });
}

export function filterAlertList(items: AlertListItem[], filters: AlertFilters): AlertListItem[] {
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
      item.typeLabel.toLowerCase().includes(search) ||
      (item.plateNumber?.toLowerCase().includes(search) ?? false)
    );
  });
}

export function countDocumentAlerts(
  documents: DocumentRecord[],
  thresholdDays: number,
  vehicles: VehicleRecord[] = [],
): number {
  let count = 0;
  for (const doc of documents) {
    if (!doc.expiry_date) continue;
    const status = getDocumentDisplayStatus(doc.expiry_date, thresholdDays);
    if (status === 'expired' || status === 'expiring') count += 1;
  }
  return count + countVehicleDaftarAlerts(vehicles, thresholdDays);
}
