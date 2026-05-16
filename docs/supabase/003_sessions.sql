-- OhHike CoachOS sessions migration
-- Scope: session planning foundation for the app /sessions module.
-- Safe to run after 001_initial_schema.sql and 002_phase1_foundation.sql.

do $$
begin
  create type session_type as enum (
    'team_training',
    'personal_training',
    'match',
    'friendly_match',
    'recovery',
    'test_day',
    'analysis_meeting',
    'nutrition_session',
    'education_session',
    'other'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type session_status as enum (
    'draft',
    'planned',
    'in_progress',
    'completed',
    'cancelled',
    'analyzing',
    'analysis_completed',
    'analysis_failed'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  type session_type not null,
  status session_status default 'draft',
  title varchar(255) not null,
  description text,
  opponent varchar(255),
  location varchar(255),
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  planned_duration_min integer,
  actual_duration_min integer,
  focus_area varchar(255),
  planned_intensity integer check (planned_intensity between 1 and 10),
  coach_notes text,
  created_by varchar(255) references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.session_attendance (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  attended boolean default false,
  absence_reason text,
  minutes_played integer,
  rpe integer check (rpe between 1 and 10),
  athlete_note text,
  coach_note text,
  pain_reported boolean default false,
  pain_area varchar(100),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (session_id, athlete_id)
);

create table if not exists public.training_blocks (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  title varchar(255) not null,
  description text,
  order_index integer not null default 0,
  planned_duration_min integer,
  actual_duration_min integer,
  intensity integer check (intensity between 1 and 10),
  drill_id uuid,
  completed boolean default false,
  notes text,
  created_at timestamptz default now()
);

drop trigger if exists set_sessions_updated_at on public.sessions;
create trigger set_sessions_updated_at
before update on public.sessions
for each row execute function set_updated_at();

drop trigger if exists set_session_attendance_updated_at on public.session_attendance;
create trigger set_session_attendance_updated_at
before update on public.session_attendance
for each row execute function set_updated_at();

create index if not exists idx_sessions_org on public.sessions(organization_id);
create index if not exists idx_sessions_team on public.sessions(team_id);
create index if not exists idx_sessions_scheduled_at on public.sessions(scheduled_at);
create index if not exists idx_attendance_session on public.session_attendance(session_id);
create index if not exists idx_attendance_athlete on public.session_attendance(athlete_id);
create index if not exists idx_training_blocks_session on public.training_blocks(session_id);

alter table public.sessions enable row level security;
alter table public.session_attendance enable row level security;
alter table public.training_blocks enable row level security;

drop policy if exists "Org members can view sessions" on public.sessions;
create policy "Org members can view sessions"
on public.sessions for select
using (public.is_org_member(organization_id));

drop policy if exists "Coaches can manage sessions" on public.sessions;
create policy "Coaches can manage sessions"
on public.sessions for all
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach']::organization_role[]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach']::organization_role[]
  )
);

drop policy if exists "Org members can view session attendance" on public.session_attendance;
create policy "Org members can view session attendance"
on public.session_attendance for select
using (
  exists (
    select 1
    from public.sessions
    where sessions.id = session_attendance.session_id
      and public.is_org_member(sessions.organization_id)
  )
);

drop policy if exists "Coaches can manage session attendance" on public.session_attendance;
create policy "Coaches can manage session attendance"
on public.session_attendance for all
using (
  exists (
    select 1
    from public.sessions
    where sessions.id = session_attendance.session_id
      and public.has_org_role(
        sessions.organization_id,
        array['owner', 'admin', 'head_coach', 'assistant_coach']::organization_role[]
      )
  )
)
with check (
  exists (
    select 1
    from public.sessions
    where sessions.id = session_attendance.session_id
      and public.has_org_role(
        sessions.organization_id,
        array['owner', 'admin', 'head_coach', 'assistant_coach']::organization_role[]
      )
  )
);

drop policy if exists "Org members can view training blocks" on public.training_blocks;
create policy "Org members can view training blocks"
on public.training_blocks for select
using (
  exists (
    select 1
    from public.sessions
    where sessions.id = training_blocks.session_id
      and public.is_org_member(sessions.organization_id)
  )
);

drop policy if exists "Coaches can manage training blocks" on public.training_blocks;
create policy "Coaches can manage training blocks"
on public.training_blocks for all
using (
  exists (
    select 1
    from public.sessions
    where sessions.id = training_blocks.session_id
      and public.has_org_role(
        sessions.organization_id,
        array['owner', 'admin', 'head_coach', 'assistant_coach']::organization_role[]
      )
  )
)
with check (
  exists (
    select 1
    from public.sessions
    where sessions.id = training_blocks.session_id
      and public.has_org_role(
        sessions.organization_id,
        array['owner', 'admin', 'head_coach', 'assistant_coach']::organization_role[]
      )
  )
);
