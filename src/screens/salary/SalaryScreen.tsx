import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppScreenLayout } from '@/src/components/layout/AppScreenLayout';
import { SalarySummaryStrip } from '@/src/components/salary/SalarySummaryStrip';
import { SalaryStaffRow } from '@/src/components/salary/SalaryStaffRow';
import { StaffFiltersBar } from '@/src/components/staff/StaffFiltersBar';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { SearchInput } from '@/src/components/ui/SearchInput';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { ListRowSkeleton } from '@/src/components/ui/ListRowSkeleton';
import { EMPTY_STATES } from '@/src/constants/emptyStates';
import { FLAT_LIST_PERF } from '@/src/constants/listConfig';
import { colors, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useCompanyStaffData } from '@/src/hooks/useCompanyStaffData';
import { formatPay } from '@/src/lib/format';
import { calculateSalarySummary } from '@/src/lib/salaryStats';
import { enrichStaffList, filterStaffList } from '@/src/lib/staffFilters';
import { DEFAULT_STAFF_FILTERS, type StaffFilters } from '@/src/types/filters';

export function SalaryScreen() {
  const { profile } = useAuth();
  const companyId = profile?.company_id;
  const {
    brands,
    branches,
    staff,
    brandMap,
    branchMap,
    branchToBrandId,
    roles,
    loading,
    refreshing,
    error,
    refresh,
    retry,
  } = useCompanyStaffData(companyId);

  const [filters, setFilters] = useState<StaffFilters>(DEFAULT_STAFF_FILTERS);

  const filterMaps = useMemo(
    () => ({ branchToBrandId, brandMap, branchMap }),
    [branchToBrandId, brandMap, branchMap],
  );

  const filteredStaff = useMemo(() => {
    const filtered = filterStaffList(staff, filters, filterMaps);
    return enrichStaffList(filtered, brandMap, branchMap, branchToBrandId);
  }, [staff, filters, filterMaps, brandMap, branchMap, branchToBrandId]);

  const filteredForSummary = useMemo(
    () => filterStaffList(staff, filters, filterMaps),
    [staff, filters, filterMaps],
  );

  const hasActiveSearch = filters.search.trim().length > 0;
  const isSearchEmpty =
    !loading && !error && staff.length > 0 && filteredStaff.length === 0 && hasActiveSearch;

  const summary = useMemo(
    () => calculateSalarySummary(filteredForSummary),
    [filteredForSummary],
  );

  const updateFilters = (patch: Partial<StaffFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      {!loading || staff.length > 0 ? (
        <SalarySummaryStrip
          totalStaff={summary.totalStaff}
          totalPay={formatPay(summary.totalPay)}
          averageSalary={formatPay(summary.averageSalary)}
          activeStaffCount={summary.activeStaff}
        />
      ) : null}

      <SearchInput
        value={filters.search}
        onChangeText={(search) => updateFilters({ search })}
        placeholder="Search name, employee ID, brand, branch…"
      />

      <StaffFiltersBar
        filters={filters}
        onChange={updateFilters}
        brands={brands}
        branches={branches}
        roles={roles}
        showRole
      />

      {!loading && !error ? (
        <Text style={styles.count}>
          {filteredStaff.length} staff · pay totals use active staff in filtered set
        </Text>
      ) : null}
    </View>
  );

  return (
    <AppScreenLayout title="Salary" subtitle="Payroll overview (read-only)">
      <View style={styles.topPad}>
        {loading && staff.length === 0 ? (
          <View style={styles.skeletonPad}>
            {Array.from({ length: 4 }).map((_, i) => (
              <ListRowSkeleton key={`salary-skeleton-${i}`} />
            ))}
          </View>
        ) : null}
      </View>

      {error && staff.length === 0 ? (
        <View style={styles.pad}>
          {listHeader}
          <ErrorState message={error} onRetry={retry} />
        </View>
      ) : (
        <FlatList
          {...FLAT_LIST_PERF}
          data={filteredStaff}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.pad}
          ListHeaderComponent={listHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            loading ? (
              <View>
                {Array.from({ length: 4 }).map((_, i) => (
                  <ListRowSkeleton key={`salary-row-skeleton-${i}`} />
                ))}
              </View>
            ) : isSearchEmpty ? (
              <EmptyState {...EMPTY_STATES.salarySearch} />
            ) : (
              <EmptyState {...EMPTY_STATES.salary} />
            )
          }
          renderItem={({ item }) => <SalaryStaffRow staff={item} />}
        />
      )}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  topPad: {
    paddingHorizontal: spacing.xl,
  },
  skeletonPad: {
    paddingBottom: spacing.sm,
  },
  pad: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headerBlock: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  count: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
