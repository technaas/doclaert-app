import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAuth } from '@/src/context/AuthContext';

import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';

export function RootNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return session ? <AppStack /> : <AuthStack />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
