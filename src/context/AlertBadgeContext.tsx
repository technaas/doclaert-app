import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '@/src/context/AuthContext';
import { countDocumentAlerts } from '@/src/lib/alertFilters';
import { fetchCompanyDocumentsData } from '@/src/services/documents';

type AlertBadgeContextValue = {
  count: number;
  loading: boolean;
  refresh: () => Promise<void>;
};

const AlertBadgeContext = createContext<AlertBadgeContextValue | undefined>(undefined);

export function AlertBadgeProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const companyId = profile?.company_id;
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!companyId) {
      setCount(0);
      setLoading(false);
      return;
    }

    try {
      const data = await fetchCompanyDocumentsData(companyId);
      setCount(countDocumentAlerts(data.documents, data.alertThresholdDays));
    } catch {
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      count,
      loading,
      refresh,
    }),
    [count, loading, refresh],
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
