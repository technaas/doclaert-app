import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ListCard } from '@/src/components/ui/ListCard';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { colors, spacing } from '@/src/constants/theme';
import { formatCount } from '@/src/lib/format';
import type { BranchListItem } from '@/src/types/branch';

type BranchCardProps = {
  branch: BranchListItem;
  onPress: () => void;
};

function BranchCardComponent({ branch, onPress }: BranchCardProps) {
  const statusTone =
    (branch.status ?? '').toLowerCase() === 'active'
      ? 'success'
      : (branch.status ?? '').toLowerCase() === 'inactive'
        ? 'neutral'
        : 'default';

  return (
    <ListCard
      title={branch.name}
      subtitle={branch.brandName}
      meta={[branch.location, branch.manager_name].filter(Boolean).join(' · ') || undefined}
      onPress={onPress}
      badges={<StatusBadge label={branch.status ?? '—'} tone={statusTone} size="sm" />}
      footer={
        <View style={styles.statsGrid}>
          <StatPill label="Staff" value={formatCount(branch.staffCount)} />
          <StatPill label="Licenses" value={formatCount(branch.licensesCount)} />
          <StatPill label="Expiring" value={formatCount(branch.expiringLicensesCount)} tone="warning" />
          <StatPill label="Expired" value={formatCount(branch.expiredLicensesCount)} tone="danger" />
        </View>
      }
    />
  );
}

function StatPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'warning' | 'danger';
}) {
  const valueColor =
    tone === 'warning' ? colors.warning : tone === 'danger' ? colors.danger : colors.text;

  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={[styles.pillValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    minWidth: '46%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  pillLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  pillValue: {
    marginTop: 2,
    fontSize: 16,
    fontWeight: '700',
  },
});

export const BranchCard = memo(BranchCardComponent);
