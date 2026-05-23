import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { modalScreenOptions, stackScreenOptions } from '@/src/constants/navigation';
import type { AlertFilters } from '@/src/types/alerts';
import { MainTabNavigator } from '@/src/navigation/MainTabNavigator';
import { AlertsScreen } from '@/src/screens/alerts/AlertsScreen';
import { BrandDetailScreen } from '@/src/screens/brands/BrandDetailScreen';
import { BrandsScreen } from '@/src/screens/brands/BrandsScreen';
import { BranchDetailScreen } from '@/src/screens/branches/BranchDetailScreen';
import { BranchesScreen } from '@/src/screens/branches/BranchesScreen';
import { DocumentDetailScreen } from '@/src/screens/documents/DocumentDetailScreen';

export type AppStackParamList = {
  MainTabs: undefined;
  Alerts:
    | {
        tab?: AlertFilters['tab'];
        status?: AlertFilters['status'];
      }
    | undefined;
  Brands: undefined;
  BrandDetail: { brandId: string };
  Branches: undefined;
  BranchDetail: { branchId: string };
  DocumentDetail: { documentId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Alerts' }} />
      <Stack.Screen name="Brands" component={BrandsScreen} options={{ title: 'Brands' }} />
      <Stack.Screen
        name="BrandDetail"
        component={BrandDetailScreen}
        options={{ title: 'Brand Details' }}
      />
      <Stack.Screen name="Branches" component={BranchesScreen} options={{ title: 'Branches' }} />
      <Stack.Screen
        name="BranchDetail"
        component={BranchDetailScreen}
        options={{ title: 'Branch Details' }}
      />
      <Stack.Screen
        name="DocumentDetail"
        component={DocumentDetailScreen}
        options={{
          ...modalScreenOptions,
          title: 'Document Details',
        }}
      />
    </Stack.Navigator>
  );
}
