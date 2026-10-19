import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { stackScreenOptions } from '@/src/constants/navigation';
import { LoginScreen } from '@/src/screens/LoginScreen';
import { PrivacyPolicyScreen } from '@/src/screens/support/PrivacyPolicyScreen';

export type AuthStackParamList = {
  Login: undefined;
  PrivacyPolicy: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          ...stackScreenOptions,
          headerShown: true,
          title: 'Privacy Policy',
        }}
      />
    </Stack.Navigator>
  );
}
