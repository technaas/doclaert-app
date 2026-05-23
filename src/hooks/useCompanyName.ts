import { useCompanyNameQuery } from '@/src/hooks/queries/useCompanyNameQuery';
import { getQueryScreenState } from '@/src/lib/queryScreenState';

export function useCompanyName(companyId: string | undefined) {
  const query = useCompanyNameQuery(companyId);
  const { isInitialLoading } = getQueryScreenState(query);

  return {
    companyName: query.data ?? null,
    loading: isInitialLoading,
    refresh: () => query.refetch(),
  };
}
