import { StyleSheet, Text, View } from 'react-native';

import { SalaryTypeBadge } from '@/src/components/salary/SalaryTypeBadge';
import { colors, radius, shadows, spacing } from '@/src/constants/theme';
import { formatPay } from '@/src/lib/format';
import { formatStaffType } from '@/src/lib/staffDisplay';
import type { StaffListItem } from '@/src/types/staff';

type SalaryStaffRowProps = {
  staff: StaffListItem;
};

export function SalaryStaffRow({ staff }: SalaryStaffRowProps) {
  const salaryLabel =
    typeof staff.salary === 'number' ? formatPay(staff.salary) : '—';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={2}>
              {staff.name}
            </Text>
            <SalaryTypeBadge salaryType={staff.salary_type} />
          </View>
          <Text style={styles.staffType}>{formatStaffType(staff.staff_type)}</Text>
        </View>
        <View style={styles.salaryWrap}>
          <Text style={styles.salaryLabel}>Salary</Text>
          <Text style={styles.salaryAmount}>{salaryLabel}</Text>
        </View>
      </View>

      <Text style={styles.meta}>
        {staff.brandName} · {staff.branchName}
      </Text>
      {staff.role?.trim() ? (
        <Text style={styles.role}>{staff.role.trim()}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.cardSoft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  staffType: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  salaryWrap: {
    alignItems: 'flex-end',
    minWidth: 92,
  },
  salaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  salaryAmount: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  meta: {
    marginTop: spacing.sm,
    fontSize: 12,
    color: colors.textSubtle,
  },
  role: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
});
