import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/src/constants/theme';

type DetailRowProps = {
  label: string;
  value?: string | null;
  children?: ReactNode;
};

export function DetailRow({ label, value, children }: DetailRowProps) {
  const display = (value ?? '').trim() || '—';

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {children ? (
        <View style={styles.valueWrap}>{children}</View>
      ) : (
        <Text style={styles.value}>{display}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  label: {
    ...typography.label,
    width: 132,
    paddingTop: 2,
  },
  valueWrap: {
    flex: 1,
    alignItems: 'flex-start',
  },
  value: {
    ...typography.body,
    flex: 1,
    fontWeight: '600',
  },
});
