export type NotificationCategory = "staff" | "branch" | "vehicle" | "test";

export interface DocumentRow {
  id: string;
  company_id: string;
  type: string | null;
  staff_id: string | null;
  branch_id: string | null;
  document_name: string | null;
  expiry_date: string | null;
  expiry_status: string | null;
  file_url: string | null;
  status: string | null;
}

export interface VehicleRow {
  id: string;
  brand_id: string | null;
  branch_id: string | null;
  vehicle_make: string | null;
  model: string | null;
  registration_number: string | null;
  duftar_expiry_date: string | null;
  daftar_expiry_date: string | null;
  duftar_file_url: string | null;
  daftar_file_url: string | null;
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
