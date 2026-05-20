import { ScrollView, StyleSheet, View } from 'react-native';

import { FilterSelect, type FilterOption } from '@/src/components/ui/FilterSelect';
import { spacing } from '@/src/constants/theme';
import type { DocumentFilters } from '@/src/types/documents';
import type { Branch, Brand } from '@/src/types/staff';

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' },
];

type DocumentFiltersBarProps = {
  filters: DocumentFilters;
  onChange: (patch: Partial<DocumentFilters>) => void;
  brands: Brand[];
  branches: Branch[];
};

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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
