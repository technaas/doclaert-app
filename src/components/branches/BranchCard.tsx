import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { colors, radius, spacing } from '@/src/constants/theme';
import { formatCount } from '@/src/lib/format';
import type { BranchListItem } from '@/src/types/branch';

type BranchCardProps = {
  branch: BranchListItem;
  onPress: () => void;
};

export function BranchCard({ branch, onPress }: BranchCardProps) {
  const statusTone =
    (branch.status ?? '') === 'active'
      ? 'success'
      : (branch.status ?? '') === 'inactive'
        ? 'muted'
        : 'default';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.name}>{branch.name}</Text>
          <Text style={styles.brand}>{branch.brandName}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </View>

      <Text style={styles.meta}>Location: {branch.location ?? '—'}</Text>
      <Text style={styles.meta}>Manager: {branch.manager_name ?? '—'}</Text>
      <Text style={styles.meta}>Contact: {branch.manager_contact ?? '—'}</Text>

      <View style={styles.row}>
        <StatusBadge label={branch.status ?? '—'} tone={statusTone} />
      </View>

      <View style={styles.stats}>
        <Text style={styles.stat}>Staff: {formatCount(branch.staffCount)}</Text>
        <Text style={styles.stat}>Licenses: {formatCount(branch.licensesCount)}</Text>
      </View>

      <View style={styles.stats}>
        <Text style={[styles.stat, styles.warning]}>
          Expiring: {formatCount(branch.expiringLicensesCount)}
        </Text>
        <Text style={[styles.stat, styles.danger]}>
          Expired: {formatCount(branch.expiredLicensesCount)}
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
    marginBottom: spacing.sm,
  },
  titleWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  brand: {
    marginTop: 2,
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 2,
  },
  row: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stat: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  warning: {
    color: colors.warning,
  },
  danger: {
    color: colors.danger,
  },
});
