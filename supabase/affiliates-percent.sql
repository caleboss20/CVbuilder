-- Switches the partner reward from a flat amount to a percentage of each payment (6% by default).
-- Run this once in Supabase: SQL Editor > New query > paste > Run. It is safe to run again.
-- (supabase/affiliates.sql already contains this for new set-ups; this file is for a database that ran the earlier version.)

alter table public.pay_settings add column if not exists partner_commission_percent numeric(5, 2) not null default 6 check (partner_commission_percent between 0 and 100);

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
