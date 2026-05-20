import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getDocumentLabel } from '@/src/constants/documents';
import { colors, radius, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { DetailRow } from '@/src/components/ui/DetailRow';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import {
  DOCUMENT_STATUS_LABEL,
  formatDaysRemaining,
  getDocumentDisplayStatus,
  statusBadgeTone,
} from '@/src/lib/documentStatus';
import { daysUntilExpiry } from '@/src/lib/expiry';
import type { DocumentsStackParamList } from '@/src/navigation/DocumentsStack';
import {
  fetchCompanyDocumentsData,
  fetchDocumentById,
  getDocumentFileUrl,
} from '@/src/services/documents';
import type { DocumentRecord } from '@/src/types/documents';

type Props = NativeStackScreenProps<DocumentsStackParamList, 'DocumentDetail'>;

export function DocumentDetailScreen({ route }: Props) {
  const { documentId } = route.params;
  const { profile } = useAuth();
  const companyId = profile?.company_id;

  const [document, setDocument] = useState<DocumentRecord | null>(null);
  const [linkedTo, setLinkedTo] = useState('—');
  const [brandName, setBrandName] = useState('—');
  const [branchName, setBranchName] = useState('—');
  const [staffInfo, setStaffInfo] = useState<string | null>(null);
  const [thresholdDays, setThresholdDays] = useState(30);
  const [documentFileUrl, setDocumentFileUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingFile, setOpeningFile] = useState(false);
  const [fileOpenError, setFileOpenError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!companyId) {
      setError('Company not found.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [lookups, doc] = await Promise.all([
        fetchCompanyDocumentsData(companyId),
        fetchDocumentById(companyId, documentId),
      ]);

      if (!doc) {
        setError('Document not found.');
        setDocument(null);
        return;
      }

      setDocument(doc);
      setThresholdDays(lookups.alertThresholdDays);

      const brandMap = new Map(lookups.brands.map((b) => [b.id, b.name]));
      const staffMap = new Map(lookups.staff.map((s) => [s.id, s]));

      if (doc.type === 'staff' && doc.staff_id) {
        const staff = staffMap.get(doc.staff_id);
        const branch = staff ? lookups.branches.find((b) => b.id === staff.branch_id) : undefined;
        const brandId = branch?.brand_id ?? staff?.brand_id;
        setLinkedTo(staff?.name ?? '—');
        setStaffInfo(
          [staff?.role, staff?.staff_id ? `ID: ${staff.staff_id}` : null]
            .filter(Boolean)
            .join(' · ') || null,
        );
        setBranchName(branch?.name ?? '—');
        setBrandName(brandId ? (brandMap.get(brandId) ?? '—') : '—');
      } else if (doc.type === 'branch' && doc.branch_id) {
        const branch = lookups.branches.find((b) => b.id === doc.branch_id);
        setLinkedTo(branch?.name ?? '—');
        setStaffInfo(null);
        setBranchName(branch?.name ?? '—');
        setBrandName(branch ? (brandMap.get(branch.brand_id) ?? '—') : '—');
      }

      setDocumentFileUrl(getDocumentFileUrl(doc));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load document details.');
    } finally {
      setLoading(false);
    }
  }, [companyId, documentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleOpenFile = async () => {
    if (!documentFileUrl) return;

    setFileOpenError(null);
    setOpeningFile(true);

    try {
      const supported = await Linking.canOpenURL(documentFileUrl);
      if (!supported) {
        setFileOpenError('Unable to open this file link.');
        return;
      }
      await Linking.openURL(documentFileUrl);
    } catch {
      setFileOpenError('Failed to open file.');
    } finally {
      setOpeningFile(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !document) {
    return (
      <View style={styles.centeredPad}>
        <ErrorState message={error ?? 'Document not found.'} onRetry={() => void load()} />
      </View>
    );
  }

  const displayStatus = getDocumentDisplayStatus(document.expiry_date, thresholdDays);
  const days = document.expiry_date ? daysUntilExpiry(document.expiry_date) : null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document</Text>
        <DetailRow label="Document name" value={getDocumentLabel(document.document_name)} />
        <DetailRow
          label="Type"
          value={document.type === 'staff' ? 'Staff Document' : 'Branch License'}
        />
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Status</Text>
          <StatusBadge
            label={DOCUMENT_STATUS_LABEL[displayStatus]}
            tone={statusBadgeTone(displayStatus)}
          />
        </View>
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
        {documentFileUrl ? (
          <>
            <Pressable
              style={[styles.fileButton, openingFile && styles.fileButtonDisabled]}
              onPress={handleOpenFile}
              disabled={openingFile}>
              <Text style={styles.fileButtonText}>
                {openingFile ? 'Opening…' : 'View Document'}
              </Text>
            </Pressable>
            {fileOpenError ? <Text style={styles.fileError}>{fileOpenError}</Text> : null}
          </>
        ) : (
          <Text style={styles.noFile}>No file uploaded</Text>
        )}
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
  fileButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fileButtonDisabled: {
    opacity: 0.7,
  },
  fileButtonText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  noFile: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  fileError: {
    fontSize: 13,
    color: colors.danger,
    marginBottom: spacing.md,
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
