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
  if array_length(p_names, 1) > 500 then raise exception 'too many names'; end if;
  if length(p_settings::text) > 900000 then raise exception 'design too large'; end if;
  if (select count(*) from public.cert_events where owner = me and expires_at > now()) >= 20 then
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
    (select jsonb_build_object('title', title, 'needsCode', code is not null)
       from public.cert_events where slug = p_slug and expires_at > now()),
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
begin
  select * into ev from public.cert_events where slug = p_slug;
  if not found or ev.expires_at <= now() then return jsonb_build_object('status', 'gone'); end if;

  -- Slow down guessing: at most 40 lookups a minute per event
  delete from public.cert_lookups where at < now() - interval '1 hour';
  if (select count(*) from public.cert_lookups where event_id = ev.id and at > now() - interval '1 minute') >= 40 then
    return jsonb_build_object('status', 'busy');
  end if;
  insert into public.cert_lookups (event_id) values (ev.id);

  if ev.code is not null and lower(btrim(coalesce(p_code, ''))) <> lower(ev.code) then
    return jsonb_build_object('status', 'code');
  end if;
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
  return jsonb_build_object('status', 'ok', 'name', hits[1], 'title', ev.title, 'settings', ev.settings);
end;
$$;

-- Who may call what: the claim functions are public; creating needs a signed-in person
revoke all on function public.cert_event_create(text, jsonb, text, text[], integer) from public, anon;
grant execute on function public.cert_event_create(text, jsonb, text, text[], integer) to authenticated;
grant execute on function public.cert_event_info(text) to anon, authenticated;
grant execute on function public.cert_claim(text, text, text) to anon, authenticated;
