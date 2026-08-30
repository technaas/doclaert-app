import type { ReactNode } from 'react';

import { PermissionDenied } from '@/src/components/access/PermissionDenied';
import { useAuth } from '@/src/context/AuthContext';
import { canAccessAppRoute, type GatedAppRoute } from '@/src/lib/routePermissions';

export function PermissionGate({
  route,
  children,
}: {
  route: GatedAppRoute;
  children: ReactNode;
}) {
  const { profile, loading, session } = useAuth();
  if (!session || loading) return <>{children}</>;
  if (canAccessAppRoute(profile?.role, route)) return <>{children}</>;
  return <PermissionDenied />;
}
