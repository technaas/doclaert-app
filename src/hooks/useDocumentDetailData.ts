import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useCompanyDocumentsQuery } from '@/src/hooks/queries/useCompanyDocumentsQuery';
import { queryKeys } from '@/src/lib/queryKeys';
import { getQueryScreenState } from '@/src/lib/queryScreenState';
import { fetchDocumentById, getDocumentFileUrl } from '@/src/services/documents';

export function useDocumentDetailData(
  companyId: string | undefined,
  documentId: string,
) {
  const lookupsQuery = useCompanyDocumentsQuery(companyId);

  const documentQuery = useQuery({
    queryKey: queryKeys.document(companyId ?? '', documentId),
    queryFn: () => fetchDocumentById(companyId!, documentId),
    enabled: Boolean(companyId),
  });

  const lookupsState = getQueryScreenState(lookupsQuery);
  const documentState = getQueryScreenState(documentQuery);

  const isInitialLoading =
    (lookupsState.isInitialLoading || documentState.isInitialLoading) &&
    !documentQuery.data;

  const errorMessage = !companyId
    ? 'Company not found.'
    : documentQuery.data === null && !documentState.isInitialLoading && !documentQuery.isError
      ? 'Document not found.'
      : documentQuery.error?.message ?? lookupsQuery.error?.message ?? null;

  const linkedMeta = useMemo(() => {
    const doc = documentQuery.data;
    const lookups = lookupsQuery.data;
    if (!doc || !lookups) {
      return {
        linkedTo: '—',
        brandName: '—',
        branchName: '—',
        staffInfo: null as string | null,
      };
    }

    const brandMap = new Map(lookups.brands.map((b) => [b.id, b.name]));
    const staffMap = new Map(lookups.staff.map((s) => [s.id, s]));

    if (doc.type === 'staff' && doc.staff_id) {
      const staff = staffMap.get(doc.staff_id);
      const branch = staff
        ? lookups.branches.find((b) => b.id === staff.branch_id)
        : undefined;
      const brandId = branch?.brand_id ?? staff?.brand_id;
      return {
        linkedTo: staff?.name ?? '—',
        staffInfo:
          [staff?.role, staff?.staff_id ? `ID: ${staff.staff_id}` : null]
            .filter(Boolean)
            .join(' · ') || null,
        branchName: branch?.name ?? '—',
        brandName: brandId ? (brandMap.get(brandId) ?? '—') : '—',
      };
    }

    if (doc.type === 'branch' && doc.branch_id) {
      const branch = lookups.branches.find((b) => b.id === doc.branch_id);
      return {
        linkedTo: branch?.name ?? '—',
        staffInfo: null,
        branchName: branch?.name ?? '—',
        brandName: branch ? (brandMap.get(branch.brand_id) ?? '—') : '—',
      };
    }

    return {
      linkedTo: '—',
      brandName: '—',
      branchName: '—',
      staffInfo: null,
    };
  }, [documentQuery.data, lookupsQuery.data]);

  return {
    document: documentQuery.data ?? null,
    thresholdDays: lookupsQuery.data?.alertThresholdDays ?? 30,
    documentFileUrl: documentQuery.data
      ? getDocumentFileUrl(documentQuery.data)
      : null,
    ...linkedMeta,
    loading: isInitialLoading,
    error: errorMessage,
    retry: () =>
      Promise.all([lookupsQuery.refetch(), documentQuery.refetch()]),
  };
}
