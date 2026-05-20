import { useCallback, useEffect, useState } from 'react';

import { fetchCompanyOrgData, type CompanyOrgData } from '@/src/services/orgData';

export function useCompanyOrgData(companyId: string | undefined) {
  const [data, setData] = useState<CompanyOrgData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!companyId) {
        setError('Company not found on your profile.');
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const orgData = await fetchCompanyOrgData(companyId);
        setData(orgData);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load data. Please try again.';
        setError(message);
        if (!isRefresh) setData(null);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [companyId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return {
    data,
    loading,
    refreshing,
    error,
    refresh: () => load(true),
    retry: () => load(false),
  };
}
