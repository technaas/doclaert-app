import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';

import { PermissionGate } from '@/src/components/access/PermissionGate';
import { modalScreenOptions, stackScreenOptions } from '@/src/constants/navigation';
import type { AlertFilters } from '@/src/types/alerts';
import { MainTabNavigator } from '@/src/navigation/MainTabNavigator';
import { AlertsScreen } from '@/src/screens/alerts/AlertsScreen';
import { BrandDetailScreen } from '@/src/screens/brands/BrandDetailScreen';
import { BrandsScreen } from '@/src/screens/brands/BrandsScreen';
import { BranchDetailScreen } from '@/src/screens/branches/BranchDetailScreen';
import { BranchesScreen } from '@/src/screens/branches/BranchesScreen';
import { DocumentDetailScreen } from '@/src/screens/documents/DocumentDetailScreen';
import { VehicleDetailScreen } from '@/src/screens/vehicles/VehicleDetailScreen';
import { PermissionDenied } from '@/src/components/access/PermissionDenied';
import type { VehiclesStackParamList } from '@/src/navigation/VehiclesStack';
import { VehiclesStack } from '@/src/navigation/VehiclesStack';

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
  VehicleDetail: { vehicleId: string };
  Vehicles: NavigatorScreenParams<VehiclesStackParamList> | undefined;
  AccessDenied: undefined;
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
      <Stack.Screen name="Alerts" options={{ title: 'Alerts' }}>
        {(props) => (
          <PermissionGate route="Alerts">
            <AlertsScreen {...props} />
          </PermissionGate>
        )}
      </Stack.Screen>
      <Stack.Screen name="Brands" options={{ title: 'Brands' }}>
        {(props) => (
          <PermissionGate route="Brands">
            <BrandsScreen {...props} />
          </PermissionGate>
        )}
      </Stack.Screen>
      <Stack.Screen name="BrandDetail" options={{ title: 'Brand Details' }}>
        {(props) => (
          <PermissionGate route="BrandDetail">
            <BrandDetailScreen {...props} />
          </PermissionGate>
        )}
      </Stack.Screen>
      <Stack.Screen name="Branches" options={{ title: 'Branches' }}>
        {() => (
          <PermissionGate route="Branches">
            <BranchesScreen />
          </PermissionGate>
        )}
      </Stack.Screen>
      <Stack.Screen name="BranchDetail" options={{ title: 'Branch Details' }}>
        {(props) => (
          <PermissionGate route="BranchDetail">
            <BranchDetailScreen {...props} />
          </PermissionGate>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="DocumentDetail"
        options={{
          ...modalScreenOptions,
          title: 'Document Details',
        }}>
        {(props) => (
          <PermissionGate route="DocumentDetail">
            <DocumentDetailScreen {...props} />
          </PermissionGate>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Vehicles"
        options={{ headerShown: false }}>
        {() => (
          <PermissionGate route="Vehicles">
            <VehiclesStack />
          </PermissionGate>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="VehicleDetail"
        options={{
          ...modalScreenOptions,
          title: 'Vehicle Details',
        }}>
        {(props) => (
          <PermissionGate route="VehicleDetail">
            <VehicleDetailScreen {...props} />
          </PermissionGate>
        )}
      </Stack.Screen>
      <Stack.Screen
        name="AccessDenied"
        options={{ title: 'Access denied' }}>
        {() => <PermissionDenied />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
