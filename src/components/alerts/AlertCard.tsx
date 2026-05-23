import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { colors, radius, spacing } from '@/src/constants/theme';
import {
  formatDaysRemaining,
} from '@/src/lib/documentStatus';
import {
  getAlertCardTone,
  getAlertStatusLabel,
} from '@/src/lib/alertUrgency';
import type { AlertListItem } from '@/src/types/alerts';

type AlertCardProps = {
  alert: AlertListItem;
  onPress: () => void;
};

function AlertCardComponent({ alert, onPress }: AlertCardProps) {
  const tone = getAlertCardTone(alert.displayStatus, alert.daysRemaining);
  const statusLabel = getAlertStatusLabel(alert.displayStatus, alert.daysRemaining);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.name}>{alert.documentLabel}</Text>
          <Text style={styles.type}>{alert.typeLabel}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </View>

      <Text style={styles.linked}>Linked to: {alert.linkedTo}</Text>
      <Text style={styles.meta}>
        {alert.brandName} · {alert.branchName}
      </Text>

      <View style={styles.footer}>
        <View>
          <Text style={styles.expiryLabel}>Expiry</Text>
          <Text style={styles.expiryValue}>{alert.expiryDate ?? '—'}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.days}>{formatDaysRemaining(alert.daysRemaining)}</Text>
          <StatusBadge label={statusLabel} tone={tone} />
        </View>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  titleWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  type: {
    marginTop: 2,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  linked: {
    fontSize: 13,
    color: colors.textMuted,
  },
  meta: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSubtle,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  expiryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expiryValue: {
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
    fontWeight: '600',
    color: colors.textMuted,
  },
});

export const AlertCard = memo(AlertCardComponent);
