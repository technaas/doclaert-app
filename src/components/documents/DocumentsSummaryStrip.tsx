import { StyleSheet, Text, View } from 'react-native';

type DocumentsSummaryStripProps = {
  total: number;
  expiringSoon: number;
  expired: number;
};

type StatTone = 'neutral' | 'warning' | 'danger';

const TONE_STYLES: Record<
  StatTone,
  { bg: string; border: string; label: string; value: string }
> = {
  neutral: {
    bg: '#EFF6FF',
    border: '#BFDBFE',
    label: '#2563EB',
    value: '#111827',
  },
  warning: {
    bg: '#FFF7ED',
    border: '#FED7AA',
    label: '#C2410C',
    value: '#111827',
  },
  danger: {
    bg: '#FEF2F2',
    border: '#FECACA',
    label: '#B91C1C',
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

export function DocumentsSummaryStrip({
  total,
  expiringSoon,
  expired,
}: DocumentsSummaryStripProps) {
  return (
    <View style={styles.row}>
      <CompactStatCard value={total} label="Total Docs" tone="neutral" />
      <CompactStatCard value={expiringSoon} label="Expiring Soon" tone="warning" />
      <CompactStatCard value={expired} label="Expired" tone="danger" />
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
