import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppScreenLayout } from '@/src/components/layout/AppScreenLayout';
import { SummaryCard } from '@/src/components/dashboard/SummaryCard';
import { SummaryCardSkeleton } from '@/src/components/dashboard/SummaryCardSkeleton';
import { SalaryStaffRow } from '@/src/components/salary/SalaryStaffRow';
import { StaffFiltersBar } from '@/src/components/staff/StaffFiltersBar';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { ListRowSkeleton } from '@/src/components/ui/ListRowSkeleton';
import { colors, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useCompanyStaffData } from '@/src/hooks/useCompanyStaffData';
import { formatCount, formatPay } from '@/src/lib/format';
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

  const filteredStaff = useMemo(() => {
    const filtered = filterStaffList(staff, filters, { branchToBrandId });
    return enrichStaffList(filtered, brandMap, branchMap, branchToBrandId);
  }, [staff, filters, branchToBrandId, brandMap, branchMap]);

  const summary = useMemo(
    () => calculateSalarySummary(filterStaffList(staff, filters, { branchToBrandId })),
    [staff, filters, branchToBrandId],
  );

  const updateFilters = (patch: Partial<StaffFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      <StaffFiltersBar
        filters={filters}
        onChange={updateFilters}
        brands={brands}
        branches={branches}
        roles={roles}
        showRole
      />

      {loading && staff.length === 0 ? (
        <View style={styles.summaryGrid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <SummaryCardSkeleton key={i} />
          ))}
        </View>
      ) : (
        <View style={styles.summaryGrid}>
          <SummaryCard
            label="Total Staff"
            value={formatCount(summary.totalStaff)}
            icon="people-outline"
          />
          <SummaryCard
            label="Active Staff"
            value={formatCount(summary.activeStaff)}
            icon="checkmark-circle-outline"
            tone="success"
          />
          <SummaryCard
            label="Total Pay"
            value={formatPay(summary.totalPay)}
            icon="wallet-outline"
            subtitle="Active staff only"
          />
          <SummaryCard
            label="Avg Salary"
            value={formatPay(summary.averageSalary)}
            icon="stats-chart-outline"
          />
        </View>
      )}

      {!loading && !error ? (
        <Text style={styles.count}>
          {filteredStaff.length} staff · calculations use active filters
        </Text>
      ) : null}
    </View>
  );

  return (
    <AppScreenLayout title="Salary" subtitle="Payroll overview (read-only)">
      {error && staff.length === 0 ? (
        <View style={styles.pad}>
          {listHeader}
          <ErrorState message={error} onRetry={retry} />
        </View>
      ) : (
        <FlatList
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
                  <ListRowSkeleton key={i} />
                ))}
              </View>
            ) : (
              <EmptyState
                title="No staff found"
                message="Adjust filters or pull down to refresh."
                icon="wallet-outline"
              />
            )
          }
          renderItem={({ item }) => <SalaryStaffRow staff={item} />}
        />
      )}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  headerBlock: {
    gap: spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  count: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
});
