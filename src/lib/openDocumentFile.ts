import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

import {
  getDocumentFileKind,
  getStoredDocumentFileKind,
  mimeTypeForDocumentKind,
  suggestedDocumentFileName,
  type DocumentFileKind,
} from '@/src/lib/documentFile';
import { createFreshSignedUrl } from '@/src/lib/documentStorage';

export type OpenDocumentFileResult =
  | { action: 'image-preview'; url: string }
  | { action: 'opened-in-browser'; url: string; kind: DocumentFileKind }
  | { action: 'failed'; message: string; url: string | null };

export type DownloadDocumentFileResult =
  | { action: 'shared' }
  | { action: 'unavailable'; message: string }
  | { action: 'failed'; message: string };

function isShareCancelled(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return message.includes('cancel') || message.includes('dismiss');
}

export async function resolveAccessibleDocumentUrl(
  storedFileUrl: string | null | undefined,
): Promise<string> {
  return createFreshSignedUrl(storedFileUrl);
}

export async function openUrlInBrowser(url: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      enableBarCollapsing: true,
      showInRecents: false,
    });
    return;
  } catch {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      throw new Error('Unable to open this file in the browser.');
    }
    await Linking.openURL(url);
  }
}

/**
 * Preview/open a stored file_url. Always mints a fresh signed URL when the
 * value points at the private staff-documents bucket.
 */
export async function openDocumentFile(
  storedFileUrl: string | null | undefined,
): Promise<OpenDocumentFileResult> {
  try {
    const url = await resolveAccessibleDocumentUrl(storedFileUrl);
    const kind = getDocumentFileKind(url);

    if (kind === 'image') {
      return { action: 'image-preview', url };
    }

    await openUrlInBrowser(url);
    return { action: 'opened-in-browser', url, kind };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to open document.';
    return { action: 'failed', message, url: null };
  }
}

export async function downloadDocumentFile(
  storedFileUrl: string | null | undefined,
  fileNameHint?: string,
): Promise<DownloadDocumentFileResult> {
  try {
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      return {
        action: 'unavailable',
        message: 'Saving files is not available on this device. Use Preview instead.',
      };
    }

    const url = await resolveAccessibleDocumentUrl(storedFileUrl);
    const kind = getStoredDocumentFileKind(storedFileUrl);
    const fileName = suggestedDocumentFileName(storedFileUrl, fileNameHint ?? 'document');
    const dest = new File(Paths.cache, `docalert-${Date.now()}-${fileName}`);
    const downloaded = await File.downloadFileAsync(url, dest, { idempotent: true });
    const ext = fileName.split('.').pop()?.toLowerCase();
    const mimeType =
      ext === 'png'
        ? 'image/png'
        : ext === 'webp'
          ? 'image/webp'
          : mimeTypeForDocumentKind(kind);

    await Sharing.shareAsync(downloaded.uri, {
      mimeType,
      dialogTitle: 'Save document',
      UTI: kind === 'pdf' ? 'com.adobe.pdf' : kind === 'image' ? 'public.image' : undefined,
    });

    return { action: 'shared' };
  } catch (err) {
    if (isShareCancelled(err)) {
      return { action: 'shared' };
    }
    const message =
      err instanceof Error ? err.message : 'Failed to download document.';
    return { action: 'failed', message };
  }
}
