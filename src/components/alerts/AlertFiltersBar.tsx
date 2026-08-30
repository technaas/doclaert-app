import { FilterBar } from '@/src/components/ui/FilterBar';
import { FilterSelect, type FilterOption } from '@/src/components/ui/FilterSelect';
import { DocumentTabBar } from '@/src/components/documents/DocumentTabBar';
import { spacing } from '@/src/constants/theme';
import type { AlertFilters } from '@/src/types/alerts';
import { DEFAULT_ALERT_FILTERS } from '@/src/types/alerts';
import type { Branch, Brand } from '@/src/types/staff';
import { StyleSheet, View } from 'react-native';

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'critical', label: 'Critical' },
  { value: 'expired', label: 'Expired' },
];

type AlertFiltersBarProps = {
  filters: AlertFilters;
  onChange: (patch: Partial<AlertFilters>) => void;
  brands: Brand[];
  branches: Branch[];
};

function hasActiveFilters(filters: AlertFilters): boolean {
  return (
    filters.brandId !== DEFAULT_ALERT_FILTERS.brandId ||
    filters.branchId !== DEFAULT_ALERT_FILTERS.branchId ||
    filters.status !== DEFAULT_ALERT_FILTERS.status ||
    filters.tab !== DEFAULT_ALERT_FILTERS.tab
  );
}

export function AlertFiltersBar({
  filters,
  onChange,
  brands,
  branches,
}: AlertFiltersBarProps) {
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
    <View style={styles.wrap}>
      <DocumentTabBar
        value={filters.tab}
        onChange={(tab) => onChange({ tab })}
      />
      <FilterBar
        showReset={hasActiveFilters(filters)}
        onReset={() =>
          onChange({
            brandId: 'all',
            branchId: 'all',
            status: 'all',
            tab: 'all',
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
          onChange={(status) => onChange({ status: status as AlertFilters['status'] })}
        />
      </FilterBar>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
});
