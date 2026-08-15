import { FilterBar } from '@/src/components/ui/FilterBar';
import { FilterSelect, type FilterOption } from '@/src/components/ui/FilterSelect';
import type { StaffFilters } from '@/src/types/filters';
import { DEFAULT_STAFF_FILTERS } from '@/src/types/filters';
import type { Branch, Brand } from '@/src/types/staff';

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const STAFF_TYPE_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All types' },
  { value: 'Full Time', label: 'Full Time' },
  { value: 'Part Time', label: 'Part Time' },
  { value: 'Both', label: 'Both' },
];

type StaffFiltersBarProps = {
  filters: StaffFilters;
  onChange: (patch: Partial<StaffFilters>) => void;
  brands: Brand[];
  branches: Branch[];
  roles: string[];
  showRole?: boolean;
};

function hasActiveFilters(filters: StaffFilters): boolean {
  return (
    filters.brandId !== DEFAULT_STAFF_FILTERS.brandId ||
    filters.branchId !== DEFAULT_STAFF_FILTERS.branchId ||
    filters.status !== DEFAULT_STAFF_FILTERS.status ||
    filters.staffType !== DEFAULT_STAFF_FILTERS.staffType ||
    filters.role !== DEFAULT_STAFF_FILTERS.role
  );
}

export function StaffFiltersBar({
  filters,
  onChange,
  brands,
  branches,
  roles,
  showRole = false,
}: StaffFiltersBarProps) {
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

  const roleOptions: FilterOption[] = [
    { value: 'all', label: 'All roles' },
    ...roles.map((r) => ({ value: r, label: r })),
  ];

  return (
    <FilterBar
      showReset={hasActiveFilters(filters)}
      onReset={() =>
        onChange({
          brandId: 'all',
          branchId: 'all',
          status: 'all',
          staffType: 'all',
          role: 'all',
        })
      }>
      <FilterSelect
        label="Brand"
        value={filters.brandId}
        options={brandOptions}
        onChange={(brandId) =>
          onChange({
            brandId,
            branchId: 'all',
          })
        }
      />
      <FilterSelect
        label="Branch"
        value={filters.branchId}
        options={branchOptions}
        onChange={(branchId) => onChange({ branchId })}
      />
      <FilterSelect
        label="Type"
        value={filters.staffType}
        options={STAFF_TYPE_OPTIONS}
        onChange={(staffType) => onChange({ staffType })}
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(status) => onChange({ status })}
      />
      {showRole ? (
        <FilterSelect
          label="Role"
          value={filters.role}
          options={roleOptions}
          onChange={(role) => onChange({ role })}
        />
      ) : null}
    </FilterBar>
  );
}
