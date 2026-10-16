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
