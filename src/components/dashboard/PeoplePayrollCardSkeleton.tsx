import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/theme';

export function PeoplePayrollCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={[styles.block, styles.title]} />
      <View style={styles.row}>
        <View style={styles.column}>
          <View style={[styles.block, styles.icon]} />
          <View style={styles.textCol}>
            <View style={[styles.block, styles.label]} />
            <View style={[styles.block, styles.value]} />
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.column}>
          <View style={[styles.block, styles.icon]} />
          <View style={styles.textCol}>
            <View style={[styles.block, styles.label]} />
            <View style={[styles.block, styles.value]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    width: '40%',
    height: 12,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  column: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  textCol: {
    flex: 1,
    gap: 6,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
  },
  block: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  label: {
    height: 10,
    width: '70%',
  },
  value: {
    height: 24,
    width: '55%',
  },
});
