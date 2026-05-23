export type DocumentFileKind = 'image' | 'pdf' | 'unknown';

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp']);
const PDF_EXTENSIONS = new Set(['pdf']);

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
