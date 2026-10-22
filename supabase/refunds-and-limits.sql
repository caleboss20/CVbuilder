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
