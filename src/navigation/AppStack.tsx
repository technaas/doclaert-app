import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MainTabNavigator } from '@/src/navigation/MainTabNavigator';
import { AlertsScreen } from '@/src/screens/alerts/AlertsScreen';
import { BrandDetailScreen } from '@/src/screens/brands/BrandDetailScreen';
import { BrandsScreen } from '@/src/screens/brands/BrandsScreen';
import { BranchDetailScreen } from '@/src/screens/branches/BranchDetailScreen';
import { BranchesScreen } from '@/src/screens/branches/BranchesScreen';
import { DocumentDetailScreen } from '@/src/screens/documents/DocumentDetailScreen';

export type AppStackParamList = {
  MainTabs: undefined;
  Alerts: undefined;
  Brands: undefined;
  BrandDetail: { brandId: string };
  Branches: undefined;
  BranchDetail: { branchId: string };
  DocumentDetail: { documentId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          title: 'Alerts',
          headerTintColor: '#2563EB',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Brands"
        component={BrandsScreen}
        options={{
          title: 'Brands',
          headerTintColor: '#2563EB',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="BrandDetail"
        component={BrandDetailScreen}
        options={{
          title: 'Brand Details',
          headerTintColor: '#2563EB',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Branches"
        component={BranchesScreen}
        options={{
          title: 'Branches',
          headerTintColor: '#2563EB',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="BranchDetail"
        component={BranchDetailScreen}
        options={{
          title: 'Branch Details',
          headerTintColor: '#2563EB',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="DocumentDetail"
        component={DocumentDetailScreen}
        options={{
          presentation: 'modal',
          title: 'Document Details',
          headerTintColor: '#2563EB',
        }}
      />
    </Stack.Navigator>
  );
}
