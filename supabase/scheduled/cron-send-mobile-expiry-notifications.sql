-- =============================================================================
-- DocAlert: ONE daily cron for mobile expiry push notifications
-- =============================================================================
--
-- IMPORTANT
-- - Create exactly ONE schedule for send-mobile-expiry-notifications.
-- - Do NOT create separate cron jobs per company.
-- - The Edge Function loops every row in email_notification_settings itself.
--
-- Schedule: every day at 08:00 Asia/Kuwait (UTC+3, no DST)
-- pg_cron uses UTC: 08:00 Kuwait = 05:00 UTC → cron expression: 0 5 * * *
--
-- Prerequisites (Supabase Dashboard → Database → Extensions):
--   - pg_cron
--   - pg_net
--
-- Replace placeholders before running:
--   YOUR_PROJECT_REF  → Project Settings → General → Reference ID
--   YOUR_SERVICE_ROLE_KEY → Project Settings → API → service_role (secret)
--
-- =============================================================================

-- 1) List existing cron jobs (avoid duplicates)
select jobid, jobname, schedule, command
from cron.job
order by jobname;

-- 2) Remove old/duplicate mobile push jobs if you re-run this script
select cron.unschedule(jobid)
from cron.job
where jobname in (
  'send-mobile-expiry-notifications-daily',
  'mobile-expiry-push-daily-kuwait-8am'
);

-- 3) Schedule ONE daily job at 08:00 Kuwait (05:00 UTC)
select cron.schedule(
  'send-mobile-expiry-notifications-daily',
  '0 5 * * *',
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-mobile-expiry-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);

-- 4) Verify the job exists (expect exactly one row for this job name)
select jobid, jobname, schedule, active
from cron.job
where jobname = 'send-mobile-expiry-notifications-daily';

-- =============================================================================
-- Alternative: Supabase Dashboard (no SQL)
-- =============================================================================
-- Edge Functions → send-mobile-expiry-notifications → Cron Jobs → Add
--   Schedule: 0 5 * * *   (05:00 UTC = 08:00 Kuwait)
--   HTTP method: POST
--   Body: {}
--   Authorization: Bearer <service_role_key>
--
-- Again: one cron total, not per company.
-- =============================================================================
--
-- Manual test (does not use production expiry logic):
--   POST .../send-mobile-expiry-notifications?test=true
--
-- Manual production run for one company:
--   POST .../send-mobile-expiry-notifications
--   Body: { "company_id": "<uuid>" }
-- =============================================================================
