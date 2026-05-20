import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DetailRow } from '@/src/components/ui/DetailRow';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { colors, radius, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useCompanyOrgData } from '@/src/hooks/useCompanyOrgData';
import { buildBranchListItems, getBranchDetailLicenses } from '@/src/lib/branchMetrics';
import { formatCount } from '@/src/lib/format';
import { DOCUMENT_STATUS_LABEL } from '@/src/lib/documentStatus';
import type { AppStackParamList } from '@/src/navigation/AppStack';

type Props = NativeStackScreenProps<AppStackParamList, 'BranchDetail'>;

export function BranchDetailScreen({ route, navigation }: Props) {
  const { branchId } = route.params;
  const { profile } = useAuth();
  const companyId = profile?.company_id;
  const { data, loading, error, retry } = useCompanyOrgData(companyId);

  const detail = useMemo(() => {
    if (!data) return null;

    const brandMap = new Map(data.brands.map((brand) => [brand.id, brand.name]));
    const items = buildBranchListItems(data.branches, brandMap, {
      staff: data.staff,
      documents: data.documents,
      thresholdDays: data.alertThresholdDays,
    });
    const branch = items.find((item) => item.id === branchId);
    if (!branch) return null;

    const staff = data.staff
      .filter((member) => member.branch_id === branchId)
      .map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        status: member.status,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    const licenses = getBranchDetailLicenses(
      branchId,
      data.documents,
      data.alertThresholdDays,
    );

    return { branch, staff, licenses };
  }, [data, branchId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !detail) {
    return (
      <View style={styles.centeredPad}>
        <ErrorState message={error ?? 'Branch not found.'} onRetry={retry} />
      </View>
    );
  }

  const { branch, staff, licenses } = detail;
  const statusTone =
    (branch.status ?? '') === 'active'
      ? 'success'
      : (branch.status ?? '') === 'inactive'
        ? 'muted'
        : 'default';

  const licenseTone = (status: string) => {
    if (status === 'expired') return 'danger' as const;
    if (status === 'expiring') return 'warning' as const;
    return 'success' as const;
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Branch</Text>
        <DetailRow label="Name" value={branch.name} />
        <DetailRow label="Brand" value={branch.brandName} />
        <DetailRow label="Location" value={branch.location ?? '—'} />
        <DetailRow label="Full address" value={branch.full_address ?? '—'} />
        <DetailRow label="Manager" value={branch.manager_name ?? '—'} />
        <DetailRow label="Manager contact" value={branch.manager_contact ?? '—'} />
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <StatusBadge label={branch.status ?? '—'} tone={statusTone} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <DetailRow label="Staff" value={formatCount(branch.staffCount)} />
        <DetailRow label="Branch licenses" value={formatCount(branch.licensesCount)} />
        <DetailRow
          label="Expiring licenses"
          value={formatCount(branch.expiringLicensesCount)}
        />
        <DetailRow label="Expired licenses" value={formatCount(branch.expiredLicensesCount)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Staff</Text>
        {staff.length === 0 ? (
          <EmptyState
            title="No staff"
            message="No staff assigned to this branch."
            icon="people-outline"
          />
        ) : (
          staff.map((member) => (
            <View key={member.id} style={styles.listRow}>
              <Text style={styles.listTitle}>{member.name}</Text>
              <Text style={styles.listMeta}>
                {member.role ?? '—'} · {member.status ?? '—'}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Branch licenses</Text>
        {licenses.length === 0 ? (
          <EmptyState
            title="No licenses"
            message="No branch license documents found."
            icon="document-text-outline"
          />
        ) : (
          licenses.map((license) => (
            <Pressable
              key={license.id}
              style={styles.listRow}
              onPress={() =>
                navigation.navigate('DocumentDetail', { documentId: license.id })
              }>
              <Text style={styles.listTitle}>{license.documentLabel}</Text>
              <Text style={styles.listMeta}>Expiry: {license.expiry_date ?? '—'}</Text>
              <StatusBadge
                label={DOCUMENT_STATUS_LABEL[license.displayStatus]}
                tone={licenseTone(license.displayStatus)}
              />
            </Pressable>
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
  listRow: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  listMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
