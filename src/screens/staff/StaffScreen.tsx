import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppScreenLayout } from '@/src/components/layout/AppScreenLayout';
import { StaffCard } from '@/src/components/staff/StaffCard';
import { StaffFiltersBar } from '@/src/components/staff/StaffFiltersBar';
import { StaffSummaryStrip } from '@/src/components/staff/StaffSummaryStrip';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { ListRowSkeleton } from '@/src/components/ui/ListRowSkeleton';
import { SearchInput } from '@/src/components/ui/SearchInput';
import { EMPTY_STATES } from '@/src/constants/emptyStates';
import { FLAT_LIST_PERF } from '@/src/constants/listConfig';
import { colors, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useCompanyStaffData } from '@/src/hooks/useCompanyStaffData';
import { enrichStaffList, filterStaffList } from '@/src/lib/staffFilters';
import type { StaffStackParamList } from '@/src/navigation/StaffStack';
import { DEFAULT_STAFF_FILTERS, type StaffFilters } from '@/src/types/filters';

type Props = NativeStackScreenProps<StaffStackParamList, 'StaffList'>;

export function StaffScreen({ navigation, route }: Props) {
  const { profile } = useAuth();
  const companyId = profile?.company_id;
  const {
    brands,
    branches,
    staff,
    brandMap,
    branchMap,
    branchToBrandId,
    loading,
    refreshing,
    error,
    refresh,
    retry,
  } = useCompanyStaffData(companyId);

  const routeStatus = route.params?.status;

  const [filters, setFilters] = useState<StaffFilters>(() => ({
    ...DEFAULT_STAFF_FILTERS,
    ...(routeStatus ? { status: routeStatus } : {}),
  }));

  useEffect(() => {
    if (routeStatus) {
      setFilters((prev) => ({ ...prev, status: routeStatus }));
    }
  }, [routeStatus]);

  const filteredStaff = useMemo(() => {
    const filtered = filterStaffList(staff, filters, { branchToBrandId });
    return enrichStaffList(filtered, brandMap, branchMap, branchToBrandId);
  }, [staff, filters, branchToBrandId, brandMap, branchMap]);

  const summaryCounts = useMemo(() => {
    let active = 0;
    let inactive = 0;
    for (const member of filteredStaff) {
      const status = (member.status ?? '').toLowerCase();
      if (status === 'active') {
        active += 1;
      } else if (status === 'inactive') {
        inactive += 1;
      }
    }
    return {
      total: filteredStaff.length,
      active,
      inactive,
    };
  }, [filteredStaff]);

  const updateFilters = (patch: Partial<StaffFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  return (
    <AppScreenLayout title="Staff" subtitle="Read-only staff directory">
      <View style={styles.filtersWrap}>
        <StaffSummaryStrip
          total={summaryCounts.total}
          active={summaryCounts.active}
          inactive={summaryCounts.inactive}
        />
        <SearchInput
          value={filters.search}
          onChangeText={(search) => updateFilters({ search })}
          placeholder="Search name or staff ID"
        />
        <StaffFiltersBar
          filters={filters}
          onChange={updateFilters}
          brands={brands}
          branches={branches}
          roles={[]}
        />
      </View>

      {loading && staff.length === 0 ? (
        <View style={styles.listPad}>
          {Array.from({ length: 5 }).map((_, i) => (
            <ListRowSkeleton key={i} />
          ))}
        </View>
      ) : null}

      {error && staff.length === 0 ? (
        <View style={styles.listPad}>
          <ErrorState message={error} onRetry={retry} />
        </View>
      ) : null}

      {!loading && !error && filteredStaff.length === 0 ? (
        <View style={styles.listPad}>
          <EmptyState {...EMPTY_STATES.staff} />
        </View>
      ) : null}

      {!error && (staff.length > 0 || !loading) ? (
        <FlatList
          {...FLAT_LIST_PERF}
          data={filteredStaff}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPad}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderItem={({ item }) => (
            <StaffCard
              staff={item}
              onPress={() => navigation.navigate('StaffDetail', { staffId: item.id })}
            />
          )}
          ListHeaderComponent={
            !loading && !error ? (
              <Text style={styles.count}>
                {filteredStaff.length} staff member{filteredStaff.length === 1 ? '' : 's'}
              </Text>
            ) : null
          }
        />
      ) : null}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  filtersWrap: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  listPad: {
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
