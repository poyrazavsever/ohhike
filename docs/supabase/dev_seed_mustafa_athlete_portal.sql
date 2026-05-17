-- =============================================================================
-- Mustafa — Athlete portal demo (rich /athlete/home data)
-- =============================================================================
--
-- Target: mustafaoguztargiz@gmail.com (Clerk user must exist in public.users)
--
-- Creates a dedicated org so coach demo (ohhike-demo-academy) is untouched:
--   Organization: OhHike Sporcu Portal · slug ohhike-athlete-portal-mustafa
--
-- AFTER RUN (app.ohhike.com or localhost:3001)
--   1. Sign in as Mustafa
--   2. Sidebar → switch workspace to "OhHike Sporcu Portal"
--   3. Open /athlete/home — metrics, program card, sessions, proofs filled
--
-- Safe to re-run (idempotent).
-- =============================================================================

begin;

do $$
declare
  missing text[];
begin
  select array_agg(email)
  into missing
  from (values ('mustafaoguztargiz@gmail.com')) as r(email)
  where not exists (
    select 1 from public.users u where lower(u.email) = lower(r.email)
  );

  if missing is not null then
    raise exception 'Missing user %. Sign in with Clerk once.', missing[1];
  end if;
end $$;

-- Synthetic coach for remote relationship (same org)
insert into public.users (id, email, display_name, avatar_url, locale, timezone)
values (
  'seed_portal_coach_deniz',
  'portal.coach.deniz@ohhike.seed',
  'Deniz Aydın',
  'https://images.unsplash.com/photo-1560272564-c83b66b1ad44?w=256&h=256&fit=crop',
  'tr',
  'Europe/Istanbul'
)
on conflict (id) do update set
  display_name = excluded.display_name,
  avatar_url = excluded.avatar_url,
  updated_at = now();

with
  u_athlete as (
    select id, email, display_name, avatar_url
    from public.users
    where lower(email) = lower('mustafaoguztargiz@gmail.com')
    limit 1
  ),
  u_coach as (
    select id from public.users where id = 'seed_portal_coach_deniz' limit 1
  ),
  ins_org as (
    insert into public.organizations (
      name,
      slug,
      type,
      logo_url,
      country,
      city,
      created_by,
      settings
    )
    select
      'OhHike Sporcu Portal',
      'ohhike-athlete-portal-mustafa',
      'performance_center',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=400&fit=crop',
      'Türkiye',
      'İstanbul',
      u_athlete.id,
      '{"demo": true, "athlete_portal_preview": true}'::jsonb
    from u_athlete
    on conflict (slug) do update set
      name = excluded.name,
      updated_at = now()
    returning id
  ),
  org as (
    select id from ins_org
    union all
    select o.id from public.organizations o
    where o.slug = 'ohhike-athlete-portal-mustafa'
    limit 1
  ),
  ins_team as (
    insert into public.teams (
      organization_id,
      name,
      sport_type,
      age_group,
      level,
      season_goal,
      weekly_training_count
    )
    select
      org.id,
      'Mustafa Performance Squad',
      'football',
      'Senior',
      'Remote + team hybrid',
      'Peak readiness for showcase matches.',
      4
    from org
    where not exists (
      select 1 from public.teams t
      where t.organization_id = org.id
        and t.name = 'Mustafa Performance Squad'
    )
    returning id, organization_id
  ),
  team as (
    select t.id, t.organization_id
    from ins_team t
    union all
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Mustafa Performance Squad'
    limit 1
  )
insert into public.organization_members (organization_id, user_id, role, is_active)
select org.id, m.user_id, m.role, true
from org
cross join (
  select id as user_id, 'athlete'::public.organization_role as role from u_athlete
  union all
  select id, 'head_coach'::public.organization_role from u_coach
) m
on conflict (organization_id, user_id) do update set
  role = excluded.role,
  is_active = true;

with
  org as (select id from public.organizations where slug = 'ohhike-athlete-portal-mustafa' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Mustafa Performance Squad'
    limit 1
  ),
  u_athlete as (
    select id, email, display_name, avatar_url
    from public.users
    where lower(email) = lower('mustafaoguztargiz@gmail.com')
    limit 1
  )
insert into public.team_billing_entitlements (
  organization_id,
  team_id,
  plan,
  max_team_members,
  ai_features_enabled,
  ai_reports_enabled,
  team_memory_enabled,
  training_planner_enabled,
  wearable_enabled
)
select
  team.organization_id,
  team.id,
  'pro_team',
  10,
  true,
  true,
  true,
  true,
  true
from team
on conflict (team_id) do update set
  plan = 'pro_team',
  wearable_enabled = true,
  updated_at = now();

-- Athlete row (Mustafa)
with
  org as (select id from public.organizations where slug = 'ohhike-athlete-portal-mustafa' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Mustafa Performance Squad'
    limit 1
  ),
  u as (
    select id, email, display_name, avatar_url
    from public.users
    where lower(email) = lower('mustafaoguztargiz@gmail.com')
    limit 1
  ),
  ins as (
    insert into public.athletes (
      organization_id,
      team_id,
      user_id,
      first_name,
      last_name,
      display_name,
      email,
      number,
      position,
      birth_date,
      height_cm,
      weight_kg,
      dominant_side,
      status,
      metadata,
      source,
      marketplace_user_id
    )
    select
      team.organization_id,
      team.id,
      u.id,
      'Mustafa',
      'Targız',
      coalesce(u.display_name, 'Mustafa Targız'),
      u.email,
      10,
      'CM',
      date '1998-03-15',
      178,
      74,
      'right',
      'active',
      jsonb_build_object(
        'seed_key', 'mustafa_portal_athlete',
        'photo_url', coalesce(
          u.avatar_url,
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b796d?w=512&h=512&fit=crop'
        ),
        'profile_completed', true,
        'profile_completed_at', now()
      ),
      'marketplace',
      u.id
    from team, u
    where not exists (
      select 1 from public.athletes a
      where a.user_id = u.id
        and a.organization_id = team.organization_id
    )
    returning id, organization_id, team_id, user_id
  ),
  athlete as (
    select id, organization_id, team_id, user_id from ins
    union all
    select a.id, a.organization_id, a.team_id, a.user_id
    from public.athletes a
    join u on u.id = a.user_id
    join team on team.organization_id = a.organization_id
    limit 1
  )
update public.athletes a
set
  metadata = coalesce(a.metadata, '{}'::jsonb) || jsonb_build_object(
    'profile_completed', true,
    'profile_completed_at', coalesce(a.metadata->>'profile_completed_at', now()::text),
    'photo_url', coalesce(
      a.metadata->>'photo_url',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b796d?w=512&h=512&fit=crop'
    )
  ),
  status = 'active',
  updated_at = now()
from athlete ar
where a.id = ar.id;

insert into public.athlete_marketplace_profiles (
  user_id,
  display_name,
  bio,
  photo_url,
  sport_interests,
  goals,
  timezone
)
select
  u.id,
  coalesce(u.display_name, 'Mustafa Targız'),
  'Hybrid midfielder working on aerobic base, scanning and match sharpness.',
  coalesce(
    u.avatar_url,
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b796d?w=512&h=512&fit=crop'
  ),
  array['football']::public.sport_type[],
  'Improve weak-foot passing, maintain readiness above 80, showcase in May.',
  'Europe/Istanbul'
from public.users u
where lower(u.email) = lower('mustafaoguztargiz@gmail.com')
on conflict (user_id) do update set
  bio = excluded.bio,
  goals = excluded.goals,
  photo_url = excluded.photo_url,
  updated_at = now();

-- Coach marketplace + remote coaching + program
with
  org as (select id from public.organizations where slug = 'ohhike-athlete-portal-mustafa' limit 1),
  u_coach as (select id from public.users where id = 'seed_portal_coach_deniz'),
  ins_profile as (
    insert into public.coach_marketplace_profiles (
      organization_id,
      coach_user_id,
      slug,
      display_name,
      headline,
      bio,
      photo_url,
      is_public,
      is_accepting_clients,
      average_rating,
      review_count
    )
    select
      org.id,
      u_coach.id,
      'portal-coach-deniz',
      'Deniz Aydın',
      'Remote performance coach',
      'Demo coach for athlete portal preview.',
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad44?w=512&h=512&fit=crop',
      true,
      true,
      4.8,
      12
    from org, u_coach
    on conflict (coach_user_id) do update set
      organization_id = excluded.organization_id,
      updated_at = now()
    returning id, organization_id
  ),
  profile as (
    select id, organization_id from ins_profile
    union all
    select cp.id, cp.organization_id
    from public.coach_marketplace_profiles cp
    join org on org.id = cp.organization_id
    where cp.slug = 'portal-coach-deniz'
    limit 1
  ),
  athlete as (
    select a.id, a.organization_id, a.team_id, a.user_id
    from public.athletes a
    join public.users u on u.id = a.user_id
    join org on org.id = a.organization_id
    where lower(u.email) = lower('mustafaoguztargiz@gmail.com')
    limit 1
  ),
  ins_rel as (
    insert into public.remote_coaching_relationships (
      organization_id,
      team_id,
      athlete_id,
      athlete_user_id,
      coach_user_id,
      coach_profile_id,
      status,
      payment_status,
      started_at,
      metadata
    )
    select
      athlete.organization_id,
      athlete.team_id,
      athlete.id,
      athlete.user_id,
      u_coach.id,
      profile.id,
      'active',
      'waived_demo',
      now() - interval '28 days',
      '{"demo": true}'::jsonb
    from athlete, profile, u_coach
    where not exists (
      select 1
      from public.remote_coaching_relationships r
      where r.athlete_user_id = athlete.user_id
        and r.coach_profile_id = profile.id
    )
    returning id, organization_id, athlete_id
  ),
  rel as (
    select id, organization_id, athlete_id from ins_rel
    union all
    select r.id, r.organization_id, r.athlete_id
    from public.remote_coaching_relationships r
    join athlete a on a.id = r.athlete_id
    where r.status = 'active'
    limit 1
  )
insert into public.coaching_program_assignments (
  relationship_id,
  organization_id,
  athlete_id,
  assigned_by,
  title,
  description,
  program_metadata,
  status,
  starts_at,
  ends_at
)
select
  rel.id,
  rel.organization_id,
  rel.athlete_id,
  (select id from u_coach),
  '4-week match sharpness block',
  'Daily touch + scanning drills with progressive load.',
  jsonb_build_object(
    'daily_focus',
    'Today: 12 min rondo, weak-foot passing pattern, 6×30m strides (full recovery).',
    'completed_dates',
    (
      select jsonb_agg(d::text order by d)
      from generate_series(
        (current_date - interval '18 days')::date,
        (current_date - interval '1 day')::date,
        interval '1 day'
      ) as g(d)
    )
  ),
  'active',
  (current_date - 21),
  (current_date + 14)
from rel
where not exists (
  select 1
  from public.coaching_program_assignments pa
  where pa.relationship_id = rel.id
    and pa.title = '4-week match sharpness block'
);

-- Wellness: 30 days (today included — strong readiness)
with
  athlete as (
    select a.id, a.organization_id, a.team_id
    from public.athletes a
    join public.users u on u.id = a.user_id
    join public.organizations o on o.id = a.organization_id
    where lower(u.email) = lower('mustafaoguztargiz@gmail.com')
      and o.slug = 'ohhike-athlete-portal-mustafa'
    limit 1
  ),
  days as (
    select (current_date - offs) as d, offs
    from generate_series(0, 29) as offs
  )
insert into public.wellness_checkins (
  organization_id,
  team_id,
  athlete_id,
  checkin_date,
  sleep_quality,
  sleep_hours,
  fatigue,
  muscle_soreness,
  stress,
  mood,
  readiness_score,
  notes
)
select
  athlete.organization_id,
  athlete.team_id,
  athlete.id,
  days.d,
  6 + (days.offs % 4),
  7.0 + (days.offs % 3) * 0.3,
  greatest(2, 5 - (days.offs % 4)),
  greatest(2, 4 - (days.offs % 3)),
  greatest(2, 4 - (days.offs % 5)),
  6 + (days.offs % 3),
  greatest(
    62,
    least(
      94,
      72
        + case when days.d = current_date then 8 else 0 end
        + (days.offs % 5)
        - case when days.offs % 7 = 0 then 6 else 0 end
    )
  ),
  case
    when days.d = current_date then 'Feeling sharp — ready for technical session.'
    when days.offs % 6 = 0 then 'Heavy legs after match block.'
    else null
  end
from athlete
cross join days
on conflict (athlete_id, checkin_date) do update set
  readiness_score = excluded.readiness_score,
  sleep_hours = excluded.sleep_hours,
  fatigue = excluded.fatigue,
  mood = excluded.mood,
  notes = excluded.notes,
  updated_at = now();

-- Nutrition: 30 days
with
  athlete as (
    select a.id, a.organization_id, a.team_id
    from public.athletes a
    join public.users u on u.id = a.user_id
    join public.organizations o on o.id = a.organization_id
    where lower(u.email) = lower('mustafaoguztargiz@gmail.com')
      and o.slug = 'ohhike-athlete-portal-mustafa'
    limit 1
  ),
  days as (
    select (current_date - offs) as d
    from generate_series(0, 29) as offs
  )
insert into public.nutrition_logs (
  organization_id,
  team_id,
  athlete_id,
  log_date,
  hydration_score,
  meal_quality,
  protein_servings,
  carbs_timing,
  supplements,
  notes
)
select
  athlete.organization_id,
  athlete.team_id,
  athlete.id,
  days.d,
  6 + (extract(day from days.d)::int % 4),
  7 + (extract(day from days.d)::int % 2),
  2 + (extract(day from days.d)::int % 2),
  case when extract(dow from days.d)::int in (1, 3, 5) then 'pre_training' else 'post_training' end,
  case when extract(day from days.d)::int % 3 = 0 then 'Creatine, vitamin D, magnesium' else 'Vitamin D' end,
  case when days.d = current_date then 'High hydration target — afternoon session.' else 'On plan' end
from athlete
cross join days
on conflict (athlete_id, log_date) do update set
  hydration_score = excluded.hydration_score,
  meal_quality = excluded.meal_quality,
  notes = excluded.notes,
  updated_at = now();

-- Personal trainings (15 entries)
with
  athlete as (
    select a.id, a.organization_id, a.team_id
    from public.athletes a
    join public.users u on u.id = a.user_id
    join public.organizations o on o.id = a.organization_id
    where lower(u.email) = lower('mustafaoguztargiz@gmail.com')
      and o.slug = 'ohhike-athlete-portal-mustafa'
    limit 1
  )
insert into public.personal_trainings (
  organization_id,
  team_id,
  athlete_id,
  source,
  title,
  training_type,
  started_at,
  duration_min,
  distance_km,
  rpe,
  notes,
  coach_reviewed,
  coach_note
)
select
  athlete.organization_id,
  athlete.team_id,
  athlete.id,
  case when g.i % 3 = 0 then 'strava' else 'manual' end::public.data_source,
  case (g.i % 4)
    when 0 then 'Aerobic base run'
    when 1 then 'Gym — posterior chain'
    when 2 then 'Technical ball work'
    else 'Recovery jog'
  end,
  case (g.i % 4)
    when 0 then 'endurance'
    when 1 then 'strength'
    when 2 then 'technical'
    else 'recovery'
  end,
  now() - (g.i * 2 + 1) * interval '1 day',
  35 + (g.i % 5) * 8,
  4.0 + (g.i % 6) * 0.5,
  5 + (g.i % 4),
  'Portal demo personal log #' || (g.i + 1)::text,
  g.i % 3 = 0,
  case when g.i % 3 = 0 then 'Good discipline — keep weekly structure.' else null end
from athlete
cross join generate_series(0, 14) as g(i)
where not exists (
  select 1
  from public.personal_trainings pt
  where pt.athlete_id = athlete.id
    and pt.notes = 'Portal demo personal log #' || (g.i + 1)::text
);

-- Sessions: past + upcoming
with
  org as (select id from public.organizations where slug = 'ohhike-athlete-portal-mustafa' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Mustafa Performance Squad'
    limit 1
  ),
  u_coach as (select id from public.users where id = 'seed_portal_coach_deniz')
insert into public.sessions (
  organization_id,
  team_id,
  type,
  status,
  title,
  description,
  location,
  scheduled_at,
  planned_duration_min,
  planned_intensity,
  created_by
)
select
  team.organization_id,
  team.id,
  s.type::public.session_type,
  s.status::public.session_status,
  s.title,
  s.description,
  s.location,
  s.scheduled_at,
  s.duration_min,
  s.intensity,
  u_coach.id
from team, u_coach
cross join (
  values
    ('team_training', 'completed', 'Technical — first touch under pressure', 'Completed block', 'OhHike Center', (current_date - 3)::timestamptz + time '17:00', 75, 7),
    ('team_training', 'completed', 'Conditioning — aerobic power', 'Completed', 'OhHike Center', (current_date - 1)::timestamptz + time '18:00', 70, 8),
    ('match', 'completed', 'Friendly vs Anadolu Select', '90 min match', 'Away', (current_date - 5)::timestamptz + time '15:00', 90, 9),
    ('team_training', 'planned', 'Today — activation + passing', 'Low load', 'OhHike Center', (current_date)::timestamptz + time '19:00', 65, 5),
    ('team_training', 'planned', 'Speed & agility', 'High intent', 'OhHike Center', (current_date + 2)::timestamptz + time '17:30', 80, 8),
    ('friendly_match', 'planned', 'Showcase friendly', 'Scouting event', 'Neutral venue', (current_date + 6)::timestamptz + time '14:00', 90, 8),
    ('recovery', 'planned', 'Pool recovery', 'Optional', 'Sports complex', (current_date + 1)::timestamptz + time '10:00', 45, 3)
) as s(type, status, title, description, location, scheduled_at, duration_min, intensity)
where not exists (
  select 1 from public.sessions existing
  where existing.team_id = team.id
    and existing.title = s.title
    and existing.scheduled_at::date = s.scheduled_at::date
);

-- Attendance (7-day load + history)
with
  athlete as (
    select a.id
    from public.athletes a
    join public.users u on u.id = a.user_id
    join public.organizations o on o.id = a.organization_id
    where lower(u.email) = lower('mustafaoguztargiz@gmail.com')
      and o.slug = 'ohhike-athlete-portal-mustafa'
    limit 1
  ),
  sessions as (
    select s.id
    from public.sessions s
    join public.teams t on t.id = s.team_id
    join public.organizations o on o.id = t.organization_id
    where o.slug = 'ohhike-athlete-portal-mustafa'
      and s.status = 'completed'
  )
insert into public.session_attendance (
  session_id,
  athlete_id,
  attended,
  minutes_played,
  rpe,
  coach_note
)
select
  s.id,
  athlete.id,
  true,
  68 + (row_number() over () * 3) % 25,
  6 + (row_number() over () % 3),
  'Solid output — maintain progression.'
from sessions s
cross join athlete
on conflict (session_id, athlete_id) do update set
  minutes_played = excluded.minutes_played,
  rpe = excluded.rpe;

-- Wearables
with
  athlete as (
    select a.id, a.organization_id, a.team_id, a.user_id
    from public.athletes a
    join public.users u on u.id = a.user_id
    join public.organizations o on o.id = a.organization_id
    where lower(u.email) = lower('mustafaoguztargiz@gmail.com')
      and o.slug = 'ohhike-athlete-portal-mustafa'
    limit 1
  )
insert into public.wearable_connections (
  organization_id,
  athlete_id,
  user_id,
  provider,
  provider_user_id,
  is_active,
  last_synced_at
)
select
  athlete.organization_id,
  athlete.id,
  athlete.user_id,
  'strava',
  'mustafa_strava_demo',
  true,
  now() - interval '1 hour'
from athlete
on conflict (athlete_id, provider) do update set
  is_active = true,
  last_synced_at = excluded.last_synced_at;

with
  athlete as (
    select a.id, a.organization_id, a.team_id
    from public.athletes a
    join public.users u on u.id = a.user_id
    join public.organizations o on o.id = a.organization_id
    where lower(u.email) = lower('mustafaoguztargiz@gmail.com')
      and o.slug = 'ohhike-athlete-portal-mustafa'
    limit 1
  ),
  days as (
    select (current_date - offs) as d, offs
    from generate_series(0, 13) as offs
  )
insert into public.wearable_daily_summaries (
  organization_id,
  team_id,
  athlete_id,
  provider,
  summary_date,
  steps,
  active_minutes,
  distance_km,
  sleep_hours,
  sleep_score,
  resting_heart_rate
)
select
  athlete.organization_id,
  athlete.team_id,
  athlete.id,
  'strava',
  days.d,
  8200 + days.offs * 120,
  52 + (days.offs % 15),
  5.2 + (days.offs % 4) * 0.3,
  7.2 + (days.offs % 3) * 0.25,
  75 + (days.offs % 12),
  54 + (days.offs % 6)
from athlete
cross join days
on conflict (athlete_id, provider, summary_date) do update set
  steps = excluded.steps,
  sleep_score = excluded.sleep_score;

-- Training proofs (with image URLs)
with
  athlete as (
    select a.id, a.organization_id, a.user_id
    from public.athletes a
    join public.users u on u.id = a.user_id
    join public.organizations o on o.id = a.organization_id
    where lower(u.email) = lower('mustafaoguztargiz@gmail.com')
      and o.slug = 'ohhike-athlete-portal-mustafa'
    limit 1
  ),
  rel as (
    select r.id
    from public.remote_coaching_relationships r
    join athlete a on a.id = r.athlete_id
    where r.status = 'active'
    limit 1
  ),
  assignment as (
    select pa.id
    from public.coaching_program_assignments pa
    join athlete a on a.id = pa.athlete_id
    where pa.status = 'active'
    limit 1
  ),
  u_coach as (select id from public.users where id = 'seed_portal_coach_deniz')
insert into public.training_proofs (
  relationship_id,
  assignment_id,
  organization_id,
  athlete_id,
  submitted_by,
  title,
  notes,
  proof_date,
  media_urls,
  status,
  coach_feedback,
  reviewed_by,
  reviewed_at
)
select
  rel.id,
  assignment.id,
  athlete.organization_id,
  athlete.id,
  athlete.user_id,
  p.title,
  p.notes,
  p.proof_date,
  p.media_urls,
  p.status::public.training_proof_status,
  p.feedback,
  case when p.status in ('approved', 'needs_revision') then u_coach.id else null end,
  case when p.status in ('approved', 'needs_revision') then now() - (p.days_ago || ' days')::interval else null end
from rel, assignment, athlete, u_coach
cross join (
  values
    (
      'Technical session — rondo clip',
      'First touch series, 4×90s.',
      current_date - 1,
      array['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop'],
      'approved',
      'Clean touches — add weak-foot set tomorrow.',
      1
    ),
    (
      'Conditioning run',
      '30 min steady + 6 strides.',
      current_date - 3,
      array['https://images.unsplash.com/photo-1517466787929-bc90951f0971?w=800&h=600&fit=crop'],
      'approved',
      'Good pacing. Hold RPE 7 max next time.',
      3
    ),
    (
      'Gym — posterior chain',
      'RDL + nordic progressions.',
      current_date - 5,
      array['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop'],
      'approved',
      null,
      5
    ),
    (
      'Match highlights',
      'Friendly — pressing triggers.',
      current_date - 6,
      array[
        'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1526232761682-d26e03ac758e?w=800&h=600&fit=crop'
      ],
      'pending',
      null,
      6
    ),
    (
      'Recovery mobility',
      '15 min flow post-session.',
      current_date - 2,
      array['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop'],
      'needs_revision',
      'Add hip opener circuit from week 2 plan.',
      2
    ),
    (
      'Sprint mechanics',
      '6×30m build-ups.',
      current_date,
      array['https://images.unsplash.com/photo-1551958219-ac4fe1c4d908?w=800&h=600&fit=crop'],
      'pending',
      null,
      0
    )
) as p(title, notes, proof_date, media_urls, status, feedback, days_ago)
where not exists (
  select 1
  from public.training_proofs tp
  where tp.athlete_id = athlete.id
    and tp.title = p.title
    and tp.proof_date = p.proof_date
);

-- Marketplace messages thread
with
  org as (select id from public.organizations where slug = 'ohhike-athlete-portal-mustafa' limit 1),
  athlete as (
    select a.user_id
    from public.athletes a
    join public.users u on u.id = a.user_id
    join org on org.id = a.organization_id
    limit 1
  ),
  u_coach as (select id from public.users where id = 'seed_portal_coach_deniz'),
  ins_conv as (
    insert into public.marketplace_conversations (
      conversation_type,
      organization_id,
      last_message_at
    )
    select 'coaching', org.id, now() - interval '2 hours'
    from org
    where not exists (
      select 1
      from public.marketplace_conversations c
      join public.marketplace_conversation_participants p on p.conversation_id = c.id
      join athlete a on a.user_id = p.user_id
      where c.conversation_type = 'coaching'
    )
    returning id
  ),
  conv as (
    select id from ins_conv
    union all
    select c.id
    from public.marketplace_conversations c
    join public.marketplace_conversation_participants p on p.conversation_id = c.id
    join athlete a on a.user_id = p.user_id
    where c.conversation_type = 'coaching'
    limit 1
  )
insert into public.marketplace_conversation_participants (conversation_id, user_id, participant_role)
select conv.id, p.user_id, p.role
from conv
cross join (
  select user_id, 'athlete'::public.marketplace_participant_role as role from athlete
  union all
  select id, 'coach'::public.marketplace_participant_role from u_coach
) p
on conflict (conversation_id, user_id) do nothing;

with
  org as (select id from public.organizations where slug = 'ohhike-athlete-portal-mustafa' limit 1),
  athlete as (
    select a.user_id from public.athletes a
    join public.users u on u.id = a.user_id
    join org on org.id = a.organization_id
    limit 1
  ),
  u_coach as (select id from public.users where id = 'seed_portal_coach_deniz'),
  conv as (
    select c.id
    from public.marketplace_conversations c
    join public.marketplace_conversation_participants p on p.conversation_id = c.id
    join athlete a on a.user_id = p.user_id
    where c.conversation_type = 'coaching'
    limit 1
  )
insert into public.marketplace_messages (
  conversation_id,
  organization_id,
  sender_user_id,
  body,
  message_type
)
select
  conv.id,
  org.id,
  m.sender_id,
  m.body,
  'text'
from conv
cross join org
cross join (
  values
    ((select user_id from athlete), 'Coach, tomorrow I will focus on weak-foot patterns as discussed.'),
    (u_coach.id, 'Perfect. Send a 60s clip after the session — I will review tonight.'),
    ((select user_id from athlete), 'Uploaded the rondo proof. Feeling sharp.'),
    (u_coach.id, 'Approved. Add the hip opener block I sent for recovery day.')
) as m(sender_id, body)
where not exists (
  select 1 from public.marketplace_messages mm
  where mm.conversation_id = conv.id
    and mm.body = m.body
);

commit;

-- Verification
select
  o.name as organization,
  o.slug,
  om.role,
  t.name as team,
  a.display_name as athlete,
  (select count(*) from public.wellness_checkins w where w.athlete_id = a.id) as wellness_rows,
  (select count(*) from public.nutrition_logs n where n.athlete_id = a.id) as nutrition_rows,
  (select count(*) from public.personal_trainings pt where pt.athlete_id = a.id) as personal_trainings,
  (select count(*) from public.training_proofs tp where tp.athlete_id = a.id) as proofs,
  (select count(*) from public.sessions s where s.team_id = t.id and s.scheduled_at >= now()) as upcoming_sessions,
  (select pa.title from public.coaching_program_assignments pa where pa.athlete_id = a.id and pa.status = 'active' limit 1) as active_program
from public.users u
join public.organization_members om on om.user_id = u.id
join public.organizations o on o.id = om.organization_id
left join public.teams t on t.organization_id = o.id
left join public.athletes a on a.user_id = u.id and a.organization_id = o.id
where lower(u.email) = lower('mustafaoguztargiz@gmail.com')
  and o.slug = 'ohhike-athlete-portal-mustafa';
