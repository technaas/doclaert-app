import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/theme';
import { formatPay } from '@/src/lib/format';
import type { StaffListItem } from '@/src/types/staff';

type SalaryStaffRowProps = {
  staff: StaffListItem;
};

export function SalaryStaffRow({ staff }: SalaryStaffRowProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{staff.name}</Text>
      <Text style={styles.meta}>
        {staff.brandName} · {staff.branchName}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.role}>{staff.role ?? '—'}</Text>
        <Text style={styles.salary}>
          {typeof staff.salary === 'number' ? formatPay(staff.salary) : '—'}
        </Text>
      </View>
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
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
  footer: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  role: {
    fontSize: 13,
    color: colors.textMuted,
    flex: 1,
    paddingRight: spacing.sm,
  },
  salary: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
