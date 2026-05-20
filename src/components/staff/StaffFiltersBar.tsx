import { ScrollView, StyleSheet, View } from 'react-native';

import { FilterSelect, type FilterOption } from '@/src/components/ui/FilterSelect';
import { spacing } from '@/src/constants/theme';
import type { StaffFilters } from '@/src/types/filters';
import type { Branch, Brand } from '@/src/types/staff';

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const STAFF_TYPE_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
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
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}>
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
