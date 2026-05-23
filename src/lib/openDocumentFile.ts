import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

import {
  getDocumentFileKind,
  resolveDocumentFileUrl,
  type DocumentFileKind,
} from '@/src/lib/documentFile';

export type OpenDocumentFileResult =
  | { action: 'image-preview'; url: string }
  | { action: 'opened-in-browser'; url: string; kind: DocumentFileKind }
  | { action: 'failed'; message: string; url: string | null };

export async function openUrlInBrowser(url: string): Promise<void> {
  const resolved = resolveDocumentFileUrl(url);
  if (!resolved) {
    throw new Error('Invalid document URL.');
  }

  try {
    await WebBrowser.openBrowserAsync(resolved, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      enableBarCollapsing: true,
      showInRecents: false,
    });
    return;
  } catch {
    const canOpen = await Linking.canOpenURL(resolved);
    if (!canOpen) {
      throw new Error('Unable to open this file in the browser.');
    }
    await Linking.openURL(resolved);
  }
}

export async function openDocumentFile(url: string): Promise<OpenDocumentFileResult> {
  const resolved = resolveDocumentFileUrl(url);
  if (!resolved) {
    return {
      action: 'failed',
      message: 'Invalid or unsupported document URL.',
      url: null,
    };
  }

  const kind = getDocumentFileKind(resolved);

  if (kind === 'image') {
    return { action: 'image-preview', url: resolved };
  }

  try {
    await openUrlInBrowser(resolved);
    return { action: 'opened-in-browser', url: resolved, kind };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to open document.';
    return { action: 'failed', message, url: resolved };
  }
}
