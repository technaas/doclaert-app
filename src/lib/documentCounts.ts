import { getDocumentDisplayStatus } from '@/src/lib/documentStatus';
import type { DocumentCountBreakdown } from '@/src/types/dashboard';

type DocumentRow = {
  expiry_date: string | null;
  type: string | null;
};

type VehicleDaftarRow = {
  daftar_expiry_date: string | null;
};

function emptyBreakdown(): DocumentCountBreakdown {
  return { staff: 0, licenses: 0, vehicles: 0 };
}

function bucketForType(type: string | null): keyof DocumentCountBreakdown | null {
  if (type === 'staff') return 'staff';
  if (type === 'branch') return 'licenses';
  return null;
}

function incrementBreakdown(
  breakdowns: {
    valid: DocumentCountBreakdown;
    expiringSoon: DocumentCountBreakdown;
    expired: DocumentCountBreakdown;
  },
  bucket: keyof DocumentCountBreakdown,
  status: ReturnType<typeof getDocumentDisplayStatus>,
) {
  if (status === 'active') breakdowns.valid[bucket] += 1;
  else if (status === 'expiring') breakdowns.expiringSoon[bucket] += 1;
  else if (status === 'expired') breakdowns.expired[bucket] += 1;
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
  const breakdowns = { valid, expiringSoon, expired };

  for (const doc of documents) {
    if (!doc.expiry_date) continue;

    const bucket = bucketForType(doc.type);
    if (!bucket) continue;

    const status = getDocumentDisplayStatus(doc.expiry_date, thresholdDays);
    incrementBreakdown(breakdowns, bucket, status);
  }

  return breakdowns;
}

export function countVehicleDaftarByStatus(
  vehicles: VehicleDaftarRow[],
  thresholdDays: number,
): {
  valid: DocumentCountBreakdown;
  expiringSoon: DocumentCountBreakdown;
  expired: DocumentCountBreakdown;
} {
  const valid = emptyBreakdown();
  const expiringSoon = emptyBreakdown();
  const expired = emptyBreakdown();
  const breakdowns = { valid, expiringSoon, expired };

  for (const vehicle of vehicles) {
    if (!vehicle.daftar_expiry_date) continue;

    const status = getDocumentDisplayStatus(vehicle.daftar_expiry_date, thresholdDays);
    incrementBreakdown(breakdowns, 'vehicles', status);
  }

  return breakdowns;
}

export function mergeDocumentCountBreakdowns(
  primary: {
    valid: DocumentCountBreakdown;
    expiringSoon: DocumentCountBreakdown;
    expired: DocumentCountBreakdown;
  },
  secondary: {
    valid: DocumentCountBreakdown;
    expiringSoon: DocumentCountBreakdown;
    expired: DocumentCountBreakdown;
  },
): {
  valid: DocumentCountBreakdown;
  expiringSoon: DocumentCountBreakdown;
  expired: DocumentCountBreakdown;
} {
  const merge = (a: DocumentCountBreakdown, b: DocumentCountBreakdown): DocumentCountBreakdown => ({
    staff: a.staff + b.staff,
    licenses: a.licenses + b.licenses,
    vehicles: a.vehicles + b.vehicles,
  });

  return {
    valid: merge(primary.valid, secondary.valid),
    expiringSoon: merge(primary.expiringSoon, secondary.expiringSoon),
    expired: merge(primary.expired, secondary.expired),
  };
}
