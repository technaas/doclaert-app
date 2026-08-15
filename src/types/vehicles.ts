import type { DocumentDisplayStatus } from '@/src/types/documents';

export type VehicleRecord = {
  id: string;
  company_id: string;
  vehicle_make: string;
  model: string;
  plate_number: string;
  daftar_number: string;
  chassis_number: string;
  engine_number: string;
  vehicle_color: string;
  year_of_manufacture: number | null;
  daftar_expiry_date: string | null;
  daftar_file_url: string | null;
  brand_id: string;
  branch_id: string;
  status: string;
};

export type VehicleListItem = {
  id: string;
  vehicleMake: string;
  model: string;
  plateNumber: string;
  daftarNumber: string;
  brandId: string;
  brandName: string;
  branchId: string;
  branchName: string;
  daftarExpiryDate: string | null;
  daysRemaining: number | null;
  displayStatus: DocumentDisplayStatus;
  status: string;
};

export type VehicleFilters = {
  brandId: string;
  branchId: string;
  status: string;
  search: string;
};

export const DEFAULT_VEHICLE_FILTERS: VehicleFilters = {
  brandId: 'all',
  branchId: 'all',
  status: 'all',
  search: '',
};
