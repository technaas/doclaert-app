import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ComponentProps } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { DocumentsStackParamList } from '@/src/navigation/DocumentsStack';
import type { StaffStackParamList } from '@/src/navigation/StaffStack';
import type { BranchesStackParamList } from '@/src/navigation/BranchesStack';
import { BranchesStack } from '@/src/navigation/BranchesStack';

import { colors, shadows } from '@/src/constants/theme';
import { PermissionGate } from '@/src/components/access/PermissionGate';
import { DocumentsStack } from '@/src/navigation/DocumentsStack';
import { StaffStack } from '@/src/navigation/StaffStack';
import { DashboardScreen } from '@/src/screens/DashboardScreen';
import { SalaryScreen } from '@/src/screens/salary/SalaryScreen';
import { SettingsScreen } from '@/src/screens/SettingsScreen';
import { useAuth } from '@/src/context/AuthContext';
import { visibleMainTabs } from '@/src/lib/routePermissions';

export type MainTabParamList = {
  Dashboard: undefined;
  Staff: NavigatorScreenParams<StaffStackParamList>;
  Salary: undefined;
  Documents: NavigatorScreenParams<DocumentsStackParamList>;
  Branches: NavigatorScreenParams<BranchesStackParamList> | undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<
  keyof MainTabParamList,
  { icon: IconName; iconFocused: IconName; label: string }
> = {
  Dashboard: { icon: 'grid-outline', iconFocused: 'grid', label: 'Home' },
  Staff: { icon: 'people-outline', iconFocused: 'people', label: 'Staff' },
  Salary: { icon: 'wallet-outline', iconFocused: 'wallet', label: 'Salary' },
  Documents: { icon: 'document-text-outline', iconFocused: 'document-text', label: 'Docs' },
  Branches: { icon: 'git-branch-outline', iconFocused: 'git-branch', label: 'Branch' },
  Settings: { icon: 'settings-outline', iconFocused: 'settings', label: 'Settings' },
};

export function MainTabNavigator() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const visible = visibleMainTabs(profile?.role);
  const initialRouteName = visible[0] ?? 'Settings';
  const show = (name: keyof MainTabParamList) => visible.includes(name);
  const tabBarBottomInset = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={({ route }) => ({
        headerShown: false,
        href: show(route.name) ? undefined : null,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.borderLight,
          paddingTop: 4,
          paddingBottom: tabBarBottomInset,
          height: 52 + tabBarBottomInset,
          ...shadows.cardSoft,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: -2,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const config = TAB_CONFIG[route.name];
          return (
            <Ionicons
              name={focused ? config.iconFocused : config.icon}
              size={focused ? size + 1 : size}
              color={color}
            />
          );
        },
        tabBarLabel: TAB_CONFIG[route.name].label,
      })}>
      <Tab.Screen name="Dashboard">
        {() => (
          <PermissionGate route="Dashboard">
            <DashboardScreen />
          </PermissionGate>
        )}
      </Tab.Screen>
      <Tab.Screen name="Staff">
        {() => (
          <PermissionGate route="Staff">
            <StaffStack />
          </PermissionGate>
        )}
      </Tab.Screen>
      <Tab.Screen name="Salary">
        {() => (
          <PermissionGate route="Salary">
            <SalaryScreen />
          </PermissionGate>
        )}
      </Tab.Screen>
      <Tab.Screen name="Documents">
        {() => (
          <PermissionGate route="Documents">
            <DocumentsStack />
          </PermissionGate>
        )}
      </Tab.Screen>
      <Tab.Screen name="Branches">
        {() => (
          <PermissionGate route="Branches">
            <BranchesStack />
          </PermissionGate>
        )}
      </Tab.Screen>
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
