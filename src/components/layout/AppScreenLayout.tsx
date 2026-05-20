import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationBell } from '@/src/components/layout/NotificationBell';
import { colors, spacing } from '@/src/constants/theme';

type AppScreenLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBell?: boolean;
};

export function AppScreenLayout({
  title,
  subtitle,
  children,
  showBell = true,
}: AppScreenLayoutProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {showBell ? <NotificationBell /> : null}
      </View>
      <View style={styles.body}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.textMuted,
  },
  body: {
    flex: 1,
  },
});
