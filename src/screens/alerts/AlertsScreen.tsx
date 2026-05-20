import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { colors, spacing } from '@/src/constants/theme';
import { useAlertBadge } from '@/src/context/AlertBadgeContext';
import { useAuth } from '@/src/context/AuthContext';
import { buildAlertListItems, filterAlertList } from '@/src/lib/alertFilters';
import { EXPIRING_GROUP_ORDER, URGENCY_GROUP_LABELS } from '@/src/lib/alertUrgency';
import type { AppStackParamList } from '@/src/navigation/AppStack';
import { fetchCompanyDocumentsData } from '@/src/services/documents';
import type { AlertFilters, AlertListItem, AlertUrgencyGroup } from '@/src/types/alerts';
import { DEFAULT_ALERT_FILTERS } from '@/src/types/alerts';
import type { Branch, Brand, StaffMember } from '@/src/types/staff';
import type { DocumentRecord } from '@/src/types/documents';

type Props = NativeStackScreenProps<AppStackParamList, 'Alerts'>;

export function AlertsScreen({ navigation }: Props) {
  const { profile } = useAuth();
  const companyId = profile?.company_id;
  const { refresh: refreshBadge } = useAlertBadge();

  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [thresholdDays, setThresholdDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AlertFilters>(DEFAULT_ALERT_FILTERS);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!companyId) {
        setError('Company not found on your profile.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await fetchCompanyDocumentsData(companyId);
        setDocuments(data.documents);
        setBrands(data.brands);
        setBranches(data.branches);
        setStaff(data.staff);
        setThresholdDays(data.alertThresholdDays);
        await refreshBadge();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load alerts. Please try again.';
        setError(message);
        if (!isRefresh) {
          setDocuments([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [companyId, refreshBadge],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const staffById = useMemo(() => {
    const map = new Map<string, StaffMember>();
    staff.forEach((s) => map.set(s.id, s));
    return map;
  }, [staff]);

  const branchById = useMemo(() => {
    const map = new Map<string, Branch>();
    branches.forEach((b) => map.set(b.id, b));
    return map;
  }, [branches]);

  const brandById = useMemo(() => {
    const map = new Map<string, Brand>();
    brands.forEach((b) => map.set(b.id, b));
    return map;
  }, [brands]);

  const allAlerts = useMemo(
    () =>
      buildAlertListItems(documents, {
        staffById,
        branchById,
        brandById,
        thresholdDays,
      }),
    [documents, staffById, branchById, brandById, thresholdDays],
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

  const openDetail = (documentId: string) => {
    navigation.navigate('DocumentDetail', { documentId });
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
          placeholder="Search document or linked name"
        />
        <AlertFiltersBar
          filters={filters}
          onChange={(patch) => setFilters((p) => ({ ...p, ...patch }))}
          brands={brands}
          branches={branches}
        />
      </View>

      {loading && documents.length === 0 ? (
        <View style={styles.listPad}>
          {Array.from({ length: 5 }, (_, i) => (
            <ListRowSkeleton key={`alert-skeleton-${i}`} />
          ))}
        </View>
      ) : null}

      {error && documents.length === 0 ? (
        <View style={styles.listPad}>
          <ErrorState message={error} onRetry={() => void load()} />
        </View>
      ) : null}

      {!loading && !error && filteredAlerts.length === 0 ? (
        <View style={styles.listPad}>
          <EmptyState
            title="No alerts found"
            message="All documents are within their expiry threshold, or try adjusting filters."
            icon="notifications-outline"
          />
        </View>
      ) : null}

      {!error && (documents.length > 0 || !loading) ? (
        <ScrollView
          contentContainerStyle={styles.listPad}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }>
          {!loading ? (
            <Text style={styles.count}>
              {filteredAlerts.length} alert{filteredAlerts.length === 1 ? '' : 's'}
            </Text>
          ) : null}

          {expiringAlerts.length > 0 ? (
            <View key="alerts-section-expiring" style={styles.section}>
              <Text style={styles.sectionTitle}>Expiring Soon</Text>
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

          {expiredAlerts.length > 0 ? (
            <View key="alerts-section-expired" style={styles.section}>
              <Text style={styles.sectionTitle}>Expired</Text>
              {expiredAlerts.map((alert) => (
                <AlertCard
                  key={`expired-${alert.id}`}
                  alert={alert}
                  onPress={() => openDetail(alert.id)}
                />
              ))}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
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
