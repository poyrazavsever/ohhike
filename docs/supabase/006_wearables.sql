-- OhHike CoachOS wearables migration
-- Scope: wearable provider connections and normalized summaries for /wearables.
-- Safe to run after foundation migrations.

do $$
begin
  create type wearable_provider as enum (
    'strava',
    'garmin',
    'apple_health',
    'health_connect',
    'polar',
    'fitbit',
    'manual',
    'csv_import',
    'other'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.wearable_connections (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  user_id varchar(255) references public.users(id) on delete set null,
  provider wearable_provider not null,
  provider_user_id varchar(255),
  access_token_encrypted text,
  refresh_token_encrypted text,
  token_expires_at timestamptz,
  scopes text[],
  is_active boolean default true,
  last_synced_at timestamptz,
  sync_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (athlete_id, provider)
);

create table if not exists public.wearable_daily_summaries (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  provider wearable_provider not null,
  summary_date date not null,
  steps integer,
  active_minutes integer,
  distance_km numeric(8, 2),
  calories integer,
  resting_heart_rate integer,
  avg_heart_rate integer,
  max_heart_rate integer,
  hrv numeric(8, 2),
  sleep_hours numeric(4, 2),
  sleep_score integer check (sleep_score between 0 and 100),
  stress_score integer check (stress_score between 0 and 100),
  raw_payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (athlete_id, provider, summary_date)
);

create table if not exists public.wearable_activities (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  provider wearable_provider not null,
  provider_activity_id varchar(255),
  activity_type varchar(100),
  title varchar(255),
  started_at timestamptz,
  duration_sec integer,
  distance_km numeric(8, 2),
  avg_heart_rate integer,
  max_heart_rate integer,
  calories integer,
  elevation_gain_m numeric(8, 2),
  matched_session_id uuid references public.sessions(id) on delete set null,
  raw_payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (provider, provider_activity_id)
);

drop trigger if exists set_wearable_connections_updated_at on public.wearable_connections;
create trigger set_wearable_connections_updated_at
before update on public.wearable_connections
for each row execute function set_updated_at();

create index if not exists idx_wearable_connections_org on public.wearable_connections(organization_id);
create index if not exists idx_wearable_connections_athlete on public.wearable_connections(athlete_id);
create index if not exists idx_wearable_summaries_org_date on public.wearable_daily_summaries(organization_id, summary_date);
create index if not exists idx_wearable_summaries_athlete on public.wearable_daily_summaries(athlete_id);
create index if not exists idx_wearable_activities_org_started on public.wearable_activities(organization_id, started_at);
create index if not exists idx_wearable_activities_athlete on public.wearable_activities(athlete_id);

alter table public.wearable_connections enable row level security;
alter table public.wearable_daily_summaries enable row level security;
alter table public.wearable_activities enable row level security;

drop policy if exists "Org members can view wearable connections" on public.wearable_connections;
create policy "Org members can view wearable connections"
on public.wearable_connections for select
using (public.is_org_member(organization_id));

drop policy if exists "Coaches can manage wearable connections" on public.wearable_connections;
create policy "Coaches can manage wearable connections"
on public.wearable_connections for all
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach', 'analyst']::organization_role[]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach', 'analyst']::organization_role[]
  )
);

drop policy if exists "Org members can view wearable summaries" on public.wearable_daily_summaries;
create policy "Org members can view wearable summaries"
on public.wearable_daily_summaries for select
using (public.is_org_member(organization_id));

drop policy if exists "Coaches can manage wearable summaries" on public.wearable_daily_summaries;
create policy "Coaches can manage wearable summaries"
on public.wearable_daily_summaries for all
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach', 'analyst']::organization_role[]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach', 'analyst']::organization_role[]
  )
);

drop policy if exists "Org members can view wearable activities" on public.wearable_activities;
create policy "Org members can view wearable activities"
on public.wearable_activities for select
using (public.is_org_member(organization_id));

drop policy if exists "Coaches can manage wearable activities" on public.wearable_activities;
create policy "Coaches can manage wearable activities"
on public.wearable_activities for all
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach', 'analyst']::organization_role[]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach', 'analyst']::organization_role[]
  )
);
