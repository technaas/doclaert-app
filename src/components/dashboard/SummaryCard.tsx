import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];

type SummaryCardProps = {
  label: string;
  value: string;
  icon: IconName;
  tone?: 'default' | 'warning' | 'danger' | 'success';
  subtitle?: string;
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
  },
  warning: {
    cardBg: '#FFF7ED',
    cardBorder: '#FED7AA',
    iconBg: '#FFEDD5',
    iconColor: '#EA580C',
    labelColor: '#C2410C',
    valueColor: '#111827',
    subtitleColor: '#78716C',
  },
  danger: {
    cardBg: '#FEF2F2',
    cardBorder: '#FECACA',
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    labelColor: '#B91C1C',
    valueColor: '#111827',
    subtitleColor: '#78716C',
  },
  success: {
    cardBg: '#FFFFFF',
    cardBorder: '#E5E7EB',
    iconBg: '#ECFDF5',
    iconColor: '#059669',
    labelColor: '#059669',
    valueColor: '#111827',
    subtitleColor: '#6B7280',
  },
} as const;

export function SummaryCard({
  label,
  value,
  icon,
  tone = 'default',
  subtitle,
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
        <View style={[styles.iconWrap, { backgroundColor: toneStyle.iconBg }]}>
          <Ionicons name={icon} size={20} color={toneStyle.iconColor} />
        </View>
      </View>
      <Text style={[styles.value, { color: toneStyle.valueColor }]}>{value}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: toneStyle.subtitleColor }]}>{subtitle}</Text>
      ) : null}
    </>
  );

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
        accessibilityLabel={`${label}, ${value}`}>
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
  subtitle: {
    marginTop: 4,
    fontSize: 12,
  },
});
