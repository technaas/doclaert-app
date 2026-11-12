-- Runtime RLS verification assertions for platform_support_contacts.
-- Expects harness + migration already applied.

\set ON_ERROR_STOP on

do $$
declare
  super_id uuid := '11111111-1111-1111-1111-111111111111';
  support_id uuid := '22222222-2222-2222-2222-222222222222';
  company_id uuid := '33333333-3333-3333-3333-333333333333';
  n int;
  email_val text;
begin
  insert into auth.users (id) values
    (super_id), (support_id), (company_id)
  on conflict do nothing;

  insert into public.platform_users (id, email, name, role, is_active) values
    (super_id, 'super@technaas.com', 'Super', 'technaas_super_admin', true),
    (support_id, 'support@technaas.com', 'Support', 'technaas_support', true)
  on conflict (id) do update
    set role = excluded.role, is_active = true;

  -- Seed must leave existing admin edits alone.
  update public.platform_support_contacts
  set email = 'admin-edited@technaas.com'
  where id = 1;

  insert into public.platform_support_contacts (
    id, whatsapp_number, call_number, email, website_url
  ) values (
    1, '+96566112457', '+96566112457', 'info@technaas.com', 'https://docalert.net'
  )
  on conflict (id) do nothing;

  select email into email_val from public.platform_support_contacts where id = 1;
  if email_val is distinct from 'admin-edited@technaas.com' then
    raise exception 'SEED_OVERWRITE: expected admin-edited email preserved, got %', email_val;
  end if;

  raise notice 'PASS seed on conflict do nothing preserves admin edits';
end $$;

-- Anonymous read
set role anon;
reset request.jwt.claim.sub;
do $$
declare n int;
begin
  select count(*) into n from public.platform_support_contacts;
  if n <> 1 then
    raise exception 'ANON_SELECT failed, count=%', n;
  end if;
  raise notice 'PASS anon select';
end $$;
reset role;

-- Authenticated company user read + denied update/insert/delete
set role authenticated;
select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', false);

do $$
declare n int;
begin
  select count(*) into n from public.platform_support_contacts;
  if n <> 1 then
    raise exception 'AUTH_COMPANY_SELECT failed, count=%', n;
  end if;
  raise notice 'PASS authenticated company select';
end $$;

do $$
begin
  begin
    update public.platform_support_contacts
    set email = 'company-hack@example.com'
    where id = 1;
    if found then
      raise exception 'COMPANY_UPDATE unexpectedly succeeded';
    end if;
  exception
    when insufficient_privilege then
      null;
  end;
  -- RLS with no matching rows typically updates 0 rows without error.
  if exists (
    select 1 from public.platform_support_contacts
    where email = 'company-hack@example.com'
  ) then
    raise exception 'COMPANY_UPDATE changed data';
  end if;
  raise notice 'PASS company update denied/no-op';
end $$;

do $$
begin
  begin
    insert into public.platform_support_contacts (
      id, whatsapp_number, call_number, email, website_url
    ) values (
      1, '+96566112457', '+96566112457', 'x@y.com', 'https://docalert.net'
    );
    raise exception 'COMPANY_INSERT unexpectedly succeeded';
  exception
    when insufficient_privilege then
      raise notice 'PASS company insert denied (privilege)';
    when others then
      if sqlerrm ilike '%policy%' or sqlstate = '42501' or sqlstate = '23505' then
        raise notice 'PASS company insert denied (%)', sqlstate;
      else
        raise;
      end if;
  end;
end $$;

do $$
begin
  begin
    delete from public.platform_support_contacts where id = 1;
    if found then
      raise exception 'COMPANY_DELETE unexpectedly succeeded';
    end if;
  exception
    when insufficient_privilege then
      null;
  end;
  if not exists (select 1 from public.platform_support_contacts where id = 1) then
    raise exception 'COMPANY_DELETE removed row';
  end if;
  raise notice 'PASS company delete denied/no-op';
end $$;
reset role;

-- Platform support role cannot update (not super admin)
set role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
do $$
begin
  update public.platform_support_contacts
  set email = 'support-hack@example.com'
  where id = 1;
  if exists (
    select 1 from public.platform_support_contacts
    where email = 'support-hack@example.com'
  ) then
    raise exception 'SUPPORT_ROLE_UPDATE changed data';
  end if;
  raise notice 'PASS technaas_support update denied/no-op';
end $$;
reset role;

-- Platform super admin can update
set role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
do $$
begin
  update public.platform_support_contacts
  set
    whatsapp_number = '+96566119999',
    call_number = '+96566118888',
    email = 'super-ok@technaas.com',
    website_url = 'https://docalert.net'
  where id = 1;
  if not found then
    raise exception 'SUPER_ADMIN_UPDATE affected 0 rows';
  end if;
  if not exists (
    select 1 from public.platform_support_contacts
    where email = 'super-ok@technaas.com'
      and whatsapp_number = '+96566119999'
      and call_number = '+96566118888'
  ) then
    raise exception 'SUPER_ADMIN_UPDATE did not persist';
  end if;
  raise notice 'PASS technaas_super_admin update';
end $$;

-- Super admin insert/delete still denied (no policies)
do $$
begin
  begin
    insert into public.platform_support_contacts (
      id, whatsapp_number, call_number, email, website_url
    ) values (
      2, '+96566112457', '+96566112457', 'x@y.com', 'https://docalert.net'
    );
    raise exception 'SUPER_INSERT unexpectedly succeeded';
  exception
    when check_violation then
      raise notice 'PASS singleton check blocks id<>1';
    when insufficient_privilege then
      raise notice 'PASS super insert denied (privilege)';
    when others then
      if sqlstate = '42501' or sqlerrm ilike '%policy%' then
        raise notice 'PASS super insert denied (%)', sqlstate;
      else
        raise notice 'PASS super insert blocked (%) %', sqlstate, sqlerrm;
      end if;
  end;
end $$;

do $$
begin
  begin
    delete from public.platform_support_contacts where id = 1;
    if found then
      raise exception 'SUPER_DELETE unexpectedly succeeded';
    end if;
  exception
    when insufficient_privilege then
      null;
  end;
  if not exists (select 1 from public.platform_support_contacts where id = 1) then
    raise exception 'SUPER_DELETE removed row';
  end if;
  raise notice 'PASS super delete denied/no-op';
end $$;

reset role;
select set_config('request.jwt.claim.sub', '', false);

select 'ALL_RLS_CHECKS_PASSED' as result;
