import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AlertCard } from '@/src/components/alerts/AlertCard';
import { AlertFiltersBar } from '@/src/components/alerts/AlertFiltersBar';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { ListRowSkeleton } from '@/src/components/ui/ListRowSkeleton';
import { SearchInput } from '@/src/components/ui/SearchInput';
import { EMPTY_STATES } from '@/src/constants/emptyStates';
import { colors, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useDocumentsData } from '@/src/hooks/useDocumentsData';
import { buildAllAlertListItems, filterAlertList } from '@/src/lib/alertFilters';
import {
  isVehicleDaftarDocumentId,
  vehicleIdFromDaftarDocumentId,
} from '@/src/lib/vehicleFields';
import { EXPIRING_GROUP_ORDER, URGENCY_GROUP_LABELS } from '@/src/lib/alertUrgency';
import type { AppStackParamList } from '@/src/navigation/AppStack';
import type { AlertFilters, AlertListItem, AlertUrgencyGroup } from '@/src/types/alerts';
import { DEFAULT_ALERT_FILTERS } from '@/src/types/alerts';

type Props = NativeStackScreenProps<AppStackParamList, 'Alerts'>;

function filtersFromRouteParams(
  params: AppStackParamList['Alerts'],
): Partial<AlertFilters> | null {
  if (!params) {
    return null;
  }

  const patch: Partial<AlertFilters> = {};
  if (params.tab && params.tab !== 'all') {
    patch.tab = params.tab;
  }
  if (params.status && params.status !== 'all') {
    patch.status = params.status;
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

export function AlertsScreen({ navigation, route }: Props) {
  const { profile } = useAuth();
  const companyId = profile?.company_id;
  const {
    documents,
    vehicles,
    brands,
    branches,
    staffById,
    branchById,
    brandById,
    alertThresholdDays: thresholdDays,
    loading,
    refreshing,
    error,
    refresh,
    retry,
  } = useDocumentsData(companyId);

  const [filters, setFilters] = useState<AlertFilters>(() => {
    const fromRoute = filtersFromRouteParams(route.params);
    return fromRoute ? { ...DEFAULT_ALERT_FILTERS, ...fromRoute } : DEFAULT_ALERT_FILTERS;
  });

  const lastAppliedRouteKey = useRef<string | null>(null);

  useEffect(() => {
    const tab = route.params?.tab ?? 'all';
    const status = route.params?.status ?? 'all';
    const routeKey = `${tab}|${status}`;
    if (routeKey === lastAppliedRouteKey.current) {
      return;
    }
    lastAppliedRouteKey.current = routeKey;

    const fromRoute = filtersFromRouteParams(route.params);
    if (!fromRoute) {
      return;
    }

    console.log('[DocAlert push] Alerts screen applying route filters', fromRoute);
    setFilters((prev) => ({ ...prev, ...fromRoute }));
  }, [route.params?.tab, route.params?.status]);

  const allAlerts = useMemo(
    () =>
      buildAllAlertListItems(documents, vehicles, {
        staffById,
        branchById,
        brandById,
        thresholdDays,
      }),
    [documents, vehicles, staffById, branchById, brandById, thresholdDays],
  );

  const filteredAlerts = useMemo(
    () => filterAlertList(allAlerts, filters),
    [allAlerts, filters],
  );

  const expiringAlerts = useMemo(
    () => filteredAlerts.filter((a) => a.displayStatus === 'expiring'),
    [filteredAlerts],
  );

  const expiredAlerts = useMemo(
    () => filteredAlerts.filter((a) => a.displayStatus === 'expired'),
    [filteredAlerts],
  );

  const openDetail = (alertId: string) => {
    if (isVehicleDaftarDocumentId(alertId)) {
      navigation.navigate('VehicleDetail', {
        vehicleId: vehicleIdFromDaftarDocumentId(alertId),
      });
      return;
    }
    navigation.navigate('DocumentDetail', { documentId: alertId });
  };

  const renderExpiringGroup = (groupKey: AlertUrgencyGroup, items: AlertListItem[]) => {
    return (
      <View key={`expiring-group-${groupKey}`} style={styles.group}>
        <Text style={styles.groupTitle}>{URGENCY_GROUP_LABELS[groupKey]}</Text>
        {items.map((alert) => (
          <AlertCard
            key={`${groupKey}-${alert.id}`}
            alert={alert}
            onPress={() => openDetail(alert.id)}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filtersPad}>
        <SearchInput
          value={filters.search}
          onChangeText={(search) => setFilters((p) => ({ ...p, search }))}
          placeholder="Search document, plate number, or linked name"
        />
        <AlertFiltersBar
          filters={filters}
          onChange={(patch) => setFilters((p) => ({ ...p, ...patch }))}
          brands={brands}
          branches={branches}
        />
      </View>

      {loading && documents.length === 0 && vehicles.length === 0 ? (
        <View style={styles.listPad}>
          {Array.from({ length: 5 }, (_, i) => (
            <ListRowSkeleton key={`alert-skeleton-${i}`} />
          ))}
        </View>
      ) : null}

      {error && documents.length === 0 ? (
        <View style={styles.listPad}>
          <ErrorState message={error} onRetry={() => void retry()} />
        </View>
      ) : null}

      {!loading && !error && filteredAlerts.length === 0 ? (
        <View style={styles.listPad}>
          <EmptyState {...EMPTY_STATES.alerts} />
        </View>
      ) : null}

      {!error && (documents.length > 0 || vehicles.length > 0 || !loading) ? (
        <ScrollView
          contentContainerStyle={styles.listPad}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }>
          {!loading ? (
            <Text style={styles.count}>
              {filteredAlerts.length} alert{filteredAlerts.length === 1 ? '' : 's'}
            </Text>
          ) : null}

          {expiredAlerts.length > 0 ? (
            <View key="alerts-section-expired" style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, styles.sectionTitleDanger]}>Expired</Text>
                <Text style={styles.sectionCount}>{expiredAlerts.length}</Text>
              </View>
              {expiredAlerts.map((alert) => (
                <AlertCard
                  key={`expired-${alert.id}`}
                  alert={alert}
                  onPress={() => openDetail(alert.id)}
                />
              ))}
            </View>
          ) : null}

          {expiringAlerts.length > 0 ? (
            <View key="alerts-section-expiring" style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, styles.sectionTitleWarning]}>Expiring Soon</Text>
                <Text style={styles.sectionCount}>{expiringAlerts.length}</Text>
              </View>
              {EXPIRING_GROUP_ORDER.filter((groupKey) =>
                expiringAlerts.some((alert) => alert.urgencyGroup === groupKey),
              ).map((groupKey) =>
                renderExpiringGroup(
                  groupKey,
                  expiringAlerts.filter((alert) => alert.urgencyGroup === groupKey),
                ),
              )}
            </View>
          ) : null}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersPad: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.sm,
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  sectionTitleDanger: {
    color: colors.danger,
  },
  sectionTitleWarning: {
    color: colors.warning,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  group: {
    marginBottom: spacing.md,
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
});
