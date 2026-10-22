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
