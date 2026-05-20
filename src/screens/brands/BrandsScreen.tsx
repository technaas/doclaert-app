import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { BrandCard } from '@/src/components/brands/BrandCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { FilterSelect, type FilterOption } from '@/src/components/ui/FilterSelect';
import { ListRowSkeleton } from '@/src/components/ui/ListRowSkeleton';
import { SearchInput } from '@/src/components/ui/SearchInput';
import { colors, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useCompanyOrgData } from '@/src/hooks/useCompanyOrgData';
import { buildBrandListItems, filterBrands } from '@/src/lib/brandMetrics';
import type { AppStackParamList } from '@/src/navigation/AppStack';

type Props = NativeStackScreenProps<AppStackParamList, 'Brands'>;

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export function BrandsScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const companyId = profile?.company_id;
  const { data, loading, refreshing, error, refresh, retry } = useCompanyOrgData(companyId);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const brands = useMemo(() => {
    if (!data) return [];
    const items = buildBrandListItems(data.brands, {
      branches: data.branches,
      staff: data.staff,
      documents: data.documents,
      thresholdDays: data.alertThresholdDays,
    });
    return filterBrands(items, search, statusFilter);
  }, [data, search, statusFilter]);

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search brand name"
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={setStatusFilter}
        />
      </View>

      {loading && !data ? (
        <View style={styles.pad}>
          {Array.from({ length: 5 }, (_, i) => (
            <ListRowSkeleton key={`brand-skeleton-${i}`} />
          ))}
        </View>
      ) : null}

      {error && !data ? (
        <View style={styles.pad}>
          <ErrorState message={error} onRetry={retry} />
        </View>
      ) : null}

      {!loading && !error && brands.length === 0 ? (
        <View style={styles.pad}>
          <EmptyState
            title="No brands found"
            message="Try adjusting search or filters, or pull down to refresh."
            icon="business-outline"
          />
        </View>
      ) : null}

      {data && !error ? (
        <FlatList
          data={brands}
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
                {brands.length} brand{brands.length === 1 ? '' : 's'}
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <BrandCard
              brand={item}
              onPress={() => navigation.navigate('BrandDetail', { brandId: item.id })}
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
