-- Demo public coach profiles for /find-coach (CN1-08)
-- Run after 012_coach_network.sql. Requires at least one organization with an owner.

with owners as (
  select
    o.id as organization_id,
    om.user_id as coach_user_id,
    row_number() over (order by o.created_at asc) as row_num
  from public.organizations o
  join public.organization_members om
    on om.organization_id = o.id
   and om.role = 'owner'
   and om.is_active = true
),
seed as (
  select *
  from (
    values
      (
        1,
        'alex-rivers-running',
        'Alex Rivers',
        'Elite remote running coach',
        'Marathon and trail preparation with weekly proof-based feedback.',
        array['endurance', 'injury prevention'],
        array['running']::public.sport_type[],
        array['remote'],
        array['English'],
        'United States',
        'Boulder',
        12,
        'From $149 / month',
        6::numeric,
        4.9::numeric,
        28
      ),
      (
        2,
        'maya-chen-football',
        'Maya Chen',
        'Technical football development',
        'Position-specific remote programs for academy and adult players.',
        array['tactics', 'skills'],
        array['football']::public.sport_type[],
        array['remote', 'hybrid'],
        array['English', 'Spanish'],
        'Spain',
        'Barcelona',
        9,
        'From €120 / month',
        8::numeric,
        4.8::numeric,
        19
      ),
      (
        3,
        'jordan-kaya-fitness',
        'Jordan Kaya',
        'Strength & lifestyle fitness',
        'Remote hypertrophy and habit systems for busy professionals.',
        array['strength', 'nutrition habits'],
        array['fitness']::public.sport_type[],
        array['remote'],
        array['English', 'Turkish'],
        'Türkiye',
        'Istanbul',
        7,
        'From ₺2.500 / month',
        4::numeric,
        4.7::numeric,
        14
      )
  ) as rows(
    row_num,
    slug,
    display_name,
    headline,
    bio,
    specialties,
    sports,
    coaching_modes,
    languages,
    location_country,
    location_city,
    years_experience,
    pricing_display,
    response_time_avg_hours,
    average_rating,
    review_count
  )
)
insert into public.coach_marketplace_profiles (
  organization_id,
  coach_user_id,
  slug,
  display_name,
  headline,
  bio,
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
  review_count
)
select
  owners.organization_id,
  owners.coach_user_id,
  seed.slug,
  seed.display_name,
  seed.headline,
  seed.bio,
  seed.specialties,
  seed.sports,
  seed.coaching_modes,
  seed.languages,
  seed.location_country,
  seed.location_city,
  seed.years_experience,
  seed.pricing_display,
  seed.response_time_avg_hours,
  true,
  true,
  seed.average_rating,
  seed.review_count
from seed
join owners on owners.row_num = seed.row_num
on conflict (organization_id) do update set
  slug = excluded.slug,
  display_name = excluded.display_name,
  headline = excluded.headline,
  bio = excluded.bio,
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
  cp.organization_id,
  pkg.title,
  pkg.description,
  pkg.duration_weeks,
  pkg.price_cents,
  pkg.currency,
  true,
  pkg.sort_order
from public.coach_marketplace_profiles cp
join (
  values
    ('alex-rivers-running', '8-week marathon block', 'Weekly plan + proof review', 8, 14900, 'USD', 0),
    ('maya-chen-football', 'Technical block', 'Skills + match analysis', 6, 12000, 'EUR', 0),
    ('jordan-kaya-fitness', '12-week strength', 'Program + check-ins', 12, 250000, 'TRY', 0)
) as pkg(slug, title, description, duration_weeks, price_cents, currency, sort_order)
  on cp.slug = pkg.slug
where not exists (
  select 1
  from public.coaching_packages existing
  where existing.coach_profile_id = cp.id
    and existing.title = pkg.title
);
