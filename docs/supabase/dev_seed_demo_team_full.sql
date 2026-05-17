-- =============================================================================
-- OhHike Demo Team — Full mock dataset (single org, single team, rich dashboard)
-- =============================================================================
--
-- PREREQUISITES
--   1. Run migrations 001 → 014 (at minimum 002, 003, 004, 005, 006, 007, 008, 012).
--   2. Both real users must exist in public.users (sign in once via Clerk on web/app):
--        • poyrazavsever@gmail.com      → organization admin
--        • mustafaoguztargiz@gmail.com  → organization owner + head coach
--   3. Run in Supabase SQL Editor (service role / postgres). Safe to re-run (idempotent).
--
-- AFTER RUN
--   • In the app, switch workspace to "OhHike Demo Academy" (org switcher) or set cookie
--     ohhike_active_org_id to the org id returned by the verification query at the bottom.
--   • Dashboard, calendar, readiness, nutrition, wearables, drills, AI reports, team memory
--     and coach marketplace (/find-coach) will show demo data for this org.
--
-- OPTIONAL RESET (uncomment to wipe this demo org and all cascaded data, then re-run)
-- DELETE FROM public.organizations WHERE slug = 'ohhike-demo-academy';
-- =============================================================================

begin;

-- ---------------------------------------------------------------------------
-- 0) Validate real Clerk users exist
-- ---------------------------------------------------------------------------
do $$
declare
  missing text[];
begin
  select array_agg(email)
  into missing
  from (
    values
      ('poyrazavsever@gmail.com'),
      ('mustafaoguztargiz@gmail.com')
  ) as required(email)
  where not exists (
    select 1 from public.users u where lower(u.email) = lower(required.email)
  );

  if missing is not null then
    raise exception
      'Missing public.users rows for: %. Sign in with Clerk once, then re-run.',
      array_to_string(missing, ', ');
  end if;
end $$;

-- Enrich real accounts (avatars for navbar / staff lists)
update public.users
set
  display_name = coalesce(nullif(display_name, ''), 'Poyraz Avsever'),
  avatar_url = coalesce(
    avatar_url,
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop'
  ),
  updated_at = now()
where lower(email) = lower('poyrazavsever@gmail.com');

update public.users
set
  display_name = coalesce(nullif(display_name, ''), 'Mustafa Oğuz Targız'),
  avatar_url = coalesce(
    avatar_url,
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b796d?w=256&h=256&fit=crop'
  ),
  updated_at = now()
where lower(email) = lower('mustafaoguztargiz@gmail.com');

-- ---------------------------------------------------------------------------
-- 1) Synthetic staff users (roster-only logins; fill staff UI & coach profile)
-- ---------------------------------------------------------------------------
insert into public.users (id, email, display_name, avatar_url, locale, timezone)
values
  (
    'seed_demo_staff_deniz',
    'deniz.aydin@ohhike.seed',
    'Deniz Aydın',
    'https://images.unsplash.com/photo-1560272564-c83b66b1ad44?w=256&h=256&fit=crop',
    'tr',
    'Europe/Istanbul'
  ),
  (
    'seed_demo_staff_selin',
    'selin.kara@ohhike.seed',
    'Selin Kara',
    'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=256&h=256&fit=crop',
    'tr',
    'Europe/Istanbul'
  ),
  (
    'seed_demo_staff_berk',
    'berk.yilmaz@ohhike.seed',
    'Berk Yılmaz',
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=256&h=256&fit=crop',
    'tr',
    'Europe/Istanbul'
  ),
  (
    'seed_demo_staff_ayse',
    'ayse.demir@ohhike.seed',
    'Ayşe Demir',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=256&h=256&fit=crop',
    'tr',
    'Europe/Istanbul'
  ),
  (
    'seed_demo_athlete_user_01',
    'can.ozturk.demo@ohhike.seed',
    'Can Öztürk',
    'https://images.unsplash.com/photo-1517466787929-bc90951f0971?w=256&h=256&fit=crop',
    'tr',
    'Europe/Istanbul'
  ),
  (
    'seed_demo_athlete_user_02',
    'elif.sahin.demo@ohhike.seed',
    'Elif Şahin',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=256&h=256&fit=crop',
    'tr',
    'Europe/Istanbul'
  )
on conflict (id) do update set
  display_name = excluded.display_name,
  avatar_url = excluded.avatar_url,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 2) Organization + team + billing (Pro)
-- ---------------------------------------------------------------------------
with
  u_admin as (
    select id from public.users where lower(email) = lower('poyrazavsever@gmail.com') limit 1
  ),
  u_owner as (
    select id from public.users where lower(email) = lower('mustafaoguztargiz@gmail.com') limit 1
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
      'OhHike Demo Academy',
      'ohhike-demo-academy',
      'academy',
      'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=400&fit=crop',
      'Türkiye',
      'İstanbul',
      u_owner.id,
      jsonb_build_object(
        'demo', true,
        'season', '2025-26',
        'primary_color', '#0F766E'
      )
    from u_owner
    on conflict (slug) do update set
      name = excluded.name,
      logo_url = excluded.logo_url,
      country = excluded.country,
      city = excluded.city,
      settings = excluded.settings,
      updated_at = now()
    returning id
  ),
  org as (
    select id from ins_org
    union all
    select o.id from public.organizations o where o.slug = 'ohhike-demo-academy'
    limit 1
  ),
  ins_team as (
    insert into public.teams (
      organization_id,
      name,
      sport_type,
      age_group,
      level,
      default_formation,
      season_goal,
      weekly_training_count,
      settings
    )
    select
      org.id,
      'Demo U19 Elite',
      'football',
      'U19',
      'Regional League',
      '4-3-3',
      'Top 3 finish, ≤12% soft-tissue injury rate, academy promotion pipeline.',
      4,
      jsonb_build_object('demo', true, 'home_venue', 'OhHike Performance Center')
    from org
    where not exists (
      select 1
      from public.teams t
      where t.organization_id = org.id
        and t.name = 'Demo U19 Elite'
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
    where t.name = 'Demo U19 Elite'
    limit 1
  )
-- org members (real + synthetic)
insert into public.organization_members (organization_id, user_id, role, is_active, invited_by)
select org.id, m.user_id, m.role, true, (select id from u_owner)
from org
cross join (
  values
    ((select id from u_owner), 'owner'::public.organization_role),
    ((select id from u_admin), 'admin'::public.organization_role),
    ('seed_demo_staff_deniz', 'head_coach'::public.organization_role),
    ('seed_demo_staff_selin', 'assistant_coach'::public.organization_role),
    ('seed_demo_staff_berk', 'analyst'::public.organization_role),
    ('seed_demo_staff_ayse', 'physiotherapist'::public.organization_role),
    ('seed_demo_athlete_user_01', 'athlete'::public.organization_role),
    ('seed_demo_athlete_user_02', 'athlete'::public.organization_role)
) as m(user_id, role)
on conflict (organization_id, user_id) do update set
  role = excluded.role,
  is_active = true;

-- team staff assignments
with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  ),
  u_owner as (
    select id from public.users where lower(email) = lower('mustafaoguztargiz@gmail.com') limit 1
  )
insert into public.team_staff (team_id, user_id, role, assigned_by)
select team.id, s.user_id, s.role, u_owner.id
from team, u_owner
cross join (
  values
    ((select id from u_owner), 'head_coach'::public.organization_role),
    ('seed_demo_staff_deniz', 'assistant_coach'::public.organization_role),
    ('seed_demo_staff_selin', 'assistant_coach'::public.organization_role),
    ('seed_demo_staff_berk', 'analyst'::public.organization_role),
    ('seed_demo_staff_ayse', 'physiotherapist'::public.organization_role)
) as s(user_id, role)
on conflict (team_id, user_id, role) do nothing;

-- Pro billing entitlement
with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
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
  wearable_enabled,
  pdf_export_enabled,
  branded_reports_enabled,
  monthly_ai_report_limit,
  metadata
)
select
  team.organization_id,
  team.id,
  'pro_team',
  30,
  true,
  true,
  true,
  true,
  true,
  true,
  false,
  100,
  '{"demo": true}'::jsonb
from team
on conflict (team_id) do update set
  plan = excluded.plan,
  max_team_members = excluded.max_team_members,
  ai_features_enabled = excluded.ai_features_enabled,
  ai_reports_enabled = excluded.ai_reports_enabled,
  team_memory_enabled = excluded.team_memory_enabled,
  training_planner_enabled = excluded.training_planner_enabled,
  wearable_enabled = excluded.wearable_enabled,
  pdf_export_enabled = excluded.pdf_export_enabled,
  monthly_ai_report_limit = excluded.monthly_ai_report_limit,
  metadata = excluded.metadata,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 3) Athletes (14 roster + 2 linked to seed athlete users)
-- ---------------------------------------------------------------------------
with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  ),
  u_owner as (
    select id from public.users where lower(email) = lower('mustafaoguztargiz@gmail.com') limit 1
  ),
  roster as (
    select *
    from (
      values
        ('player_01', 'Arda', 'Kılıç', 1, 'GK', 'active', 188.0, 82.0, 'https://images.unsplash.com/photo-1508098682720-e00c509a5ca4?w=256&h=256&fit=crop', null::varchar, null::varchar),
        ('player_02', 'Bora', 'Tekin', 2, 'RB', 'active', 178.0, 74.0, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=256&h=256&fit=crop', null, null),
        ('player_03', 'Cem', 'Arslan', 3, 'CB', 'active', 185.0, 79.0, 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=256&h=256&fit=crop', null, null),
        ('player_04', 'Doruk', 'Eren', 4, 'CB', 'monitoring', 184.0, 81.0, 'https://images.unsplash.com/photo-1526232761682-d26e03ac758e?w=256&h=256&fit=crop', null, null),
        ('player_05', 'Emre', 'Polat', 5, 'LB', 'active', 177.0, 72.0, 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=256&h=256&fit=crop', null, null),
        ('player_06', 'Fırat', 'Güneş', 6, 'CDM', 'active', 180.0, 76.0, 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=256&h=256&fit=crop', null, null),
        ('player_07', 'Gökhan', 'Yıldız', 8, 'CM', 'active', 179.0, 75.0, 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=256&h=256&fit=crop', null, null),
        ('player_08', 'Hakan', 'Çelik', 10, 'CAM', 'injured', 176.0, 71.0, 'https://images.unsplash.com/photo-1551958219-ac4fe1c4d908?w=256&h=256&fit=crop', null, null),
        ('player_09', 'İlker', 'Koç', 7, 'RW', 'active', 175.0, 70.0, 'https://images.unsplash.com/photo-1489944440615-453fc2eb73b9?w=256&h=256&fit=crop', null, null),
        ('player_10', 'Kaan', 'Demir', 11, 'LW', 'active', 174.0, 69.0, 'https://images.unsplash.com/photo-1529900748604-07564a03e8a9?w=256&h=256&fit=crop', null, null),
        ('player_11', 'Levent', 'Ak', 9, 'ST', 'active', 182.0, 78.0, 'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?w=256&h=256&fit=crop', null, null),
        ('player_12', 'Mert', 'Şen', 14, 'ST', 'recovery', 181.0, 77.0, 'https://images.unsplash.com/photo-1504450758481-733b873c890b?w=256&h=256&fit=crop', null, null),
        ('player_13', 'Can', 'Öztürk', 17, 'CM', 'active', 178.0, 73.0, 'https://images.unsplash.com/photo-1517466787929-bc90951f0971?w=256&h=256&fit=crop', 'seed_demo_athlete_user_01', 'can.ozturk.demo@ohhike.seed'),
        ('player_14', 'Elif', 'Şahin', 19, 'LW', 'active', 170.0, 62.0, 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=256&h=256&fit=crop', 'seed_demo_athlete_user_02', 'elif.sahin.demo@ohhike.seed')
    ) as r(seed_key, first_name, last_name, number, position, status, height_cm, weight_kg, photo_url, user_id, email)
  )
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
  notes,
  metadata,
  created_by,
  source
)
select
  team.organization_id,
  team.id,
  r.user_id,
  r.first_name,
  r.last_name,
  r.first_name || ' ' || r.last_name,
  r.email,
  r.number,
  r.position,
  (date '2006-01-15' + ((r.number * 37) % 500))::date,
  r.height_cm,
  r.weight_kg,
  case when r.number % 2 = 0 then 'right' else 'left' end,
  r.status::public.athlete_status,
  case
    when r.status = 'injured' then 'Hamstring tightness — return-to-play protocol week 2.'
    when r.status = 'recovery' then 'Post-viral load management.'
    when r.status = 'monitoring' then 'Elevated fatigue trend — watch ACWR.'
    else null
  end,
  jsonb_build_object(
    'seed_key', r.seed_key,
    'photo_url', r.photo_url,
    'demo', true
  ),
  u_owner.id,
  case when r.user_id is not null then 'marketplace'::public.athlete_source else 'roster'::public.athlete_source end
from roster r
cross join team
cross join u_owner
where not exists (
  select 1
  from public.athletes a
  where a.team_id = team.id
    and a.metadata->>'seed_key' = r.seed_key
);

-- ---------------------------------------------------------------------------
-- 4) Coach marketplace profile (owner = public coach on /find-coach)
--    One profile per coach_user_id globally — upsert on coach_user_id, not org.
-- ---------------------------------------------------------------------------
with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  u_owner as (
    select id from public.users where lower(email) = lower('mustafaoguztargiz@gmail.com') limit 1
  )
insert into public.coach_marketplace_profiles (
  organization_id,
  coach_user_id,
  slug,
  display_name,
  headline,
  bio,
  photo_url,
  intro_video_url,
  training_philosophy,
  featured_result,
  specialties,
  sports,
  coaching_modes,
  languages,
  location_country,
  location_city,
  years_experience,
  pricing_display,
  response_time_avg_hours,
  is_public,
  is_accepting_clients,
  average_rating,
  review_count,
  metadata
)
select
  org.id,
  u_owner.id,
  'ohhike-demo-mustafa',
  'Mustafa Oğuz Targız',
  'Elite youth football & performance coaching',
  'Demo academy head coach. Periodized team loads, individual development blocks, and proof-based remote coaching on OhHike Coach Network.',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b796d?w=512&h=512&fit=crop',
  'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1280&h=720&fit=crop',
  'Load smart, develop skills daily, compete when readiness is green.',
  'U19 squad +18% sprint volume tolerance in 8 weeks (demo season).',
  array['tactics', 'periodization', 'youth development'],
  array['football']::public.sport_type[],
  array['remote', 'hybrid'],
  array['Turkish', 'English'],
  'Türkiye',
  'İstanbul',
  11,
  'From ₺4.500 / month',
  3.5,
  true,
  true,
  4.9,
  24,
  '{"demo": true}'::jsonb
from org, u_owner
on conflict (coach_user_id) do update set
  organization_id = case
    when not exists (
      select 1
      from public.coach_marketplace_profiles other
      where other.organization_id = excluded.organization_id
        and other.coach_user_id <> excluded.coach_user_id
    ) then excluded.organization_id
    else public.coach_marketplace_profiles.organization_id
  end,
  slug = excluded.slug,
  display_name = excluded.display_name,
  headline = excluded.headline,
  bio = excluded.bio,
  photo_url = excluded.photo_url,
  intro_video_url = excluded.intro_video_url,
  training_philosophy = excluded.training_philosophy,
  featured_result = excluded.featured_result,
  specialties = excluded.specialties,
  sports = excluded.sports,
  coaching_modes = excluded.coaching_modes,
  languages = excluded.languages,
  location_country = excluded.location_country,
  location_city = excluded.location_city,
  years_experience = excluded.years_experience,
  pricing_display = excluded.pricing_display,
  response_time_avg_hours = excluded.response_time_avg_hours,
  is_public = excluded.is_public,
  is_accepting_clients = excluded.is_accepting_clients,
  average_rating = excluded.average_rating,
  review_count = excluded.review_count,
  metadata = public.coach_marketplace_profiles.metadata || excluded.metadata,
  updated_at = now();

insert into public.coaching_packages (
  coach_profile_id,
  organization_id,
  title,
  description,
  duration_weeks,
  price_cents,
  currency,
  is_active,
  sort_order
)
select
  cp.id,
  org.id,
  pkg.title,
  pkg.description,
  pkg.duration_weeks,
  pkg.price_cents,
  pkg.currency,
  true,
  pkg.sort_order
from public.coach_marketplace_profiles cp
join public.users u on u.id = cp.coach_user_id and lower(u.email) = lower('mustafaoguztargiz@gmail.com')
cross join (
  select id from public.organizations where slug = 'ohhike-demo-academy' limit 1
) org
cross join (
  values
    ('8-week academy block', 'Team-tuned microcycle + video review', 8, 450000, 'TRY', 0),
    ('4-week skills intensive', 'Technical + tactical homework', 4, 280000, 'TRY', 1),
    ('12-week season build', 'Full periodization + wellness monitoring', 12, 650000, 'TRY', 2)
) as pkg(title, description, duration_weeks, price_cents, currency, sort_order)
where not exists (
  select 1
  from public.coaching_packages existing
  where existing.coach_profile_id = cp.id
    and existing.title = pkg.title
);

-- Athlete marketplace profiles (seed users)
insert into public.athlete_marketplace_profiles (user_id, display_name, bio, photo_url, sport_interests, goals, timezone)
values
  (
    'seed_demo_athlete_user_01',
    'Can Öztürk',
    'U19 midfielder focused on scanning and first touch under pressure.',
    'https://images.unsplash.com/photo-1517466787929-bc90951f0971?w=512&h=512&fit=crop',
    array['football']::public.sport_type[],
    'Improve weak-foot distribution and aerobic base.',
    'Europe/Istanbul'
  ),
  (
    'seed_demo_athlete_user_02',
    'Elif Şahin',
    'Winger working on 1v1 acceleration and defensive tracking.',
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=512&h=512&fit=crop',
    array['football']::public.sport_type[],
    'Increase top speed and repeat sprint ability.',
    'Europe/Istanbul'
  )
on conflict (user_id) do update set
  display_name = excluded.display_name,
  bio = excluded.bio,
  photo_url = excluded.photo_url,
  goals = excluded.goals,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 5) Drills
-- ---------------------------------------------------------------------------
with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  u_owner as (
    select id from public.users where lower(email) = lower('mustafaoguztargiz@gmail.com') limit 1
  )
insert into public.drills (
  organization_id,
  created_by,
  sport_type,
  title,
  category,
  description,
  objective,
  duration_min,
  difficulty,
  player_count_min,
  player_count_max,
  equipment,
  coaching_points,
  tags,
  is_system_drill
)
select
  org.id,
  u_owner.id,
  'football',
  d.title,
  d.category,
  d.description,
  d.objective,
  d.duration_min,
  d.difficulty,
  d.pmin,
  d.pmax,
  d.equipment,
  d.coaching_points,
  d.tags,
  false
from org, u_owner
cross join (
  values
    (
      'seed_drill_rondo_4v2',
      'Possession',
      '4v2 rondo in 12x12m',
      'Tight grid rondo with two-touch limit in the central zone.',
      'Quick circulation and press resistance',
      12,
      'medium',
      6,
      8,
      'Cones, bibs',
      'Open body shape; two-touch limit in central zone',
      array['possession', 'technique']
    ),
    (
      'seed_drill_transition_8v8',
      'Transition',
      '8v8 to two mini-goals',
      'Half-pitch game with immediate transition triggers.',
      'Win ball → attack within 6 seconds',
      20,
      'high',
      16,
      18,
      'Mini goals, vests',
      'Immediate forward pass after regain',
      array['transition', 'tactics']
    ),
    (
      'seed_drill_finishing',
      'Finishing',
      'Cross & finish wave',
      'Wide deliveries and cut-back finishes in waves.',
      'Quality strikes from cut-backs',
      15,
      'medium',
      8,
      12,
      'Goals, mannequins',
      'Attack far post; one-touch finishes only inside box',
      array['finishing', 'attacking']
    ),
    (
      'seed_drill_set_piece',
      'Set piece',
      'Corner routines A/B',
      'Rehearse A/B corner routines vs zonal marking.',
      'Organized delivery vs zonal',
      18,
      'medium',
      11,
      11,
      'Corner flags, markers',
      'Blocker runs; near-post flick-on timing',
      array['set_piece', 'tactics']
    )
) as d(
  seed_key,
  category,
  title,
  description,
  objective,
  duration_min,
  difficulty,
  pmin,
  pmax,
  equipment,
  coaching_points,
  tags
)
where not exists (
  select 1
  from public.drills existing
  where existing.organization_id = org.id
    and existing.title = d.title
);

-- ---------------------------------------------------------------------------
-- 6) Sessions + blocks + attendance
-- ---------------------------------------------------------------------------
with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  ),
  u_owner as (
    select id from public.users where lower(email) = lower('mustafaoguztargiz@gmail.com') limit 1
  ),
  session_seed as (
    select *
    from (
      values
        ('sess_completed_1', 'team_training', 'completed', 'Microcycle 3 — Possession & pressing', 'Build-up under high press', 'OhHike Center Pitch A', (current_date - 5)::timestamptz + time '17:00', 90, 8, 'completed tactical block'),
        ('sess_completed_2', 'match', 'completed', 'League Match vs Kadıköy SK', '3-1 win, controlled second half', 'Away — Kadıköy Stadium', (current_date - 2)::timestamptz + time '15:00', 95, 9, 'High pressing triggers worked in 2nd half'),
        ('sess_today', 'team_training', 'planned', 'Today — Recovery + activation', 'Low load technical touch', 'OhHike Center Pitch B', (current_date)::timestamptz + time '18:30', 75, 5, 'Monitor injured players'),
        ('sess_upcoming_1', 'team_training', 'planned', 'Speed & transition day', 'Expose weak-side overloads', 'OhHike Center Pitch A', (current_date + 2)::timestamptz + time '17:00', 85, 7, null),
        ('sess_upcoming_2', 'friendly_match', 'planned', 'Friendly vs Beşiktaş U19', 'Test week-4 patterns', 'Neutral venue', (current_date + 5)::timestamptz + time '14:00', 90, 8, null),
        ('sess_analysis', 'analysis_meeting', 'planned', 'Video analysis — Set pieces', 'Review last 3 matches corners', 'Meeting room 2', (current_date + 1)::timestamptz + time '10:00', 60, 4, null)
    ) as s(
      seed_key, type, status, title, description, location, scheduled_at,
      planned_duration_min, planned_intensity, coach_notes
    )
  )
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
  coach_notes,
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
  s.planned_duration_min,
  s.planned_intensity,
  s.coach_notes,
  u_owner.id
from session_seed s
cross join team
cross join u_owner
where not exists (
  select 1
  from public.sessions existing
  join team t on true
  where existing.team_id = t.id
    and existing.title = s.title
    and existing.scheduled_at::date = s.scheduled_at::date
);

-- Training blocks for completed possession session
with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  sess as (
    select s.id
    from public.sessions s
    join org on org.id = s.organization_id
    where s.title = 'Microcycle 3 — Possession & pressing'
    limit 1
  ),
  drills as (
    select d.id, d.title
    from public.drills d
    join org on org.id = d.organization_id
    where d.title in ('4v2 rondo in 12x12m', '8v8 to two mini-goals', 'Cross & finish wave')
  )
insert into public.training_blocks (
  session_id, title, description, order_index, planned_duration_min, intensity, drill_id, completed, notes
)
select
  sess.id,
  b.title,
  b.description,
  b.order_index,
  b.planned_duration_min,
  b.intensity,
  (select dr.id from drills dr where dr.title = b.drill_title limit 1),
  b.completed,
  b.notes
from sess
cross join (
  values
    ('Warm-up & mobility', 'Dynamic prep + RAMP', 0, 15, 4, null, true, null),
    ('4v2 rondo in 12x12m', 'Technical activation', 1, 12, 6, '4v2 rondo in 12x12m', true, 'High tempo'),
    ('8v8 to two mini-goals', 'Main block', 2, 20, 8, '8v8 to two mini-goals', true, null),
    ('Cross & finish wave', 'Finishing', 3, 15, 7, 'Cross & finish wave', true, null),
    ('Cool down', 'Stretch + debrief', 4, 10, 3, null, true, null)
) as b(title, description, order_index, planned_duration_min, intensity, drill_title, completed, notes)
where not exists (
  select 1 from public.training_blocks tb where tb.session_id = sess.id
);

-- Attendance for completed sessions
with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  ),
  athletes as (
    select a.id, a.metadata->>'seed_key' as seed_key, a.status
    from public.athletes a
    where a.team_id = (select id from team)
  ),
  sessions as (
    select s.id, s.title
    from public.sessions s
    join org on org.id = s.organization_id
    where s.status = 'completed'
  )
insert into public.session_attendance (
  session_id,
  athlete_id,
  attended,
  minutes_played,
  rpe,
  pain_reported,
  pain_area,
  coach_note
)
select
  s.id,
  a.id,
  case
    when a.status in ('injured', 'inactive') then false
    when a.seed_key = 'player_12' then false
    else true
  end,
  case
    when a.status in ('injured', 'inactive') then null
    when a.seed_key = 'player_12' then null
    else 60 + (ascii(left(a.seed_key, 1)) % 30)
  end,
  case
    when a.status in ('injured', 'inactive') then null
    when a.seed_key = 'player_12' then null
    else 5 + (ascii(left(a.seed_key, 1)) % 4)
  end,
  a.status = 'injured',
  case when a.status = 'injured' then 'hamstring' else null end,
  case when a.seed_key = 'player_04' then 'Load capped — monitoring' else null end
from sessions s
cross join athletes a
on conflict (session_id, athlete_id) do update set
  attended = excluded.attended,
  minutes_played = excluded.minutes_played,
  rpe = excluded.rpe,
  pain_reported = excluded.pain_reported;

-- ---------------------------------------------------------------------------
-- 7) Wellness & nutrition (last 14 days; today partial for dashboard alerts)
-- ---------------------------------------------------------------------------
with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  ),
  athletes as (
    select a.id, a.metadata->>'seed_key' as seed_key, row_number() over (order by a.number) as rn
    from public.athletes a
    where a.team_id = (select id from team)
  ),
  days as (
    select (current_date - offs) as d, offs
    from generate_series(0, 13) as offs
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
  team.organization_id,
  team.id,
  a.id,
  days.d,
  6 + ((a.rn + days.offs) % 4),
  6.5 + ((a.rn % 3) * 0.5),
  3 + ((a.rn + days.offs) % 5),
  2 + ((a.rn + days.offs) % 4),
  3 + ((a.rn) % 4),
  6 + ((a.rn + days.offs) % 3),
  greatest(
    45,
    least(
      95,
      78
        - case when a.seed_key = 'player_08' then 18 else 0 end
        - case when a.seed_key = 'player_04' then 8 else 0 end
        + ((days.offs % 3) * 2)
        - (days.offs % 5)
    )
  ),
  case
    when days.d = current_date and a.rn > 10 then null
  end
from athletes a
cross join team
cross join days
where
  -- Skip today for last 3 athletes → dashboard "missing readiness"
  not (days.d = current_date and a.rn > 11)
on conflict (athlete_id, checkin_date) do update set
  readiness_score = excluded.readiness_score,
  fatigue = excluded.fatigue,
  updated_at = now();

with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  ),
  athletes as (
    select a.id, row_number() over (order by a.number) as rn
    from public.athletes a
    where a.team_id = (select id from team)
  ),
  days as (
    select (current_date - offs) as d
    from generate_series(0, 13) as offs
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
  team.organization_id,
  team.id,
  a.id,
  days.d,
  6 + (a.rn % 4),
  6 + ((a.rn + extract(day from days.d)::int) % 3),
  2 + (a.rn % 2),
  case when a.rn % 2 = 0 then 'pre_training' else 'post_training' end,
  case when a.rn % 3 = 0 then 'Vitamin D, magnesium' else null end,
  case when days.d = current_date and a.rn > 12 then null else 'Demo log' end
from athletes a
cross join team
cross join days
where not (days.d = current_date and a.rn > 12)
on conflict (athlete_id, log_date) do update set
  hydration_score = excluded.hydration_score,
  meal_quality = excluded.meal_quality,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 8) Personal trainings + wearables
-- ---------------------------------------------------------------------------
with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  ),
  athletes as (
    select a.id, row_number() over (order by a.number) as rn
    from public.athletes a
    where a.team_id = (select id from team)
      and a.status = 'active'
    limit 8
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
  team.organization_id,
  team.id,
  a.id,
  'manual',
  'Individual conditioning',
  'aerobic',
  (current_timestamp - ((g.i * 2 + 1) || ' days')::interval),
  35 + (g.i * 5),
  4.5 + g.i * 0.3,
  5 + (g.i % 3),
  'Extra work — demo seed',
  g.i % 2 = 0,
  case when g.i % 2 = 0 then 'Good discipline' else null end
from athletes a
cross join team
cross join generate_series(0, 2) as g(i)
where a.rn = (g.i % 8) + 1
  and not exists (
    select 1
    from public.personal_trainings pt
    where pt.athlete_id = a.id
      and pt.title = 'Individual conditioning'
      and pt.started_at::date = (current_timestamp - ((g.i * 2 + 1) || ' days')::interval)::date
  );

with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  ),
  athletes as (
    select a.id, a.user_id, row_number() over (order by a.number) as rn
    from public.athletes a
    where a.team_id = (select id from team)
      and a.status in ('active', 'monitoring', 'recovery')
    limit 10
  )
insert into public.wearable_connections (
  organization_id,
  athlete_id,
  user_id,
  provider,
  provider_user_id,
  is_active,
  last_synced_at,
  scopes
)
select
  team.organization_id,
  a.id,
  a.user_id,
  case (a.rn % 3) when 0 then 'strava' when 1 then 'garmin' else 'apple_health' end::public.wearable_provider,
  'demo_provider_' || a.rn::text,
  true,
  now() - interval '2 hours',
  array['activity', 'sleep']
from athletes a
cross join team
on conflict (athlete_id, provider) do update set
  is_active = true,
  last_synced_at = excluded.last_synced_at;

with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  ),
  athletes as (
    select a.id, row_number() over (order by a.number) as rn
    from public.athletes a
    where a.team_id = (select id from team)
    limit 10
  ),
  days as (
    select (current_date - offs) as d, offs
    from generate_series(0, 9) as offs
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
  calories,
  resting_heart_rate,
  avg_heart_rate,
  sleep_hours,
  sleep_score,
  stress_score
)
select
  team.organization_id,
  team.id,
  a.id,
  case (a.rn % 3) when 0 then 'strava' when 1 then 'garmin' else 'apple_health' end::public.wearable_provider,
  days.d,
  6500 + a.rn * 420 + days.offs * 80,
  45 + (a.rn % 20),
  3.2 + (a.rn * 0.2),
  1800 + a.rn * 40,
  52 + (a.rn % 8),
  118 + (a.rn % 15),
  7.0 + (a.rn % 3) * 0.4,
  70 + (days.offs % 10),
  30 + (days.offs % 15)
from athletes a
cross join team
cross join days
on conflict (athlete_id, provider, summary_date) do update set
  steps = excluded.steps,
  sleep_score = excluded.sleep_score;

insert into public.wearable_activities (
  organization_id,
  team_id,
  athlete_id,
  provider,
  provider_activity_id,
  activity_type,
  title,
  started_at,
  duration_sec,
  distance_km,
  avg_heart_rate,
  max_heart_rate,
  calories
)
select
  team.organization_id,
  team.id,
  a.id,
  case (a.rn % 3) when 0 then 'strava' when 1 then 'garmin' else 'apple_health' end::public.wearable_provider,
  'demo_act_' || a.rn::text || '_' || g.i::text,
  'run',
  'Easy run — demo',
  now() - (g.i * 2 + 1) * interval '1 day',
  2400 + g.i * 300,
  5.0 + g.i * 0.4,
  135 + g.i,
  158 + g.i,
  320 + g.i * 10
from (
  select a.id, row_number() over (order by a.number) as rn
  from public.athletes a
  join public.teams t on t.id = a.team_id
  join public.organizations o on o.id = t.organization_id
  where o.slug = 'ohhike-demo-academy'
  limit 6
) a
cross join (
  select t.id, t.organization_id
  from public.teams t
  join public.organizations o on o.id = t.organization_id
  where o.slug = 'ohhike-demo-academy' and t.name = 'Demo U19 Elite'
  limit 1
) team
cross join generate_series(0, 2) g(i)
on conflict (provider, provider_activity_id) do nothing;

-- ---------------------------------------------------------------------------
-- 9) AI reports, team memory, goals, documents, audit
-- ---------------------------------------------------------------------------
with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  ),
  u_owner as (
    select id from public.users where lower(email) = lower('mustafaoguztargiz@gmail.com') limit 1
  ),
  sess as (
    select s.id, s.title
    from public.sessions s
    join org on org.id = s.organization_id
    where s.status = 'completed'
    order by s.scheduled_at desc
    limit 1
  )
insert into public.ai_reports (
  organization_id,
  team_id,
  session_id,
  report_type,
  title,
  summary,
  confidence_score,
  model_provider,
  model_name,
  tactical_observations,
  athlete_observations,
  load_observations,
  risk_alerts,
  recommended_drills,
  created_by
)
select
  team.organization_id,
  team.id,
  sess.id,
  r.report_type::public.ai_report_type,
  r.title,
  r.summary,
  0.86,
  'gemini',
  'gemini-2.0-flash',
  r.tactical,
  r.athlete_obs,
  r.load_obs,
  r.risks,
  r.drills,
  u_owner.id
from team, u_owner, sess
cross join (
  values
    (
      'weekly_team_report',
      'Weekly team report — Demo U19',
      'Squad readiness stable; pressing triggers improved; monitor hamstring group.',
      '["High press success rate up 12% in final third"]'::jsonb,
      '["CM #8 fatigue trend — reduce Monday load"]'::jsonb,
      '["Team ACWR in sweet spot 0.85–1.05"]'::jsonb,
      '["Player #8 injured — RTP week 2"]'::jsonb,
      '["4v2 rondo", "Transition 8v8"]'::jsonb
    ),
    (
      'load_report',
      '7-day load summary',
      'Aggregate RPE-minutes within planned range; 2 athletes flagged amber.',
      '[]'::jsonb,
      '["Doruk Eren — monitoring flag"]'::jsonb,
      '["Mean session RPE 6.8"]'::jsonb,
      '[]'::jsonb,
      '[]'::jsonb
    )
) as r(report_type, title, summary, tactical, athlete_obs, load_obs, risks, drills)
where not exists (
  select 1 from public.ai_reports ar
  where ar.organization_id = team.organization_id
    and ar.title = r.title
);

with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  ),
  u_owner as (
    select id from public.users where lower(email) = lower('mustafaoguztargiz@gmail.com') limit 1
  )
insert into public.athlete_observations (
  organization_id,
  team_id,
  athlete_id,
  source,
  category,
  severity,
  title,
  observation,
  recommendation,
  is_resolved,
  created_by
)
select
  team.organization_id,
  team.id,
  a.id,
  'manual',
  o.category,
  o.severity,
  o.title,
  o.observation,
  o.recommendation,
  false,
  u_owner.id
from team
cross join u_owner
cross join (
  values
    ('player_08', 'injury', 'high', 'Hamstring tightness', 'Reported discomfort after sprint sets.', 'Physio clearance before full training.'),
    ('player_04', 'load', 'medium', 'Elevated fatigue trend', 'Wellness flags above team average for 3 days.', 'Reduce high-speed volume 15%.')
) as o(seed_key, category, severity, title, observation, recommendation)
inner join public.athletes a
  on a.team_id = team.id
 and a.metadata->>'seed_key' = o.seed_key
where not exists (
  select 1 from public.athlete_observations x
  where x.team_id = team.id and x.title = o.title
);

with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  )
insert into public.team_patterns (
  organization_id,
  team_id,
  pattern_type,
  title,
  description,
  severity,
  occurrence_count,
  status,
  metadata
)
select
  team.organization_id,
  team.id,
  p.pattern_type,
  p.title,
  p.description,
  p.severity,
  p.occurrence_count,
  'active',
  '{"demo": true}'::jsonb
from team
cross join (
  values
    ('pressing', 'Late press breakdown', 'Wide CB steps late on switch of play.', 'medium', 4),
    ('readiness', 'Monday readiness dip', 'Avg readiness −8 pts after Sunday match.', 'low', 6),
    ('nutrition', 'Hydration variance', 'Match-day −1.2L vs training day average.', 'low', 3)
) as p(pattern_type, title, description, severity, occurrence_count)
where not exists (
  select 1 from public.team_patterns tp
  where tp.team_id = team.id and tp.title = p.title
);

with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  ),
  u_owner as (
    select id from public.users where lower(email) = lower('mustafaoguztargiz@gmail.com') limit 1
  )
insert into public.performance_goals (
  organization_id,
  team_id,
  athlete_id,
  title,
  description,
  category,
  target_value,
  current_value,
  unit,
  start_date,
  due_date,
  status,
  created_by
)
select
  team.organization_id,
  team.id,
  null,
  g.title,
  g.description,
  g.category,
  g.target_value,
  g.current_value,
  g.unit,
  current_date - 30,
  current_date + 60,
  'active',
  u_owner.id
from team, u_owner
cross join (
  values
    ('Season points target', 'Finish top 3 in league table.', 'team', 65, 48, 'points'),
    ('Injury reduction', 'Keep soft-tissue injuries ≤ 12% of squad.', 'medical', 12, 8, 'percent'),
    ('Pressing PPDA', 'Improve defensive intensity metric.', 'tactical', 8.5, 10.2, 'ppda')
) as g(title, description, category, target_value, current_value, unit)
where not exists (
  select 1 from public.performance_goals pg
  where pg.team_id = team.id and pg.title = g.title
);

with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  ),
  u_owner as (
    select id from public.users where lower(email) = lower('mustafaoguztargiz@gmail.com') limit 1
  )
insert into public.documents (
  organization_id,
  team_id,
  type,
  title,
  content,
  created_by
)
select
  org.id,
  team.id,
  d.type::public.document_type,
  d.title,
  d.content,
  u_owner.id
from org, team, u_owner
cross join (
  values
    ('coach_note', 'Pre-season philosophy', 'We prioritize positional play, rest defense, and individual skill blocks.'),
    ('team_pattern', 'Set-piece priorities', 'Near-post flick, far-post recycle, short corner variation B.'),
    ('recovery_note', 'Recovery day template', 'Pool optional, mobility mandatory, no high-speed runs.')
) as d(type, title, content)
where not exists (
  select 1 from public.documents doc
  where doc.organization_id = org.id and doc.title = d.title
);

with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  u_admin as (
    select id from public.users where lower(email) = lower('poyrazavsever@gmail.com') limit 1
  ),
  u_owner as (
    select id from public.users where lower(email) = lower('mustafaoguztargiz@gmail.com') limit 1
  )
insert into public.audit_logs (organization_id, user_id, action, entity_type, metadata)
select
  org.id,
  l.user_id,
  l.action,
  l.entity_type,
  l.metadata
from org
cross join (
  values
    ((select id from u_owner), 'demo.seed.completed', 'organization', '{"demo": true}'::jsonb),
    ((select id from u_admin), 'demo.seed.admin_bootstrap', 'organization', '{"role": "admin"}'::jsonb)
) as l(user_id, action, entity_type, metadata)
where not exists (
  select 1 from public.audit_logs al
  where al.organization_id = org.id and al.action = l.action
);

-- Assistant thread (team memory UI)
with
  org as (select id from public.organizations where slug = 'ohhike-demo-academy' limit 1),
  team as (
    select t.id, t.organization_id
    from public.teams t
    join org on org.id = t.organization_id
    where t.name = 'Demo U19 Elite'
    limit 1
  ),
  u_owner as (
    select id from public.users where lower(email) = lower('mustafaoguztargiz@gmail.com') limit 1
  ),
  ins_thread as (
    insert into public.assistant_threads (
      organization_id,
      team_id,
      created_by,
      title
    )
    select
      team.organization_id,
      team.id,
      u_owner.id,
      'Demo — Weekly planning chat'
    from team, u_owner
    where not exists (
      select 1
      from public.assistant_threads at
      where at.team_id = team.id
        and at.title = 'Demo — Weekly planning chat'
    )
    returning id
  ),
  thread as (
    select id from ins_thread
    union all
    select at.id
    from public.assistant_threads at
    join team on team.id = at.team_id
    where at.title = 'Demo — Weekly planning chat'
    limit 1
  )
insert into public.assistant_messages (thread_id, organization_id, role, content)
select
  thread.id,
  team.organization_id,
  m.role,
  m.content
from thread
cross join team
cross join (
  values
    ('user', 'What should we adjust before Friday friendly?'),
    ('assistant', 'Reduce high-speed running for amber readiness athletes; rehearse rest-defense shape; keep set-piece reps under 20 minutes total.')
) as m(role, content)
where not exists (
  select 1
  from public.assistant_messages am
  where am.thread_id = thread.id
    and am.content = m.content
);

commit;

-- ---------------------------------------------------------------------------
-- Verification (run after commit)
-- ---------------------------------------------------------------------------
select
  o.id as organization_id,
  o.name,
  o.slug,
  t.id as team_id,
  t.name as team_name,
  e.plan,
  (select count(*) from public.athletes a where a.team_id = t.id) as athletes,
  (select count(*) from public.sessions s where s.team_id = t.id) as sessions,
  (select count(*) from public.wellness_checkins w where w.team_id = t.id) as wellness_rows,
  (select count(*) from public.organization_members om where om.organization_id = o.id) as members
from public.organizations o
join public.teams t on t.organization_id = o.id and t.name = 'Demo U19 Elite'
left join public.team_billing_entitlements e on e.team_id = t.id
where o.slug = 'ohhike-demo-academy';

select
  u.email,
  om.role,
  u.display_name
from public.organization_members om
join public.users u on u.id = om.user_id
join public.organizations o on o.id = om.organization_id
where o.slug = 'ohhike-demo-academy'
order by om.role, u.email;
