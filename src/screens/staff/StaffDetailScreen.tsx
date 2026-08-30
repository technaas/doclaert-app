import { CommonActions, type CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DocumentFileActions } from '@/src/components/documents/DocumentFileActions';
import { StaffPortrait } from '@/src/components/staff/StaffPortrait';
import { DetailRow } from '@/src/components/ui/DetailRow';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { getDocumentLabel } from '@/src/constants/documents';
import { colors, radius, spacing, typography } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useStaffDetailData } from '@/src/hooks/useStaffDetailData';
import { hasUploadedDocumentFile } from '@/src/lib/documentFile';
import { documentTypeSortValue } from '@/src/lib/documentTypes';
import {
  DOCUMENT_STATUS_LABEL,
  daysRemainingForDocument,
  daysRemainingForVehicleDaftar,
  formatDaysRemaining,
  statusBadgeTone,
  uiStatusForDocument,
  uiStatusForVehicleDaftar,
} from '@/src/lib/documentStatus';
import { canViewSalary } from '@/src/lib/permissions';
import { formatPay } from '@/src/lib/format';
import { formatSalaryType } from '@/src/lib/staffDisplay';
import { shareStaffProfilePdf } from '@/src/lib/staffProfilePdf';
import { formatKuwaitContact, formatNativeContactFromStaff, formatStaffEmail } from '@/src/lib/staffContact';
import { displayPassportCustody } from '@/src/lib/staffPassport';
import { displayVisaWorkingType, isDifferentCompanyVisa } from '@/src/lib/staffVisa';
import { isPartTimeType } from '@/src/lib/staffFilters';
import type { AppStackParamList } from '@/src/navigation/AppStack';
import type { MainTabParamList } from '@/src/navigation/MainTabNavigator';
import type { StaffStackParamList } from '@/src/navigation/StaffStack';
import { queryKeys } from '@/src/lib/queryKeys';
import { fetchCompanyDocumentTypes } from '@/src/services/documentTypes';

type Props = CompositeScreenProps<
  NativeStackScreenProps<StaffStackParamList, 'StaffDetail'>,
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList>,
    NativeStackScreenProps<AppStackParamList>
  >
>;

export function StaffDetailScreen({ route, navigation }: Props) {
  const { staffId } = route.params;
  const { profile } = useAuth();
  const companyId = profile?.company_id;
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const {
    staff,
    documents,
    brandMap,
    branchMap,
    branchToBrandId,
    loading,
    error,
    retry,
  } = useStaffDetailData(companyId, staffId);

  const typesQuery = useQuery({
    queryKey: queryKeys.documentTypes(companyId ?? ''),
    queryFn: () => fetchCompanyDocumentTypes(companyId!),
    enabled: Boolean(companyId),
  });

  const sortedDocuments = useMemo(() => {
    const types = typesQuery.data ?? [];
    return [...documents].sort((a, b) => {
      const order = documentTypeSortValue(a.document_name, types) -
        documentTypeSortValue(b.document_name, types);
      if (order !== 0) return order;
      return getDocumentLabel(a.document_name).localeCompare(getDocumentLabel(b.document_name));
    });
  }, [documents, typesQuery.data]);

  if (loading && !staff) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !staff) {
    return (
      <View style={styles.centeredPad}>
        <ErrorState message={error ?? 'Staff not found.'} onRetry={() => void retry()} />
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
  const visaLabel = displayVisaWorkingType(staff.visa_working_type, staff.staff_type);
  const showPartTime =
    isDifferentCompanyVisa(staff.visa_working_type, staff.staff_type) ||
    isPartTimeType(staff.staff_type);
  const partTimeLicenseStatus = uiStatusForVehicleDaftar(staff.part_time_license_expiry_date);
  const partTimeLicenseDays = daysRemainingForVehicleDaftar(staff.part_time_license_expiry_date);
  const employmentTone =
    (staff.status ?? '').toLowerCase() === 'active'
      ? 'success'
      : (staff.status ?? '').toLowerCase() === 'inactive'
        ? 'muted'
        : 'default';
  const kuwaitContact =
    formatKuwaitContact(staff.kuwait_contact_number) || staff.contact_number?.trim() || '—';
  const nativeContact = formatNativeContactFromStaff(staff) || '—';

  const handleDownloadStaffPdf = async () => {
    setPdfError(null);
    setPdfBusy(true);
    try {
      const result = await shareStaffProfilePdf({
        staff,
        brandName,
        branchName,
        partTimeBrandName: partTimeBrand,
        partTimeBranchName: partTimeBranch,
        includeSalary: canViewSalary(profile?.role),
      });
      if (result.action === 'failed' || result.action === 'unavailable') {
        setPdfError(result.message ?? 'Unable to save staff PDF.');
      }
    } catch {
      setPdfError('Unable to save staff PDF.');
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <StaffPortrait photoUrl={staff.photo_url} name={staff.name} />
          <View style={styles.headerCopy}>
            <Text style={styles.staffName}>{staff.name}</Text>
            <Text style={styles.staffMeta}>{staff.role?.trim() || '—'}</Text>
            <Text style={styles.staffMeta}>Staff ID: {staff.staff_id?.trim() || '—'}</Text>
            <View style={styles.headerBadge}>
              <StatusBadge label={staff.status ?? '—'} tone={employmentTone} />
            </View>
            <Text style={styles.staffMeta}>
              {brandName} · {branchName}
            </Text>
          </View>
        </View>
        {pdfError ? <Text style={styles.pdfError}>{pdfError}</Text> : null}
        <Pressable
          style={[styles.pdfButton, pdfBusy && styles.pdfButtonDisabled]}
          onPress={() => void handleDownloadStaffPdf()}
          disabled={pdfBusy}
          accessibilityRole="button"
          accessibilityLabel="Download staff PDF">
          {pdfBusy ? (
            <ActivityIndicator color={colors.background} size="small" />
          ) : (
            <Text style={styles.pdfButtonText}>Download Staff PDF</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal & contact</Text>
        <DetailRow label="Staff name" value={staff.name} />
        <DetailRow label="Role" value={staff.role ?? '—'} />
        <DetailRow label="Staff ID" value={staff.staff_id ?? '—'} />
        <DetailRow label="Email" value={formatStaffEmail(staff.email) || '—'} />
        <DetailRow label="Kuwait contact number" value={kuwaitContact} />
        <DetailRow label="Native / India contact number" value={nativeContact} />
        <DetailRow label="Civil ID number" value={staff.civil_id_number ?? '—'} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Identity documents</Text>
        <DetailRow label="Passport custody" value={displayPassportCustody(staff.passport_custody)} />
        <DetailRow label="Passport code number" value={staff.passport_code_number ?? '—'} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Employment</Text>
        <DetailRow label="Brand" value={brandName} />
        <DetailRow label="Branch" value={branchName} />
        <DetailRow label="Staff type" value={staff.staff_type ?? 'Full Time'} />
        <DetailRow label="Visa / working type" value={visaLabel} />
        {isDifferentCompanyVisa(staff.visa_working_type, staff.staff_type) ? (
          <DetailRow label="Visa company name" value={staff.visa_company_name ?? '—'} />
        ) : null}
        {canViewSalary(profile?.role) ? (
          <>
            <DetailRow
              label="Salary"
              value={typeof staff.salary === 'number' ? formatPay(staff.salary) : '—'}
            />
            <DetailRow label="Salary type" value={formatSalaryType(staff.salary_type)} />
          </>
        ) : null}
        <DetailRow label="Status">
          <StatusBadge label={staff.status ?? '—'} tone={employmentTone} />
        </DetailRow>
      </View>

      {showPartTime ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Part-time details</Text>
          <DetailRow label="Part-time brand" value={partTimeBrand ?? '—'} />
          <DetailRow label="Part-time branch" value={partTimeBranch ?? '—'} />
          <DetailRow
            label="License expiry"
            value={staff.part_time_license_expiry_date ?? '—'}
          />
          <DetailRow label="License status">
            <StatusBadge
              label={DOCUMENT_STATUS_LABEL[partTimeLicenseStatus]}
              tone={statusBadgeTone(partTimeLicenseStatus)}
            />
          </DetailRow>
          {partTimeLicenseDays !== null ? (
            <DetailRow
              label="Days remaining"
              value={formatDaysRemaining(partTimeLicenseDays)}
            />
          ) : null}
          <DetailRow label="Note" value={staff.part_time_note ?? '—'} />
          <View style={styles.fileActions}>
            <DocumentFileActions
              storedFileUrl={staff.part_time_license_file_url}
              title={`${staff.name} · Part Time License`}
              viewLabel="View Part Time License"
              emptyLabel="No part-time license file uploaded"
            />
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Related documents</Text>
        {sortedDocuments.length === 0 ? (
          <EmptyState
            title="No documents"
            message="No staff documents are linked to this record."
            icon="document-text-outline"
          />
        ) : (
          sortedDocuments.map((doc) => {
            const status = uiStatusForDocument(doc);
            const days = daysRemainingForDocument(doc);
            const hasFile = hasUploadedDocumentFile(doc.file_url);
            const label = getDocumentLabel(doc.document_name);
            const card = (
              <>
                <Text style={styles.docName}>{label}</Text>
                <Text style={styles.docExpiry}>
                  Expiry: {doc.expiry_date ?? '—'}
                  {days !== null ? ` · ${formatDaysRemaining(days)}` : ''}
                </Text>
                <StatusBadge
                  label={DOCUMENT_STATUS_LABEL[status]}
                  tone={statusBadgeTone(status)}
                />
                {!hasFile ? <Text style={styles.noFileHint}>No file uploaded</Text> : null}
              </>
            );

            if (!hasFile) {
              return (
                <View key={doc.id} style={styles.docCard}>
                  {card}
                </View>
              );
            }

            return (
              <Pressable
                key={doc.id}
                style={styles.docCard}
                onPress={() =>
                  navigation.dispatch(
                    CommonActions.navigate({
                      name: 'DocumentDetail',
                      params: { documentId: doc.id },
                    }),
                  )
                }
                accessibilityRole="button"
                accessibilityLabel={`Open ${label}`}>
                {card}
              </Pressable>
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
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'flex-start',
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  staffName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  staffMeta: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  headerBadge: {
    marginTop: spacing.xs,
  },
  pdfButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  pdfButtonDisabled: {
    opacity: 0.7,
  },
  pdfButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  pdfError: {
    marginTop: spacing.md,
    fontSize: 13,
    color: colors.danger,
  },
  fileActions: {
    marginTop: spacing.md,
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
  noFileHint: {
    fontSize: 12,
    color: colors.textSubtle,
    marginTop: spacing.xs,
  },
});
