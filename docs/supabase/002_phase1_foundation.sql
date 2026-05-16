-- OhHike CoachOS phase 1 foundation migration
-- Source: docs/AgentGorevDagilimi.md, docs/DatabaseSchema.md, docs/PricingPolicy.md
-- Scope: foundation tables, team-level entitlements, RLS helpers and policies.
--
-- This migration is intentionally idempotent. It can be applied after the
-- existing 001_initial_schema.sql without dropping or rewriting data.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$
begin
  create type organization_type as enum (
    'club',
    'academy',
    'individual_coach',
    'school_team',
    'university_team',
    'performance_center',
    'other'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type organization_role as enum (
    'owner',
    'admin',
    'head_coach',
    'assistant_coach',
    'analyst',
    'physiotherapist',
    'nutritionist',
    'athlete',
    'viewer'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type sport_type as enum (
    'football',
    'basketball',
    'volleyball',
    'handball',
    'running',
    'fitness',
    'tennis',
    'swimming',
    'martial_arts',
    'esports',
    'other'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type athlete_status as enum (
    'active',
    'injured',
    'recovery',
    'inactive',
    'monitoring'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type team_plan_tier as enum (
    'basic_team',
    'pro_team',
    'pro_plus_team'
  );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Updated timestamp helper
-- ---------------------------------------------------------------------------

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.users (
  id varchar(255) primary key,
  email varchar(255) unique not null,
  display_name varchar(150),
  avatar_url text,
  phone varchar(50),
  locale varchar(20) default 'tr',
  timezone varchar(100) default 'Europe/Istanbul',
  last_active_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  slug varchar(255) unique not null,
  type organization_type not null default 'club',
  logo_url text,
  country varchar(100),
  city varchar(100),
  billing_customer_id varchar(255),
  is_self_hosted boolean default false,
  settings jsonb default '{}'::jsonb,
  created_by varchar(255) references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.organization_members (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id varchar(255) not null references public.users(id) on delete cascade,
  role organization_role not null default 'viewer',
  is_active boolean default true,
  invited_by varchar(255) references public.users(id) on delete set null,
  joined_at timestamptz default now(),
  unique (organization_id, user_id)
);

create table if not exists public.teams (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name varchar(255) not null,
  sport_type sport_type not null default 'football',
  age_group varchar(50),
  level varchar(100),
  default_formation varchar(50),
  season_goal text,
  weekly_training_count integer default 0,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.team_staff (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id varchar(255) not null references public.users(id) on delete cascade,
  role organization_role not null,
  assigned_by varchar(255) references public.users(id) on delete set null,
  created_at timestamptz default now(),
  unique (team_id, user_id, role)
);

create table if not exists public.athletes (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id varchar(255) references public.users(id) on delete set null,
  first_name varchar(100) not null,
  last_name varchar(100),
  display_name varchar(150),
  email varchar(255),
  phone varchar(50),
  number integer,
  position varchar(100),
  birth_date date,
  height_cm numeric(5,2),
  weight_kg numeric(5,2),
  dominant_side varchar(50),
  status athlete_status default 'active',
  notes text,
  metadata jsonb default '{}'::jsonb,
  created_by varchar(255) references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.athlete_invites (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  email varchar(255),
  token text unique not null,
  invited_by varchar(255) references public.users(id) on delete set null,
  accepted_by varchar(255) references public.users(id) on delete set null,
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.team_billing_entitlements (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  plan team_plan_tier not null default 'basic_team',
  max_team_members integer not null default 3,
  ai_features_enabled boolean not null default false,
  ai_reports_enabled boolean not null default false,
  team_memory_enabled boolean not null default false,
  training_planner_enabled boolean not null default false,
  wearable_enabled boolean not null default false,
  pdf_export_enabled boolean not null default false,
  branded_reports_enabled boolean not null default false,
  monthly_ai_report_limit integer not null default 0,
  clerk_subscription_id varchar(255),
  clerk_plan_id varchar(255),
  current_period_start timestamptz,
  current_period_end timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (team_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id varchar(255) references public.users(id) on delete set null,
  action varchar(255) not null,
  entity_type varchar(100),
  entity_id uuid,
  ip_address varchar(100),
  user_agent text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function set_updated_at();

drop trigger if exists set_organizations_updated_at on public.organizations;
create trigger set_organizations_updated_at
before update on public.organizations
for each row execute function set_updated_at();

drop trigger if exists set_teams_updated_at on public.teams;
create trigger set_teams_updated_at
before update on public.teams
for each row execute function set_updated_at();

drop trigger if exists set_athletes_updated_at on public.athletes;
create trigger set_athletes_updated_at
before update on public.athletes
for each row execute function set_updated_at();

drop trigger if exists set_team_billing_entitlements_updated_at on public.team_billing_entitlements;
create trigger set_team_billing_entitlements_updated_at
before update on public.team_billing_entitlements
for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists idx_organizations_slug on public.organizations(slug);
create index if not exists idx_org_members_user on public.organization_members(user_id);
create index if not exists idx_org_members_org on public.organization_members(organization_id);
create index if not exists idx_teams_org on public.teams(organization_id);
create index if not exists idx_team_staff_team on public.team_staff(team_id);
create index if not exists idx_team_staff_user on public.team_staff(user_id);
create index if not exists idx_athletes_org on public.athletes(organization_id);
create index if not exists idx_athletes_team on public.athletes(team_id);
create index if not exists idx_athletes_user on public.athletes(user_id);
create index if not exists idx_athlete_invites_token on public.athlete_invites(token);
create index if not exists idx_team_billing_org on public.team_billing_entitlements(organization_id);
create index if not exists idx_audit_logs_org on public.audit_logs(organization_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at);

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------

create or replace function public.current_user_id()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() ->> 'sub', ''),
    nullif(current_setting('request.jwt.claim.sub', true), '')
  );
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = org_id
      and user_id = public.current_user_id()
      and is_active = true
  );
$$;

create or replace function public.has_org_role(
  org_id uuid,
  allowed_roles organization_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_id = org_id
      and user_id = public.current_user_id()
      and role = any(allowed_roles)
      and is_active = true
  );
$$;

create or replace function public.is_team_staff(team_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_staff
    where team_id = team_uuid
      and user_id = public.current_user_id()
  );
$$;

create or replace function public.is_athlete_self(athlete_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.athletes
    where id = athlete_uuid
      and user_id = public.current_user_id()
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.teams enable row level security;
alter table public.team_staff enable row level security;
alter table public.athletes enable row level security;
alter table public.athlete_invites enable row level security;
alter table public.team_billing_entitlements enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
on public.users for select
using (id = public.current_user_id());

drop policy if exists "Users can update own profile" on public.users;
create policy "Users can update own profile"
on public.users for update
using (id = public.current_user_id())
with check (id = public.current_user_id());

drop policy if exists "Users can insert own profile" on public.users;
create policy "Users can insert own profile"
on public.users for insert
with check (id = public.current_user_id());

drop policy if exists "Members can view organizations" on public.organizations;
create policy "Members can view organizations"
on public.organizations for select
using (public.is_org_member(id));

drop policy if exists "Authenticated users can create organizations" on public.organizations;
create policy "Authenticated users can create organizations"
on public.organizations for insert
with check (created_by = public.current_user_id());

drop policy if exists "Owners and admins can update organizations" on public.organizations;
create policy "Owners and admins can update organizations"
on public.organizations for update
using (public.has_org_role(id, array['owner', 'admin']::organization_role[]))
with check (public.has_org_role(id, array['owner', 'admin']::organization_role[]));

drop policy if exists "Members can view organization members" on public.organization_members;
create policy "Members can view organization members"
on public.organization_members for select
using (public.is_org_member(organization_id));

drop policy if exists "Users can create own owner bootstrap membership" on public.organization_members;
create policy "Users can create own owner bootstrap membership"
on public.organization_members for insert
with check (
  user_id = public.current_user_id()
  and role = 'owner'
);

drop policy if exists "Owners and admins can manage organization members" on public.organization_members;
create policy "Owners and admins can manage organization members"
on public.organization_members for all
using (public.has_org_role(organization_id, array['owner', 'admin']::organization_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin']::organization_role[]));

drop policy if exists "Org members can view teams" on public.teams;
create policy "Org members can view teams"
on public.teams for select
using (public.is_org_member(organization_id));

drop policy if exists "Coaches can manage teams" on public.teams;
create policy "Coaches can manage teams"
on public.teams for all
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach']::organization_role[]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach']::organization_role[]
  )
);

drop policy if exists "Org members can view team staff" on public.team_staff;
create policy "Org members can view team staff"
on public.team_staff for select
using (
  exists (
    select 1 from public.teams
    where teams.id = team_staff.team_id
      and public.is_org_member(teams.organization_id)
  )
);

drop policy if exists "Owners and admins can manage team staff" on public.team_staff;
create policy "Owners and admins can manage team staff"
on public.team_staff for all
using (
  exists (
    select 1 from public.teams
    where teams.id = team_staff.team_id
      and public.has_org_role(teams.organization_id, array['owner', 'admin']::organization_role[])
  )
)
with check (
  exists (
    select 1 from public.teams
    where teams.id = team_staff.team_id
      and public.has_org_role(teams.organization_id, array['owner', 'admin']::organization_role[])
  )
);

drop policy if exists "Team staff and athlete can view athletes" on public.athletes;
create policy "Team staff and athlete can view athletes"
on public.athletes for select
using (
  public.is_org_member(organization_id)
  or public.is_athlete_self(id)
);

drop policy if exists "Coaches can manage athletes" on public.athletes;
create policy "Coaches can manage athletes"
on public.athletes for all
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

drop policy if exists "Coaches can manage athlete invites" on public.athlete_invites;
create policy "Coaches can manage athlete invites"
on public.athlete_invites for all
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

drop policy if exists "Athletes can view own invite" on public.athlete_invites;
create policy "Athletes can view own invite"
on public.athlete_invites for select
using (
  accepted_by = public.current_user_id()
  or exists (
    select 1 from public.athletes
    where athletes.id = athlete_invites.athlete_id
      and athletes.user_id = public.current_user_id()
  )
);

drop policy if exists "Org admins can view team billing entitlements" on public.team_billing_entitlements;
create policy "Org admins can view team billing entitlements"
on public.team_billing_entitlements for select
using (public.has_org_role(organization_id, array['owner', 'admin']::organization_role[]));

drop policy if exists "Org admins can manage team billing entitlements" on public.team_billing_entitlements;
create policy "Org admins can manage team billing entitlements"
on public.team_billing_entitlements for all
using (public.has_org_role(organization_id, array['owner', 'admin']::organization_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin']::organization_role[]));

drop policy if exists "Owners and admins can view audit logs" on public.audit_logs;
create policy "Owners and admins can view audit logs"
on public.audit_logs for select
using (
  organization_id is null
  or public.has_org_role(organization_id, array['owner', 'admin']::organization_role[])
);

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('organization-logos', 'organization-logos', true)
on conflict (id) do nothing;
