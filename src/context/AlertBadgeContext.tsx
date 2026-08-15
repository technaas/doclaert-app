import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { useAuth } from '@/src/context/AuthContext';
import { useCompanyDocumentsQuery } from '@/src/hooks/queries/useCompanyDocumentsQuery';
import { countDocumentAlerts } from '@/src/lib/alertFilters';
import { getQueryScreenState } from '@/src/lib/queryScreenState';

type AlertBadgeContextValue = {
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AlertBadgeContext = createContext<AlertBadgeContextValue | undefined>(undefined);

export function AlertBadgeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const companyId = profile?.company_id;
  const query = useCompanyDocumentsQuery(companyId);
  const { isInitialLoading } = getQueryScreenState(query);

  const count = useMemo(() => {
    if (!query.data) return 0;
    return countDocumentAlerts(
      query.data.documents,
      query.data.alertThresholdDays,
      query.data.vehicles,
    );
  }, [query.data]);

  const value = useMemo(
    () => ({
      count,
      loading: isInitialLoading,
      refresh: async () => {
        await query.refetch();
      },
    }),
    [count, isInitialLoading, query],
  );

  return <AlertBadgeContext.Provider value={value}>{children}</AlertBadgeContext.Provider>;
}

export function useAlertBadge(): AlertBadgeContextValue {
  const context = useContext(AlertBadgeContext);
  if (!context) {
    throw new Error('useAlertBadge must be used within AlertBadgeProvider');
  }
  return context;
}
