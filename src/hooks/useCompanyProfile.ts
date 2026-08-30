import { useCompanyProfileQuery } from '@/src/hooks/queries/useCompanyProfileQuery';
import { getQueryScreenState } from '@/src/lib/queryScreenState';

export function useCompanyProfile(companyId: string | null | undefined) {
  const query = useCompanyProfileQuery(companyId);
  const { isInitialLoading } = getQueryScreenState(query);

  return {
    profile: query.data ?? null,
    loading: isInitialLoading,
    refresh: () => query.refetch(),
  };
}
