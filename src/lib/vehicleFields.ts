import type { VehicleListItem, VehicleRecord } from '@/src/types/vehicles';

export const safeText = (value?: string | null): string => (value ?? '').trim();

function readString(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (value == null) continue;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed) return trimmed;
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }
  return '';
}

function readNullableString(row: Record<string, unknown>, ...keys: string[]): string | null {
  const value = readString(row, ...keys);
  return value || null;
}

function readYear(row: Record<string, unknown>): number | null {
  const raw = row.year_of_manufacture;
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return Math.floor(raw);
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function mapVehicleRecord(row: Record<string, unknown>): VehicleRecord {
  return {
    id: String(row.id ?? ''),
    company_id: String(row.company_id ?? ''),
    vehicle_make: readString(row, 'vehicle_make'),
    model: readString(row, 'model'),
    plate_number: readString(row, 'plate_number', 'registration_number'),
    daftar_number: readString(
      row,
      'daftar_number',
      'daftar_license_number',
      'duftar_license_number',
    ),
    chassis_number: readString(row, 'chassis_number'),
    engine_number: readString(row, 'engine_number'),
    vehicle_color: readString(row, 'vehicle_color'),
    year_of_manufacture: readYear(row),
    daftar_expiry_date: readNullableString(
      row,
      'daftar_expiry_date',
      'duftar_expiry_date',
    ),
    daftar_file_url: readNullableString(row, 'daftar_file_url', 'duftar_file_url'),
    brand_id: String(row.brand_id ?? ''),
    branch_id: String(row.branch_id ?? ''),
    status: readString(row, 'status') || 'active',
  };
}

export type VehicleTitleInput = {
  vehicle_make?: string | null;
  vehicleMake?: string | null;
  model?: string | null;
};

export function formatVehicleTitle(vehicle: VehicleTitleInput): string {
  const make = safeText(vehicle.vehicle_make ?? vehicle.vehicleMake);
  const model = safeText(vehicle.model);
  if (make && model) return `${make} ${model}`;
  return make || model || 'Vehicle';
}

export function formatPlateNumber(value?: string | null): string {
  const plate = safeText(value);
  return plate || 'Plate not available';
}

export function formatDaftarNumber(value?: string | null): string {
  const daftar = safeText(value);
  return daftar || '—';
}

export function formatOrgLine(
  brandName?: string | null,
  branchName?: string | null,
): string {
  const brand = safeText(brandName) || '—';
  const branch = safeText(branchName) || '—';
  return `${brand} · ${branch}`;
}

export function vehicleTitleFromListItem(item: VehicleListItem): string {
  return formatVehicleTitle({
    vehicleMake: item.vehicleMake,
    model: item.model,
  });
}

export const VEHICLE_DAFTAR_LABEL = 'Vehicle Daftar';

export const VEHICLE_DAFTAR_DOCUMENT_PREFIX = 'vehicle-daftar:';

export function vehicleDaftarDocumentId(vehicleId: string): string {
  return `${VEHICLE_DAFTAR_DOCUMENT_PREFIX}${vehicleId}`;
}

export function isVehicleDaftarDocumentId(id: string): boolean {
  return id.startsWith(VEHICLE_DAFTAR_DOCUMENT_PREFIX);
}

export function vehicleIdFromDaftarDocumentId(id: string): string {
  return id.slice(VEHICLE_DAFTAR_DOCUMENT_PREFIX.length);
}
