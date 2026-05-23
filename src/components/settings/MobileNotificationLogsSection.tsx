import { useImperativeHandle, useState, forwardRef } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MobileNotificationLogCard } from '@/src/components/settings/MobileNotificationLogCard';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { FilterSelect, type FilterOption } from '@/src/components/ui/FilterSelect';
import { ListRowSkeleton } from '@/src/components/ui/ListRowSkeleton';
import { EMPTY_STATES } from '@/src/constants/emptyStates';
import { colors, spacing, typography } from '@/src/constants/theme';
import { useMobileNotificationLogsQuery } from '@/src/hooks/queries/useMobileNotificationLogsQuery';
import { getQueryScreenState } from '@/src/lib/queryScreenState';
import type {
  MobileNotificationLogStatusFilter,
  MobileNotificationLogTypeFilter,
} from '@/src/types/mobileNotificationLogs';

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
];

const TYPE_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'staff', label: 'Staff' },
  { value: 'branch', label: 'Branch' },
];

export type MobileNotificationLogsSectionHandle = {
  refresh: () => Promise<void>;
};

type MobileNotificationLogsSectionProps = {
  companyId: string | undefined;
};

export const MobileNotificationLogsSection = forwardRef<
  MobileNotificationLogsSectionHandle,
  MobileNotificationLogsSectionProps
>(function MobileNotificationLogsSection({ companyId }, ref) {
  const [statusFilter, setStatusFilter] =
    useState<MobileNotificationLogStatusFilter>('all');
  const [typeFilter, setTypeFilter] =
    useState<MobileNotificationLogTypeFilter>('all');

  const query = useMobileNotificationLogsQuery(companyId, statusFilter, typeFilter);
  const { isInitialLoading, isRefreshing, errorMessage } = getQueryScreenState(query);
  const logs = query.data ?? [];
  const error = companyId ? errorMessage : 'Company not found on your profile.';

  useImperativeHandle(
    ref,
    () => ({
      refresh: async () => {
        await query.refetch();
      },
    }),
    [query],
  );

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Mobile notification logs</Text>
      <Text style={styles.subtitle}>
        Recent push activity for your company (latest 20, read-only).
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}>
        <FilterSelect
          label="Status"
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={(value) =>
            setStatusFilter(value as MobileNotificationLogStatusFilter)
          }
        />
        <FilterSelect
          label="Type"
          value={typeFilter}
          options={TYPE_OPTIONS}
          onChange={(value) => setTypeFilter(value as MobileNotificationLogTypeFilter)}
        />
      </ScrollView>

      {isInitialLoading ? (
        <View style={styles.skeletonWrap}>
          {Array.from({ length: 3 }, (_, i) => (
            <ListRowSkeleton key={`notif-log-skeleton-${i}`} />
          ))}
        </View>
      ) : null}

      {error && logs.length === 0 ? (
        <ErrorState message={error} onRetry={() => void query.refetch()} />
      ) : null}

      {!isInitialLoading && !error && logs.length === 0 ? (
        <EmptyState {...EMPTY_STATES.notificationLogs} />
      ) : null}

      {!error && logs.length > 0 ? (
        <View style={styles.list}>
          {isRefreshing ? (
            <ActivityIndicator
              color={colors.primary}
              style={styles.inlineLoader}
              size="small"
            />
          ) : null}
          {logs.map((log) => (
            <MobileNotificationLogCard key={log.id} log={log} />
          ))}
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  cardTitle: {
    ...typography.sectionTitle,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
    marginTop: -spacing.xs,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  skeletonWrap: {
    gap: spacing.sm,
  },
  list: {
    marginTop: spacing.xs,
  },
  inlineLoader: {
    marginBottom: spacing.sm,
  },
});
