import {
  isSummaryExpiring,
  isSummaryValid,
  uiStatusForDocument,
  uiStatusForVehicleDaftar,
} from '@/src/lib/documentStatus';
import { isDocumentInventoryRow } from '@/src/lib/operationalExpiry';
import type { DocumentCountBreakdown } from '@/src/types/dashboard';
import type { DocumentDisplayStatus } from '@/src/types/documents';

type DocumentRow = {
  id?: string;
  type: string | null;
  document_name?: string | null;
  expiry_date: string | null;
  expiry_status?: string | null;
  file_url?: string | null;
};

type VehicleDaftarRow = {
  daftar_expiry_date: string | null;
};

export type DocumentStatusBreakdowns = {
  valid: DocumentCountBreakdown;
  expiringSoon: DocumentCountBreakdown;
  expired: DocumentCountBreakdown;
  critical: DocumentCountBreakdown;
  nonExpiring: DocumentCountBreakdown;
  pendingVerification: DocumentCountBreakdown;
};

function emptyBreakdown(): DocumentCountBreakdown {
  return { staff: 0, licenses: 0, vehicles: 0 };
}

function emptyBreakdowns(): DocumentStatusBreakdowns {
  return {
    valid: emptyBreakdown(),
    expiringSoon: emptyBreakdown(),
    expired: emptyBreakdown(),
    critical: emptyBreakdown(),
    nonExpiring: emptyBreakdown(),
    pendingVerification: emptyBreakdown(),
  };
}

function bucketForType(type: string | null): keyof DocumentCountBreakdown | null {
  if (type === 'staff') return 'staff';
  if (type === 'branch') return 'licenses';
  return null;
}

function incrementBreakdown(
  breakdowns: DocumentStatusBreakdowns,
  bucket: keyof DocumentCountBreakdown,
  status: DocumentDisplayStatus,
) {
  if (status === 'expired') breakdowns.expired[bucket] += 1;
  else if (isSummaryExpiring(status)) breakdowns.expiringSoon[bucket] += 1;
  else if (isSummaryValid(status)) breakdowns.valid[bucket] += 1;

  if (status === 'critical') breakdowns.critical[bucket] += 1;
  if (status === 'non_expiring') breakdowns.nonExpiring[bucket] += 1;
  if (status === 'pending_verification') breakdowns.pendingVerification[bucket] += 1;
}

export function countDocumentsByStatus(documents: DocumentRow[]): DocumentStatusBreakdowns {
  const breakdowns = emptyBreakdowns();

  for (const doc of documents) {
    if (!isDocumentInventoryRow(doc)) continue;

    const bucket = bucketForType(doc.type);
    if (!bucket) continue;

    incrementBreakdown(breakdowns, bucket, uiStatusForDocument(doc));
  }

  return breakdowns;
}

export function countVehicleDaftarByStatus(vehicles: VehicleDaftarRow[]): DocumentStatusBreakdowns {
  const breakdowns = emptyBreakdowns();

  for (const vehicle of vehicles) {
    if (!vehicle.daftar_expiry_date) continue;
    incrementBreakdown(breakdowns, 'vehicles', uiStatusForVehicleDaftar(vehicle.daftar_expiry_date));
  }

  return breakdowns;
}

export function mergeDocumentCountBreakdowns(
  primary: DocumentStatusBreakdowns,
  secondary: DocumentStatusBreakdowns,
): DocumentStatusBreakdowns {
  const merge = (a: DocumentCountBreakdown, b: DocumentCountBreakdown): DocumentCountBreakdown => ({
    staff: a.staff + b.staff,
    licenses: a.licenses + b.licenses,
    vehicles: a.vehicles + b.vehicles,
  });

  return {
    valid: merge(primary.valid, secondary.valid),
    expiringSoon: merge(primary.expiringSoon, secondary.expiringSoon),
    expired: merge(primary.expired, secondary.expired),
    critical: merge(primary.critical, secondary.critical),
    nonExpiring: merge(primary.nonExpiring, secondary.nonExpiring),
    pendingVerification: merge(primary.pendingVerification, secondary.pendingVerification),
  };
}
