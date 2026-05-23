import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { colors, radius, spacing } from '@/src/constants/theme';
import { formatCount } from '@/src/lib/format';
import type { BrandListItem } from '@/src/types/brand';

type BrandCardProps = {
  brand: BrandListItem;
  onPress: () => void;
};

function BrandCardComponent({ brand, onPress }: BrandCardProps) {
  const statusTone =
    (brand.status ?? '') === 'active'
      ? 'success'
      : (brand.status ?? '') === 'inactive'
        ? 'muted'
        : 'default';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{brand.name}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </View>

      <Text style={styles.contact}>{brand.contact_number ?? 'No contact number'}</Text>

      <View style={styles.row}>
        <StatusBadge label={brand.status ?? '—'} tone={statusTone} />
      </View>

      <View style={styles.stats}>
        <Text style={styles.stat}>Branches: {formatCount(brand.branchCount)}</Text>
        <Text style={styles.stat}>Staff: {formatCount(brand.staffCount)}</Text>
      </View>

      <View style={styles.stats}>
        <Text style={[styles.stat, styles.warning]}>
          Expiring: {formatCount(brand.expiringDocsCount)}
        </Text>
        <Text style={[styles.stat, styles.danger]}>
          Expired: {formatCount(brand.expiredDocsCount)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    paddingRight: spacing.sm,
  },
  contact: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  row: {
    marginBottom: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stat: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  warning: {
    color: colors.warning,
  },
  danger: {
    color: colors.danger,
  },
});

export const BrandCard = memo(BrandCardComponent);
