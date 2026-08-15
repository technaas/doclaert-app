import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppScreenLayout } from '@/src/components/layout/AppScreenLayout';
import { PeoplePayrollCard } from '@/src/components/dashboard/PeoplePayrollCard';
import { PeoplePayrollCardSkeleton } from '@/src/components/dashboard/PeoplePayrollCardSkeleton';
import { SummaryCard } from '@/src/components/dashboard/SummaryCard';
import { SummaryCardSkeleton } from '@/src/components/dashboard/SummaryCardSkeleton';
import { cardStyle, colors, spacing, typography } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useDashboardQuery } from '@/src/hooks/queries/useDashboardQuery';
import { getQueryScreenState } from '@/src/lib/queryScreenState';
import { totalBreakdown } from '@/src/types/dashboard';
import type { AppStackParamList } from '@/src/navigation/AppStack';
import type { MainTabParamList } from '@/src/navigation/MainTabNavigator';

function formatCount(count: number): string {
  return count.toLocaleString();
}

type DashboardNavigation = BottomTabNavigationProp<MainTabParamList, 'Dashboard'> &
  NativeStackNavigationProp<AppStackParamList>;

export function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigation>();
  const { profile } = useAuth();
  const companyId = profile?.company_id;
  const query = useDashboardQuery(companyId);
  const { isInitialLoading, isRefreshing, errorMessage } = getQueryScreenState(query);
  const stats = query.data;

  const openAppScreen = (screen: 'Brands' | 'Branches') => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate(screen);
      return;
    }
    navigation.navigate(screen);
  };

  const openStaffActive = () => {
    navigation.navigate('Staff', {
      screen: 'StaffList',
      params: { status: 'active' },
    });
  };

  const openSalary = () => {
    navigation.navigate('Salary');
  };

  const openDocuments = (status: 'active' | 'expiring' | 'expired') => {
    navigation.navigate('Documents', {
      screen: 'DocumentsList',
      params: { status },
    });
  };

  const openFleet = () => {
    navigation.navigate('Vehicles', {
      screen: 'VehiclesList',
    });
  };

  const error = companyId ? errorMessage : 'Company not found on your profile.';

  const isEmpty =
    !isInitialLoading &&
    !error &&
    stats &&
    stats.brandsCount === 0 &&
    stats.branchesCount === 0 &&
    stats.activeStaffCount === 0 &&
    stats.vehiclesCount === 0 &&
    totalBreakdown(stats.validDocuments) === 0 &&
    totalBreakdown(stats.expiringSoon) === 0 &&
    totalBreakdown(stats.expired) === 0;

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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void query.refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }>
        {isInitialLoading ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Organization</Text>
              <SummaryCardSkeleton fullWidth />
            </View>
            <View style={styles.section}>
              <PeoplePayrollCardSkeleton />
            </View>
            <View style={styles.section}>
              <SummaryCardSkeleton fullWidth />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Document compliance</Text>
              <View style={styles.stack}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <SummaryCardSkeleton key={index} fullWidth />
                ))}
              </View>
            </View>
          </>
        ) : null}

        {error && !stats ? (
          <View style={styles.stateCard}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.danger} />
            <Text style={styles.stateTitle}>Unable to load dashboard</Text>
            <Text style={styles.stateMessage}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => void query.refetch()}>
              <Text style={styles.retryButtonText}>Try again</Text>
            </Pressable>
          </View>
        ) : null}

        {!error && stats ? (
          <>
            {isEmpty ? (
              <View style={[styles.stateCard, styles.stateCardFirst]}>
                <Ionicons name="folder-open-outline" size={40} color={colors.primary} />
                <Text style={styles.stateTitle}>No data yet</Text>
                <Text style={styles.stateMessage}>
                  Your company has no brands, branches, staff, or documents yet. Pull down to
                  refresh when data is added.
                </Text>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Organization</Text>
              <SummaryCard
                label="Brands & Branches"
                value={`${formatCount(stats.brandsCount)} / ${formatCount(stats.branchesCount)}`}
                icon="business-outline"
                subtitle={`${formatCount(stats.brandsCount)} brands · ${formatCount(stats.branchesCount)} branches`}
                fullWidth
                onPress={() => openAppScreen('Brands')}
              />
            </View>

            <View style={styles.section}>
              <PeoplePayrollCard
                activeStaffCount={stats.activeStaffCount}
                totalPay={stats.totalPay}
                onPressActiveStaff={openStaffActive}
                onPressTotalPay={openSalary}
              />
            </View>

            <View style={styles.section}>
              <SummaryCard
                label="Fleet"
                value={formatCount(stats.vehiclesCount)}
                icon="car-outline"
                subtitle="Vehicles"
                fullWidth
                onPress={openFleet}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Document compliance</Text>
              <View style={styles.stack}>
                <SummaryCard
                  label="Valid Documents"
                  icon="checkmark-circle-outline"
                  tone="success"
                  breakdown={stats.validDocuments}
                  fullWidth
                  onPress={() => openDocuments('active')}
                />
                <SummaryCard
                  label="Expiring Soon"
                  icon="time-outline"
                  tone="warning"
                  breakdown={stats.expiringSoon}
                  subtitle={`Within ${stats.alertThresholdDays} days`}
                  fullWidth
                  onPress={() => openDocuments('expiring')}
                />
                <SummaryCard
                  label="Expired"
                  icon="close-circle-outline"
                  tone="danger"
                  breakdown={stats.expired}
                  subtitle="Requires immediate attention"
                  fullWidth
                  onPress={() => openDocuments('expired')}
                />
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </AppScreenLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  stack: {
    gap: spacing.md,
  },
  stateCard: {
    ...cardStyle,
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  stateCardFirst: {
    marginBottom: spacing.md,
  },
  stateTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  stateMessage: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});
