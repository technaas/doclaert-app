-- Mobile push notification audit + repeat-interval deduplication (DocAlert)

create table if not exists public.mobile_notification_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  mobile_device_id uuid references public.mobile_devices (id) on delete set null,
  notification_type text not null check (notification_type in ('staff', 'branch')),
  status text not null check (status in ('sent', 'failed')),
  device_name text,
  platform text,
  error text,
  expo_ticket_id text,
  sent_at timestamptz not null default now()
);

create index if not exists mobile_notification_logs_company_idx
  on public.mobile_notification_logs (company_id, sent_at desc);

create index if not exists mobile_notification_logs_device_type_idx
  on public.mobile_notification_logs (mobile_device_id, notification_type, sent_at desc)
  where status = 'sent';

alter table public.mobile_notification_logs enable row level security;

drop policy if exists "mobile_notif_logs read company" on public.mobile_notification_logs;
create policy "mobile_notif_logs read company"
on public.mobile_notification_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.company_id = mobile_notification_logs.company_id
  )
);
