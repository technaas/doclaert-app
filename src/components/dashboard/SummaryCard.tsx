import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { DocumentCountBreakdown } from '@/src/types/dashboard';

type IconName = ComponentProps<typeof Ionicons>['name'];

type SummaryCardProps = {
  label: string;
  value?: string;
  icon: IconName;
  tone?: 'default' | 'warning' | 'danger' | 'success';
  subtitle?: string;
  breakdown?: DocumentCountBreakdown;
  onPress?: () => void;
};

const TONE_STYLES = {
  default: {
    cardBg: '#FFFFFF',
    cardBorder: '#E5E7EB',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    labelColor: '#2563EB',
    valueColor: '#111827',
    subtitleColor: '#6B7280',
    breakdownColor: '#111827',
  },
  warning: {
    cardBg: '#FFF7ED',
    cardBorder: '#FED7AA',
    iconBg: '#FFEDD5',
    iconColor: '#EA580C',
    labelColor: '#C2410C',
    valueColor: '#111827',
    subtitleColor: '#78716C',
    breakdownColor: '#111827',
  },
  danger: {
    cardBg: '#FEF2F2',
    cardBorder: '#FECACA',
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    labelColor: '#B91C1C',
    valueColor: '#111827',
    subtitleColor: '#78716C',
    breakdownColor: '#111827',
  },
  success: {
    cardBg: '#ECFDF5',
    cardBorder: '#A7F3D0',
    iconBg: '#D1FAE5',
    iconColor: '#059669',
    labelColor: '#047857',
    valueColor: '#111827',
    subtitleColor: '#047857',
    breakdownColor: '#111827',
  },
} as const;

function formatAccessibilityLabel(
  label: string,
  value?: string,
  breakdown?: DocumentCountBreakdown,
): string {
  if (breakdown) {
    return `${label}, Staff ${breakdown.staff}, Licenses ${breakdown.licenses}`;
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
  onPress,
}: SummaryCardProps) {
  const toneStyle = TONE_STYLES[tone];

  const cardSurfaceStyle = {
    backgroundColor: toneStyle.cardBg,
    borderColor: toneStyle.cardBorder,
  };

  const content = (
    <>
      <View style={styles.header}>
        <Text style={[styles.label, { color: toneStyle.labelColor }]}>{label}</Text>
        <View style={styles.headerRight}>
          <View style={[styles.iconWrap, { backgroundColor: toneStyle.iconBg }]}>
            <Ionicons name={icon} size={20} color={toneStyle.iconColor} />
          </View>
          {onPress ? (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={toneStyle.labelColor}
              style={styles.chevron}
            />
          ) : null}
        </View>
      </View>

      {breakdown ? (
        <View style={styles.breakdown}>
          <Text style={[styles.breakdownLine, { color: toneStyle.breakdownColor }]}>
            Staff: {breakdown.staff.toLocaleString()}
          </Text>
          <Text style={[styles.breakdownLine, { color: toneStyle.breakdownColor }]}>
            Licenses: {breakdown.licenses.toLocaleString()}
          </Text>
        </View>
      ) : value ? (
        <Text style={[styles.value, { color: toneStyle.valueColor }]}>{value}</Text>
      ) : null}

      {subtitle ? (
        <Text style={[styles.subtitle, { color: toneStyle.subtitleColor }]}>{subtitle}</Text>
      ) : null}
    </>
  );

  const accessibilityLabel = formatAccessibilityLabel(label, value, breakdown);

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          cardSurfaceStyle,
          styles.cardPressable,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.card, cardSurfaceStyle]}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressable: {
    borderColor: '#DBEAFE',
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chevron: {
    opacity: 0.55,
  },
  label: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    paddingRight: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  breakdown: {
    gap: 4,
  },
  breakdownLine: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
  },
});
