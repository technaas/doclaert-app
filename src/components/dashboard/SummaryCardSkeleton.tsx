import { StyleSheet, View } from 'react-native';

import { radius, spacing } from '@/src/constants/theme';

type SummaryCardSkeletonProps = {
  fullWidth?: boolean;
};

export function SummaryCardSkeleton({ fullWidth = false }: SummaryCardSkeletonProps) {
  return (
    <View style={[styles.card, fullWidth && styles.cardFull]}>
      <View style={styles.row}>
        <View style={[styles.block, styles.label]} />
        <View style={[styles.block, styles.icon]} />
      </View>
      <View style={[styles.block, styles.value]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: spacing.lg,
  },
  cardFull: {
    flex: undefined,
    minWidth: '100%',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  block: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  label: {
    width: '55%',
    height: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  value: {
    width: '40%',
    height: 28,
  },
});
