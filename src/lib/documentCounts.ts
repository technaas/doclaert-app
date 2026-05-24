import { getDocumentDisplayStatus } from '@/src/lib/documentStatus';
import type { DocumentCountBreakdown } from '@/src/types/dashboard';

type DocumentRow = {
  expiry_date: string | null;
  type: string | null;
};

function emptyBreakdown(): DocumentCountBreakdown {
  return { staff: 0, licenses: 0 };
}

function bucketForType(type: string | null): keyof DocumentCountBreakdown | null {
  if (type === 'staff') return 'staff';
  if (type === 'branch') return 'licenses';
  return null;
}

export function countDocumentsByStatus(
  documents: DocumentRow[],
  thresholdDays: number,
): {
  valid: DocumentCountBreakdown;
  expiringSoon: DocumentCountBreakdown;
  expired: DocumentCountBreakdown;
} {
  const valid = emptyBreakdown();
  const expiringSoon = emptyBreakdown();
  const expired = emptyBreakdown();

  for (const doc of documents) {
    if (!doc.expiry_date) continue;

    const bucket = bucketForType(doc.type);
    if (!bucket) continue;

    const status = getDocumentDisplayStatus(doc.expiry_date, thresholdDays);
    if (status === 'active') valid[bucket] += 1;
    else if (status === 'expiring') expiringSoon[bucket] += 1;
    else if (status === 'expired') expired[bucket] += 1;
  }

  return { valid, expiringSoon, expired };
}
