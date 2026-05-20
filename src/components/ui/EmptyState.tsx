import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type EmptyStateProps = {
  title: string;
  message: string;
  icon?: IconName;
};

export function EmptyState({
  title,
  message,
  icon = 'folder-open-outline',
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons name={icon} size={40} color={colors.primary} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xxl,
    gap: spacing.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
