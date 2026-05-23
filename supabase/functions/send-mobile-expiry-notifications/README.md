# send-mobile-expiry-notifications

Expo push summaries for expiring / expired documents.

## Scheduling (production)

**One daily cron only** — not per company.

See [`supabase/scheduled/cron-send-mobile-expiry-notifications.sql`](../../scheduled/cron-send-mobile-expiry-notifications.sql):

- **08:00 Asia/Kuwait** daily
- pg_cron UTC expression: `0 5 * * *`
- POST `{}` to this function with the service role key

## Per-company settings

Read from `email_notification_settings` for each `company_id`:

| Column | Use |
|--------|-----|
| `enabled` | `false` → skip company |
| `alert_threshold_days` | Documents with `expiry_date <= today + threshold` (includes expired) |
| `repeat_interval_days` | Min days between staff/branch summary per device |

## Limits

Per active device per run (subject to repeat interval):

- 1 Staff Documents summary
- 1 Branch Licenses summary

Deduped via `mobile_notification_logs` + `repeat_interval_days`.

## Manual invoke

```http
POST /functions/v1/send-mobile-expiry-notifications
Authorization: Bearer <SERVICE_ROLE_KEY>
Content-Type: application/json

{}
```

Test push: `?test=true`

Single company: `{ "company_id": "<uuid>" }`
