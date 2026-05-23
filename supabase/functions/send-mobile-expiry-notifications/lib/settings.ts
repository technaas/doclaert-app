import { normalizeRepeatDays, normalizeThresholdDays } from "./documents.ts";

export interface CompanyNotificationSettings {
  companyId: string;
  enabled: boolean;
  alertThresholdDays: number;
  repeatIntervalDays: number;
}

export function parseCompanyNotificationSettings(
  row: Record<string, unknown>,
): CompanyNotificationSettings {
  return {
    companyId: String(row.company_id),
    enabled: row.enabled !== false,
    alertThresholdDays: normalizeThresholdDays(row.alert_threshold_days),
    repeatIntervalDays: normalizeRepeatDays(row.repeat_interval_days),
  };
}
