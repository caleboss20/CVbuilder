-- Payments for CV11: GH₵ 5 unlocks downloading one CV for 30 days.
-- Run this once in Supabase: SQL Editor > New query > paste > Run. It is safe to run again.
--
-- The app only ever uses the public anon key, never the service-role key, so the rules live here:
--   * pay_settings      the price and how long a payment lasts, plus a private secret (see below)
--   * payments          one row per attempt; a row becomes 'paid' only through payment_confirm()
--   * payment_start()   the student's server request creates a pending row and returns its reference
--   * payment_confirm() our SERVER calls this after Paystack says the money arrived. It needs the
--                       secret below, so a student cannot mark their own payment as paid.
--   * cv_access()       the student asks "have I paid for this CV, and until when?"
--
-- AFTER RUNNING: open the table pay_settings in Supabase, copy the value of `confirm_secret`, and
-- save it as PAYMENT_CONFIRM_SECRET in .env.local and in Vercel (sensitive). Never put it in the browser.

-- ---------------------------------------------------------------- settings
create table if not exists public.pay_settings (
  id boolean primary key default true check (id),              -- one row only
  price_pesewas integer not null default 500,                  -- 500 pesewas = GH₵ 5
  valid_days integer not null default 30,                      -- how long one payment keeps downloads open
  confirm_secret text not null default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
);
insert into public.pay_settings (id) values (true) on conflict do nothing;

alter table public.pay_settings enable row level security;
-- Only the owner can see (or change) these, because the secret is in here
drop policy if exists "owner reads pay settings" on public.pay_settings;
create policy "owner reads pay settings" on public.pay_settings for select using (public.is_admin());
drop policy if exists "owner edits pay settings" on public.pay_settings;
create policy "owner edits pay settings" on public.pay_settings for update using (public.is_admin());

-- ---------------------------------------------------------------- payments
create table if not exists public.payments (
  reference text primary key,                                  -- what we send to Paystack
  user_id uuid not null references auth.users (id) on delete cascade,
  cv_id text not null check (char_length(cv_id) between 1 and 100),
  amount_pesewas integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid')),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  expires_at timestamptz
);
create index if not exists payments_user_cv on public.payments (user_id, cv_id);

alter table public.payments enable row level security;
-- A student sees their own payments, the owner sees all. Nobody can write directly.
drop policy if exists "read own payments" on public.payments;
create policy "read own payments" on public.payments for select using (user_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------- start a payment
-- Called with the student's own token. The price comes from pay_settings, never from the browser.
create or replace function public.payment_start(p_cv_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
  price integer;
  ref text := 'cv11_' || replace(gen_random_uuid()::text, '-', '');
begin
  if me is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if p_cv_id is null or char_length(p_cv_id) not between 1 and 100 then
    raise exception 'bad cv id' using errcode = '22023';
  end if;

  select price_pesewas into price from public.pay_settings limit 1;
  insert into public.payments (reference, user_id, cv_id, amount_pesewas) values (ref, me, p_cv_id, price);

  return jsonb_build_object('reference', ref, 'amount', price);
end;
$$;

-- --------------------------------------------------------- confirm a payment
-- Called by OUR server (anon key + secret) once Paystack has confirmed the money. Safe to call twice.
create or replace function public.payment_confirm(p_reference text, p_amount integer, p_secret text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  cfg public.pay_settings;
  pay public.payments;
begin
  select * into cfg from public.pay_settings limit 1;
  if p_secret is distinct from cfg.confirm_secret then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select * into pay from public.payments where reference = p_reference;
  if not found or p_amount < pay.amount_pesewas then
    return false;
  end if;

  -- Already paid: nothing more to do (Paystack may tell us twice: the redirect and the webhook)
  if pay.status = 'paid' then
    return true;
  end if;

  update public.payments
    set status = 'paid', paid_at = now(), expires_at = now() + make_interval(days => cfg.valid_days)
    where reference = p_reference;
  return true;
end;
$$;

-- ------------------------------------------------------------ check access
-- {paid, expires_at} for the signed-in student and one CV. The owner always has access.
create or replace function public.cv_access(p_cv_id text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  valid_until timestamptz;
begin
  if auth.uid() is null then
    return jsonb_build_object('paid', false);
  end if;
  if public.is_admin() then
    return jsonb_build_object('paid', true, 'owner', true);
  end if;

  select max(expires_at) into valid_until from public.payments
    where user_id = auth.uid() and cv_id = p_cv_id and status = 'paid' and expires_at > now();

  return jsonb_build_object('paid', valid_until is not null, 'expires_at', valid_until);
end;
$$;

-- ------------------------------------------------------------------ access
revoke all on function public.payment_start(text) from public, anon;
revoke all on function public.cv_access(text) from public, anon;
grant execute on function public.payment_start(text) to authenticated;
grant execute on function public.cv_access(text) to authenticated;
-- payment_confirm is called by the server with the anon key, so anon may run it; the secret is the lock
revoke all on function public.payment_confirm(text, integer, text) from public;
grant execute on function public.payment_confirm(text, integer, text) to anon, authenticated;
