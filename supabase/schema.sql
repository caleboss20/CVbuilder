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
