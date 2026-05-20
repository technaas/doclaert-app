import { ScrollView, StyleSheet, View } from 'react-native';

import { DocumentTabBar } from '@/src/components/documents/DocumentTabBar';
import { FilterSelect, type FilterOption } from '@/src/components/ui/FilterSelect';
import { spacing } from '@/src/constants/theme';
import type { AlertFilters } from '@/src/types/alerts';
import type { DocumentTab } from '@/src/types/documents';
import type { Branch, Brand } from '@/src/types/staff';

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'expiring', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' },
];

type AlertFiltersBarProps = {
  filters: AlertFilters;
  onChange: (patch: Partial<AlertFilters>) => void;
  brands: Brand[];
  branches: Branch[];
};

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
        value={filters.tab as DocumentTab}
        onChange={(tab) => onChange({ tab })}
      />
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
          onChange={(status) => onChange({ status: status as AlertFilters['status'] })}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
