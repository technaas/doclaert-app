import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DocAlertLogo } from '@/src/components/branding/DocAlertLogo';
import { NotificationBell } from '@/src/components/layout/NotificationBell';
import { colors, headerStyles, spacing, typography } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { canViewAlerts } from '@/src/lib/permissions';

type AppScreenLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBell?: boolean;
  compactTitle?: boolean;
};

export function AppScreenLayout({
  title,
  subtitle,
  children,
  showBell = true,
  compactTitle = false,
}: AppScreenLayoutProps) {
  const { profile } = useAuth();
  const showAlerts = showBell && canViewAlerts(profile?.role);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <DocAlertLogo variant="mark" size="sm" style={styles.headerMark} />
        <View style={styles.headerText}>
          <View style={headerStyles.accentBar} />
          <Text
            style={[styles.title, compactTitle && styles.titleCompact]}
            numberOfLines={compactTitle ? 2 : 3}
            adjustsFontSizeToFit={compactTitle}
            minimumFontScale={0.85}>
            {title}
          </Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {showAlerts ? <NotificationBell /> : null}
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  headerMark: {
    marginTop: 2,
    marginRight: spacing.sm,
  },
  headerText: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  title: {
    ...typography.screenTitle,
    fontSize: 26,
    lineHeight: 32,
  },
  titleCompact: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    ...typography.screenSubtitle,
    marginTop: spacing.xs,
  },
  body: {
    flex: 1,
  },
});
