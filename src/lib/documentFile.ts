import { parseStoragePathFromFileUrl } from '@/src/lib/documentStorage';

export type DocumentFileKind = 'image' | 'pdf' | 'unknown';

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
const PDF_EXTENSIONS = new Set(['pdf']);

export function hasUploadedDocumentFile(fileUrl: string | null | undefined): boolean {
  return !!(fileUrl && fileUrl.trim());
}

export function resolveDocumentFileUrl(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') {
    return null;
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

function getUrlExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split('/').pop() ?? '';
    const dotIndex = segment.lastIndexOf('.');
    if (dotIndex === -1) {
      return '';
    }
    return segment.slice(dotIndex + 1).toLowerCase();
  } catch {
    const match = url.match(/\.([a-z0-9]+)(?:\?|#|$)/i);
    return match?.[1]?.toLowerCase() ?? '';
  }
}

export function getDocumentFileKind(url: string): DocumentFileKind {
  const extension = getUrlExtension(url);

  if (IMAGE_EXTENSIONS.has(extension)) {
    return 'image';
  }

  if (PDF_EXTENSIONS.has(extension)) {
    return 'pdf';
  }

  return 'unknown';
}

export function isPreviewableDocumentUrl(url: string): boolean {
  const kind = getDocumentFileKind(url);
  return kind === 'image' || kind === 'pdf';
}

export function getStoredDocumentFileKind(
  storedFileUrl: string | null | undefined,
): DocumentFileKind {
  const path = parseStoragePathFromFileUrl(storedFileUrl);
  if (path) {
    return getDocumentFileKind(`https://example.invalid/${path}`);
  }
  if (!storedFileUrl?.trim()) return 'unknown';
  return getDocumentFileKind(storedFileUrl.trim());
}

export function mimeTypeForDocumentKind(kind: DocumentFileKind): string | undefined {
  if (kind === 'pdf') return 'application/pdf';
  if (kind === 'image') return 'image/jpeg';
  return undefined;
}

export function suggestedDocumentFileName(
  storedFileUrl: string | null | undefined,
  fallback = 'document',
): string {
  const path = parseStoragePathFromFileUrl(storedFileUrl);
  const source = path ?? storedFileUrl ?? fallback;
  const segment = source.split('/').pop()?.split('?')[0] ?? fallback;
  const cleaned = segment.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '');
  return cleaned || fallback;
}
