-- CV11 numbers. Paste one query at a time into Supabase > SQL Editor > New query > Run.
-- These read the anonymous counter. Your own devices are left out if you used /stop-tracking.

-- 1. The big totals
select
  count(*) filter (where name = 'first_visit')    as people,
  count(*) filter (where name = 'cv_started')     as cvs_started,
  count(*) filter (where name = 'cv_downloaded')  as cvs_finished,
  count(*) filter (where name = 'letter_downloaded') as letters_downloaded,
  count(*) filter (where name = 'letter_signed')  as letters_signed,
  count(*) filter (where name = 'share_whatsapp') as whatsapp_shares
from public.events;

-- 2. Students with an account
select count(*) as accounts from auth.users;

-- 3. Per day, for the last 30 days
select
  date_trunc('day', created_at)::date as day,
  count(*) filter (where name = 'first_visit')   as new_people,
  count(*) filter (where name = 'cv_started')    as cvs_started,
  count(*) filter (where name = 'cv_downloaded') as cvs_finished
from public.events
where created_at > now() - interval '30 days'
group by 1
order by 1 desc;

-- 4. Which templates people finish with
select props ->> 'template' as template, count(*) as downloads
from public.events
where name = 'cv_downloaded'
group by 1
order by downloads desc;

-- 5. Of the people who started a CV, how many finished one (same device)
select
  count(distinct device) filter (where name = 'cv_started')    as started,
  count(distinct device) filter (where name = 'cv_downloaded') as finished
from public.events;
