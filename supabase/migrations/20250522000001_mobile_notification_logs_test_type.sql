-- Allow manual test pushes in notification logs (temporary test mode)

alter table public.mobile_notification_logs
  drop constraint if exists mobile_notification_logs_notification_type_check;

alter table public.mobile_notification_logs
  add constraint mobile_notification_logs_notification_type_check
  check (notification_type in ('staff', 'branch', 'test'));
