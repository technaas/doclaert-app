import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getFriendlyErrorPresentation } from '@/src/lib/errors';
import { cardStyle, colors, radius, spacing } from '@/src/constants/theme';

type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Try again',
}: ErrorStateProps) {
  const presentation = getFriendlyErrorPresentation(message, title);
  const iconName = presentation.isNetwork ? 'cloud-offline-outline' : 'alert-circle-outline';
  const iconColor = presentation.isNetwork ? colors.primary : colors.danger;

  return (
    <View style={styles.wrap}>
      <View style={[styles.iconCircle, presentation.isNetwork && styles.iconCircleNetwork]}>
        <Ionicons name={iconName} size={28} color={iconColor} />
      </View>
      <Text style={styles.title}>{title ?? presentation.title}</Text>
      <Text style={styles.message}>{presentation.message}</Text>
      {onRetry ? (
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}>
          <Text style={styles.buttonText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...cardStyle,
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconCircleNetwork: {
    backgroundColor: colors.primaryLight,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 300,
  },
  button: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});
