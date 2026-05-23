import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BranchCard } from '@/src/components/branches/BranchCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { FilterSelect, type FilterOption } from '@/src/components/ui/FilterSelect';
import { ListRowSkeleton } from '@/src/components/ui/ListRowSkeleton';
import { SearchInput } from '@/src/components/ui/SearchInput';
import { EMPTY_STATES } from '@/src/constants/emptyStates';
import { FLAT_LIST_PERF } from '@/src/constants/listConfig';
import { colors, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useCompanyOrgData } from '@/src/hooks/useCompanyOrgData';
import { buildBranchListItems, filterBranches } from '@/src/lib/branchMetrics';
import type { AppStackParamList } from '@/src/navigation/AppStack';

type Props = NativeStackScreenProps<AppStackParamList, 'Branches'>;

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function BranchesScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const companyId = profile?.company_id;
  const { data, loading, refreshing, error, refresh, retry } = useCompanyOrgData(companyId);

  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const brandOptions: FilterOption[] = useMemo(() => {
    if (!data) return [{ value: 'all', label: 'All brands' }];
    return [
      { value: 'all', label: 'All brands' },
      ...data.brands.map((brand) => ({ value: brand.id, label: brand.name })),
    ];
  }, [data]);

  const branches = useMemo(() => {
    if (!data) return [];
    const brandMap = new Map(data.brands.map((brand) => [brand.id, brand.name]));
    const items = buildBranchListItems(data.branches, brandMap, {
      staff: data.staff,
      documents: data.documents,
      thresholdDays: data.alertThresholdDays,
    });
    return filterBranches(items, search, brandFilter, statusFilter);
  }, [data, search, brandFilter, statusFilter]);

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search branch or location"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <FilterSelect
              label="Brand"
              value={brandFilter}
              options={brandOptions}
              onChange={setBrandFilter}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={setStatusFilter}
            />
          </View>
        </ScrollView>
      </View>

      {loading && !data ? (
        <View style={styles.pad}>
          {Array.from({ length: 5 }, (_, i) => (
            <ListRowSkeleton key={`branch-skeleton-${i}`} />
          ))}
        </View>
      ) : null}

      {error && !data ? (
        <View style={styles.pad}>
          <ErrorState message={error} onRetry={retry} />
        </View>
      ) : null}

      {!loading && !error && branches.length === 0 ? (
        <View style={styles.pad}>
          <EmptyState {...EMPTY_STATES.branches} />
        </View>
      ) : null}

      {data && !error ? (
        <FlatList
          {...FLAT_LIST_PERF}
          data={branches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.pad}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={
            !loading ? (
              <Text style={styles.count}>
                {branches.length} branch{branches.length === 1 ? '' : 'es'}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <BranchCard
              branch={item}
              onPress={() => navigation.navigate('BranchDetail', { branchId: item.id })}
            />
          )}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filters: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pad: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  count: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
});
