import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing } from '@/src/constants/theme';
import { formatPayDashboard } from '@/src/lib/format';

type PeoplePayrollCardProps = {
  activeStaffCount: number;
  totalPay: number;
  showSalary?: boolean;
  onPressActiveStaff?: () => void;
  onPressTotalPay?: () => void;
};

function statValueFontSize(value: string): number {
  if (value.length > 14) return 20;
  if (value.length > 11) return 22;
  return 26;
}

function StatBlock({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  labelColor,
  onPress,
  accessibilityLabel,
}: {
  icon: 'people-outline' | 'wallet-outline';
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  labelColor: string;
  onPress?: () => void;
  accessibilityLabel: string;
}) {
  const content = (
    <View style={styles.statInner}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.statText}>
        <Text style={[styles.statLabel, { color: labelColor }]} numberOfLines={1}>
          {label}
        </Text>
        <Text
          style={[styles.statValue, { fontSize: statValueFontSize(value) }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}>
          {value}
        </Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.statBlock, pressed && styles.statPressed]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.statBlock}>{content}</View>;
}

export function PeoplePayrollCard({
  activeStaffCount,
  totalPay,
  showSalary = true,
  onPressActiveStaff,
  onPressTotalPay,
}: PeoplePayrollCardProps) {
  const payLabel = formatPayDashboard(totalPay);

  return (
    <View style={styles.card} accessibilityLabel="People and Payroll">
      <Text style={styles.cardTitle}>{showSalary ? 'People & Payroll' : 'People'}</Text>

      <View style={styles.statsRow}>
        <StatBlock
          icon="people-outline"
          iconBg="#D1FAE5"
          iconColor={colors.success}
          label="Active Staff"
          value={activeStaffCount.toLocaleString()}
          labelColor="#047857"
          onPress={onPressActiveStaff}
          accessibilityLabel={`Active Staff, ${activeStaffCount}`}
        />

        {showSalary ? (
          <>
            <View style={styles.divider} />
            <StatBlock
              icon="wallet-outline"
              iconBg={colors.primaryLight}
              iconColor={colors.primary}
              label="Total Pay"
              value={payLabel}
              labelColor={colors.primary}
              onPress={onPressTotalPay}
              accessibilityLabel={`Total Pay, ${payLabel}`}
            />
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.cardSoft,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  statBlock: {
    flex: 1,
    minWidth: 0,
  },
  statPressed: {
    opacity: 0.88,
  },
  statInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.text,
  },
  divider: {
    width: 1,
    marginHorizontal: spacing.sm,
    backgroundColor: colors.border,
    alignSelf: 'stretch',
  },
});
