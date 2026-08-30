import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useCompanyDocumentsQuery } from '@/src/hooks/queries/useCompanyDocumentsQuery';
import { queryKeys } from '@/src/lib/queryKeys';
import { getQueryScreenState } from '@/src/lib/queryScreenState';
import { fetchDocumentById } from '@/src/services/documents';

export function useDocumentDetailData(
  companyId: string | null | undefined,
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
  const fetched = documentQuery.data ?? null;
  const inScope = Boolean(
    fetched && lookupsQuery.data?.documents.some((row) => row.id === fetched.id),
  );
  const lookupsReady = !lookupsState.isInitialLoading && !lookupsQuery.isPending;
  const documentReady = !documentState.isInitialLoading && !documentQuery.isPending;

  const isInitialLoading = lookupsState.isInitialLoading || documentState.isInitialLoading;

  const errorMessage = !companyId
    ? 'Company not found.'
    : lookupsQuery.error?.message ??
      documentQuery.error?.message ??
      (lookupsReady && documentReady && fetched && !inScope
        ? 'Your role does not include this record.'
        : lookupsReady && documentReady && !fetched
          ? 'Document not found.'
          : null);

  const linkedMeta = useMemo(() => {
    const doc = inScope ? fetched : null;
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
  }, [fetched, inScope, lookupsQuery.data]);

  return {
    document: inScope ? fetched : null,
    documentFileUrl: inScope ? (fetched?.file_url ?? null) : null,
    ...linkedMeta,
    loading: isInitialLoading,
    error: errorMessage,
    retry: () =>
      Promise.all([lookupsQuery.refetch(), documentQuery.refetch()]),
  };
}
