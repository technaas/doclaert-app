export type NotificationCategory = "staff" | "branch" | "test";

export interface DocumentRow {
  id: string;
  company_id: string;
  type: string | null;
  staff_id: string | null;
  branch_id: string | null;
  document_name: string | null;
  expiry_date: string;
  status: string | null;
}

export interface MobileDeviceRow {
  id: string;
  company_id: string;
  user_id: string;
  expo_push_token: string | null;
  device_name: string | null;
  platform: string | null;
  is_active: boolean;
}

export interface CategoryCounts {
  total: number;
  expired: number;
  expiring: number;
}

export interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data: {
    screen: string;
    type: NotificationCategory | "test";
    status?: "expired" | "expiring" | "mixed";
  };
}

export interface SendJob {
  device: MobileDeviceRow;
  category: NotificationCategory;
  message: ExpoPushMessage;
}

export interface RunStats {
  companies_total: number;
  companies_skipped_disabled: number;
  companies_processed: number;
  processed: number;
  sent: number;
  skipped: number;
  failed: number;
  errors: string[];
}
