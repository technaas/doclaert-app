import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/theme';

type FilterBarProps = {
  children: ReactNode;
  onReset?: () => void;
  showReset?: boolean;
};

export function FilterBar({ children, onReset, showReset = false }: FilterBarProps) {
  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {children}
      </ScrollView>
      {showReset && onReset ? (
        <Pressable style={styles.reset} onPress={onReset} hitSlop={8}>
          <Ionicons name="refresh-outline" size={14} color={colors.primary} />
          <Text style={styles.resetText}>Reset</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingRight: spacing.xs,
  },
  reset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexShrink: 0,
  },
  resetText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
});
