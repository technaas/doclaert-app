import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StaffDetailScreen } from '@/src/screens/staff/StaffDetailScreen';
import { StaffScreen } from '@/src/screens/staff/StaffScreen';

export type StaffListParams = {
  /** Pre-applied status filter, e.g. `active` from Dashboard */
  status?: string;
};

export type StaffStackParamList = {
  StaffList: StaffListParams | undefined;
  StaffDetail: { staffId: string };
};

const Stack = createNativeStackNavigator<StaffStackParamList>();

export function StaffStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="StaffList"
        component={StaffScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="StaffDetail"
        component={StaffDetailScreen}
        options={{
          presentation: 'modal',
          title: 'Staff Details',
          headerTintColor: '#2563EB',
        }}
      />
    </Stack.Navigator>
  );
}
