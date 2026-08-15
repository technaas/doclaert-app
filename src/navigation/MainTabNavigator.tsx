import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ComponentProps } from 'react';
import { Platform } from 'react-native';

import type { DocumentsStackParamList } from '@/src/navigation/DocumentsStack';
import type { VehiclesStackParamList } from '@/src/navigation/VehiclesStack';
import { VehiclesStack } from '@/src/navigation/VehiclesStack';
import type { StaffStackParamList } from '@/src/navigation/StaffStack';

import { colors, shadows } from '@/src/constants/theme';
import { DocumentsStack } from '@/src/navigation/DocumentsStack';
import { StaffStack } from '@/src/navigation/StaffStack';
import { DashboardScreen } from '@/src/screens/DashboardScreen';
import { SalaryScreen } from '@/src/screens/salary/SalaryScreen';
import { SettingsScreen } from '@/src/screens/SettingsScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Staff: NavigatorScreenParams<StaffStackParamList>;
  Salary: undefined;
  Documents: NavigatorScreenParams<DocumentsStackParamList>;
  Vehicles: NavigatorScreenParams<VehiclesStackParamList>;
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
  Vehicles: { icon: 'car-outline', iconFocused: 'car', label: 'Fleet' },
  Settings: { icon: 'settings-outline', iconFocused: 'settings', label: 'Settings' },
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
          borderTopColor: colors.borderLight,
          paddingTop: 4,
          paddingBottom: Platform.OS === 'ios' ? 2 : 6,
          height: Platform.OS === 'ios' ? 84 : 64,
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
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Staff" component={StaffStack} />
      <Tab.Screen name="Salary" component={SalaryScreen} />
      <Tab.Screen name="Documents" component={DocumentsStack} />
      <Tab.Screen name="Vehicles" component={VehiclesStack} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
