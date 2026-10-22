-- Lets an affiliate correct their name and mobile money number, safely.
-- Run this once in Supabase: SQL Editor > New query > paste > Run. It is safe to run again.
-- (Needs supabase/affiliates.sql to have been run first.)
--
-- Where the money goes depends on these two details, so once someone is approved a change does not take effect on
-- its own: it waits as a request until the owner confirms it in the admin dashboard (Affiliates > "Profile changes").
-- That way nobody who gets into an affiliate's account can quietly send the payouts somewhere else.

alter table public.affiliates add column if not exists pending_name text check (pending_name is null or char_length(pending_name) between 2 and 100);
alter table public.affiliates add column if not exists pending_phone text check (pending_phone is null or char_length(pending_phone) between 7 and 20);

-- The affiliate asks for a change. Before approval it applies straight away, after approval it waits for the owner.
create or replace function public.affiliate_update_profile(p_name text, p_phone text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  aff public.affiliates;
begin
  select * into aff from public.affiliates where user_id = auth.uid();
  if not found then raise exception 'no affiliate record' using errcode = '42501'; end if;
  if char_length(btrim(p_name)) not between 2 and 100 or char_length(btrim(p_phone)) not between 7 and 20 then
    raise exception 'bad details' using errcode = '22023';
  end if;

  if aff.status = 'pending' then
    update public.affiliates set name = btrim(p_name), phone = btrim(p_phone) where id = aff.id;
    return 'saved';
  end if;
  update public.affiliates set pending_name = btrim(p_name), pending_phone = btrim(p_phone) where id = aff.id;
  return 'requested';
end;
$$;
revoke all on function public.affiliate_update_profile(text, text) from public, anon;
grant execute on function public.affiliate_update_profile(text, text) to authenticated;

-- The owner's list of waiting changes
create or replace function public.admin_affiliate_changes()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  return coalesce((
    select jsonb_agg(c) from (
      select id, code, name, phone, pending_name, pending_phone
      from public.affiliates
      where pending_name is not null or pending_phone is not null
      order by name
    ) c
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.admin_affiliate_changes() from public, anon;
grant execute on function public.admin_affiliate_changes() to authenticated;

-- The owner confirms (true) or rejects (false) a waiting change
create or replace function public.admin_affiliate_decide(p_id uuid, p_accept boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_accept then
    update public.affiliates
      set name = coalesce(pending_name, name), phone = coalesce(pending_phone, phone)
      where id = p_id;
  end if;
  update public.affiliates set pending_name = null, pending_phone = null where id = p_id;
end;
$$;
revoke all on function public.admin_affiliate_decide(uuid, boolean) from public, anon;
grant execute on function public.admin_affiliate_decide(uuid, boolean) to authenticated;
