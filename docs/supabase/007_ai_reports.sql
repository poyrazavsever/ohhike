-- OhHike CoachOS AI reports migration
-- Scope: AI report registry foundation for /ai-reports.
-- Safe to run after foundation migrations.

do $$
begin
  create type ai_report_type as enum (
    'session_analysis',
    'match_analysis',
    'training_analysis',
    'player_development',
    'weekly_team_report',
    'load_report',
    'readiness_report',
    'nutrition_report',
    'scout_report'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.ai_reports (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  athlete_id uuid references public.athletes(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  report_type ai_report_type not null,
  title varchar(255) not null,
  summary text,
  confidence_score numeric(4, 2),
  model_provider varchar(100),
  model_name varchar(100),
  prompt_version varchar(50),
  tactical_observations jsonb default '[]'::jsonb,
  athlete_observations jsonb default '[]'::jsonb,
  load_observations jsonb default '[]'::jsonb,
  nutrition_observations jsonb default '[]'::jsonb,
  risk_alerts jsonb default '[]'::jsonb,
  recommended_drills jsonb default '[]'::jsonb,
  next_training_plan jsonb default '{}'::jsonb,
  raw_input jsonb default '{}'::jsonb,
  raw_output jsonb default '{}'::jsonb,
  created_by varchar(255) references public.users(id) on delete set null,
  created_at timestamptz default now()
);

create index if not exists idx_ai_reports_org_created on public.ai_reports(organization_id, created_at);
create index if not exists idx_ai_reports_team on public.ai_reports(team_id);
create index if not exists idx_ai_reports_athlete on public.ai_reports(athlete_id);
create index if not exists idx_ai_reports_session on public.ai_reports(session_id);
create index if not exists idx_ai_reports_type on public.ai_reports(report_type);

alter table public.ai_reports enable row level security;

drop policy if exists "Org members can view ai reports" on public.ai_reports;
create policy "Org members can view ai reports"
on public.ai_reports for select
using (public.is_org_member(organization_id));

drop policy if exists "Coaches can manage ai reports" on public.ai_reports;
create policy "Coaches can manage ai reports"
on public.ai_reports for all
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
