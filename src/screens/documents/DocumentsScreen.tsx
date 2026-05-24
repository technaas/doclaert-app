import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppScreenLayout } from '@/src/components/layout/AppScreenLayout';
import { DocumentCard } from '@/src/components/documents/DocumentCard';
import { DocumentFiltersBar } from '@/src/components/documents/DocumentFiltersBar';
import { DocumentsSummaryStrip } from '@/src/components/documents/DocumentsSummaryStrip';
import { DocumentTabBar } from '@/src/components/documents/DocumentTabBar';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { ListRowSkeleton } from '@/src/components/ui/ListRowSkeleton';
import { SearchInput } from '@/src/components/ui/SearchInput';
import { EMPTY_STATES } from '@/src/constants/emptyStates';
import { FLAT_LIST_PERF } from '@/src/constants/listConfig';
import { colors, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useDocumentsData } from '@/src/hooks/useDocumentsData';
import { buildDocumentListItems, filterDocumentList } from '@/src/lib/documentFilters';
import type { DocumentsStackParamList } from '@/src/navigation/DocumentsStack';
import {
  DEFAULT_DOCUMENT_FILTERS,
  type DocumentFilters,
} from '@/src/types/documents';

type Props = NativeStackScreenProps<DocumentsStackParamList, 'DocumentsList'>;

export function DocumentsScreen({ navigation, route }: Props) {
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  const {
    documents,
    brands,
    branches,
    staffById,
    branchById,
    brandById,
    alertThresholdDays,
    loading,
    refreshing,
    error,
    refresh,
    retry,
  } = useDocumentsData(companyId);

  const routeStatus = route.params?.status;

  const [filters, setFilters] = useState<DocumentFilters>(() => ({
    ...DEFAULT_DOCUMENT_FILTERS,
    ...(routeStatus ? { status: routeStatus } : {}),
  }));

  useEffect(() => {
    if (routeStatus) {
      setFilters((prev) => ({ ...prev, status: routeStatus }));
    }
  }, [routeStatus]);

  const allItems = useMemo(
    () =>
      buildDocumentListItems(documents, {
        staffById,
        branchById,
        brandById,
        thresholdDays: alertThresholdDays,
      }),
    [documents, staffById, branchById, brandById, alertThresholdDays],
  );

  const filteredItems = useMemo(
    () => filterDocumentList(allItems, filters),
    [allItems, filters],
  );

  const summaryCounts = useMemo(() => {
    let valid = 0;
    let expiringSoon = 0;
    let expired = 0;
    for (const item of filteredItems) {
      if (item.displayStatus === 'active') valid += 1;
      else if (item.displayStatus === 'expiring') expiringSoon += 1;
      else if (item.displayStatus === 'expired') expired += 1;
    }
    return {
      valid,
      expiringSoon,
      expired,
    };
  }, [filteredItems]);

  const updateFilters = (patch: Partial<DocumentFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  return (
    <AppScreenLayout title="Documents" subtitle="Staff documents & branch licenses">
      <View style={styles.controls}>
        <DocumentsSummaryStrip
          valid={summaryCounts.valid}
          expiringSoon={summaryCounts.expiringSoon}
          expired={summaryCounts.expired}
        />
        <DocumentTabBar
          value={filters.tab}
          onChange={(tab) => updateFilters({ tab })}
        />
        <SearchInput
          value={filters.search}
          onChangeText={(search) => updateFilters({ search })}
          placeholder="Search document, staff, branch…"
        />
        <DocumentFiltersBar
          filters={filters}
          onChange={updateFilters}
          brands={brands}
          branches={branches}
        />
      </View>

      {loading && documents.length === 0 ? (
        <View style={styles.listPad}>
          {Array.from({ length: 5 }).map((_, i) => (
            <ListRowSkeleton key={i} />
          ))}
        </View>
      ) : null}

      {error && documents.length === 0 ? (
        <View style={styles.listPad}>
          <ErrorState message={error} onRetry={retry} />
        </View>
      ) : null}

      {!loading && !error && filteredItems.length === 0 ? (
        <View style={styles.listPad}>
          <EmptyState {...EMPTY_STATES.documents} />
        </View>
      ) : null}

      {!error && (documents.length > 0 || !loading) ? (
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
            <DocumentCard
              document={item}
              onPress={() =>
                navigation.navigate('DocumentDetail', { documentId: item.id })
              }
            />
          )}
          ListHeaderComponent={
            !loading && !error ? (
              <Text style={styles.count}>
                {filteredItems.length} document{filteredItems.length === 1 ? '' : 's'}
              </Text>
            ) : null
          }
        />
      ) : null}
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  controls: {
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
