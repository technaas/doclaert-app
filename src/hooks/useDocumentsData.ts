import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchCompanyDocumentsData } from '@/src/services/documents';
import type { DocumentRecord } from '@/src/types/documents';
import type { Branch, Brand, StaffMember } from '@/src/types/staff';

export function useDocumentsData(companyId: string | undefined) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [alertThresholdDays, setAlertThresholdDays] = useState(30);
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
        const data = await fetchCompanyDocumentsData(companyId);
        setDocuments(data.documents);
        setBrands(data.brands);
        setBranches(data.branches);
        setStaff(data.staff);
        setAlertThresholdDays(data.alertThresholdDays);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load documents. Please try again.';
        setError(message);
        if (!isRefresh) {
          setDocuments([]);
          setBrands([]);
          setBranches([]);
          setStaff([]);
        }
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

  const staffById = useMemo(() => {
    const map = new Map<string, StaffMember>();
    staff.forEach((s) => map.set(s.id, s));
    return map;
  }, [staff]);

  const branchById = useMemo(() => {
    const map = new Map<string, Branch>();
    branches.forEach((b) => map.set(b.id, b));
    return map;
  }, [branches]);

  const brandById = useMemo(() => {
    const map = new Map<string, Brand>();
    brands.forEach((b) => map.set(b.id, b));
    return map;
  }, [brands]);

  return {
    documents,
    brands,
    branches,
    staffById,
    branchById,
    brandById,
    alertThresholdDays,
    loading,
    refreshing,
    error,
    refresh: () => load(true),
    retry: () => load(false),
  };
}
