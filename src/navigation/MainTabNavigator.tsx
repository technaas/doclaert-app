import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ComponentProps } from 'react';

import { colors } from '@/src/constants/theme';
import { DocumentsStack } from '@/src/navigation/DocumentsStack';
import { StaffStack } from '@/src/navigation/StaffStack';
import { DashboardScreen } from '@/src/screens/DashboardScreen';
import { SalaryScreen } from '@/src/screens/salary/SalaryScreen';
import { SettingsScreen } from '@/src/screens/SettingsScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Staff: undefined;
  Salary: undefined;
  Documents: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

type IconName = ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof MainTabParamList, IconName> = {
  Dashboard: 'grid-outline',
  Staff: 'people-outline',
  Salary: 'wallet-outline',
  Documents: 'document-text-outline',
  Settings: 'settings-outline',
};

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingTop: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}>
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Staff" component={StaffStack} />
      <Tab.Screen name="Salary" component={SalaryScreen} />
      <Tab.Screen name="Documents" component={DocumentsStack} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
