import { StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { colors, spacing } from '@/src/constants/theme';
import { formatDaysRemaining } from '@/src/lib/documentStatus';

type ExpiryFooterProps = {
  expiryDate: string | null;
  daysRemaining: number | null;
  statusLabel: string;
  statusTone: 'success' | 'warning' | 'danger' | 'muted' | 'default' | 'critical';
  expiryLabel?: string;
};

export function ExpiryFooter({
  expiryDate,
  daysRemaining,
  statusLabel,
  statusTone,
  expiryLabel = 'Expiry',
}: ExpiryFooterProps) {
  const daysText = formatDaysRemaining(daysRemaining);
  const isOverdue = daysRemaining !== null && daysRemaining < 0;

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.label}>{expiryLabel}</Text>
        <Text style={styles.date}>{expiryDate ?? '—'}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.days, isOverdue && styles.daysOverdue]}>{daysText}</Text>
        <StatusBadge label={statusLabel} tone={statusTone} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  left: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  date: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  days: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  daysOverdue: {
    color: colors.danger,
  },
});
