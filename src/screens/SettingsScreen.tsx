import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppScreenLayout } from '@/src/components/layout/AppScreenLayout';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { useAuth } from '@/src/context/AuthContext';
import { colors, radius, spacing } from '@/src/constants/theme';

export function SettingsScreen() {
  const { user, profile, logout } = useAuth();
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
    <AppScreenLayout title="Settings" subtitle="Account">
      <View style={styles.content}>
        <View style={styles.profileCard}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email ?? '—'}</Text>
          <Text style={[styles.label, styles.labelSpaced]}>Role</Text>
          <Text style={styles.value}>{profile?.role ?? '—'}</Text>
        </View>

        <EmptyState
          title="More settings coming soon"
          message="Account and notification preferences will be added here."
          icon="settings-outline"
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={[styles.logout, loading && styles.logoutDisabled]}
          onPress={handleLogout}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.logoutText}>Logout</Text>
          )}
        </Pressable>
      </View>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelSpaced: {
    marginTop: spacing.md,
  },
  value: {
    marginTop: 4,
    fontSize: 15,
    color: colors.text,
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  logout: {
    marginTop: 'auto',
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
  },
  logoutDisabled: {
    opacity: 0.7,
  },
  logoutText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
