import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getDocumentLabel } from '@/src/constants/documents';
import { colors, radius, spacing } from '@/src/constants/theme';
import { useAuth } from '@/src/context/AuthContext';
import { useDocumentDetailData } from '@/src/hooks/useDocumentDetailData';
import { DocumentImagePreviewModal } from '@/src/components/documents/DocumentImagePreviewModal';
import { DetailRow } from '@/src/components/ui/DetailRow';
import { ErrorState } from '@/src/components/ui/ErrorState';
import { StatusBadge } from '@/src/components/ui/StatusBadge';
import {
  DOCUMENT_STATUS_LABEL,
  formatDaysRemaining,
  getDocumentDisplayStatus,
  statusBadgeTone,
} from '@/src/lib/documentStatus';
import { resolveDocumentFileUrl } from '@/src/lib/documentFile';
import { daysUntilExpiry } from '@/src/lib/expiry';
import { openDocumentFile, openUrlInBrowser } from '@/src/lib/openDocumentFile';
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
    thresholdDays,
    documentFileUrl,
    loading,
    error,
    retry,
  } = useDocumentDetailData(companyId, documentId);

  const [openingFile, setOpeningFile] = useState(false);
  const [fileOpenError, setFileOpenError] = useState<string | null>(null);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const handleOpenInBrowser = async () => {
    const url = resolveDocumentFileUrl(documentFileUrl);
    if (!url) {
      setFileOpenError('Invalid document URL.');
      return;
    }

    setFileOpenError(null);
    setOpeningFile(true);

    try {
      await openUrlInBrowser(url);
    } catch (err) {
      setFileOpenError(
        err instanceof Error ? err.message : 'Failed to open in browser.',
      );
    } finally {
      setOpeningFile(false);
    }
  };

  const handleViewDocument = async () => {
    const url = resolveDocumentFileUrl(documentFileUrl);
    if (!url) {
      setFileOpenError('Invalid document URL.');
      return;
    }

    setFileOpenError(null);
    setOpeningFile(true);

    try {
      const result = await openDocumentFile(url);

      if (result.action === 'image-preview') {
        setImagePreviewUrl(result.url);
        setImagePreviewVisible(true);
        return;
      }

      if (result.action === 'failed') {
        setFileOpenError(result.message);
      }
    } catch (err) {
      setFileOpenError(
        err instanceof Error ? err.message : 'Failed to open document.',
      );
    } finally {
      setOpeningFile(false);
    }
  };

  const handleImagePreviewError = (message: string) => {
    setImagePreviewVisible(false);
    setImagePreviewUrl(null);
    setFileOpenError(message);
  };

  const handleCloseImagePreview = () => {
    setImagePreviewVisible(false);
    setImagePreviewUrl(null);
  };

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

  const displayStatus = getDocumentDisplayStatus(document.expiry_date, thresholdDays);
  const days = document.expiry_date ? daysUntilExpiry(document.expiry_date) : null;

  const documentTitle = getDocumentLabel(document.document_name);

  return (
    <>
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document</Text>
        <DetailRow label="Document name" value={getDocumentLabel(document.document_name)} />
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
              onPress={() => void handleViewDocument()}
              disabled={openingFile}>
              {openingFile ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Text style={styles.fileButtonText}>View Document</Text>
              )}
            </Pressable>
            {fileOpenError ? (
              <>
                <Text style={styles.fileError}>{fileOpenError}</Text>
                <Pressable
                  style={[styles.secondaryButton, openingFile && styles.fileButtonDisabled]}
                  onPress={() => void handleOpenInBrowser()}
                  disabled={openingFile}>
                  <Text style={styles.secondaryButtonText}>Open in Browser</Text>
                </Pressable>
              </>
            ) : null}
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

    {imagePreviewUrl ? (
      <DocumentImagePreviewModal
        visible={imagePreviewVisible}
        uri={imagePreviewUrl}
        title={documentTitle}
        onClose={handleCloseImagePreview}
        onError={handleImagePreviewError}
        onOpenInBrowser={() => void handleOpenInBrowser()}
      />
    ) : null}
    </>
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
    marginBottom: spacing.sm,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
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
