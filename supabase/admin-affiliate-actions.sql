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
