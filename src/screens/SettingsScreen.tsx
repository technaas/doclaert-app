import Constants from 'expo-constants';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppScreenLayout } from '@/src/components/layout/AppScreenLayout';
import {
  MobileNotificationLogsSection,
  type MobileNotificationLogsSectionHandle,
} from '@/src/components/settings/MobileNotificationLogsSection';
import { useAuth } from '@/src/context/AuthContext';
import { useNotifications } from '@/src/context/NotificationContext';
import { cardStyle, colors, radius, spacing, typography } from '@/src/constants/theme';
import { useCompanyProfile } from '@/src/hooks/useCompanyProfile';
import { displayField } from '@/src/lib/staffDisplay';
import type { NotificationPermissionStatus } from '@/src/types/notifications';

function formatPermissionStatus(status: NotificationPermissionStatus): string {
  switch (status) {
    case 'granted':
      return 'Granted';
    case 'denied':
      return 'Denied';
    case 'unavailable':
      return 'Unavailable';
    default:
      return 'Not determined';
  }
}

function formatPushStatus(pushEnabled: boolean, permissionStatus: NotificationPermissionStatus) {
  if (pushEnabled) return 'Enabled';
  if (permissionStatus === 'denied') return 'Disabled (permission denied)';
  if (permissionStatus === 'unavailable') return 'Unavailable on this device';
  return 'Not enabled';
}

function formatSyncStatus(
  syncStatus: string,
  lastSyncedAt: string | null,
  lastSyncError: string | null,
): string {
  if (syncStatus === 'syncing') return 'Syncing…';
  if (syncStatus === 'success' && lastSyncedAt) {
    return `Last synced ${new Date(lastSyncedAt).toLocaleString()}`;
  }
  if (syncStatus === 'error') return lastSyncError ?? 'Sync failed';
  return 'Not synced yet';
}

function SettingsRow({
  label,
  value,
  valueTone,
}: {
  label: string;
  value: string;
  valueTone?: 'default' | 'success' | 'muted' | 'danger';
}) {
  const valueStyle =
    valueTone === 'success'
      ? styles.valueSuccess
      : valueTone === 'danger'
        ? styles.valueDanger
        : valueTone === 'muted'
          ? styles.valueMuted
          : styles.value;

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[valueStyle, styles.rowValue]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

export function SettingsScreen() {
  const { user, profile, logout } = useAuth();
  const companyId = profile?.company_id;
  const { profile: companyProfile, loading: companyLoading } = useCompanyProfile(companyId);
  const {
    permissionStatus,
    pushEnabled,
    syncStatus,
    lastSyncedAt,
    lastSyncError,
    permissionMessage,
    devicePlatform,
    isRegistering,
    retryTokenSync,
    testPushRegistration,
  } = useNotifications();

  const appVersion =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '1.0.0';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pushActionLoading, setPushActionLoading] = useState(false);
  const [logsRefreshing, setLogsRefreshing] = useState(false);
  const notificationLogsRef = useRef<MobileNotificationLogsSectionHandle>(null);

  const handleLogout = async () => {
    setError(null);
    setLoading(true);
    try {
      await logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetrySync = async () => {
    setPushActionLoading(true);
    try {
      await retryTokenSync();
    } finally {
      setPushActionLoading(false);
    }
  };

  const handleTestPushRegistration = async () => {
    setPushActionLoading(true);
    try {
      const result = await testPushRegistration();
      const detail = [
        result.message,
        result.permissionStatus ? `Permission: ${result.permissionStatus}` : null,
        result.tokenValid !== undefined ? `Token valid: ${result.tokenValid}` : null,
        result.syncAction ? `Action: ${result.syncAction}` : null,
        result.rowId ? `Row: ${result.rowId}` : null,
        result.error ? `Error: ${result.error}` : null,
        result.supabaseResponse
          ? `Response: ${JSON.stringify(result.supabaseResponse, null, 2)}`
          : null,
      ]
        .filter(Boolean)
        .join('\n\n');

      Alert.alert(
        result.success ? 'Push registration test OK' : 'Push registration test failed',
        detail.slice(0, 2000),
      );
    } finally {
      setPushActionLoading(false);
    }
  };

  const showPlaceholder = (title: string) => {
    Alert.alert(title, 'This link will be available in a future update.');
  };

  const pushStatusLabel = formatPushStatus(pushEnabled, permissionStatus);

  const handleRefreshLogs = async () => {
    setLogsRefreshing(true);
    try {
      await notificationLogsRef.current?.refresh();
    } finally {
      setLogsRefreshing(false);
    }
  };

  return (
    <AppScreenLayout title="Settings" subtitle="Account & app preferences" showBell={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={logsRefreshing}
            onRefresh={() => void handleRefreshLogs()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Company</Text>
          <Text style={styles.sectionHint}>Read-only company details</Text>
          <SettingsRow
            label="Company name"
            value={
              companyLoading
                ? 'Loading…'
                : displayField(companyProfile?.name)
            }
          />
          <SettingsRow
            label="Business type"
            value={
              companyLoading
                ? 'Loading…'
                : displayField(companyProfile?.business_type)
            }
          />
          <SettingsRow
            label="Country"
            value={
              companyLoading
                ? 'Loading…'
                : displayField(companyProfile?.country)
            }
          />
          <SettingsRow
            label="Contact person"
            value={
              companyLoading
                ? 'Loading…'
                : displayField(companyProfile?.contact_person)
            }
          />
          <SettingsRow
            label="Contact number"
            value={
              companyLoading
                ? 'Loading…'
                : displayField(companyProfile?.contact_number)
            }
          />
          <SettingsRow
            label="Email"
            value={
              companyLoading
                ? 'Loading…'
                : displayField(companyProfile?.email)
            }
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account</Text>
          <SettingsRow label="User" value={user?.email ?? '—'} />
          <SettingsRow label="Role" value={profile?.role ?? '—'} />
          <SettingsRow label="App version" value={appVersion} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Push notifications</Text>
          <SettingsRow
            label="Status"
            value={pushStatusLabel}
            valueTone={pushEnabled ? 'success' : permissionStatus === 'denied' ? 'danger' : 'muted'}
          />
          <SettingsRow
            label="Permission"
            value={formatPermissionStatus(permissionStatus)}
          />
          <SettingsRow
            label="Token sync"
            value={formatSyncStatus(syncStatus, lastSyncedAt, lastSyncError)}
          />
          {devicePlatform ? (
            <SettingsRow label="Device platform" value={devicePlatform} />
          ) : null}
          {permissionMessage ? (
            <Text style={styles.hint}>{permissionMessage}</Text>
          ) : null}

          <Pressable
            style={[styles.secondaryButton, pushActionLoading && styles.buttonDisabled]}
            onPress={() => void handleRetrySync()}
            disabled={pushActionLoading || isRegistering}>
            {pushActionLoading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={styles.secondaryButtonText}>Retry notification sync</Text>
            )}
          </Pressable>

          <Pressable
            style={[styles.testButton, pushActionLoading && styles.buttonDisabled]}
            onPress={() => void handleTestPushRegistration()}
            disabled={pushActionLoading || isRegistering}>
            <Text style={styles.testButtonText}>Test Push Registration</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <MobileNotificationLogsSection ref={notificationLogsRef} companyId={companyId} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Support</Text>
          <Pressable
            style={styles.linkButton}
            onPress={() => showPlaceholder('Privacy Policy')}>
            <Text style={styles.linkButtonText}>Privacy policy</Text>
          </Pressable>
          <Pressable
            style={styles.linkButton}
            onPress={() => showPlaceholder('Help & Support')}>
            <Text style={styles.linkButtonText}>Help & support</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.logout, loading && styles.buttonDisabled]}
          onPress={() => void handleLogout()}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.logoutText}>Logout</Text>
          )}
        </Pressable>
      </ScrollView>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  card: {
    ...cardStyle,
    padding: spacing.lg,
  },
  cardTitle: {
    ...typography.sectionTitle,
    marginBottom: spacing.sm,
  },
  sectionHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  rowLabel: {
    fontSize: 14,
    color: colors.textMuted,
    flex: 1,
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  valueSuccess: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  valueDanger: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.danger,
  },
  valueMuted: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  hint: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
  secondaryButton: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  testButton: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    minHeight: 44,
    justifyContent: 'center',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  linkButton: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  linkButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
  logout: {
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    marginTop: spacing.sm,
  },
  logoutText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
