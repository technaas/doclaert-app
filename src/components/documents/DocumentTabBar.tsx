import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/src/constants/theme';
import type { DocumentTab } from '@/src/types/documents';

const TABS: { key: DocumentTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'staff', label: 'Staff Documents' },
  { key: 'branch', label: 'Branch Licenses' },
];

type DocumentTabBarProps = {
  value: DocumentTab;
  onChange: (tab: DocumentTab) => void;
};

export function DocumentTabBar({ value, onChange }: DocumentTabBarProps) {
  return (
    <View style={styles.wrap}>
      {TABS.map((tab) => {
        const active = tab.key === value;
        return (
          <Pressable
            key={tab.key}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onChange(tab.key)}>
            <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  tabTextActive: {
    color: colors.primary,
  },
});
