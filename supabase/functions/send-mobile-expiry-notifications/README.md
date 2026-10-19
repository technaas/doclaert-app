# send-mobile-expiry-notifications

Expo push summaries for expiring and expired documents. Email and WhatsApp stay in `send-expiry-email-reminders`.

## Authorization

Company-wide runs require the `x-cron-secret` header to match the `MOBILE_CRON_SECRET` function secret. A missing, empty, or incorrect value is rejected. `CRON_SECRET` remains the email and WhatsApp reminder secret and does not authorize this function. A signed-in user cannot start a company-wide run.

A one-device test requires:

- `Authorization: Bearer <access token>` for an active `owner` or `technaas_super_admin`
- JSON body `{ "mode": "test", "mobile_device_id": "<uuid>" }`

An owner can test only a device in their own company. A Technaas super admin testing another company must also send that `company_id`. The test writes `notification_type = test` and does not start the staff, branch, or vehicle cooldown. Responses and logs do not include the push token.

`?test=true` no longer sends anything.

## Recipients

For each company, the function reads `email_notification_settings`:

| Column | Use |
|--------|-----|
| `enabled` | `false` skips the company for push and does not change email |
| `alert_threshold_days` | Same window used by email |
| `repeat_interval_days` | Minimum days between successful pushes of one category to one device |
| `recipient_roles` | Only active users in these roles, registered to this company, can receive push |

Each eligible user must also have expiry-alert permission. Staff, branch, and vehicle counts are then limited to that user's brand and branch access. Custom email addresses are not push recipients.

## Logs

`staff`, `branch`, and `vehicle` have separate cooldown rows. The production check constraint allows `staff`, `branch`, `vehicle`, and `test`.

## Scheduling

The prepared daily job is `send-mobile-expiry-notifications-daily` at `0 7 * * *` (10:00 Asia/Kuwait). Its command reads `MOBILE_CRON_SECRET` from Supabase Vault when it runs. Do not execute `supabase/scheduled/cron-send-mobile-expiry-notifications.sql` until that secret exists in both the Edge Function secrets and Vault, and this version of the function is deployed. The SQL file contains no secret value.
