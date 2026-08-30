import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '@/src/constants/theme';
import { AppScreenLayout } from '@/src/components/layout/AppScreenLayout';
import { BranchDetailScreen } from '@/src/screens/branches/BranchDetailScreen';
import { BranchesScreen } from '@/src/screens/branches/BranchesScreen';

export type BranchesStackParamList = {
  BranchesList: undefined;
  BranchDetail: { branchId: string };
};

const Stack = createNativeStackNavigator<BranchesStackParamList>();

function BranchesListScreen() {
  return (
    <AppScreenLayout title="Branches" subtitle="Locations & licenses">
      <BranchesScreen />
    </AppScreenLayout>
  );
}

export function BranchesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BranchesList"
        component={BranchesListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BranchDetail"
        component={BranchDetailScreen}
        options={{
          title: 'Branch Details',
          headerTintColor: colors.primary,
        }}
      />
    </Stack.Navigator>
  );
}
