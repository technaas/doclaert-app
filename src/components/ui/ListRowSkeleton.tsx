import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/theme';

export function ListRowSkeleton() {
  return (
    <View style={styles.card}>
      <View style={[styles.block, styles.title]} />
      <View style={[styles.block, styles.line]} />
      <View style={[styles.block, styles.lineShort]} />
      <View style={styles.row}>
        <View style={[styles.block, styles.pill]} />
        <View style={[styles.block, styles.pill]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  block: {
    backgroundColor: colors.skeleton,
    borderRadius: 6,
  },
  title: {
    width: '55%',
    height: 16,
  },
  line: {
    width: '80%',
    height: 12,
  },
  lineShort: {
    width: '45%',
    height: 12,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  pill: {
    width: 72,
    height: 22,
    borderRadius: 11,
  },
});
