import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DetailRow } from '@/src/components/ui/DetailRow';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { colors, radius, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useCompanyOrgData } from '@/src/hooks/useCompanyOrgData';
import { buildBrandListItems } from '@/src/lib/brandMetrics';
import { formatCount } from '@/src/lib/format';
import type { AppStackParamList } from '@/src/navigation/AppStack';

type Props = NativeStackScreenProps<AppStackParamList, 'BrandDetail'>;

export function BrandDetailScreen({ route }: Props) {
  const { brandId } = route.params;
  const { profile } = useAuth();
  const companyId = profile?.company_id;
  const { data, loading, error, retry } = useCompanyOrgData(companyId);

  const brand = useMemo(() => {
    if (!data) return null;
    const items = buildBrandListItems(data.brands, {
      branches: data.branches,
      staff: data.staff,
      documents: data.documents,
      thresholdDays: data.alertThresholdDays,
    });
    const found = items.find((item) => item.id === brandId);
    if (!found) return null;

    const branches = data.branches
      .filter((branch) => branch.brand_id === brandId)
      .map((branch) => ({
        id: branch.id,
        name: branch.name,
        location: branch.location,
        status: branch.status,
      }));

    return { ...found, branches };
  }, [data, brandId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !brand) {
    return (
      <View style={styles.centeredPad}>
        <ErrorState
          message={error ?? 'Brand not found.'}
          onRetry={retry}
        />
      </View>
    );
  }

  const statusTone =
    (brand.status ?? '') === 'active'
      ? 'success'
      : (brand.status ?? '') === 'inactive'
        ? 'muted'
        : 'default';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Brand</Text>
        <DetailRow label="Name" value={brand.name} />
        <DetailRow label="Contact" value={brand.contact_number ?? '—'} />
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <StatusBadge label={brand.status ?? '—'} tone={statusTone} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <DetailRow label="Branches" value={formatCount(brand.branchCount)} />
        <DetailRow label="Staff" value={formatCount(brand.staffCount)} />
        <DetailRow label="Expiring documents" value={formatCount(brand.expiringDocsCount)} />
        <DetailRow label="Expired documents" value={formatCount(brand.expiredDocsCount)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Branches</Text>
        {brand.branches.length === 0 ? (
          <EmptyState
            title="No branches"
            message="This brand has no branches yet."
            icon="location-outline"
          />
        ) : (
          brand.branches.map((branch) => (
            <View key={branch.id} style={styles.branchRow}>
              <Text style={styles.branchName}>{branch.name}</Text>
              <Text style={styles.branchMeta}>
                {branch.location ?? '—'} · {branch.status ?? '—'}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  centeredPad: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statusRow: {
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  branchRow: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  branchName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  branchMeta: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted,
  },
});
