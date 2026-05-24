export type DocumentCountBreakdown = {
  staff: number;
  licenses: number;
};

export type DashboardStats = {
  brandsCount: number;
  branchesCount: number;
  activeStaffCount: number;
  totalPay: number;
  validDocuments: DocumentCountBreakdown;
  expiringSoon: DocumentCountBreakdown;
  expired: DocumentCountBreakdown;
  companyName: string | null;
  alertThresholdDays: number;
};

export function totalBreakdown(breakdown: DocumentCountBreakdown): number {
  return breakdown.staff + breakdown.licenses;
}

export function formatBreakdownSubtitle(breakdown: DocumentCountBreakdown): string {
  return `Staff: ${breakdown.staff.toLocaleString()} · Licenses: ${breakdown.licenses.toLocaleString()}`;
}
