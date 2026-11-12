-- Isolated RLS harness for platform_support_contacts (not for production).
-- Mimics Supabase role/auth.uid() enough to exercise policies.

begin;

create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key
);

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end $$;

grant usage on schema public to anon, authenticated;
grant usage on schema auth to anon, authenticated;

create table if not exists public.platform_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  role text not null check (role in ('technaas_super_admin','technaas_support')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

revoke all on function public.has_platform_role(uuid, text) from public;
grant execute on function public.has_platform_role(uuid, text) to anon, authenticated;

commit;
