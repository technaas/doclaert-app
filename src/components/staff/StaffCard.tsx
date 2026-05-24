import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { colors, radius, spacing } from '@/src/constants/theme';
import {
  formatContactNumber,
  formatStaffType,
} from '@/src/lib/staffDisplay';
import { isPartTimeType } from '@/src/lib/staffFilters';
import type { StaffListItem } from '@/src/types/staff';

type StaffCardProps = {
  staff: StaffListItem;
  onPress: () => void;
};

function StaffCardComponent({ staff, onPress }: StaffCardProps) {
  const showPartTime = isPartTimeType(staff.staff_type);
  const contactNumber = formatContactNumber(staff.contact_number);
  const statusTone =
    (staff.status ?? '') === 'active'
      ? 'success'
      : (staff.status ?? '') === 'inactive'
        ? 'muted'
        : 'default';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.name}>{staff.name}</Text>
          <Text style={styles.staffType}>{formatStaffType(staff.staff_type)}</Text>
          {staff.staff_id ? <Text style={styles.staffId}>ID: {staff.staff_id}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </View>

      <Text style={styles.meta}>
        {staff.brandName} · {staff.branchName}
      </Text>

      {contactNumber ? (
        <Text style={styles.contact}>Contact: {contactNumber}</Text>
      ) : null}

      <View style={styles.row}>
        <StatusBadge label={staff.status ?? '—'} tone={statusTone} />
      </View>

      {showPartTime && (staff.partTimeBrandName || staff.partTimeBranchName) ? (
        <View style={styles.partTime}>
          {staff.partTimeBrandName ? (
            <Text style={styles.partTimeText}>Part Time Brand: {staff.partTimeBrandName}</Text>
          ) : null}
          {staff.partTimeBranchName ? (
            <Text style={styles.partTimeText}>Part Time Branch: {staff.partTimeBranchName}</Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
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
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  titleWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  staffType: {
    marginTop: 2,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  staffId: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted,
  },
  meta: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  contact: {
    fontSize: 13,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  partTime: {
    marginTop: spacing.sm,
    gap: 2,
  },
  partTimeText: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

export const StaffCard = memo(StaffCardComponent);
