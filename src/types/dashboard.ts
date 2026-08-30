export type DocumentCountBreakdown = {
  staff: number;
  licenses: number;
  vehicles: number;
};

export type DashboardStats = {
  brandsCount: number;
  branchesCount: number;
  activeStaffCount: number;
  totalPay: number;
  vehiclesCount: number;
  validDocuments: DocumentCountBreakdown;
  expiringSoon: DocumentCountBreakdown;
  expired: DocumentCountBreakdown;
  criticalDocuments: DocumentCountBreakdown;
  nonExpiringDocuments: DocumentCountBreakdown;
  pendingVerificationDocuments: DocumentCountBreakdown;
  companyName: string | null;
};

export function totalBreakdown(breakdown: DocumentCountBreakdown): number {
  return breakdown.staff + breakdown.licenses + breakdown.vehicles;
}

export function formatBreakdownSubtitle(breakdown: DocumentCountBreakdown): string {
  return `Staff: ${breakdown.staff.toLocaleString()} · Licenses: ${breakdown.licenses.toLocaleString()} · Vehicles: ${breakdown.vehicles.toLocaleString()}`;
}
