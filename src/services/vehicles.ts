import { mapVehicleRecord } from '@/src/lib/vehicleFields';
import { supabase } from '@/src/lib/supabase';
import type { VehicleRecord } from '@/src/types/vehicles';
import type { Branch, Brand } from '@/src/types/staff';
import { fetchCompanyStaffData } from '@/src/services/staff';

const VEHICLE_COLUMNS = '*';

export type CompanyVehiclesData = {
  vehicles: VehicleRecord[];
  brands: Brand[];
  branches: Branch[];
};

export async function fetchCompanyVehicles(companyId: string): Promise<VehicleRecord[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select(VEHICLE_COLUMNS)
    .eq('company_id', companyId)
    .order('vehicle_make');

  if (error) {
    return [];
  }

  return (data ?? []).map((row) => mapVehicleRecord(row as Record<string, unknown>));
}

export async function fetchVehicleById(
  companyId: string,
  vehicleId: string,
): Promise<VehicleRecord | null> {
  const { data, error } = await supabase
    .from('vehicles')
    .select(VEHICLE_COLUMNS)
    .eq('company_id', companyId)
    .eq('id', vehicleId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) return null;
  return mapVehicleRecord(data as Record<string, unknown>);
}

export async function fetchCompanyVehiclesData(companyId: string): Promise<CompanyVehiclesData> {
  const [lookups, vehicles] = await Promise.all([
    fetchCompanyStaffData(companyId),
    fetchCompanyVehicles(companyId),
  ]);

  return {
    vehicles,
    brands: lookups.brands,
    branches: lookups.branches,
  };
}
