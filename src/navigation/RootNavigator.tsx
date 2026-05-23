import { BrandedLoading } from '@/src/components/branding/BrandedLoading';
import { useAuth } from '@/src/context/AuthContext';
import { startupLog } from '@/src/lib/startup';

import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';

type RootNavigatorProps = {
  authTimedOut?: boolean;
};

export function RootNavigator({ authTimedOut = false }: RootNavigatorProps) {
  const { session, loading } = useAuth();

  if (loading && !authTimedOut) {
    return <BrandedLoading />;
  }

  if (authTimedOut && loading) {
    startupLog('Rendering app despite auth still loading (timeout fallback)');
  }

  startupLog('Root navigator ready', {
    route: session ? 'AppStack' : 'AuthStack',
    loading,
    authTimedOut,
  });

  return session ? <AppStack /> : <AuthStack />;
}
