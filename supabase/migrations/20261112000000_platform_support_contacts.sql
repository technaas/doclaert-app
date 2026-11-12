-- Global Technaas support contacts for DocAlert mobile Help & Support
-- and matching privacy/support links. Singleton row (id = 1).
-- Writes: platform super-admin only (public.has_platform_role).
-- Reads: anon + authenticated (public privacy pages and logged-in mobile).

create table if not exists public.platform_support_contacts (
  id integer primary key default 1 check (id = 1),
  whatsapp_number text not null,
  call_number text not null,
  email text not null,
  website_url text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

create or replace function public.set_platform_support_contacts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists platform_support_contacts_updated_at on public.platform_support_contacts;

create trigger platform_support_contacts_updated_at
before update on public.platform_support_contacts
for each row
execute function public.set_platform_support_contacts_updated_at();

-- Ensure platform role helper exists (same definition as platform_users.sql).
create or replace function public.has_platform_role(_uid uuid, _role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_users
    where id = _uid and role = _role and is_active = true
  );
$$;

alter table public.platform_support_contacts enable row level security;

drop policy if exists "Anyone can read platform support contacts"
  on public.platform_support_contacts;
drop policy if exists "Platform super admins update support contacts"
  on public.platform_support_contacts;
drop policy if exists "Platform super admins insert support contacts"
  on public.platform_support_contacts;
drop policy if exists "Platform super admins delete support contacts"
  on public.platform_support_contacts;

create policy "Anyone can read platform support contacts"
on public.platform_support_contacts
for select
to anon, authenticated
using (true);

create policy "Platform super admins update support contacts"
on public.platform_support_contacts
for update
to authenticated
using (public.has_platform_role(auth.uid(), 'technaas_super_admin'))
with check (public.has_platform_role(auth.uid(), 'technaas_super_admin'));

-- No insert/delete policies for authenticated/anon: seed via migration only.
-- Super-admins update the singleton; company roles cannot write.

grant select on table public.platform_support_contacts to anon, authenticated;
grant update on table public.platform_support_contacts to authenticated;

insert into public.platform_support_contacts (
  id,
  whatsapp_number,
  call_number,
  email,
  website_url
)
values (
  1,
  '+96566112457',
  '+96566112457',
  'info@technaas.com',
  'https://docalert.net'
)
on conflict (id) do nothing;
