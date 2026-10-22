-- Keeps the owner's own devices out of the dashboard numbers, for good.
-- Run this once in Supabase: SQL Editor > New query > paste > Run. It is safe to run again.
--
-- How it works: when you (the admin) are logged in on a browser, the site tells the database that this
-- browser's anonymous device id is yours. From then on:
--   * every event already recorded for that device id is deleted, so past visits stop counting, and
--   * any new event from that device id is thrown away before it is saved.
-- So it no longer matters how many browsers, private windows or phones you test with: each one you log
-- in on is removed from the numbers.

create table if not exists public.owner_devices (
  device text primary key check (char_length(device) <= 64),
  created_at timestamptz not null default now()
);
alter table public.owner_devices enable row level security;   -- no policies: only the function below touches it

create or replace function public.mark_owner_device(p_device text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;
  if p_device is null or char_length(p_device) not between 1 and 64 then
    return;
  end if;
  insert into public.owner_devices (device) values (p_device) on conflict do nothing;
  delete from public.events where device = p_device;
end;
$$;

revoke all on function public.mark_owner_device(text) from public, anon;
grant execute on function public.mark_owner_device(text) to authenticated;

-- New events from a marked device are dropped before they are stored
create or replace function public.skip_owner_events()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.owner_devices where device = new.device) then
    return null;
  end if;
  return new;
end;
$$;

drop trigger if exists skip_owner_events on public.events;
create trigger skip_owner_events before insert on public.events
  for each row execute function public.skip_owner_events();
