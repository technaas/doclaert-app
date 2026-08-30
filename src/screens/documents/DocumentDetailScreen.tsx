import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DocumentFileActions } from '@/src/components/documents/DocumentFileActions';
import { DetailRow } from '@/src/components/ui/DetailRow';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import { getDocumentLabel } from '@/src/constants/documents';
import { colors, radius, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useDocumentDetailData } from '@/src/hooks/useDocumentDetailData';
import {
  DOCUMENT_STATUS_LABEL,
  daysRemainingForDocument,
  formatDaysRemaining,
  statusBadgeTone,
  uiStatusForDocument,
} from '@/src/lib/documentStatus';
import { inferExpiryStatus } from '@/src/lib/documentExpiry';
import type { DocumentsStackParamList } from '@/src/navigation/DocumentsStack';

type Props = NativeStackScreenProps<DocumentsStackParamList, 'DocumentDetail'>;

export function DocumentDetailScreen({ route }: Props) {
  const { documentId } = route.params;
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  const {
    document,
    linkedTo,
    brandName,
    branchName,
    staffInfo,
    documentFileUrl,
    loading,
    error,
    retry,
  } = useDocumentDetailData(companyId, documentId);

  if (loading && !document) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !document) {
    return (
      <View style={styles.centeredPad}>
        <ErrorState message={error ?? 'Document not found.'} onRetry={() => void retry()} />
      </View>
    );
  }

  const displayStatus = uiStatusForDocument(document);
  const days = daysRemainingForDocument(document);
  const documentTitle = getDocumentLabel(document.document_name);
  const expiryMode = inferExpiryStatus(document.expiry_date, document.expiry_status);
  const expiryModeLabel =
    expiryMode === 'no_expiry'
      ? 'Non-Expiring'
      : expiryMode === 'pending_verification'
        ? 'Pending Verification'
        : 'Has expiry';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document</Text>
        <DetailRow label="Document name" value={documentTitle} />
        <DetailRow
          label="Type"
          value={
            document.type === 'staff'
              ? 'Staff Document'
              : document.type === 'branch'
                ? 'Branch License'
                : 'Vehicle Daftar'
          }
        />
        <DetailRow label="Status">
          <StatusBadge
            label={DOCUMENT_STATUS_LABEL[displayStatus]}
            tone={statusBadgeTone(displayStatus)}
          />
        </DetailRow>
        <DetailRow label="Expiry status" value={expiryModeLabel} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {document.type === 'staff' ? 'Staff' : 'Branch'}
        </Text>
        <DetailRow label="Linked to" value={linkedTo} />
        {staffInfo ? <DetailRow label="Staff info" value={staffInfo} /> : null}
        <DetailRow label="Brand" value={brandName} />
        <DetailRow label="Branch" value={branchName} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expiry</Text>
        <DetailRow label="Expiry date" value={document.expiry_date ?? '—'} />
        <DetailRow label="Days remaining" value={formatDaysRemaining(days)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>File & notes</Text>
        <DocumentFileActions storedFileUrl={documentFileUrl} title={documentTitle} />
        {document.notes?.trim() ? (
          <View style={styles.notesBox}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{document.notes.trim()}</Text>
          </View>
        ) : null}
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
  statusRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesBox: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});
