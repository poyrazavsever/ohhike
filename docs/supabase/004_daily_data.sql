-- OhHike CoachOS daily data migration
-- Scope: athlete readiness and nutrition foundations for Performance Data routes.
-- Safe to run after 001_initial_schema.sql, 002_phase1_foundation.sql and 003_sessions.sql.

create table if not exists public.wellness_checkins (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  checkin_date date not null default current_date,
  sleep_quality integer check (sleep_quality between 1 and 10),
  sleep_hours numeric(4, 2),
  fatigue integer check (fatigue between 1 and 10),
  muscle_soreness integer check (muscle_soreness between 1 and 10),
  stress integer check (stress between 1 and 10),
  mood integer check (mood between 1 and 10),
  readiness_score integer check (readiness_score between 0 and 100),
  pain_area varchar(100),
  notes text,
  created_by varchar(255) references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (athlete_id, checkin_date)
);

create table if not exists public.nutrition_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  log_date date not null default current_date,
  hydration_score integer check (hydration_score between 1 and 10),
  meal_quality integer check (meal_quality between 1 and 10),
  protein_servings integer,
  carbs_timing varchar(100),
  supplements text,
  notes text,
  created_by varchar(255) references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (athlete_id, log_date)
);

drop trigger if exists set_wellness_checkins_updated_at on public.wellness_checkins;
create trigger set_wellness_checkins_updated_at
before update on public.wellness_checkins
for each row execute function set_updated_at();

drop trigger if exists set_nutrition_logs_updated_at on public.nutrition_logs;
create trigger set_nutrition_logs_updated_at
before update on public.nutrition_logs
for each row execute function set_updated_at();

create index if not exists idx_wellness_checkins_org_date on public.wellness_checkins(organization_id, checkin_date);
create index if not exists idx_wellness_checkins_team_date on public.wellness_checkins(team_id, checkin_date);
create index if not exists idx_wellness_checkins_athlete on public.wellness_checkins(athlete_id);
create index if not exists idx_nutrition_logs_org_date on public.nutrition_logs(organization_id, log_date);
create index if not exists idx_nutrition_logs_team_date on public.nutrition_logs(team_id, log_date);
create index if not exists idx_nutrition_logs_athlete on public.nutrition_logs(athlete_id);

alter table public.wellness_checkins enable row level security;
alter table public.nutrition_logs enable row level security;

drop policy if exists "Org members can view wellness checkins" on public.wellness_checkins;
create policy "Org members can view wellness checkins"
on public.wellness_checkins for select
using (public.is_org_member(organization_id));

drop policy if exists "Coaches can manage wellness checkins" on public.wellness_checkins;
create policy "Coaches can manage wellness checkins"
on public.wellness_checkins for all
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach', 'physiotherapist']::organization_role[]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach', 'physiotherapist']::organization_role[]
  )
);

drop policy if exists "Athletes can manage own wellness checkins" on public.wellness_checkins;
create policy "Athletes can manage own wellness checkins"
on public.wellness_checkins for all
using (public.is_athlete_self(athlete_id))
with check (public.is_athlete_self(athlete_id));

drop policy if exists "Org members can view nutrition logs" on public.nutrition_logs;
create policy "Org members can view nutrition logs"
on public.nutrition_logs for select
using (public.is_org_member(organization_id));

drop policy if exists "Coaches can manage nutrition logs" on public.nutrition_logs;
create policy "Coaches can manage nutrition logs"
on public.nutrition_logs for all
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach', 'nutritionist']::organization_role[]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach', 'nutritionist']::organization_role[]
  )
);

drop policy if exists "Athletes can manage own nutrition logs" on public.nutrition_logs;
create policy "Athletes can manage own nutrition logs"
on public.nutrition_logs for all
using (public.is_athlete_self(athlete_id))
with check (public.is_athlete_self(athlete_id));
