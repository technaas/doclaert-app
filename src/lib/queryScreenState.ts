import type { UseQueryResult } from '@tanstack/react-query';

export type QueryScreenState = {
  hasData: boolean;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  errorMessage: string | null;
};

export function getQueryScreenState<T>(
  query: Pick<
    UseQueryResult<T, Error>,
    'data' | 'isPending' | 'isFetching' | 'isError' | 'error'
  >,
): QueryScreenState {
  const hasData = query.data !== undefined;
  const isInitialLoading = query.isPending && !hasData;
  const isRefreshing = query.isFetching && hasData;
  const errorMessage = query.isError
    ? query.error instanceof Error
      ? query.error.message
      : 'Something went wrong. Please try again.'
    : null;

  return { hasData, isInitialLoading, isRefreshing, errorMessage };
}
