import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/constants/theme';

type StatusBadgeProps = {
  label: string;
  tone?: 'default' | 'success' | 'muted' | 'warning' | 'danger' | 'critical';
};

const TONES = {
  default: { bg: colors.primaryLight, text: colors.primary },
  success: { bg: colors.successLight, text: colors.success },
  muted: { bg: colors.surface, text: colors.textMuted },
  warning: { bg: colors.warningLight, text: colors.warning },
  danger: { bg: colors.dangerLight, text: colors.danger },
  critical: { bg: '#FFEDD5', text: '#C2410C' },
} as const;

export function StatusBadge({ label, tone = 'default' }: StatusBadgeProps) {
  const style = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
