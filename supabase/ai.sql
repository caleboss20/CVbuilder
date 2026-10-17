-- AI usage limits for CV11.
-- Run this once in Supabase: SQL Editor > New query > paste > Run. It is safe to run again.
--
-- What it gives us:
--   * ai_settings   the daily limits, editable by the owner without any code change
--   * ai_usage      how many AI requests each person made each day (also feeds the admin dashboard)
--   * ai_use_credit()    called by the server before every AI request: counts it and says yes or no
--   * ai_refund_credit() called if the AI failed, so a student is not charged for our error
--
-- Only the public anon key is used by the app, so these functions run as the signed-in person
-- (auth.uid()) and are written so nobody can read or change anyone else's counts.

-- ---------------------------------------------------------------- settings
create table if not exists public.ai_settings (
  id boolean primary key default true check (id),       -- one row only
  per_user_daily integer not null default 5,             -- free AI requests per student per day
  site_daily integer not null default 450  -- AI requests for the whole site per day (Google's free limit is 500)
);
insert into public.ai_settings (id) values (true) on conflict do nothing;
-- Earlier versions of this file started at 300; raise it to fit the free Flash-Lite allowance
update public.ai_settings set site_daily = 450 where site_daily = 300;

alter table public.ai_settings enable row level security;
drop policy if exists "owner reads ai settings" on public.ai_settings;
create policy "owner reads ai settings" on public.ai_settings for select using (public.is_admin());
drop policy if exists "owner edits ai settings" on public.ai_settings;
create policy "owner edits ai settings" on public.ai_settings for update using (public.is_admin());

-- ------------------------------------------------------------------- usage
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null default (now() at time zone 'utc')::date,
  used integer not null default 0,
  primary key (user_id, day)
);

alter table public.ai_usage enable row level security;
-- A student may see only their own count; the owner may see all of them
drop policy if exists "read own ai usage" on public.ai_usage;
create policy "read own ai usage" on public.ai_usage for select using (user_id = auth.uid() or public.is_admin());
-- No insert/update policy: counts change only through the functions below

-- ------------------------------------------------------------- the checkpoint
-- Returns {allowed, reason, remaining}. reason is 'user_limit' or 'site_limit' when not allowed.
-- The owner is never stopped by the per-person limit, but still counts towards the site total.
create or replace function public.ai_use_credit()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  today date := (now() at time zone 'utc')::date;
  limits public.ai_settings;
  site_total integer;
  mine integer;
  is_owner boolean := public.is_admin();
begin
  if me is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;

  select * into limits from public.ai_settings limit 1;

  select coalesce(sum(used), 0) into site_total from public.ai_usage where day = today;
  if site_total >= limits.site_daily then
    return jsonb_build_object('allowed', false, 'reason', 'site_limit', 'remaining', 0);
  end if;

  -- Take the credit in one statement so two quick taps cannot both slip under the limit
  insert into public.ai_usage (user_id, day, used) values (me, today, 1)
  on conflict (user_id, day) do update set used = public.ai_usage.used + 1
    where is_owner or public.ai_usage.used < limits.per_user_daily
  returning used into mine;

  if mine is null then
    return jsonb_build_object('allowed', false, 'reason', 'user_limit', 'remaining', 0);
  end if;

  return jsonb_build_object('allowed', true, 'remaining', greatest(limits.per_user_daily - mine, 0));
end;
$$;

-- Gives the credit back after an AI failure
create or replace function public.ai_refund_credit()
returns void
language sql
security definer
set search_path = public
as $$
  update public.ai_usage set used = greatest(used - 1, 0)
  where user_id = auth.uid() and day = (now() at time zone 'utc')::date;
$$;

revoke all on function public.ai_use_credit() from public, anon;
revoke all on function public.ai_refund_credit() from public, anon;
grant execute on function public.ai_use_credit() to authenticated;
grant execute on function public.ai_refund_credit() to authenticated;
