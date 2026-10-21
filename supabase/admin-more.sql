-- More numbers for the admin dashboard: money, certificates, shared events, bigger-batch unlocks, AI use.
-- Run this once in Supabase: SQL Editor > New query > paste > Run. It is safe to run again.
-- It needs schema.sql, payments.sql and share.sql (run share.sql again first if it is older than the scan counter) to have been run first (ai.sql is optional).
--
-- admin_overview(days) answers only for people on the admin list (public.is_admin()), like admin_stats().

create or replace function public.admin_overview(days integer default 30)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  span integer := greatest(1, least(coalesce(days, 30), 365));
  since timestamptz := now() - make_interval(days => span);
  ai jsonb := '{}'::jsonb;
begin
  if not public.is_admin() then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  -- AI use, only when ai.sql has been run
  if to_regclass('public.ai_usage') is not null then
    execute 'select jsonb_build_object(''used_period'', coalesce(sum(used), 0), ''users_period'', count(distinct user_id), '
         || '''used_today'', coalesce(sum(used) filter (where day = (now() at time zone ''utc'')::date), 0)) '
         || 'from public.ai_usage where day >= $1'
      into ai using since::date;
  end if;

  return jsonb_build_object(
    'days', span,
    'money', (
      select jsonb_build_object(
        'price_pesewas', (select price_pesewas from public.pay_settings limit 1),
        'paid_total', count(*) filter (where status = 'paid'),
        'revenue_total', coalesce(sum(amount_pesewas) filter (where status = 'paid'), 0),
        'paid_period', count(*) filter (where status = 'paid' and paid_at >= since),
        'revenue_period', coalesce(sum(amount_pesewas) filter (where status = 'paid' and paid_at >= since), 0),
        'pending', count(*) filter (where status = 'pending' and created_at >= since),
        'active_access', count(*) filter (where status = 'paid' and expires_at > now())
      ) from public.payments
    ),
    'recent_payments', (
      select coalesce(jsonb_agg(to_jsonb(x) order by x.paid_at desc), '[]'::jsonb)
      from (
        select p.paid_at, p.amount_pesewas as amount, u.email
        from public.payments p join auth.users u on u.id = p.user_id
        where p.status = 'paid' order by p.paid_at desc limit 10
      ) x
    ),
    'certificates', jsonb_build_object(
      'batches_period', (select count(*) from public.events where name = 'certificates_made' and created_at >= since),
      'made_period', (select coalesce(sum(case when props ->> 'count' ~ '^[0-9]{1,6}$' then (props ->> 'count')::int else 0 end), 0)
                        from public.events where name = 'certificates_made' and created_at >= since),
      'made_total', (select coalesce(sum(case when props ->> 'count' ~ '^[0-9]{1,6}$' then (props ->> 'count')::int else 0 end), 0)
                        from public.events where name = 'certificates_made'),
      'versions_period', (select coalesce(sum(case when props ->> 'count' ~ '^[0-9]{1,6}$' then (props ->> 'count')::int else 0 end), 0)
                        from public.events where name = 'cv_versions_downloaded' and created_at >= since),
      'shared_events', (select count(*) from public.cert_events where not verify_only),
      'shared_active', (select count(*) from public.cert_events where not verify_only and expires_at > now()),
      'collecting', (select count(*) from public.cert_events where mode = 'register' and not released and expires_at > now()),
      'shared_people', (select count(*) from public.cert_recipients r join public.cert_events e on e.id = r.event_id where not e.verify_only),
      'verify_batches', (select count(*) from public.cert_events where verify_only),
      'verify_certificates', (select count(*) from public.cert_recipients r join public.cert_events e on e.id = r.event_id where e.verify_only),
      'verify_scans', (select coalesce(sum(scans), 0) from public.cert_events),
      'organisers', (select count(distinct owner) from public.cert_events)
    ),
    'grants', (
      select coalesce(jsonb_agg(jsonb_build_object('email', u.email, 'max_names', g.max_names, 'expires_at', g.expires_at, 'note', g.note)
                               order by g.expires_at desc), '[]'::jsonb)
      from public.cert_grants g join auth.users u on u.id = g.user_id
      where g.expires_at > now()
    ),
    'signups_period', (select count(*) from auth.users where created_at >= since),
    'ai', ai
  );
end;
$$;

revoke all on function public.admin_overview(integer) from public, anon;
grant execute on function public.admin_overview(integer) to authenticated;

-- One-time: the CV download price is now GH₵ 5 (it was GH₵ 7). Change price_pesewas in pay_settings any time.
update public.pay_settings set price_pesewas = 500 where price_pesewas = 700;
