import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/theme';
import type { DocumentCountBreakdown } from '@/src/types/dashboard';

type BreakdownChipsProps = {
  breakdown: DocumentCountBreakdown;
  tone?: 'default' | 'success' | 'warning' | 'danger';
};

const CHIP_TONES = {
  default: { bg: colors.primaryLight, text: colors.primary, border: colors.primaryMuted },
  success: { bg: '#D1FAE5', text: '#047857', border: '#A7F3D0' },
  warning: { bg: '#FFEDD5', text: '#C2410C', border: '#FED7AA' },
  danger: { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' },
} as const;

const ROWS: { key: keyof DocumentCountBreakdown; label: string }[] = [
  { key: 'staff', label: 'Staff' },
  { key: 'licenses', label: 'Licenses' },
  { key: 'vehicles', label: 'Vehicles' },
];

export function BreakdownChips({ breakdown, tone = 'default' }: BreakdownChipsProps) {
  const chipTone = CHIP_TONES[tone];

  return (
    <View style={styles.wrap}>
      {ROWS.map((row) => (
        <View
          key={row.key}
          style={[
            styles.chip,
            {
              backgroundColor: chipTone.bg,
              borderColor: chipTone.border,
            },
          ]}>
          <Text style={[styles.chipLabel, { color: chipTone.text }]}>{row.label}</Text>
          <Text style={[styles.chipValue, { color: chipTone.text }]}>
            {breakdown[row.key].toLocaleString()}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function breakdownTotal(breakdown: DocumentCountBreakdown): number {
  return breakdown.staff + breakdown.licenses + breakdown.vehicles;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  chipLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  chipValue: {
    fontSize: 14,
    fontWeight: '800',
  },
});
