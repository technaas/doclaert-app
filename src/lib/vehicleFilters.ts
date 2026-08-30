import {
  daysRemainingForVehicleDaftar,
  matchesStatusFilter,
  uiStatusForVehicleDaftar,
} from '@/src/lib/documentStatus';
import { formatVehicleTitle, safeText } from '@/src/lib/vehicleFields';
import type { VehicleFilters, VehicleListItem, VehicleRecord } from '@/src/types/vehicles';
import type { Branch, Brand } from '@/src/types/staff';

type LookupContext = {
  branchById: Map<string, Branch>;
  brandById: Map<string, Brand>;
};

export function buildVehicleListItems(
  vehicles: VehicleRecord[],
  context: LookupContext,
): VehicleListItem[] {
  const items: VehicleListItem[] = [];

  for (const vehicle of vehicles) {
    const branch = context.branchById.get(vehicle.branch_id);
    const brand = branch
      ? context.brandById.get(branch.brand_id)
      : context.brandById.get(vehicle.brand_id);

    items.push({
      id: vehicle.id,
      companyName: vehicle.company_name,
      fleetNumber: vehicle.number,
      vehicleMake: vehicle.vehicle_make,
      model: vehicle.model,
      plateNumber: vehicle.plate_number,
      daftarNumber: vehicle.daftar_number,
      brandId: brand?.id ?? vehicle.brand_id,
      brandName: brand?.name ?? '—',
      branchId: branch?.id ?? vehicle.branch_id,
      branchName: branch?.name ?? '—',
      daftarExpiryDate: vehicle.daftar_expiry_date,
      daysRemaining: daysRemainingForVehicleDaftar(vehicle.daftar_expiry_date),
      displayStatus: uiStatusForVehicleDaftar(vehicle.daftar_expiry_date),
      status: vehicle.status,
    });
  }

  return items.sort((a, b) => {
    const titleA = formatVehicleTitle({
      vehicleMake: a.vehicleMake,
      model: a.model,
    }).toLowerCase();
    const titleB = formatVehicleTitle({
      vehicleMake: b.vehicleMake,
      model: b.model,
    }).toLowerCase();
    return titleA.localeCompare(titleB);
  });
}

export function filterVehicleList(
  items: VehicleListItem[],
  filters: VehicleFilters,
): VehicleListItem[] {
  const search = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    if (filters.brandId !== 'all' && item.brandId !== filters.brandId) return false;
    if (filters.branchId !== 'all' && item.branchId !== filters.branchId) return false;
    if (!matchesStatusFilter(item.displayStatus, filters.status)) return false;

    if (!search) return true;

    const title = formatVehicleTitle({
      vehicleMake: item.vehicleMake,
      model: item.model,
    }).toLowerCase();
    return (
      title.includes(search) ||
      safeText(item.plateNumber).toLowerCase().includes(search) ||
      safeText(item.daftarNumber).toLowerCase().includes(search) ||
      safeText(item.companyName).toLowerCase().includes(search) ||
      safeText(item.fleetNumber).toLowerCase().includes(search) ||
      safeText(item.brandName).toLowerCase().includes(search) ||
      safeText(item.branchName).toLowerCase().includes(search)
    );
  });
}
