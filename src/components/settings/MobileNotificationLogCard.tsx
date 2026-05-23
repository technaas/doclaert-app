import { StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/src/components/ui/StatusBadge';
import {
  formatNotificationLogDateTime,
  getNotificationLogDisplay,
} from '@/src/lib/mobileNotificationLogDisplay';
import { cardStyle, colors, radius, spacing } from '@/src/constants/theme';
import type { MobileNotificationLogRecord } from '@/src/types/mobileNotificationLogs';

type MobileNotificationLogCardProps = {
  log: MobileNotificationLogRecord;
};

export function MobileNotificationLogCard({ log }: MobileNotificationLogCardProps) {
  const display = getNotificationLogDisplay(log.notification_type);
  const isFailed = log.status === 'failed';
  const deviceLabel =
    log.device_name?.trim() ||
    (log.platform ? `${log.platform} device` : 'Unknown device');

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatNotificationLogDateTime(log.sent_at)}</Text>
        <View style={styles.badges}>
          <StatusBadge label={display.typeLabel} tone="default" />
          <StatusBadge
            label={log.status}
            tone={isFailed ? 'danger' : 'success'}
          />
        </View>
      </View>

      <Text style={styles.title}>{display.title}</Text>
      <Text style={styles.body}>{display.body}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaLabel}>Device</Text>
        <Text style={styles.metaValue} numberOfLines={2}>
          {deviceLabel}
        </Text>
      </View>

      {isFailed && log.error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorLabel}>Error</Text>
          <Text style={styles.errorText}>{log.error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyle,
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  date: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'flex-end',
    maxWidth: '55%',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSubtle,
  },
  metaValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'right',
  },
  errorBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  errorLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.danger,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: spacing.xs,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.danger,
  },
});
