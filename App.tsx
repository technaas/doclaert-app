import 'react-native-gesture-handler';

import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AlertBadgeProvider } from '@/src/context/AlertBadgeContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { RootNavigator } from '@/src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AlertBadgeProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </AlertBadgeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
