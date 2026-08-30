import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/src/constants/theme';

type StaffSummaryStripProps = {
  total: number;
  active: number;
  inactive: number;
};

type StatTone = 'neutral' | 'success' | 'inactive';

const TONE_STYLES: Record<
  StatTone,
  { bg: string; border: string; label: string; value: string }
> = {
  neutral: {
    bg: colors.primaryLight,
    border: colors.primaryMuted,
    label: colors.primary,
    value: colors.text,
  },
  success: {
    bg: '#ECFDF5',
    border: '#A7F3D0',
    label: '#059669',
    value: '#111827',
  },
  inactive: {
    bg: '#F3F4F6',
    border: '#E5E7EB',
    label: '#6B7280',
    value: '#111827',
  },
};

function CompactStatCard({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: StatTone;
}) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: toneStyle.bg, borderColor: toneStyle.border },
      ]}
      accessibilityLabel={`${label}, ${value}`}>
      <Text
        style={[styles.value, { color: toneStyle.value }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}>
        {value.toLocaleString()}
      </Text>
      <Text style={[styles.label, { color: toneStyle.label }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

export function StaffSummaryStrip({ total, active, inactive }: StaffSummaryStripProps) {
  return (
    <View style={styles.row}>
      <CompactStatCard value={total} label="Total Staff" tone="neutral" />
      <CompactStatCard value={active} label="Active Staff" tone="success" />
      <CompactStatCard value={inactive} label="Inactive Staff" tone="inactive" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    minWidth: 0,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  label: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 13,
  },
});
