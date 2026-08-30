import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import { DocumentImagePreviewModal } from '@/src/components/documents/DocumentImagePreviewModal';
import { colors, radius, spacing } from '@/src/constants/theme';
import { hasUploadedDocumentFile } from '@/src/lib/documentFile';
import {
  downloadDocumentFile,
  openDocumentFile,
  openUrlInBrowser,
  resolveAccessibleDocumentUrl,
} from '@/src/lib/openDocumentFile';

type DocumentFileActionsProps = {
  storedFileUrl: string | null | undefined;
  title: string;
  viewLabel?: string;
  emptyLabel?: string;
};

export function DocumentFileActions({
  storedFileUrl,
  title,
  viewLabel = 'View Document',
  emptyLabel = 'No file uploaded',
}: DocumentFileActionsProps) {
  const [busyAction, setBusyAction] = useState<'preview' | 'download' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviewVisible, setImagePreviewVisible] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const hasFile = hasUploadedDocumentFile(storedFileUrl);
  const disabled = busyAction !== null;

  const handlePreview = useCallback(async () => {
    if (!hasFile) return;
    setError(null);
    setBusyAction('preview');
    try {
      const result = await openDocumentFile(storedFileUrl);
      if (result.action === 'image-preview') {
        setImagePreviewUrl(result.url);
        setImagePreviewVisible(true);
        return;
      }
      if (result.action === 'failed') {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open document.');
    } finally {
      setBusyAction(null);
    }
  }, [hasFile, storedFileUrl]);

  const handleDownload = useCallback(async () => {
    if (!hasFile) return;
    setError(null);
    setBusyAction('download');
    try {
      const result = await downloadDocumentFile(storedFileUrl, title);
      if (result.action === 'failed' || result.action === 'unavailable') {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download document.');
    } finally {
      setBusyAction(null);
    }
  }, [hasFile, storedFileUrl, title]);

  const handleOpenInBrowser = useCallback(async () => {
    if (!hasFile) return;
    setError(null);
    setBusyAction('preview');
    try {
      const url = await resolveAccessibleDocumentUrl(storedFileUrl);
      await openUrlInBrowser(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open in browser.');
    } finally {
      setBusyAction(null);
    }
  }, [hasFile, storedFileUrl]);

  const handleImagePreviewError = useCallback((message: string) => {
    setImagePreviewVisible(false);
    setImagePreviewUrl(null);
    setError(message);
  }, []);

  const handleCloseImagePreview = useCallback(() => {
    setImagePreviewVisible(false);
    setImagePreviewUrl(null);
  }, []);

  if (!hasFile) {
    return <Text style={styles.noFile}>{emptyLabel}</Text>;
  }

  return (
    <>
      <Pressable
        style={[styles.primaryButton, disabled && styles.buttonDisabled]}
        onPress={() => void handlePreview()}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={viewLabel}>
        {busyAction === 'preview' ? (
          <ActivityIndicator color={colors.background} size="small" />
        ) : (
          <Text style={styles.primaryButtonText}>{viewLabel}</Text>
        )}
      </Pressable>

      <Pressable
        style={[styles.secondaryButton, disabled && styles.buttonDisabled]}
        onPress={() => void handleDownload()}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel="Download document">
        {busyAction === 'download' ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Text style={styles.secondaryButtonText}>Download</Text>
        )}
      </Pressable>

      {error ? (
        <>
          <Text style={styles.fileError}>{error}</Text>
          <Pressable
            style={[styles.secondaryButton, disabled && styles.buttonDisabled]}
            onPress={() => void handleOpenInBrowser()}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Open in browser">
            <Text style={styles.secondaryButtonText}>Open in Browser</Text>
          </Pressable>
        </>
      ) : null}

      {imagePreviewUrl ? (
        <DocumentImagePreviewModal
          visible={imagePreviewVisible}
          uri={imagePreviewUrl}
          title={title}
          onClose={handleCloseImagePreview}
          onError={handleImagePreviewError}
          onOpenInBrowser={() => void handleOpenInBrowser()}
          onDownload={() => void handleDownload()}
          downloading={busyAction === 'download'}
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
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
    minHeight: 44,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
