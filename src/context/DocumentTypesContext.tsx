import { useQuery } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';

import { queryKeys } from '@/src/lib/queryKeys';
import {
  buildDocumentTypeLabelMap,
  setRuntimeDocumentTypeLabels,
  type DocumentTypeRecord,
} from '@/src/lib/documentTypes';
import { fetchCompanyDocumentTypes } from '@/src/services/documentTypes';

export function DocumentTypesProvider({
  companyId,
  children,
}: {
  companyId: string | null | undefined;
  children: ReactNode;
}) {
  const query = useQuery({
    queryKey: queryKeys.documentTypes(companyId ?? ''),
    queryFn: () => fetchCompanyDocumentTypes(companyId!),
    enabled: Boolean(companyId),
  });

  useEffect(() => {
    const rows: DocumentTypeRecord[] = query.data ?? [];
    setRuntimeDocumentTypeLabels(buildDocumentTypeLabelMap(rows));
  }, [query.data]);

  return <>{children}</>;
}
