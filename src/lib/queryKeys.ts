import type {
  MobileNotificationLogStatusFilter,
  MobileNotificationLogTypeFilter,
} from '@/src/types/mobileNotificationLogs';

export const queryKeys = {
  companyName: (companyId: string) => ['company', companyId, 'name'] as const,
  companyProfile: (companyId: string) => ['company', companyId, 'profile'] as const,
  dashboard: (companyId: string, scopeKey: string, includeSalary: boolean) =>
    ['company', companyId, 'dashboard', scopeKey, includeSalary] as const,
  staff: (companyId: string, scopeKey: string, includeSalary: boolean) =>
    ['company', companyId, 'staff', scopeKey, includeSalary] as const,
  documents: (companyId: string, scopeKey: string) =>
    ['company', companyId, 'documents', scopeKey] as const,
  vehicles: (companyId: string, scopeKey: string) =>
    ['company', companyId, 'vehicles', scopeKey] as const,
  org: (companyId: string, scopeKey: string) =>
    ['company', companyId, 'org', scopeKey] as const,
  staffMember: (companyId: string, staffId: string, includeSalary: boolean) =>
    ['company', companyId, 'staff', staffId, includeSalary] as const,
  staffDocuments: (companyId: string, staffId: string) =>
    ['company', companyId, 'staff', staffId, 'documents'] as const,
  document: (companyId: string, documentId: string) =>
    ['company', companyId, 'document', documentId] as const,
  vehicle: (companyId: string, vehicleId: string, scopeKey = '') =>
    ['company', companyId, 'vehicle', vehicleId, scopeKey] as const,
  notificationLogs: (
    companyId: string,
    statusFilter: MobileNotificationLogStatusFilter,
    typeFilter: MobileNotificationLogTypeFilter,
  ) => ['company', companyId, 'notificationLogs', statusFilter, typeFilter] as const,
  subscription: (companyId: string) => ['company', companyId, 'subscription'] as const,
  documentTypes: (companyId: string) => ['company', companyId, 'documentTypes'] as const,
  accessMappings: (userId: string) => ['profile', userId, 'accessMappings'] as const,
};
