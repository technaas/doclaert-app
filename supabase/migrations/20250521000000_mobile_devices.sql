-- Mobile device registry for Expo push tokens (DocAlert mobile app)
-- Matches app sync fields: company_id, user_id, expo_push_token, device_name,
-- platform, app_version, is_active (+ id, created_at, updated_at).

create table if not exists public.mobile_devices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  expo_push_token text not null,
  device_name text,
  platform text not null,
  app_version text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists mobile_devices_company_id_idx on public.mobile_devices (company_id);
create index if not exists mobile_devices_user_id_idx on public.mobile_devices (user_id);
create index if not exists mobile_devices_expo_push_token_idx on public.mobile_devices (expo_push_token);
create index if not exists mobile_devices_user_platform_name_idx
  on public.mobile_devices (user_id, platform, device_name);

create or replace function public.set_mobile_devices_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists mobile_devices_updated_at on public.mobile_devices;

create trigger mobile_devices_updated_at
before update on public.mobile_devices
for each row
execute function public.set_mobile_devices_updated_at();

alter table public.mobile_devices enable row level security;

drop policy if exists "Users read own mobile devices" on public.mobile_devices;
drop policy if exists "Users insert own mobile devices" on public.mobile_devices;
drop policy if exists "Users update own mobile devices" on public.mobile_devices;

create policy "Users read own mobile devices"
on public.mobile_devices
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users insert own mobile devices"
on public.mobile_devices
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users update own mobile devices"
on public.mobile_devices
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
