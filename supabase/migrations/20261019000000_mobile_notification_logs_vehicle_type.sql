-- Separate vehicle Daftar push logs from branch license logs.
-- Apply this before deploying the updated send-mobile-expiry-notifications function.
-- Do not change existing rows.

alter table public.mobile_notification_logs
  drop constraint if exists mobile_notification_logs_notification_type_check;

alter table public.mobile_notification_logs
  add constraint mobile_notification_logs_notification_type_check
  check (notification_type in ('staff', 'branch', 'vehicle', 'test'));
