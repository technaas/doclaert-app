import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/theme';

type VehicleSummaryStripProps = {
  total: number;
  valid: number;
  expiringSoon: number;
  expired: number;
};

export function VehicleSummaryStrip({
  total,
  valid,
  expiringSoon,
  expired,
}: VehicleSummaryStripProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.item}>
        <Text style={styles.value}>{total}</Text>
        <Text style={styles.label}>Total</Text>
      </View>
      <View style={styles.item}>
        <Text style={[styles.value, styles.valid]}>{valid}</Text>
        <Text style={styles.label}>Valid</Text>
      </View>
      <View style={styles.item}>
        <Text style={[styles.value, styles.expiring]}>{expiringSoon}</Text>
        <Text style={styles.label}>Expiring</Text>
      </View>
      <View style={styles.item}>
        <Text style={[styles.value, styles.expired]}>{expired}</Text>
        <Text style={styles.label}>Expired</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  valid: {
    color: colors.success,
  },
  expiring: {
    color: colors.warning,
  },
  expired: {
    color: colors.danger,
  },
  label: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
});
