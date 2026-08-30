import { FilterBar } from '@/src/components/ui/FilterBar';
import { FilterSelect, type FilterOption } from '@/src/components/ui/FilterSelect';
import type { VehicleFilters } from '@/src/types/vehicles';
import { DEFAULT_VEHICLE_FILTERS } from '@/src/types/vehicles';
import type { Branch, Brand } from '@/src/types/staff';

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'valid', label: 'Valid' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'critical', label: 'Critical' },
  { value: 'expired', label: 'Expired' },
  { value: 'pending_verification', label: 'Pending Verification' },
];

type VehicleFiltersBarProps = {
  filters: VehicleFilters;
  onChange: (patch: Partial<VehicleFilters>) => void;
  brands: Brand[];
  branches: Branch[];
};

function hasActiveFilters(filters: VehicleFilters): boolean {
  return (
    filters.brandId !== DEFAULT_VEHICLE_FILTERS.brandId ||
    filters.branchId !== DEFAULT_VEHICLE_FILTERS.branchId ||
    filters.status !== DEFAULT_VEHICLE_FILTERS.status
  );
}

export function VehicleFiltersBar({
  filters,
  onChange,
  brands,
  branches,
}: VehicleFiltersBarProps) {
  const brandOptions: FilterOption[] = [
    { value: 'all', label: 'All brands' },
    ...brands.map((b) => ({ value: b.id, label: b.name })),
  ];

  const visibleBranches =
    filters.brandId === 'all'
      ? branches
      : branches.filter((b) => b.brand_id === filters.brandId);

  const branchOptions: FilterOption[] = [
    { value: 'all', label: 'All branches' },
    ...visibleBranches.map((b) => ({ value: b.id, label: b.name })),
  ];

  return (
    <FilterBar
      showReset={hasActiveFilters(filters)}
      onReset={() =>
        onChange({
          brandId: 'all',
          branchId: 'all',
          status: 'all',
        })
      }>
      <FilterSelect
        label="Brand"
        value={filters.brandId}
        options={brandOptions}
        onChange={(brandId) => onChange({ brandId, branchId: 'all' })}
      />
      <FilterSelect
        label="Branch"
        value={filters.branchId}
        options={branchOptions}
        onChange={(branchId) => onChange({ branchId })}
      />
      <FilterSelect
        label="Daftar"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(status) => onChange({ status })}
      />
    </FilterBar>
  );
}
