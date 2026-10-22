-- The CV11 partner (affiliate) programme: a partner brings paying customers with a code and earns a flat
-- reward on each confirmed payment. Run this once in Supabase: SQL Editor > New query > paste > Run.
-- It is safe to run again. It needs payments.sql and schema.sql (for is_admin) to have been run first.
--
-- How it works
--   * Anyone signed in applies with affiliate_apply(). They start as 'pending'.
--   * You approve in the Supabase table editor: open the table "affiliates", set `code` (capital letters
--     and digits, for example KOFI) and `status` to approved. Set status to paused to switch a partner off.
--   * A customer types the code (or arrives through a link ending ?p=KOFI) when paying. payment_start()
--     records the code and the reward on that payment. A partner cannot use their own code.
--   * A reward counts as owed once the payment is `partner_hold_days` old (14 days by default), so refunds
--     and disputes can sort themselves out first.
--   * You pay partners by MoMo, then record it in the table "affiliate_payouts" (affiliate_id, amount in
--     pesewas, a note). The admin dashboard shows who is owed what.
-- Settings live in pay_settings: partner_commission_percent (6 = 6% of each payment), partner_hold_days, partners_open.

-- ---------------------------------------------------------------- settings
alter table public.pay_settings add column if not exists partner_commission_percent numeric(5, 2) not null default 6 check (partner_commission_percent between 0 and 100);
alter table public.pay_settings add column if not exists partner_hold_days integer not null default 14 check (partner_hold_days >= 0);
alter table public.pay_settings add column if not exists partners_open boolean not null default true;

-- ---------------------------------------------------------------- partners
create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (char_length(phone) between 7 and 20),
  note text check (note is null or char_length(note) <= 500),
  code text unique check (code ~ '^[A-Z0-9]{3,12}$'),
  status text not null default 'pending' check (status in ('pending', 'approved', 'paused')),
  created_at timestamptz not null default now()
);
alter table public.affiliates enable row level security;
drop policy if exists "partner reads own row" on public.affiliates;
create policy "partner reads own row" on public.affiliates for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "owner edits partners" on public.affiliates;
create policy "owner edits partners" on public.affiliates for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "owner deletes partners" on public.affiliates;
create policy "owner deletes partners" on public.affiliates for delete using (public.is_admin());

create table if not exists public.affiliate_payouts (
  id bigserial primary key,
  affiliate_id uuid not null references public.affiliates (id) on delete cascade,
  amount_pesewas integer not null check (amount_pesewas > 0),
  paid_at timestamptz not null default now(),
  note text
);
alter table public.affiliate_payouts enable row level security;
drop policy if exists "owner manages payouts" on public.affiliate_payouts;
create policy "owner manages payouts" on public.affiliate_payouts for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "partner reads own payouts" on public.affiliate_payouts;
create policy "partner reads own payouts" on public.affiliate_payouts for select
  using (exists (select 1 from public.affiliates a where a.id = affiliate_id and a.user_id = auth.uid()));

-- ---------------------------------------------------------------- payments remember the partner
alter table public.payments add column if not exists partner_code text;
alter table public.payments add column if not exists commission_pesewas integer not null default 0;
create index if not exists payments_partner on public.payments (partner_code) where partner_code is not null;

-- ---------------------------------------------------------------- apply
create or replace function public.affiliate_apply(p_name text, p_phone text, p_note text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := auth.uid();
begin
  if me is null then raise exception 'not signed in' using errcode = '42501'; end if;
  if not (select partners_open from public.pay_settings limit 1) then
    raise exception 'closed' using errcode = '22023';
  end if;
  insert into public.affiliates (user_id, name, phone, note)
  values (me, left(btrim(p_name), 100), left(btrim(p_phone), 20), left(btrim(coalesce(p_note, '')), 500))
  on conflict (user_id) do update
    set name = excluded.name, phone = excluded.phone, note = excluded.note
    where public.affiliates.status = 'pending';
end;
$$;

-- ---------------------------------------------------------------- start a payment (now with an optional partner code)
drop function if exists public.payment_start(text);
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

-- ---------------------------------------------------------------- a partner's own numbers
create or replace function public.affiliate_me()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  aff public.affiliates;
  hold integer;
  earned integer;
  matured integer;
  paid_out integer;
  customers integer;
begin
  if auth.uid() is null then return jsonb_build_object('status', 'none'); end if;
  select * into aff from public.affiliates where user_id = auth.uid();
  if not found then return jsonb_build_object('status', 'none'); end if;
  if aff.code is null then
    return jsonb_build_object('status', aff.status, 'name', aff.name);
  end if;

  select partner_hold_days into hold from public.pay_settings limit 1;
  select count(*), coalesce(sum(commission_pesewas), 0),
         coalesce(sum(commission_pesewas) filter (where paid_at <= now() - make_interval(days => hold)), 0)
    into customers, earned, matured
    from public.payments where partner_code = aff.code and status = 'paid';
  select coalesce(sum(amount_pesewas), 0) into paid_out from public.affiliate_payouts where affiliate_id = aff.id;

  return jsonb_build_object('status', aff.status, 'name', aff.name, 'code', aff.code, 'customers', customers,
    'earned', earned, 'owed', greatest(matured - paid_out, 0), 'waiting', earned - matured, 'paid_out', paid_out, 'hold_days', hold);
end;
$$;

-- ---------------------------------------------------------------- the owner's list for the dashboard
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
        'name', a.name, 'phone', a.phone, 'email', u.email, 'code', a.code, 'status', a.status, 'note', a.note,
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

-- ---------------------------------------------------------------- who may call what
revoke all on function public.affiliate_apply(text, text, text) from public, anon;
grant execute on function public.affiliate_apply(text, text, text) to authenticated;
revoke all on function public.payment_start(text, text) from public, anon;
grant execute on function public.payment_start(text, text) to authenticated;
revoke all on function public.affiliate_me() from public, anon;
grant execute on function public.affiliate_me() to authenticated;
revoke all on function public.admin_affiliates() from public, anon;
grant execute on function public.admin_affiliates() to authenticated;

-- The CV price is GH₵ 7 again (700 pesewas). Change price_pesewas in pay_settings any time.
update public.pay_settings set price_pesewas = 700 where price_pesewas = 500;
