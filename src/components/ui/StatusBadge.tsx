import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/constants/theme';

export type StatusBadgeTone =
  | 'default'
  | 'success'
  | 'muted'
  | 'neutral'
  | 'warning'
  | 'danger'
  | 'critical';

type StatusBadgeProps = {
  label: string;
  tone?: StatusBadgeTone;
  size?: 'sm' | 'md';
};

const TONES: Record<
  StatusBadgeTone,
  { bg: string; text: string; border: string }
> = {
  default: { bg: colors.primaryLight, text: colors.primary, border: colors.primaryMuted },
  success: { bg: colors.successLight, text: colors.success, border: '#A7F3D0' },
  muted: { bg: colors.surface, text: colors.textMuted, border: colors.border },
  neutral: { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' },
  warning: { bg: colors.warningLight, text: colors.warning, border: '#FED7AA' },
  danger: { bg: colors.dangerLight, text: colors.danger, border: '#FECACA' },
  critical: { bg: '#FFEDD5', text: '#C2410C', border: '#FDBA74' },
};

export function StatusBadge({ label, tone = 'default', size = 'md' }: StatusBadgeProps) {
  const style = TONES[tone === 'muted' ? 'neutral' : tone];
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        isSmall && styles.badgeSm,
        { backgroundColor: style.bg, borderColor: style.border },
      ]}>
      <Text style={[styles.text, isSmall && styles.textSm, { color: style.text }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
  textSm: {
    fontSize: 10,
  },
});
