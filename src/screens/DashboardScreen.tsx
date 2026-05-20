import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppScreenLayout } from '@/src/components/layout/AppScreenLayout';
import { SummaryCard } from '@/src/components/dashboard/SummaryCard';
import type { AppStackParamList } from '@/src/navigation/AppStack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SummaryCardSkeleton } from '@/src/components/dashboard/SummaryCardSkeleton';
import { useAuth } from '@/src/context/AuthContext';
import { fetchDashboardStats } from '@/src/services/dashboard';
import type { DashboardStats } from '@/src/types/dashboard';

function formatPay(amount: number): string {
  return `KWD ${amount.toFixed(3)}`;
}

function formatCount(count: number): string {
  return count.toLocaleString();
}

export function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user, profile, logout } = useAuth();
  const companyId = profile?.company_id;

  const openAppScreen = (screen: 'Brands' | 'Branches') => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(screen);
      return;
    }
    navigation.navigate(screen);
  };

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const loadStats = useCallback(
    async (isRefresh = false) => {
      if (!companyId) {
        setError('Company not found on your profile.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await fetchDashboardStats(companyId);
        setStats(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load dashboard. Please try again.';
        setError(message);
        if (!isRefresh) {
          setStats(null);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [companyId],
  );

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const handleLogout = async () => {
    setLogoutError(null);
    setLogoutLoading(true);

    try {
      await logout();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed. Please try again.';
      setLogoutError(message);
    } finally {
      setLogoutLoading(false);
    }
  };

  const isEmpty =
    !loading &&
    !error &&
    stats &&
    stats.brandsCount === 0 &&
    stats.branchesCount === 0 &&
    stats.activeStaffCount === 0 &&
    stats.expiringSoonCount === 0 &&
    stats.expiredCount === 0;

  const greeting = stats?.companyName ? `Welcome, ${stats.companyName}` : 'Dashboard';
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AppScreenLayout title={greeting} subtitle={today}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadStats(true)}
            tintColor="#2563EB"
            colors={['#2563EB']}
          />
        }>
        {user?.email ? <Text style={styles.email}>{user.email}</Text> : null}

        {loading && !stats ? (
          <View style={styles.grid}>
            {Array.from({ length: 6 }).map((_, index) => (
              <SummaryCardSkeleton key={index} />
            ))}
          </View>
        ) : null}

        {error ? (
          <View style={styles.stateCard}>
            <Ionicons name="alert-circle-outline" size={40} color="#DC2626" />
            <Text style={styles.stateTitle}>Unable to load dashboard</Text>
            <Text style={styles.stateMessage}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => void loadStats()}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : null}

        {!loading && !error && stats ? (
          <>
            {isEmpty ? (
              <View style={styles.stateCard}>
                <Ionicons name="folder-open-outline" size={40} color="#2563EB" />
                <Text style={styles.stateTitle}>No data yet</Text>
                <Text style={styles.stateMessage}>
                  Your company has no brands, branches, staff, or documents yet. Pull down to
                  refresh when data is added.
                </Text>
              </View>
            ) : null}

            <View style={styles.grid}>
              <SummaryCard
                label="Brands"
                value={formatCount(stats.brandsCount)}
                icon="business-outline"
                onPress={() => openAppScreen('Brands')}
              />
              <SummaryCard
                label="Branches"
                value={formatCount(stats.branchesCount)}
                icon="location-outline"
                onPress={() => openAppScreen('Branches')}
              />
              <SummaryCard
                label="Active Staff"
                value={formatCount(stats.activeStaffCount)}
                icon="people-outline"
                tone="success"
              />
              <SummaryCard
                label="Total Pay"
                value={formatPay(stats.totalPay)}
                icon="wallet-outline"
                subtitle="Active staff salaries"
              />
              <SummaryCard
                label="Expiring Soon"
                value={formatCount(stats.expiringSoonCount)}
                icon="time-outline"
                tone="warning"
                subtitle={`Within ${stats.alertThresholdDays} days`}
              />
              <SummaryCard
                label="Expired"
                value={formatCount(stats.expiredCount)}
                icon="close-circle-outline"
                tone="danger"
                subtitle="Past expiry date"
              />
            </View>
          </>
        ) : null}

        {logoutError ? <Text style={styles.logoutError}>{logoutError}</Text> : null}

        <Pressable
          style={[styles.logoutButton, logoutLoading && styles.logoutButtonDisabled]}
          onPress={handleLogout}
          disabled={logoutLoading || loading}>
          {logoutLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.logoutButtonText}>Logout</Text>
          )}
        </Pressable>
      </ScrollView>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  email: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  stateCard: {
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 24,
    marginBottom: 20,
    gap: 8,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  stateMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: '#DC2626',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutError: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
});
