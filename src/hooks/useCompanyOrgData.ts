import { useCompanyOrgQuery } from '@/src/hooks/queries/useCompanyOrgQuery';
import { getQueryScreenState } from '@/src/lib/queryScreenState';

export function useCompanyOrgData(companyId: string | undefined) {
  const query = useCompanyOrgQuery(companyId);
  const { isInitialLoading, isRefreshing, errorMessage } = getQueryScreenState(query);

  return {
    data: query.data ?? null,
    loading: isInitialLoading,
    refreshing: isRefreshing,
    error: companyId ? errorMessage : 'Company not found on your profile.',
    refresh: () => query.refetch(),
    retry: () => query.refetch(),
  };
}
