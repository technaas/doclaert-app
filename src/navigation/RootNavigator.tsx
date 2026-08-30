import { BrandedLoading } from '@/src/components/branding/BrandedLoading';
import { useAuth } from '@/src/context/AuthContext';
import { DocumentTypesProvider } from '@/src/context/DocumentTypesContext';
import { NotificationProvider } from '@/src/context/NotificationContext';
import { useSubscriptionGate } from '@/src/hooks/useSubscriptionGate';
import { requiresPasswordChange } from '@/src/lib/passwordChangeGate';
import { startupLog } from '@/src/lib/startup';
import { AccessGateScreen } from '@/src/screens/access/AccessGateScreen';

import { AppStack } from './AppStack';
import { AuthStack } from './AuthStack';

type RootNavigatorProps = {
  authTimedOut?: boolean;
};

export function RootNavigator({ authTimedOut = false }: RootNavigatorProps) {
  const { session, loading, profile } = useAuth();
  const mustChangePassword = requiresPasswordChange(profile);
  const subscriptionEnabled = Boolean(
    session && profile && !mustChangePassword && profile.company_id,
  );
  const subscription = useSubscriptionGate(profile?.company_id, subscriptionEnabled);

  if (loading && !authTimedOut) {
    return <BrandedLoading />;
  }

  if (authTimedOut && loading) {
    startupLog('Rendering app despite auth still loading (timeout fallback)');
  }

  if (!session) {
    startupLog('Root navigator ready', { route: 'AuthStack', loading, authTimedOut });
    return <AuthStack />;
  }

  if (!profile) {
    if (authTimedOut) {
      return (
        <AccessGateScreen
          title="Unable to load profile"
          message="Your session is active but your profile could not be loaded. Please sign out and try again."
        />
      );
    }
    return <BrandedLoading />;
  }

  if (mustChangePassword) {
    return (
      <AccessGateScreen
        title="Set Your New Password"
        message="Your administrator gave you a temporary password. Choose a new password before continuing."
        detail="Use the DocAlert web app to set your new password, then sign in again."
        icon="key-outline"
      />
    );
  }

  if (!profile.company_id) {
    return (
      <AccessGateScreen
        title="Company not assigned"
        message="No company is assigned to this account. Please contact your administrator."
      />
    );
  }

  if (subscription.loading) {
    return <BrandedLoading />;
  }

  if (!subscription.allowed) {
    const endDate = subscription.subscription?.end_date;
    return (
      <AccessGateScreen
        title="Subscription Inactive"
        message="Your subscription is not active. Please contact Technaas support to renew your access."
        detail={endDate ? `End date: ${endDate}` : null}
        icon="card-outline"
      />
    );
  }

  startupLog('Root navigator ready', { route: 'AppStack', loading, authTimedOut });
  return (
    <NotificationProvider>
      <DocumentTypesProvider companyId={profile.company_id}>
        <AppStack />
      </DocumentTypesProvider>
    </NotificationProvider>
  );
}
