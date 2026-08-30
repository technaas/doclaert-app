import { getUrgencyGroup } from '@/src/lib/alertUrgency';
import {
  daysRemainingForVehicleDaftar,
  isAlertStatus,
  isSummaryExpiring,
  isSummaryValid,
  uiStatusForVehicleDaftar,
} from '@/src/lib/documentStatus';
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
};

function vehicleLinkedLabel(vehicle: VehicleRecord): string {
  const title = formatVehicleTitle(vehicle);
  const plate = safeText(vehicle.plate_number);
  if (plate) {
    return `${title} · Plate Number: ${plate}`;
  }
  return `${title} · ${formatPlateNumber(vehicle.plate_number)}`;
}

function vehicleOrg(vehicle: VehicleRecord, context: LookupContext) {
  const branch = context.branchById.get(vehicle.branch_id);
  const brand = branch
    ? context.brandById.get(branch.brand_id)
    : context.brandById.get(vehicle.brand_id);
  return {
    branch,
    brand,
    brandId: brand?.id ?? vehicle.brand_id,
    brandName: brand?.name ?? '—',
    branchId: branch?.id ?? vehicle.branch_id,
    branchName: branch?.name ?? '—',
  };
}

export function buildVehicleDaftarDocumentItems(
  vehicles: VehicleRecord[],
  context: LookupContext,
): DocumentListItem[] {
  const items: DocumentListItem[] = [];

  for (const vehicle of vehicles) {
    const org = vehicleOrg(vehicle, context);
    const displayStatus = uiStatusForVehicleDaftar(vehicle.daftar_expiry_date);

    items.push({
      id: vehicleDaftarDocumentId(vehicle.id),
      kind: 'vehicle',
      documentName: 'vehicle_daftar',
      documentLabel: VEHICLE_DAFTAR_LABEL,
      linkedTo: vehicleLinkedLabel(vehicle),
      ownerId: vehicle.id,
      brandId: org.brandId,
      brandName: org.brandName,
      branchId: org.branchId,
      branchName: org.branchName,
      expiryDate: vehicle.daftar_expiry_date,
      daysRemaining: daysRemainingForVehicleDaftar(vehicle.daftar_expiry_date),
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

    const displayStatus = uiStatusForVehicleDaftar(vehicle.daftar_expiry_date);
    if (!isAlertStatus(displayStatus)) continue;

    const daysRemaining = daysRemainingForVehicleDaftar(vehicle.daftar_expiry_date);
    const urgencyGroup = getUrgencyGroup(daysRemaining, displayStatus);
    if (!urgencyGroup) continue;

    const org = vehicleOrg(vehicle, context);

    items.push({
      id: vehicleDaftarDocumentId(vehicle.id),
      kind: 'vehicle',
      documentLabel: VEHICLE_DAFTAR_LABEL,
      typeLabel: safeText(vehicle.plate_number)
        ? `Plate No: ${safeText(vehicle.plate_number)}`
        : formatPlateNumber(vehicle.plate_number),
      linkedTo: vehicleLinkedLabel(vehicle),
      brandId: org.brandId,
      brandName: org.brandName,
      branchId: org.branchId,
      branchName: org.branchName,
      expiryDate: vehicle.daftar_expiry_date,
      daysRemaining,
      displayStatus,
      urgencyGroup,
      plateNumber: safeText(vehicle.plate_number) || null,
    });
  }

  return items;
}

export function countVehicleDaftarAlerts(vehicles: VehicleRecord[]): number {
  let count = 0;
  for (const vehicle of vehicles) {
    if (!vehicle.daftar_expiry_date) continue;
    if (isAlertStatus(uiStatusForVehicleDaftar(vehicle.daftar_expiry_date))) count += 1;
  }
  return count;
}

export function countVehicleDaftarSummary(vehicles: VehicleRecord[]): {
  valid: number;
  expiringSoon: number;
  expired: number;
} {
  let valid = 0;
  let expiringSoon = 0;
  let expired = 0;
  for (const vehicle of vehicles) {
    if (!vehicle.daftar_expiry_date) continue;
    const status = uiStatusForVehicleDaftar(vehicle.daftar_expiry_date);
    if (status === 'expired') expired += 1;
    else if (isSummaryExpiring(status)) expiringSoon += 1;
    else if (isSummaryValid(status)) valid += 1;
  }
  return { valid, expiringSoon, expired };
}
