-- OhHike CoachOS team memory migration
-- Scope: athlete observations and recurring team patterns for /team-memory.
-- Safe to run after foundation and AI report migrations.

do $$
begin
  create type data_source as enum (
    'manual',
    'csv_import',
    'strava',
    'garmin',
    'apple_health',
    'health_connect',
    'system',
    'ai',
    'other'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.athlete_observations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  session_id uuid references public.sessions(id) on delete set null,
  ai_report_id uuid references public.ai_reports(id) on delete set null,
  source data_source default 'manual',
  category varchar(100),
  severity varchar(50),
  title varchar(255),
  observation text not null,
  recommendation text,
  is_resolved boolean default false,
  created_by varchar(255) references public.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.team_patterns (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  pattern_type varchar(100) not null,
  title varchar(255) not null,
  description text,
  severity varchar(50),
  occurrence_count integer default 1,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  status varchar(50) default 'active',
  related_ai_report_id uuid references public.ai_reports(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists set_team_patterns_updated_at on public.team_patterns;
create trigger set_team_patterns_updated_at
before update on public.team_patterns
for each row execute function set_updated_at();

create index if not exists idx_athlete_observations_org on public.athlete_observations(organization_id);
create index if not exists idx_athlete_observations_team on public.athlete_observations(team_id);
create index if not exists idx_athlete_observations_athlete on public.athlete_observations(athlete_id);
create index if not exists idx_team_patterns_org on public.team_patterns(organization_id);
create index if not exists idx_team_patterns_team on public.team_patterns(team_id);
create index if not exists idx_team_patterns_status on public.team_patterns(status);

alter table public.athlete_observations enable row level security;
alter table public.team_patterns enable row level security;

drop policy if exists "Org members can view athlete observations" on public.athlete_observations;
create policy "Org members can view athlete observations"
on public.athlete_observations for select
using (public.is_org_member(organization_id));

drop policy if exists "Coaches can manage athlete observations" on public.athlete_observations;
create policy "Coaches can manage athlete observations"
on public.athlete_observations for all
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach', 'analyst', 'physiotherapist', 'nutritionist']::organization_role[]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach', 'analyst', 'physiotherapist', 'nutritionist']::organization_role[]
  )
);

drop policy if exists "Org members can view team patterns" on public.team_patterns;
create policy "Org members can view team patterns"
on public.team_patterns for select
using (public.is_org_member(organization_id));

drop policy if exists "Coaches can manage team patterns" on public.team_patterns;
create policy "Coaches can manage team patterns"
on public.team_patterns for all
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
