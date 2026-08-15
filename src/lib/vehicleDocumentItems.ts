import { getDocumentDisplayStatus } from '@/src/lib/documentStatus';
import { getUrgencyGroup } from '@/src/lib/alertUrgency';
import { daysUntilExpiry } from '@/src/lib/expiry';
import {
  formatPlateNumber,
  formatVehicleTitle,
  safeText,
  VEHICLE_DAFTAR_LABEL,
  vehicleDaftarDocumentId,
} from '@/src/lib/vehicleFields';
import type { AlertListItem } from '@/src/types/alerts';
import type { DocumentListItem } from '@/src/types/documents';
import type { VehicleRecord } from '@/src/types/vehicles';
import type { Branch, Brand } from '@/src/types/staff';

type LookupContext = {
  branchById: Map<string, Branch>;
  brandById: Map<string, Brand>;
  thresholdDays: number;
};

function vehicleLinkedLabel(vehicle: VehicleRecord): string {
  const title = formatVehicleTitle(vehicle);
  const plate = safeText(vehicle.plate_number);
  if (plate) {
    return `${title} · Plate Number: ${plate}`;
  }
  return `${title} · ${formatPlateNumber(vehicle.plate_number)}`;
}

export function buildVehicleDaftarDocumentItems(
  vehicles: VehicleRecord[],
  context: LookupContext,
): DocumentListItem[] {
  const items: DocumentListItem[] = [];

  for (const vehicle of vehicles) {
    if (!vehicle.daftar_expiry_date) continue;

    const branch = context.branchById.get(vehicle.branch_id);
    const brand = branch
      ? context.brandById.get(branch.brand_id)
      : context.brandById.get(vehicle.brand_id);

    const displayStatus = getDocumentDisplayStatus(
      vehicle.daftar_expiry_date,
      context.thresholdDays,
    );

    items.push({
      id: vehicleDaftarDocumentId(vehicle.id),
      kind: 'vehicle',
      documentName: 'vehicle_daftar',
      documentLabel: VEHICLE_DAFTAR_LABEL,
      linkedTo: vehicleLinkedLabel(vehicle),
      ownerId: vehicle.id,
      brandId: brand?.id ?? vehicle.brand_id,
      brandName: brand?.name ?? '—',
      branchId: branch?.id ?? vehicle.branch_id,
      branchName: branch?.name ?? '—',
      expiryDate: vehicle.daftar_expiry_date,
      daysRemaining: daysUntilExpiry(vehicle.daftar_expiry_date),
      displayStatus,
      plateNumber: safeText(vehicle.plate_number) || null,
      vehicleMake: safeText(vehicle.vehicle_make) || null,
      vehicleModel: safeText(vehicle.model) || null,
    });
  }

  return items;
}

export function buildVehicleDaftarAlertItems(
  vehicles: VehicleRecord[],
  context: LookupContext,
): AlertListItem[] {
  const items: AlertListItem[] = [];

  for (const vehicle of vehicles) {
    if (!vehicle.daftar_expiry_date) continue;

    const displayStatus = getDocumentDisplayStatus(
      vehicle.daftar_expiry_date,
      context.thresholdDays,
    );
    if (displayStatus !== 'expired' && displayStatus !== 'expiring') continue;

    const daysRemaining = daysUntilExpiry(vehicle.daftar_expiry_date);
    const urgencyGroup = getUrgencyGroup(daysRemaining, displayStatus);
    if (!urgencyGroup) continue;

    const branch = context.branchById.get(vehicle.branch_id);
    const brand = branch
      ? context.brandById.get(branch.brand_id)
      : context.brandById.get(vehicle.brand_id);

    items.push({
      id: vehicleDaftarDocumentId(vehicle.id),
      kind: 'vehicle',
      documentLabel: VEHICLE_DAFTAR_LABEL,
      typeLabel: safeText(vehicle.plate_number)
        ? `Plate No: ${safeText(vehicle.plate_number)}`
        : formatPlateNumber(vehicle.plate_number),
      linkedTo: vehicleLinkedLabel(vehicle),
      brandId: brand?.id ?? vehicle.brand_id,
      brandName: brand?.name ?? '—',
      branchId: branch?.id ?? vehicle.branch_id,
      branchName: branch?.name ?? '—',
      expiryDate: vehicle.daftar_expiry_date,
      daysRemaining,
      displayStatus,
      urgencyGroup,
      plateNumber: safeText(vehicle.plate_number) || null,
    });
  }

  return items;
}

export function countVehicleDaftarAlerts(
  vehicles: VehicleRecord[],
  thresholdDays: number,
): number {
  let count = 0;
  for (const vehicle of vehicles) {
    if (!vehicle.daftar_expiry_date) continue;
    const status = getDocumentDisplayStatus(vehicle.daftar_expiry_date, thresholdDays);
    if (status === 'expired' || status === 'expiring') count += 1;
  }
  return count;
}
