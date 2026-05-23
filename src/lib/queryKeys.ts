import type {
  MobileNotificationLogStatusFilter,
  MobileNotificationLogTypeFilter,
} from '@/src/types/mobileNotificationLogs';

export const queryKeys = {
  companyName: (companyId: string) => ['company', companyId, 'name'] as const,
  dashboard: (companyId: string) => ['company', companyId, 'dashboard'] as const,
  staff: (companyId: string) => ['company', companyId, 'staff'] as const,
  documents: (companyId: string) => ['company', companyId, 'documents'] as const,
  org: (companyId: string) => ['company', companyId, 'org'] as const,
  staffMember: (companyId: string, staffId: string) =>
    ['company', companyId, 'staff', staffId] as const,
  staffDocuments: (companyId: string, staffId: string) =>
    ['company', companyId, 'staff', staffId, 'documents'] as const,
  document: (companyId: string, documentId: string) =>
    ['company', companyId, 'document', documentId] as const,
  notificationLogs: (
    companyId: string,
    statusFilter: MobileNotificationLogStatusFilter,
    typeFilter: MobileNotificationLogTypeFilter,
  ) => ['company', companyId, 'notificationLogs', statusFilter, typeFilter] as const,
};
