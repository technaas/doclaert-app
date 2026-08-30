import { supabase } from '@/src/lib/supabase';

export const STAFF_DOCUMENTS_BUCKET = 'staff-documents';

/** Fresh preview/download links — matches web openDocumentFile TTL. */
export const OPEN_SIGNED_URL_TTL_SECONDS = 60 * 60;

function storageErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const m = (error as { message: unknown }).message;
    if (typeof m === 'string' && m.trim()) return m;
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Unknown error';
}

export function signedUrlAccessError(error: unknown): string {
  const message = storageErrorMessage(error).toLowerCase();
  if (/jwt expired|invalid jwt|not authenticated|session expired/.test(message)) {
    return 'Your session may have expired. Please sign in again.';
  }
  if (/row-level security|unauthorized|not allowed|403/.test(message)) {
    return 'Unable to access document storage.';
  }
  if (
    message === 'failed to fetch' ||
    message.includes('networkerror') ||
    message.includes('network request failed') ||
    message.includes('load failed')
  ) {
    return 'Unable to access document storage. Check your connection and retry.';
  }
  return 'Unable to create a secure document link.';
}

/**
 * Derive the storage object path from a Supabase signed/public file URL.
 * Matches the web app: there is no storage_path column.
 */
export function parseStoragePathFromFileUrl(
  fileUrl: string | null | undefined,
  bucket = STAFF_DOCUMENTS_BUCKET,
): string | null {
  if (!fileUrl?.trim()) return null;
  try {
    const url = new URL(fileUrl.trim());
    const markers = [
      `/object/sign/${bucket}/`,
      `/object/public/${bucket}/`,
      `/object/authenticated/${bucket}/`,
    ];
    for (const marker of markers) {
      const idx = url.pathname.indexOf(marker);
      if (idx === -1) continue;
      const encoded = url.pathname.slice(idx + marker.length);
      const path = decodeURIComponent(encoded);
      return path || null;
    }
  } catch {
    return null;
  }
  return null;
}

export async function createFreshSignedUrl(
  fileUrl: string | null | undefined,
  bucket = STAFF_DOCUMENTS_BUCKET,
  expiresIn = OPEN_SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  if (!fileUrl?.trim()) {
    throw new Error('No file available to view');
  }

  const path = parseStoragePathFromFileUrl(fileUrl, bucket);
  if (path) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);
    if (!error && data?.signedUrl) {
      return data.signedUrl;
    }
    throw new Error(signedUrlAccessError(error));
  }

  try {
    const parsed = new URL(fileUrl.trim());
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    // fall through
  }

  throw new Error('Invalid or unsupported document URL.');
}
