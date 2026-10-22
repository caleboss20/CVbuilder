-- ONE FILE for the affiliate program updates: run it once in Supabase (SQL Editor > New query > paste > Run).
-- It holds, in order: affiliates-percent, affiliate-activity, admin-affiliate-actions, refunds-and-limits, admin-flagged, affiliate-profile, then sets the commission to 25%.
-- Safe to run again. Needs affiliates.sql, payments.sql and schema.sql to have been run before (they were).

-- ================================================================ affiliates-percent
-- Switches the partner reward from a flat amount to a percentage of each payment (25% by default).
-- Run this once in Supabase: SQL Editor > New query > paste > Run. It is safe to run again.
-- (supabase/affiliates.sql already contains this for new set-ups; this file is for a database that ran the earlier version.)

alter table public.pay_settings add column if not exists partner_commission_percent numeric(5, 2) not null default 25 check (partner_commission_percent between 0 and 100);

create or replace function public.payment_start(p_cv_id text, p_partner text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  cfg public.pay_settings;
  aff public.affiliates;
  ref text := 'cv11_' || replace(gen_random_uuid()::text, '-', '');
  partner text := null;
  reward integer := 0;
begin
  if me is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if p_cv_id is null or char_length(p_cv_id) not between 1 and 100 then
    raise exception 'bad cv id' using errcode = '22023';
  end if;

  select * into cfg from public.pay_settings limit 1;

  if p_partner is not null and btrim(p_partner) <> '' then
    select * into aff from public.affiliates where code = upper(btrim(p_partner)) and status = 'approved';
    if not found then raise exception 'unknown partner code' using errcode = '22023'; end if;
    if aff.user_id = me then raise exception 'own code' using errcode = '22023'; end if;
    partner := aff.code;
    reward := round(cfg.price_pesewas * cfg.partner_commission_percent / 100)::integer;
  end if;

  insert into public.payments (reference, user_id, cv_id, amount_pesewas, partner_code, commission_pesewas)
  values (ref, me, p_cv_id, cfg.price_pesewas, partner, reward);

  return jsonb_build_object('reference', ref, 'amount', cfg.price_pesewas);
end;
$$;

-- ================================================================ affiliate-activity
-- The affiliate's own activity: each CV paid with their code, each payout recorded for them, and their earnings
-- for each of the last 30 days. Shows no customer details, only the date, the amounts and whether the reward is
-- owed yet. Run this once in Supabase: SQL Editor > New query > paste > Run. It is safe to run again.
-- (Needs supabase/affiliates.sql to have been run first.)

create or replace function public.affiliate_activity()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  aff public.affiliates;
  hold integer;
begin
  select * into aff from public.affiliates where user_id = auth.uid();
  if not found or aff.status <> 'approved' then
    return jsonb_build_object('referrals', '[]'::jsonb, 'payouts', '[]'::jsonb, 'daily', '[]'::jsonb);
  end if;
  select partner_hold_days into hold from public.pay_settings limit 1;

  return jsonb_build_object(
    'referrals', coalesce((
      select jsonb_agg(r order by r.paid_at desc) from (
        select paid_at, amount_pesewas as amount, commission_pesewas as reward,
               (paid_at <= now() - make_interval(days => hold)) as owed
        from public.payments
        where partner_code = aff.code and status = 'paid'
        order by paid_at desc limit 50
      ) r
    ), '[]'::jsonb),
    'payouts', coalesce((
      select jsonb_agg(p order by p.paid_at desc) from (
        select paid_at, amount_pesewas as amount, note
        from public.affiliate_payouts where affiliate_id = aff.id
        order by paid_at desc limit 50
      ) p
    ), '[]'::jsonb),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', d.day, 'earned', coalesce(e.earned, 0)) order by d.day)
      from generate_series(current_date - 29, current_date, interval '1 day') as d(day)
      left join (
        select paid_at::date as day, sum(commission_pesewas) as earned
        from public.payments
        where partner_code = aff.code and status = 'paid' and paid_at >= current_date - 29
        group by 1
      ) e on e.day = d.day::date
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.affiliate_activity() from public, anon;
grant execute on function public.affiliate_activity() to authenticated;

-- ================================================================ admin-affiliate-actions
-- Lets the owner approve, pause and pay affiliates from the admin dashboard instead of editing tables by hand.
-- Run this once in Supabase: SQL Editor > New query > paste > Run. It is safe to run again.
-- (Needs supabase/affiliates.sql to have been run first.)

-- The list now also returns each affiliate's id, which the buttons need
create or replace function public.admin_affiliates()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  hold integer;
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  select partner_hold_days into hold from public.pay_settings limit 1;
  return coalesce((
    select jsonb_agg(entry order by (entry ->> 'owed')::int desc, entry ->> 'name')
    from (
      select jsonb_build_object(
        'id', a.id, 'name', a.name, 'phone', a.phone, 'email', u.email, 'code', a.code, 'status', a.status, 'note', a.note,
        'customers', coalesce(p.customers, 0), 'earned', coalesce(p.earned, 0),
        'owed', greatest(coalesce(p.matured, 0) - coalesce(o.paid_out, 0), 0),
        'waiting', coalesce(p.earned, 0) - coalesce(p.matured, 0), 'paid_out', coalesce(o.paid_out, 0)) as entry
      from public.affiliates a
      join auth.users u on u.id = a.user_id
      left join (
        select partner_code, count(*) as customers, sum(commission_pesewas) as earned,
               sum(commission_pesewas) filter (where paid_at <= now() - make_interval(days => hold)) as matured
        from public.payments where status = 'paid' and partner_code is not null group by partner_code
      ) p on p.partner_code = a.code
      left join (select affiliate_id, sum(amount_pesewas) as paid_out from public.affiliate_payouts group by affiliate_id) o on o.affiliate_id = a.id
    ) t
  ), '[]'::jsonb);
end;
$$;

-- Approve an application with a code (capital letters and digits, 3 to 12), or pause / resume an affiliate
create or replace function public.admin_affiliate_set(p_id uuid, p_status text, p_code text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean text := upper(btrim(coalesce(p_code, '')));
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_status not in ('approved', 'paused') then raise exception 'bad status' using errcode = '22023'; end if;
  if clean <> '' then
    if clean !~ '^[A-Z0-9]{3,12}$' then raise exception 'bad code' using errcode = '22023'; end if;
    update public.affiliates set code = clean where id = p_id;
  end if;
  if p_status = 'approved' and not exists (select 1 from public.affiliates where id = p_id and code is not null) then
    raise exception 'a code is needed to approve' using errcode = '22023';
  end if;
  update public.affiliates set status = p_status where id = p_id;
end;
$$;

-- Record a payout after sending the money by mobile money
create or replace function public.admin_affiliate_payout(p_id uuid, p_amount_pesewas integer, p_note text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  if p_amount_pesewas is null or p_amount_pesewas <= 0 then raise exception 'bad amount' using errcode = '22023'; end if;
  insert into public.affiliate_payouts (affiliate_id, amount_pesewas, note) values (p_id, p_amount_pesewas, nullif(btrim(coalesce(p_note, '')), ''));
end;
$$;

revoke all on function public.admin_affiliates() from public, anon;
grant execute on function public.admin_affiliates() to authenticated;
revoke all on function public.admin_affiliate_set(uuid, text, text) from public, anon;
grant execute on function public.admin_affiliate_set(uuid, text, text) to authenticated;
revoke all on function public.admin_affiliate_payout(uuid, integer, text) from public, anon;
grant execute on function public.admin_affiliate_payout(uuid, integer, text) to authenticated;

-- ================================================================ refunds-and-limits
-- Refunds and fraud limits for the affiliate program.
-- Run this once in Supabase: SQL Editor > New query > paste > Run. It is safe to run again.
-- (Needs payments.sql, affiliates.sql and affiliates-percent.sql to have been run first.)
--
-- REFUNDS: when you refund a payment on Paystack, mark it here too (admin dashboard > Affiliates > "Refund a payment").
-- The payment becomes "refunded": the reward is cancelled (it no longer counts as earned or owed), the student's
-- download access from that payment ends, and it no longer counts as revenue. A refunded payment can never turn back into
-- "paid" by itself, even if Paystack sends the confirmation again.
--
-- LIMITS (in pay_settings, change the numbers there):
--   partner_daily_cap  how many rewarded payments one code may earn in 24 hours (default 30)
--   partner_buyer_cap  how many rewarded payments one paying account may give one code in total (default 3)
-- A payment over a limit still works for the student, it just earns no reward, and is flagged so you can look at it.
-- The student is never told, so nobody learns where the limit is.

-- ---------------------------------------------------------------- refunded status
alter table public.payments drop constraint if exists payments_status_check;
alter table public.payments add constraint payments_status_check check (status in ('pending', 'paid', 'refunded'));
alter table public.payments add column if not exists refunded_at timestamptz;
alter table public.payments add column if not exists partner_flag text;

-- A refunded payment stays refunded: ignore any later update that tries to change it back
create or replace function public.payments_keep_refunded()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'refunded' and new.status <> 'refunded' then
    new.status := old.status;
    new.paid_at := old.paid_at;
    new.expires_at := old.expires_at;
  end if;
  return new;
end;
$$;
drop trigger if exists payments_keep_refunded on public.payments;
create trigger payments_keep_refunded before update on public.payments for each row execute function public.payments_keep_refunded();

-- The owner marks a payment refunded (after refunding it on Paystack)
create or replace function public.admin_payment_refund(p_reference text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  update public.payments set status = 'refunded', refunded_at = now()
    where reference = btrim(p_reference) and status = 'paid';
  if not found then raise exception 'no paid payment with that reference' using errcode = '22023'; end if;
end;
$$;
revoke all on function public.admin_payment_refund(text) from public, anon;
grant execute on function public.admin_payment_refund(text) to authenticated;

-- ---------------------------------------------------------------- limits
alter table public.pay_settings add column if not exists partner_daily_cap integer not null default 30 check (partner_daily_cap >= 1);
alter table public.pay_settings add column if not exists partner_buyer_cap integer not null default 3 check (partner_buyer_cap >= 1);

create or replace function public.payment_start(p_cv_id text, p_partner text default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  cfg public.pay_settings;
  aff public.affiliates;
  ref text := 'cv11_' || replace(gen_random_uuid()::text, '-', '');
  partner text := null;
  reward integer := 0;
  flag text := null;
begin
  if me is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if p_cv_id is null or char_length(p_cv_id) not between 1 and 100 then
    raise exception 'bad cv id' using errcode = '22023';
  end if;

  select * into cfg from public.pay_settings limit 1;

  if p_partner is not null and btrim(p_partner) <> '' then
    select * into aff from public.affiliates where code = upper(btrim(p_partner)) and status = 'approved';
    if not found then raise exception 'unknown partner code' using errcode = '22023'; end if;
    if aff.user_id = me then raise exception 'own code' using errcode = '22023'; end if;

    -- Over a limit: the payment goes ahead, with no reward and a flag for the owner
    if (select count(*) from public.payments where partner_code = aff.code and status = 'paid' and paid_at > now() - interval '24 hours') >= cfg.partner_daily_cap then
      flag := 'daily cap';
    elsif (select count(*) from public.payments where partner_code = aff.code and user_id = me and status = 'paid') >= cfg.partner_buyer_cap then
      flag := 'buyer cap';
    else
      partner := aff.code;
      reward := round(cfg.price_pesewas * cfg.partner_commission_percent / 100)::integer;
    end if;
  end if;

  insert into public.payments (reference, user_id, cv_id, amount_pesewas, partner_code, commission_pesewas, partner_flag)
  values (ref, me, p_cv_id, cfg.price_pesewas, partner, reward, flag);

  return jsonb_build_object('reference', ref, 'amount', cfg.price_pesewas);
end;
$$;

-- ================================================================ admin-flagged
-- Shows the owner which payments went over an affiliate limit (they earned no reward).
-- Run this once in Supabase: SQL Editor > New query > paste > Run. It is safe to run again.
-- (Needs supabase/refunds-and-limits.sql to have been run first.)

create or replace function public.admin_flagged_payments()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'not allowed' using errcode = '42501'; end if;
  return coalesce((
    select jsonb_agg(f order by f.paid_at desc) from (
      select p.reference, p.partner_flag as flag, p.paid_at, p.amount_pesewas as amount, u.email as buyer
      from public.payments p
      join auth.users u on u.id = p.user_id
      where p.partner_flag is not null and p.status = 'paid'
      order by p.paid_at desc limit 50
    ) f
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.admin_flagged_payments() from public, anon;
grant execute on function public.admin_flagged_payments() to authenticated;

-- ================================================================ affiliate-profile
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

-- ================================================================ commission 25%
update public.pay_settings set partner_commission_percent = 25;
