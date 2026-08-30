import { FilterBar } from '@/src/components/ui/FilterBar';
import { FilterSelect, type FilterOption } from '@/src/components/ui/FilterSelect';
import type { DocumentFilters } from '@/src/types/documents';
import { DEFAULT_DOCUMENT_FILTERS } from '@/src/types/documents';
import type { Branch, Brand } from '@/src/types/staff';

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'valid', label: 'Valid' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'critical', label: 'Critical' },
  { value: 'expired', label: 'Expired' },
  { value: 'non_expiring', label: 'Non-Expiring' },
  { value: 'pending_verification', label: 'Pending Verification' },
];

type DocumentFiltersBarProps = {
  filters: DocumentFilters;
  onChange: (patch: Partial<DocumentFilters>) => void;
  brands: Brand[];
  branches: Branch[];
};

function hasActiveFilters(filters: DocumentFilters): boolean {
  return (
    filters.brandId !== DEFAULT_DOCUMENT_FILTERS.brandId ||
    filters.branchId !== DEFAULT_DOCUMENT_FILTERS.branchId ||
    filters.status !== DEFAULT_DOCUMENT_FILTERS.status
  );
}

export function DocumentFiltersBar({
  filters,
  onChange,
  brands,
  branches,
}: DocumentFiltersBarProps) {
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
        label="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(status) => onChange({ status })}
      />
    </FilterBar>
  );
}
