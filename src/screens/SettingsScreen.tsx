import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppScreenLayout } from '@/src/components/layout/AppScreenLayout';
import { useAuth } from '@/src/context/AuthContext';
import { cardStyle, colors, radius, spacing, typography } from '@/src/constants/theme';
import { useCompanyProfile } from '@/src/hooks/useCompanyProfile';
import { useSubscriptionGate } from '@/src/hooks/useSubscriptionGate';
import type { AppStackParamList } from '@/src/navigation/AppStack';
import { displayField } from '@/src/lib/staffDisplay';
import { formatSubscriptionEnd } from '@/src/lib/subscription';

function SettingsRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.value, styles.rowValue]} numberOfLines={3}>
        {value}
      </Text>
    </View>
  );
}

export function SettingsScreen() {
  const { user, profile, logout } = useAuth();
  const companyId = profile?.company_id ?? undefined;
  const { profile: companyProfile, loading: companyLoading } = useCompanyProfile(companyId);
  const subscription = useSubscriptionGate(companyId, Boolean(companyId));
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <AppScreenLayout title="Settings" subtitle="Account & app preferences" showBell={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
          <SettingsRow
            label="Subscription"
            value={subscription.subscription?.status ?? '—'}
          />
          <SettingsRow
            label="Plan"
            value={subscription.subscription?.plan_name?.trim() || '—'}
          />
          <SettingsRow
            label="Subscription end"
            value={formatSubscriptionEnd(subscription.subscription)}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Support</Text>
          <Pressable
            style={styles.linkButton}
            onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Text style={styles.linkButtonText}>Privacy policy</Text>
          </Pressable>
          <Pressable
            style={styles.linkButton}
            onPress={() => navigation.navigate('HelpSupport')}>
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
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
