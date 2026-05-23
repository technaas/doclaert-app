import { StyleSheet, Text, View } from 'react-native';

type SalarySummaryStripProps = {
  totalStaff: number;
  totalPay: string;
  averageSalary: string;
  activeStaffCount: number;
};

type StatTone = 'neutral' | 'success' | 'purple' | 'warning';

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
  success: {
    bg: '#ECFDF5',
    border: '#A7F3D0',
    label: '#059669',
    value: '#111827',
  },
  purple: {
    bg: '#F5F3FF',
    border: '#DDD6FE',
    label: '#7C3AED',
    value: '#111827',
  },
  warning: {
    bg: '#FFF7ED',
    border: '#FED7AA',
    label: '#C2410C',
    value: '#111827',
  },
};

function CompactStatCard({
  value,
  label,
  tone,
}: {
  value: string;
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
        minimumFontScale={0.65}>
        {value}
      </Text>
      <Text style={[styles.label, { color: toneStyle.label }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

export function SalarySummaryStrip({
  totalStaff,
  totalPay,
  averageSalary,
  activeStaffCount,
}: SalarySummaryStripProps) {
  return (
    <View style={styles.row}>
      <CompactStatCard
        value={totalStaff.toLocaleString()}
        label="Total Staff"
        tone="neutral"
      />
      <CompactStatCard value={totalPay} label="Total Pay" tone="success" />
      <CompactStatCard value={averageSalary} label="Avg Salary" tone="purple" />
      <CompactStatCard
        value={activeStaffCount.toLocaleString()}
        label="Active Staff"
        tone="warning"
      />
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
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 20,
    textAlign: 'center',
  },
  label: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
  },
});
