-- Shareable certificate events for CV11: the organiser shares ONE link, and each person finds and
-- downloads only their own certificate.
-- Run this once in Supabase: SQL Editor > New query > paste > Run. It is safe to run again.
--
-- The app only ever uses the public anon key (no service-role key anywhere), so the rules live here:
--   * cert_events       one row per shared event: the design settings and an optional event code
--   * cert_recipients   the names for that event. Nobody can list them: the public can only ask
--                       cert_claim() "is this person on the list?" and get that one name back
--   * cert_lookups      a small log used only to slow down guessing (cleared after an hour)
--   * cert_event_create() the organiser (signed in) creates an event with its names in one step
--   * cert_event_info()   the claim page asks for the event title and whether it needs a code
--   * cert_claim()        a person asks for their own certificate: by name, plus the code if one is set
--   * cert_event_open()   an event where people ADD THEIR OWN names (registration), released by the organiser
--   * cert_register()     a person adds their own name while registration is open
--   * cert_event_release() the organiser opens the certificates for download
-- Events expire (90 days by default) and the organiser can delete one at any time.

-- ---------------------------------------------------------------- tables
create table if not exists public.cert_events (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null references auth.users (id) on delete cascade,
  slug text not null unique,
  title text not null check (char_length(title) between 1 and 120),
  settings jsonb not null,                         -- the design, wording, signers, logo and signatures
  code text check (code is null or char_length(code) between 2 and 40),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
-- 'list': the organiser pasted the names. 'register': people add their own names, then the organiser
-- releases the certificates (released = true). cap is the most names the event may hold.
alter table public.cert_events add column if not exists mode text not null default 'list' check (mode in ('list', 'register'));
alter table public.cert_events add column if not exists released boolean not null default true;
alter table public.cert_events add column if not exists cap integer not null default 500 check (cap between 1 and 500);
-- true for a batch recorded only so its certificates can carry a verify QR: it has no design, is never
-- shared by link and does not count towards the 20 shared events
alter table public.cert_events add column if not exists verify_only boolean not null default false;
create index if not exists cert_events_owner on public.cert_events (owner);

create table if not exists public.cert_recipients (
  id bigserial primary key,
  event_id uuid not null references public.cert_events (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  name_key text not null                           -- lower case, single spaces, used for matching
);
create index if not exists cert_recipients_event on public.cert_recipients (event_id);

create table if not exists public.cert_lookups (
  event_id uuid not null,
  at timestamptz not null default now()
);
create index if not exists cert_lookups_event_at on public.cert_lookups (event_id, at);

alter table public.cert_events enable row level security;
alter table public.cert_recipients enable row level security;
alter table public.cert_lookups enable row level security;   -- no policies: only the functions below touch it

-- The organiser sees and deletes only their own events and names. Creating goes through cert_event_create().
drop policy if exists "owner reads events" on public.cert_events;
create policy "owner reads events" on public.cert_events for select using (owner = auth.uid());
drop policy if exists "owner deletes events" on public.cert_events;
create policy "owner deletes events" on public.cert_events for delete using (owner = auth.uid());

drop policy if exists "owner reads recipients" on public.cert_recipients;
create policy "owner reads recipients" on public.cert_recipients for select
  using (exists (select 1 from public.cert_events e where e.id = event_id and e.owner = auth.uid()));

-- ------------------------------------------------------------ name matching key
create or replace function public.cert_key(p text)
returns text language sql immutable as $$
  select lower(regexp_replace(btrim(coalesce(p, '')), '\s+', ' ', 'g'));
$$;

-- ------------------------------------------------------- how many names a person may share
-- Everyone may share up to cert_settings.free_names people. Someone who has bought a bigger batch gets a
-- row in cert_grants (added by the owner in the Supabase table editor, or later by a payment): their
-- limit is then max_names until expires_at. Change the free number in the cert_settings table.
create table if not exists public.cert_settings (
  id boolean primary key default true check (id),    -- one row only
  free_names integer not null default 15 check (free_names between 1 and 500)
);
insert into public.cert_settings (id) values (true) on conflict do nothing;
alter table public.cert_settings enable row level security;
drop policy if exists "owner manages cert settings" on public.cert_settings;
create policy "owner manages cert settings" on public.cert_settings for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.cert_grants (
  user_id uuid primary key references auth.users (id) on delete cascade,
  max_names integer not null check (max_names between 1 and 500),
  expires_at timestamptz not null,
  note text                                           -- for example "paid GH₵ 50 by MoMo, 12 Mar"
);
alter table public.cert_grants enable row level security;
drop policy if exists "read own grant" on public.cert_grants;
create policy "read own grant" on public.cert_grants for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "owner manages grants" on public.cert_grants;
create policy "owner manages grants" on public.cert_grants for all using (public.is_admin()) with check (public.is_admin());

-- The most names the signed-in person (or a visitor, who gets the free number) may put in one event
create or replace function public.cert_limit()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select greatest(
    (select free_names from public.cert_settings limit 1),
    coalesce((select max_names from public.cert_grants where user_id = auth.uid() and expires_at > now()), 0));
$$;

-- ----------------------------------------------------------- create an event
create or replace function public.cert_event_create(p_title text, p_settings jsonb, p_code text, p_names text[], p_days integer)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  new_slug text;
  new_id uuid;
  n text;
begin
  if me is null then raise exception 'sign in first'; end if;
  if p_names is null or array_length(p_names, 1) is null then raise exception 'no names'; end if;
  if array_length(p_names, 1) > public.cert_limit() then raise exception 'over limit'; end if;
  if length(p_settings::text) > 6000000 then raise exception 'design too large'; end if;
  if (select count(*) from public.cert_events where owner = me and expires_at > now() and not verify_only) >= 20 then
    raise exception 'too many active events';
  end if;

  new_slug := substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
  insert into public.cert_events (owner, slug, title, settings, code, expires_at)
  values (me, new_slug, left(btrim(p_title), 120), p_settings, nullif(btrim(coalesce(p_code, '')), ''),
          now() + make_interval(days => greatest(1, least(coalesce(p_days, 90), 365))))
  returning id into new_id;

  foreach n in array p_names loop
    if btrim(n) <> '' then
      insert into public.cert_recipients (event_id, name, name_key) values (new_id, left(btrim(n), 120), public.cert_key(n));
    end if;
  end loop;
  return new_slug;
end;
$$;

-- ------------------------------------------------------- what the claim page shows first
create or replace function public.cert_event_info(p_slug text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select jsonb_build_object('title', title, 'needsCode', code is not null, 'registering', mode = 'register' and not released)
       from public.cert_events where slug = p_slug and expires_at > now() and not verify_only),
    jsonb_build_object('gone', true));
$$;

-- ------------------------------------------------------------ claim a certificate
-- Returns { status: 'ok' | 'none' | 'many' | 'code' | 'busy' | 'gone', ... }. It never lists names:
-- 'ok' carries only the one matched person's own name and the design.
create or replace function public.cert_claim(p_slug text, p_query text, p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  ev public.cert_events;
  q text := public.cert_key(p_query);
  hits text[];
  rid bigint;
begin
  select * into ev from public.cert_events where slug = p_slug;
  if not found or ev.expires_at <= now() or ev.verify_only then return jsonb_build_object('status', 'gone'); end if;

  -- Slow down guessing: at most 40 lookups a minute per event
  delete from public.cert_lookups where at < now() - interval '1 hour';
  if (select count(*) from public.cert_lookups where event_id = ev.id and at > now() - interval '1 minute') >= 40 then
    return jsonb_build_object('status', 'busy');
  end if;
  insert into public.cert_lookups (event_id) values (ev.id);

  if ev.code is not null and lower(btrim(coalesce(p_code, ''))) <> lower(ev.code) then
    return jsonb_build_object('status', 'code');
  end if;
  if not ev.released then return jsonb_build_object('status', 'wait'); end if;
  if char_length(q) < 3 then return jsonb_build_object('status', 'none'); end if;

  -- An exact match wins; otherwise every word typed must start a word of the name
  select array_agg(name) into hits from public.cert_recipients where event_id = ev.id and name_key = q;
  if hits is null then
    select array_agg(r.name) into hits from public.cert_recipients r
    where r.event_id = ev.id and not exists (
      select 1 from unnest(string_to_array(q, ' ')) t
      where t <> '' and not exists (
        select 1 from unnest(string_to_array(r.name_key, ' ')) w where left(w, char_length(t)) = t));
  end if;

  if hits is null then return jsonb_build_object('status', 'none'); end if;
  if array_length(hits, 1) > 1 then return jsonb_build_object('status', 'many'); end if;
  select id into rid from public.cert_recipients where event_id = ev.id and name = hits[1] limit 1;
  -- 'ref' goes into the certificate's QR code so it can be checked later
  return jsonb_build_object('status', 'ok', 'name', hits[1], 'title', ev.title, 'settings', ev.settings, 'ref', ev.slug || '.' || rid);
end;
$$;

-- ------------------------------------------------ an event where people add their own names
create or replace function public.cert_event_open(p_title text, p_settings jsonb, p_code text, p_days integer, p_cap integer)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  new_slug text;
begin
  if me is null then raise exception 'sign in first'; end if;
  if length(p_settings::text) > 6000000 then raise exception 'design too large'; end if;
  if (select count(*) from public.cert_events where owner = me and expires_at > now() and not verify_only) >= 20 then
    raise exception 'too many active events';
  end if;
  new_slug := substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
  insert into public.cert_events (owner, slug, title, settings, code, expires_at, mode, released, cap)
  values (me, new_slug, left(btrim(p_title), 120), p_settings, nullif(btrim(coalesce(p_code, '')), ''),
          now() + make_interval(days => greatest(1, least(coalesce(p_days, 90), 365))),
          'register', false, greatest(1, least(coalesce(p_cap, 500), public.cert_limit())));
  return new_slug;
end;
$$;

-- A person adds their own name while registration is open.
-- Returns 'registered' | 'full' | 'closed' | 'code' | 'busy' | 'short' | 'gone'
create or replace function public.cert_register(p_slug text, p_name text, p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  ev public.cert_events;
  clean text := left(regexp_replace(btrim(coalesce(p_name, '')), '\s+', ' ', 'g'), 120);
begin
  select * into ev from public.cert_events where slug = p_slug;
  if not found or ev.expires_at <= now() then return 'gone'; end if;
  if ev.mode <> 'register' or ev.released then return 'closed'; end if;
  delete from public.cert_lookups where at < now() - interval '1 hour';
  if (select count(*) from public.cert_lookups where event_id = ev.id and at > now() - interval '1 minute') >= 40 then return 'busy'; end if;
  insert into public.cert_lookups (event_id) values (ev.id);
  if ev.code is not null and lower(btrim(coalesce(p_code, ''))) <> lower(ev.code) then return 'code'; end if;
  if char_length(clean) < 3 then return 'short'; end if;
  -- Registering twice is harmless
  if exists (select 1 from public.cert_recipients where event_id = ev.id and name_key = public.cert_key(clean)) then return 'registered'; end if;
  if (select count(*) from public.cert_recipients where event_id = ev.id) >= ev.cap then return 'full'; end if;
  insert into public.cert_recipients (event_id, name, name_key) values (ev.id, clean, public.cert_key(clean));
  return 'registered';
end;
$$;

-- The organiser opens (or closes again) the certificates for download
create or replace function public.cert_event_release(p_id uuid, p_released boolean)
returns void
language sql
security definer
set search_path = public
as $$
  update public.cert_events set released = p_released where id = p_id and owner = auth.uid();
$$;

-- ------------------------------------------- record a batch so its certificates can carry a verify QR
-- Called by a signed-in organiser who ticks "Add a verify QR" on a normal download. Returns, for every
-- name, the reference to put in that certificate's QR code: [{ name, ref }, ...]. It stores no design.
create or replace function public.cert_event_record(p_title text, p_issuer text, p_names text[])
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  new_id uuid;
  new_slug text;
  n text;
  rid bigint;
  refs jsonb := '[]'::jsonb;
begin
  if me is null then raise exception 'sign in first'; end if;
  if p_names is null or array_length(p_names, 1) is null then raise exception 'no names'; end if;
  if array_length(p_names, 1) > public.cert_limit() then raise exception 'over limit'; end if;
  if (select count(*) from public.cert_events where owner = me and verify_only and created_at > now() - interval '1 day') >= 100 then
    raise exception 'too many today';
  end if;

  new_slug := substr(replace(gen_random_uuid()::text, '-', ''), 1, 10);
  insert into public.cert_events (owner, slug, title, settings, expires_at, released, verify_only)
  values (me, new_slug, left(btrim(p_title), 120), jsonb_build_object('issuer', nullif(btrim(coalesce(p_issuer, '')), '')),
          now() + interval '3 years', true, true)
  returning id into new_id;

  foreach n in array p_names loop
    if btrim(n) <> '' then
      insert into public.cert_recipients (event_id, name, name_key) values (new_id, left(btrim(n), 120), public.cert_key(n))
      returning id into rid;
      refs := refs || jsonb_build_array(jsonb_build_object('name', left(btrim(n), 120), 'ref', new_slug || '.' || rid));
    end if;
  end loop;
  return refs;
end;
$$;

-- ------------------------------------------------------------ check a certificate (the QR code)
-- Anyone holding a certificate's reference can ask if it is real. The answer is only that one person's
-- name, the event, who issued it and when. A deleted or expired event no longer verifies.
create or replace function public.cert_verify(p_ref text)
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select jsonb_build_object('valid', true, 'name', r.name, 'title', e.title,
                               'issuer', nullif(btrim(coalesce(e.settings->>'issuer', '')), ''), 'issued', e.created_at)
       from public.cert_events e
       join public.cert_recipients r on r.event_id = e.id
      where e.slug = split_part(p_ref, '.', 1)
        and r.id::text = split_part(p_ref, '.', 2)
        and e.released and e.expires_at > now()),
    jsonb_build_object('valid', false));
$$;

-- Who may call what: the claim functions are public; creating needs a signed-in person
revoke all on function public.cert_event_create(text, jsonb, text, text[], integer) from public, anon;
grant execute on function public.cert_event_create(text, jsonb, text, text[], integer) to authenticated;
revoke all on function public.cert_event_open(text, jsonb, text, integer, integer) from public, anon;
grant execute on function public.cert_event_open(text, jsonb, text, integer, integer) to authenticated;
revoke all on function public.cert_event_release(uuid, boolean) from public, anon;
grant execute on function public.cert_event_release(uuid, boolean) to authenticated;
grant execute on function public.cert_register(text, text, text) to anon, authenticated;
grant execute on function public.cert_event_info(text) to anon, authenticated;
grant execute on function public.cert_claim(text, text, text) to anon, authenticated;
grant execute on function public.cert_verify(text) to anon, authenticated;
grant execute on function public.cert_limit() to anon, authenticated;
revoke all on function public.cert_event_record(text, text, text[]) from public, anon;
grant execute on function public.cert_event_record(text, text, text[]) to authenticated;
