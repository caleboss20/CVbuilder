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
