import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppScreenLayout } from '@/src/components/layout/AppScreenLayout';
import { VehicleCard } from '@/src/components/vehicles/VehicleCard';
import { VehicleFiltersBar } from '@/src/components/vehicles/VehicleFiltersBar';
import { VehicleSummaryStrip } from '@/src/components/vehicles/VehicleSummaryStrip';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { ListRowSkeleton } from '@/src/components/ui/ListRowSkeleton';
import { SearchInput } from '@/src/components/ui/SearchInput';
import { EMPTY_STATES } from '@/src/constants/emptyStates';
import { FLAT_LIST_PERF } from '@/src/constants/listConfig';
import { colors, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useCompanyVehiclesData } from '@/src/hooks/useCompanyVehiclesData';
import { isSummaryExpiring, isSummaryValid } from '@/src/lib/documentStatus';
import { buildVehicleListItems, filterVehicleList } from '@/src/lib/vehicleFilters';
import type { VehiclesStackParamList } from '@/src/navigation/VehiclesStack';
import { DEFAULT_VEHICLE_FILTERS, type VehicleFilters } from '@/src/types/vehicles';

type Props = NativeStackScreenProps<VehiclesStackParamList, 'VehiclesList'>;

export function VehiclesScreen({ navigation, route }: Props) {
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  const {
    vehicles,
    brands,
    branches,
    branchById,
    brandById,
    loading,
    refreshing,
    error,
    refresh,
    retry,
  } = useCompanyVehiclesData(companyId);

  const routeStatus = route.params?.status;

  const [filters, setFilters] = useState<VehicleFilters>(() => ({
    ...DEFAULT_VEHICLE_FILTERS,
    ...(routeStatus ? { status: routeStatus } : {}),
  }));

  useEffect(() => {
    if (routeStatus) {
      setFilters((prev) => ({ ...prev, status: routeStatus }));
    }
  }, [routeStatus]);

  const allItems = useMemo(
    () =>
      buildVehicleListItems(vehicles, {
        branchById,
        brandById,
      }),
    [vehicles, branchById, brandById],
  );

  const filteredItems = useMemo(
    () => filterVehicleList(allItems, filters),
    [allItems, filters],
  );

  const summaryCounts = useMemo(() => {
    let valid = 0;
    let expiringSoon = 0;
    let expired = 0;
    for (const item of filteredItems) {
      if (item.displayStatus === 'expired') expired += 1;
      else if (isSummaryExpiring(item.displayStatus)) expiringSoon += 1;
      else if (isSummaryValid(item.displayStatus)) valid += 1;
    }
    return {
      total: filteredItems.length,
      valid,
      expiringSoon,
      expired,
    };
  }, [filteredItems]);

  const updateFilters = (patch: Partial<VehicleFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  return (
    <AppScreenLayout title="Vehicles" subtitle="Fleet & Daftar records">
      <View style={styles.filtersWrap}>
        <VehicleSummaryStrip
          total={summaryCounts.total}
          valid={summaryCounts.valid}
          expiringSoon={summaryCounts.expiringSoon}
          expired={summaryCounts.expired}
        />
        <SearchInput
          value={filters.search}
          onChangeText={(search) => updateFilters({ search })}
          placeholder="Search make, model, plate, daftar…"
        />
        <VehicleFiltersBar
          filters={filters}
          onChange={updateFilters}
          brands={brands}
          branches={branches}
        />
      </View>

      {loading && vehicles.length === 0 ? (
        <View style={styles.listPad}>
          {Array.from({ length: 5 }).map((_, i) => (
            <ListRowSkeleton key={i} />
          ))}
        </View>
      ) : null}

      {error && vehicles.length === 0 ? (
        <View style={styles.listPad}>
          <ErrorState message={error} onRetry={retry} />
        </View>
      ) : null}

      {!loading && !error && filteredItems.length === 0 ? (
        <View style={styles.listPad}>
          <EmptyState {...EMPTY_STATES.vehicles} />
        </View>
      ) : null}

      {!error && (vehicles.length > 0 || !loading) ? (
        <FlatList
          {...FLAT_LIST_PERF}
          data={filteredItems}
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
            <VehicleCard
              vehicle={item}
              onPress={() => navigation.navigate('VehicleDetail', { vehicleId: item.id })}
            />
          )}
          ListHeaderComponent={
            !loading && !error ? (
              <Text style={styles.count}>
                {filteredItems.length} vehicle{filteredItems.length === 1 ? '' : 's'}
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
