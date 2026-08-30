import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  BreakdownChips,
  breakdownTotal,
} from '@/src/components/ui/BreakdownChips';
import { colors, radius, shadows, spacing } from '@/src/constants/theme';
import type { DocumentCountBreakdown } from '@/src/types/dashboard';

type IconName = ComponentProps<typeof Ionicons>['name'];

type SummaryCardProps = {
  label: string;
  value?: string;
  icon: IconName;
  tone?: 'default' | 'warning' | 'danger' | 'success';
  subtitle?: string;
  breakdown?: DocumentCountBreakdown;
  fullWidth?: boolean;
  compact?: boolean;
  onPress?: () => void;
};

const TONE_STYLES = {
  default: {
    cardBg: colors.background,
    cardBorder: colors.border,
    iconBg: colors.primaryLight,
    iconColor: colors.primary,
    labelColor: colors.primary,
    valueColor: colors.text,
    subtitleColor: colors.textMuted,
  },
  warning: {
    cardBg: colors.warningLight,
    cardBorder: '#FED7AA',
    iconBg: '#FFEDD5',
    iconColor: colors.warning,
    labelColor: '#C2410C',
    valueColor: colors.text,
    subtitleColor: '#78716C',
  },
  danger: {
    cardBg: colors.dangerLight,
    cardBorder: '#FECACA',
    iconBg: '#FEE2E2',
    iconColor: colors.danger,
    labelColor: '#B91C1C',
    valueColor: colors.text,
    subtitleColor: '#78716C',
  },
  success: {
    cardBg: colors.successLight,
    cardBorder: '#A7F3D0',
    iconBg: '#D1FAE5',
    iconColor: colors.success,
    labelColor: '#047857',
    valueColor: colors.text,
    subtitleColor: '#047857',
  },
} as const;

function formatAccessibilityLabel(
  label: string,
  value?: string,
  breakdown?: DocumentCountBreakdown,
): string {
  if (breakdown) {
    return `${label}, total ${breakdownTotal(breakdown)}, Staff ${breakdown.staff}, Licenses ${breakdown.licenses}, Vehicles ${breakdown.vehicles}`;
  }
  return `${label}, ${value ?? ''}`;
}

export function SummaryCard({
  label,
  value,
  icon,
  tone = 'default',
  subtitle,
  breakdown,
  fullWidth = false,
  compact = false,
  onPress,
}: SummaryCardProps) {
  const toneStyle = TONE_STYLES[tone];
  const total = breakdown ? breakdownTotal(breakdown) : null;

  const content = (
    <>
      <View style={styles.header}>
        <View style={[styles.iconWrap, compact && styles.iconWrapCompact, { backgroundColor: toneStyle.iconBg }]}>
          <Ionicons name={icon} size={compact ? 18 : 22} color={toneStyle.iconColor} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.label, { color: toneStyle.labelColor }]}>{label}</Text>
          {total !== null ? (
            <Text style={[styles.value, compact && styles.valueCompact, { color: toneStyle.valueColor }]}>
              {total.toLocaleString()}
            </Text>
          ) : value ? (
            <Text
              style={[styles.value, compact && styles.valueCompact, { color: toneStyle.valueColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}>
              {value}
            </Text>
          ) : null}
        </View>
      </View>

      {breakdown ? (
        <BreakdownChips breakdown={breakdown} tone={tone === 'default' ? 'default' : tone} />
      ) : null}

      {subtitle ? (
        <Text style={[styles.subtitle, { color: toneStyle.subtitleColor }]}>{subtitle}</Text>
      ) : null}
    </>
  );

  const cardSurfaceStyle = {
    backgroundColor: toneStyle.cardBg,
    borderColor: toneStyle.cardBorder,
  };

  const accessibilityLabel = formatAccessibilityLabel(label, value, breakdown);

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          compact && styles.cardCompact,
          fullWidth && styles.cardFull,
          cardSurfaceStyle,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.card, compact && styles.cardCompact, fullWidth && styles.cardFull, cardSurfaceStyle]}>{content}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.cardSoft,
  },
  cardCompact: {
    minWidth: 0,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardFull: {
    flex: undefined,
    minWidth: '100%',
    width: '100%',
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapCompact: {
    width: 36,
    height: 36,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  valueCompact: {
    fontSize: 22,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
});
