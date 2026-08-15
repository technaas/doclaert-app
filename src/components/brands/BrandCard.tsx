import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ListCard } from '@/src/components/ui/ListCard';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { colors, spacing } from '@/src/constants/theme';
import { formatCount } from '@/src/lib/format';
import type { BrandListItem } from '@/src/types/brand';

type BrandCardProps = {
  brand: BrandListItem;
  onPress: () => void;
};

function BrandCardComponent({ brand, onPress }: BrandCardProps) {
  const statusTone =
    (brand.status ?? '').toLowerCase() === 'active'
      ? 'success'
      : (brand.status ?? '').toLowerCase() === 'inactive'
        ? 'neutral'
        : 'default';

  return (
    <ListCard
      title={brand.name}
      subtitle={brand.contact_number ?? 'No contact number'}
      onPress={onPress}
      badges={<StatusBadge label={brand.status ?? '—'} tone={statusTone} size="sm" />}
      footer={
        <View style={styles.statsGrid}>
          <StatPill label="Branches" value={formatCount(brand.branchCount)} />
          <StatPill label="Staff" value={formatCount(brand.staffCount)} />
          <StatPill label="Expiring" value={formatCount(brand.expiringDocsCount)} tone="warning" />
          <StatPill label="Expired" value={formatCount(brand.expiredDocsCount)} tone="danger" />
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

export const BrandCard = memo(BrandCardComponent);
