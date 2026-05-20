import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DetailRow } from '@/src/components/ui/DetailRow';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { getDocumentLabel } from '@/src/constants/documents';
import { colors, radius, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import {
  computeStatus,
  daysUntilExpiry,
  DOC_STATUS_LABEL,
  type DocStatus,
} from '@/src/lib/expiry';
import { formatPay } from '@/src/lib/format';
import { isPartTimeType } from '@/src/lib/staffFilters';
import type { StaffStackParamList } from '@/src/navigation/StaffStack';
import {
  fetchCompanyStaffData,
  fetchStaffDocuments,
  fetchStaffMember,
} from '@/src/services/staff';
import type { StaffDocument, StaffMember } from '@/src/types/staff';

type Props = NativeStackScreenProps<StaffStackParamList, 'StaffDetail'>;

function docStatusTone(status: DocStatus): 'success' | 'warning' | 'danger' {
  if (status === 'expired') return 'danger';
  if (status === 'expiring') return 'warning';
  return 'success';
}

export function StaffDetailScreen({ route }: Props) {
  const { staffId } = route.params;
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  const [staff, setStaff] = useState<StaffMember | null>(null);
  const [documents, setDocuments] = useState<StaffDocument[]>([]);
  const [brandMap, setBrandMap] = useState<Map<string, string>>(new Map());
  const [branchMap, setBranchMap] = useState<Map<string, string>>(new Map());
  const [branchToBrandId, setBranchToBrandId] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) {
      setError('Company not found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [lookups, member, docs] = await Promise.all([
        fetchCompanyStaffData(companyId),
        fetchStaffMember(companyId, staffId),
        fetchStaffDocuments(companyId, staffId),
      ]);

      const nextBrandMap = new Map<string, string>();
      lookups.brands.forEach((b) => nextBrandMap.set(b.id, b.name));
      const nextBranchMap = new Map<string, string>();
      const nextBranchToBrand = new Map<string, string>();
      lookups.branches.forEach((b) => {
        nextBranchMap.set(b.id, b.name);
        nextBranchToBrand.set(b.id, b.brand_id);
      });
      setBrandMap(nextBrandMap);
      setBranchMap(nextBranchMap);
      setBranchToBrandId(nextBranchToBrand);

      if (!member) {
        setError('Staff member not found.');
        setStaff(null);
        setDocuments([]);
      } else {
        setStaff(member);
        setDocuments(docs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load staff details.');
    } finally {
      setLoading(false);
    }
  }, [companyId, staffId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !staff) {
    return (
      <View style={styles.centeredPad}>
        <ErrorState message={error ?? 'Staff not found.'} onRetry={() => void load()} />
      </View>
    );
  }

  const brandName =
    brandMap.get(branchToBrandId.get(staff.branch_id) ?? staff.brand_id) ?? '—';
  const branchName = branchMap.get(staff.branch_id) ?? '—';
  const partTimeBrand = staff.part_time_brand_id
    ? (brandMap.get(staff.part_time_brand_id) ?? '—')
    : null;
  const partTimeBranch = staff.part_time_branch_id
    ? (branchMap.get(staff.part_time_branch_id) ?? '—')
    : null;
  const showPartTime = isPartTimeType(staff.staff_type);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal details</Text>
        <DetailRow label="Name" value={staff.name} />
        <DetailRow label="Staff ID" value={staff.staff_id ?? '—'} />
        <DetailRow label="Role" value={staff.role ?? '—'} />
        <DetailRow label="Contact" value={staff.contact_number ?? '—'} />
        <DetailRow label="Status" value={staff.status ?? '—'} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Employment</Text>
        <DetailRow label="Staff Type" value={staff.staff_type ?? 'Full Time'} />
        <DetailRow
          label="Salary"
          value={typeof staff.salary === 'number' ? formatPay(staff.salary) : '—'}
        />
        <DetailRow label="Brand" value={brandName} />
        <DetailRow label="Branch" value={branchName} />
      </View>

      {showPartTime ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part-time details</Text>
          <DetailRow label="Part Time Brand" value={partTimeBrand ?? '—'} />
          <DetailRow label="Part Time Branch" value={partTimeBranch ?? '—'} />
          <DetailRow
            label="License expiry"
            value={staff.part_time_license_expiry_date ?? '—'}
          />
          <DetailRow label="Note" value={staff.part_time_note ?? '—'} />
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Related documents</Text>
        {documents.length === 0 ? (
          <EmptyState
            title="No documents"
            message="No staff documents are linked to this record."
            icon="document-text-outline"
          />
        ) : (
          documents.map((doc) => {
            const status: DocStatus = doc.expiry_date
              ? computeStatus(doc.expiry_date)
              : 'valid';
            const days = doc.expiry_date ? daysUntilExpiry(doc.expiry_date) : null;

            return (
              <View key={doc.id} style={styles.docCard}>
                <Text style={styles.docName}>
                  {getDocumentLabel(doc.document_name)}
                </Text>
                <Text style={styles.docExpiry}>
                  Expiry: {doc.expiry_date ?? '—'}
                  {days !== null
                    ? ` · ${days < 0 ? `${Math.abs(days)}d ago` : `${days}d left`}`
                    : ''}
                </Text>
                <StatusBadge
                  label={DOC_STATUS_LABEL[status]}
                  tone={docStatusTone(status)}
                />
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  centeredPad: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  docCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  docName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  docExpiry: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
