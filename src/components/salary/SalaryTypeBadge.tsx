import { StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { colors, radius, spacing } from '@/src/constants/theme';
import { formatSalaryType } from '@/src/lib/staffDisplay';

type SalaryTypeBadgeProps = {
  salaryType: string | null | undefined;
};

export function SalaryTypeBadge({ salaryType }: SalaryTypeBadgeProps) {
  const label = formatSalaryType(salaryType);
  if (label === '—') {
    return null;
  }

  const tone = label === 'Cash' ? 'warning' : 'default';

  return (
    <View style={styles.wrap}>
      <StatusBadge label={label} tone={tone} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
  },
});
