import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '@/src/constants/theme';
import { VehicleDetailScreen } from '@/src/screens/vehicles/VehicleDetailScreen';
import { VehiclesScreen } from '@/src/screens/vehicles/VehiclesScreen';

export type VehiclesListParams = {
  status?: string;
};

export type VehiclesStackParamList = {
  VehiclesList: VehiclesListParams | undefined;
  VehicleDetail: { vehicleId: string };
};

const Stack = createNativeStackNavigator<VehiclesStackParamList>();

export function VehiclesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="VehiclesList"
        component={VehiclesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="VehicleDetail"
        component={VehicleDetailScreen}
        options={{
          presentation: 'modal',
          title: 'Vehicle Details',
          headerTintColor: colors.primary,
        }}
      />
    </Stack.Navigator>
  );
}
