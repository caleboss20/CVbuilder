-- CV11: run this in Supabase (SQL Editor > New query > paste > Run).
-- It is safe to run more than once: it only creates what is missing and refreshes the rules.
--
-- One row per student holding their saved CV, letter and signature as JSON. Row level security
-- means a signed-in student can only ever read or change their own row.

create table if not exists public.cv_sync (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.cv_sync enable row level security;

drop policy if exists "Students read their own saved CV" on public.cv_sync;
create policy "Students read their own saved CV"
  on public.cv_sync for select
  using (auth.uid() = user_id);

drop policy if exists "Students create their own saved CV" on public.cv_sync;
create policy "Students create their own saved CV"
  on public.cv_sync for insert
  with check (auth.uid() = user_id);

drop policy if exists "Students update their own saved CV" on public.cv_sync;
create policy "Students update their own saved CV"
  on public.cv_sync for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Students delete their own saved CV" on public.cv_sync;
create policy "Students delete their own saved CV"
  on public.cv_sync for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------------------------
-- Anonymous usage counter. One small row per event (first visit, CV started, CV downloaded...).
-- It holds no name, email or CV content: only the event name, a random id for the device, a few
-- words such as the template name, and the time.
--
-- Visitors can ADD rows but can never read them back. You read the totals in the SQL Editor
-- (see supabase/stats.sql), which is not affected by these rules.
-- ---------------------------------------------------------------------------------------------

create table if not exists public.events (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) <= 40),
  device text not null check (char_length(device) <= 64),
  props jsonb not null default '{}'::jsonb check (pg_column_size(props) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists events_name_created_idx on public.events (name, created_at);

alter table public.events enable row level security;

drop policy if exists "Anyone can add an event" on public.events;
create policy "Anyone can add an event"
  on public.events for insert
  to anon, authenticated
  with check (true);

-- ---------------------------------------------------------------------------------------------
-- Admin dashboard (/admin). Only the emails listed in public.admins can read the numbers.
--
-- After running this file, add yourself ONCE (use the email you log in with, in quotes):
--   insert into public.admins (email) values ('you@example.com');
-- ---------------------------------------------------------------------------------------------

create table if not exists public.admins (
  email text primary key
);

-- No policies on purpose: nobody can read or change this list through the website
alter table public.admins enable row level security;

-- True when the signed-in person's confirmed email is on the admin list
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Everything the dashboard shows, in one call. `days` is the period (1 to 365).
create or replace function public.admin_stats(days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  span integer := greatest(1, least(coalesce(days, 30), 365));
  since timestamptz := now() - make_interval(days => span);
  earlier timestamptz := now() - make_interval(days => span * 2);
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'days', span,
    'totals', (
      select jsonb_build_object(
        'people', count(*) filter (where name = 'first_visit'),
        'cvs_started', count(*) filter (where name = 'cv_started'),
        'cvs_finished', count(*) filter (where name = 'cv_downloaded'),
        'letters', count(*) filter (where name = 'letter_downloaded'),
        'letters_signed', count(*) filter (where name = 'letter_signed'),
        'shares', count(*) filter (where name = 'share_whatsapp'),
        'backups', count(*) filter (where name = 'cv_backup_saved'),
        'active_devices', count(distinct device)
      ) from public.events where created_at >= since
    ),
    'previous', (
      select jsonb_build_object(
        'people', count(*) filter (where name = 'first_visit'),
        'cvs_started', count(*) filter (where name = 'cv_started'),
        'cvs_finished', count(*) filter (where name = 'cv_downloaded'),
        'letters', count(*) filter (where name = 'letter_downloaded'),
        'active_devices', count(distinct device)
      ) from public.events where created_at >= earlier and created_at < since
    ),
    'all_time', (
      select jsonb_build_object(
        'people', count(*) filter (where name = 'first_visit'),
        'cvs_started', count(*) filter (where name = 'cv_started'),
        'cvs_finished', count(*) filter (where name = 'cv_downloaded')
      ) from public.events
    ),
    'accounts', (select count(*) from auth.users),
    'daily', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'day', to_char(g.day, 'YYYY-MM-DD'),
        'people', coalesce(c.people, 0),
        'cvs_started', coalesce(c.started, 0),
        'cvs_finished', coalesce(c.finished, 0)
      ) order by g.day), '[]'::jsonb)
      from generate_series(since::date, now()::date, interval '1 day') as g(day)
      left join (
        select created_at::date as day,
          count(*) filter (where name = 'first_visit') as people,
          count(*) filter (where name = 'cv_started') as started,
          count(*) filter (where name = 'cv_downloaded') as finished
        from public.events
        where created_at >= since
        group by 1
      ) c on c.day = g.day::date
    ),
    'templates', (
      select coalesce(jsonb_agg(jsonb_build_object('name', t.label, 'count', t.n) order by t.n desc), '[]'::jsonb)
      from (
        select coalesce(props ->> 'template', 'Unknown') as label, count(*) as n
        from public.events
        where name = 'cv_downloaded' and created_at >= since
        group by 1 order by n desc limit 8
      ) t
    ),
    'funnel', (
      select jsonb_build_object(
        'started', count(distinct device) filter (where name = 'cv_started'),
        'finished', count(distinct device) filter (where name = 'cv_downloaded')
      ) from public.events where created_at >= since
    )
  );
end;
$$;

-- Only signed-in people can call it, and the function itself checks the admin list
revoke all on function public.admin_stats(integer) from public, anon;
grant execute on function public.admin_stats(integer) to authenticated;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
