import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ListCard } from '@/src/components/ui/ListCard';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { colors } from '@/src/constants/theme';
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
    (staff.status ?? '').toLowerCase() === 'active'
      ? 'success'
      : (staff.status ?? '').toLowerCase() === 'inactive'
        ? 'neutral'
        : 'default';

  const subtitle = [
    formatStaffType(staff.staff_type),
    staff.staff_id ? `ID: ${staff.staff_id}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <ListCard
      title={staff.name}
      subtitle={subtitle}
      meta={`${staff.brandName} · ${staff.branchName}`}
      onPress={onPress}
      badges={<StatusBadge label={staff.status ?? '—'} tone={statusTone} size="sm" />}
      footer={
        contactNumber || showPartTime ? (
          <View style={styles.footer}>
            {contactNumber ? (
              <Text style={styles.contact}>Contact: {contactNumber}</Text>
            ) : null}
            {showPartTime && (staff.partTimeBrandName || staff.partTimeBranchName) ? (
              <Text style={styles.partTime}>
                Part-time: {[staff.partTimeBrandName, staff.partTimeBranchName]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            ) : null}
          </View>
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  footer: {
    gap: 4,
  },
  contact: {
    fontSize: 13,
    color: colors.text,
  },
  partTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
});

export const StaffCard = memo(StaffCardComponent);
