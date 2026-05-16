-- OhHike CoachOS initial Supabase migration
-- Source: docs/DatabaseSchema.md
-- Scope: extensions, enums, tables, indexes, storage buckets, RLS helpers,
-- table policies and storage object policies.

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
  create type subscription_tier as enum (
    'free',
    'coach_pro',
    'club',
    'enterprise',
    'self_hosted'
  );
exception when duplicate_object then null;
end $$;

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

do $$
begin
  create type media_type as enum (
    'pdf',
    'csv',
    'document',
    'other'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type processing_status as enum (
    'pending',
    'processing',
    'completed',
    'failed'
  );
exception when duplicate_object then null;
end $$;

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

do $$
begin
  create type document_type as enum (
    'session_report',
    'coach_note',
    'athlete_note',
    'player_observation',
    'team_pattern',
    'training_plan',
    'drill',
    'nutrition_note',
    'recovery_note',
    'wearable_summary',
    'csv_summary',
    'ai_report',
    'other'
  );
exception when duplicate_object then null;
end $$;

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

-- Clerk users mirrored into Supabase.
create table if not exists users (
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

-- Tenant root: club, academy, individual coach account or similar.
create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name varchar(255) not null,
  slug varchar(255) unique not null,
  type organization_type not null default 'club',
  logo_url text,
  country varchar(100),
  city varchar(100),
  subscription_tier subscription_tier default 'free',
  billing_customer_id varchar(255),
  is_self_hosted boolean default false,
  settings jsonb default '{}'::jsonb,
  created_by varchar(255) references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Organization membership and organization-level roles.
create table if not exists organization_members (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id varchar(255) not null references users(id) on delete cascade,
  role organization_role not null default 'viewer',
  is_active boolean default true,
  invited_by varchar(255) references users(id) on delete set null,
  joined_at timestamptz default now(),
  unique (organization_id, user_id)
);

-- Sports team inside an organization.
create table if not exists teams (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
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

-- Team-specific staff assignments.
create table if not exists team_staff (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references teams(id) on delete cascade,
  user_id varchar(255) not null references users(id) on delete cascade,
  role organization_role not null,
  assigned_by varchar(255) references users(id) on delete set null,
  created_at timestamptz default now(),
  unique (team_id, user_id, role)
);

-- Coach-created athlete profile. user_id is nullable until the athlete claims it.
create table if not exists athletes (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  user_id varchar(255) references users(id) on delete set null,
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
  created_by varchar(255) references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Invite tokens for athlete profile claim flow.
create table if not exists athlete_invites (
  id uuid primary key default uuid_generate_v4(),
  athlete_id uuid not null references athletes(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  email varchar(255),
  token text unique not null,
  invited_by varchar(255) references users(id) on delete set null,
  accepted_by varchar(255) references users(id) on delete set null,
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

-- Team training, match, recovery, testing and analysis sessions.
create table if not exists sessions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
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
  created_by varchar(255) references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Session attendance and post-session athlete data.
create table if not exists session_attendance (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
  athlete_id uuid not null references athletes(id) on delete cascade,
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

-- Blocks inside a training session.
create table if not exists training_blocks (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references sessions(id) on delete cascade,
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

-- Athlete personal work outside team sessions.
create table if not exists personal_trainings (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  athlete_id uuid not null references athletes(id) on delete cascade,
  source data_source default 'manual',
  wearable_activity_id uuid,
  title varchar(255),
  training_type varchar(100),
  started_at timestamptz,
  duration_min integer,
  distance_km numeric(8,2),
  rpe integer check (rpe between 1 and 10),
  notes text,
  coach_reviewed boolean default false,
  coach_note text,
  created_at timestamptz default now()
);

-- Daily athlete readiness and wellness check-ins.
create table if not exists wellness_checkins (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  athlete_id uuid not null references athletes(id) on delete cascade,
  checkin_date date not null default current_date,
  source data_source default 'manual',
  sleep_hours numeric(4,2),
  sleep_quality integer check (sleep_quality between 1 and 10),
  energy_score integer check (energy_score between 1 and 10),
  soreness_score integer check (soreness_score between 1 and 10),
  stress_score integer check (stress_score between 1 and 10),
  motivation_score integer check (motivation_score between 1 and 10),
  readiness_score integer check (readiness_score between 0 and 100),
  pain_reported boolean default false,
  pain_area varchar(100),
  illness_symptoms boolean default false,
  notes text,
  ai_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (athlete_id, checkin_date)
);

-- Habit-oriented nutrition and hydration log, not a medical diet plan.
create table if not exists nutrition_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  athlete_id uuid not null references athletes(id) on delete cascade,
  log_date date not null default current_date,
  water_ml integer default 0,
  target_water_ml integer,
  breakfast_logged boolean default false,
  lunch_logged boolean default false,
  dinner_logged boolean default false,
  snack_logged boolean default false,
  pre_training_meal boolean,
  post_training_meal boolean,
  protein_goal_met boolean,
  carb_goal_met boolean,
  athlete_notes text,
  nutritionist_notes text,
  ai_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (athlete_id, log_date)
);

-- Athlete wearable provider connections. Token columns must contain encrypted values.
create table if not exists wearable_connections (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  athlete_id uuid not null references athletes(id) on delete cascade,
  user_id varchar(255) references users(id) on delete set null,
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

-- Normalized daily wearable summaries.
create table if not exists wearable_daily_summaries (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  athlete_id uuid not null references athletes(id) on delete cascade,
  provider wearable_provider not null,
  summary_date date not null,
  steps integer,
  active_minutes integer,
  distance_km numeric(8,2),
  calories integer,
  resting_heart_rate integer,
  avg_heart_rate integer,
  max_heart_rate integer,
  hrv numeric(8,2),
  sleep_hours numeric(4,2),
  sleep_score integer check (sleep_score between 0 and 100),
  stress_score integer check (stress_score between 0 and 100),
  raw_payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (athlete_id, provider, summary_date)
);

-- Normalized wearable activities.
create table if not exists wearable_activities (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  athlete_id uuid not null references athletes(id) on delete cascade,
  provider wearable_provider not null,
  provider_activity_id varchar(255),
  activity_type varchar(100),
  title varchar(255),
  started_at timestamptz,
  duration_sec integer,
  distance_km numeric(8,2),
  avg_heart_rate integer,
  max_heart_rate integer,
  calories integer,
  elevation_gain_m numeric(8,2),
  matched_personal_training_id uuid,
  matched_session_id uuid,
  raw_payload jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (provider, provider_activity_id)
);

-- Files uploaded for a session.
create table if not exists session_files (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  session_id uuid not null references sessions(id) on delete cascade,
  uploaded_by varchar(255) references users(id) on delete set null,
  file_type media_type not null,
  file_name varchar(255),
  file_url text not null,
  storage_path text,
  mime_type varchar(100),
  file_size_bytes bigint,
  duration_sec integer,
  processing_status processing_status default 'pending',
  processing_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Summaries extracted from imported/uploaded session files.
create table if not exists session_file_summaries (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  session_id uuid not null references sessions(id) on delete cascade,
  file_id uuid not null references session_files(id) on delete cascade,
  summary_text text not null,
  storage_path text,
  timestamp_sec integer,
  chunk_index integer,
  ai_caption text,
  ai_detected_context jsonb default '{}'::jsonb,
  selected_for_analysis boolean default true,
  created_at timestamptz default now()
);

-- AI-generated reports.
create table if not exists ai_reports (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  athlete_id uuid references athletes(id) on delete set null,
  session_id uuid references sessions(id) on delete set null,
  report_type ai_report_type not null,
  title varchar(255) not null,
  summary text,
  confidence_score numeric(4,2),
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
  created_by varchar(255) references users(id) on delete set null,
  created_at timestamptz default now()
);

-- Athlete-level observations produced by coach or AI.
create table if not exists athlete_observations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  athlete_id uuid not null references athletes(id) on delete cascade,
  session_id uuid references sessions(id) on delete set null,
  ai_report_id uuid references ai_reports(id) on delete set null,
  source data_source default 'manual',
  category varchar(100),
  severity varchar(50),
  title varchar(255),
  observation text not null,
  recommendation text,
  is_resolved boolean default false,
  created_by varchar(255) references users(id) on delete set null,
  created_at timestamptz default now()
);

-- Repeating team patterns and development areas.
create table if not exists team_patterns (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  pattern_type varchar(100) not null,
  title varchar(255) not null,
  description text,
  severity varchar(50),
  occurrence_count integer default 1,
  first_seen_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  status varchar(50) default 'active',
  related_ai_report_id uuid references ai_reports(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Drill library.
create table if not exists drills (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  created_by varchar(255) references users(id) on delete set null,
  sport_type sport_type not null default 'football',
  title varchar(255) not null,
  category varchar(100),
  description text,
  objective text,
  duration_min integer,
  difficulty varchar(50),
  player_count_min integer,
  player_count_max integer,
  area_setup text,
  equipment text,
  instructions text,
  coaching_points text,
  tags text[],
  is_system_drill boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI or coach-created training plans.
create table if not exists training_plans (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  athlete_id uuid references athletes(id) on delete set null,
  session_id uuid references sessions(id) on delete set null,
  title varchar(255) not null,
  objective text,
  duration_min integer,
  intensity integer check (intensity between 1 and 10),
  plan_blocks jsonb default '[]'::jsonb,
  generated_by_ai boolean default false,
  ai_report_id uuid references ai_reports(id) on delete set null,
  created_by varchar(255) references users(id) on delete set null,
  created_at timestamptz default now()
);

-- Team or athlete goals.
create table if not exists performance_goals (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid references teams(id) on delete cascade,
  athlete_id uuid references athletes(id) on delete cascade,
  title varchar(255) not null,
  description text,
  category varchar(100),
  target_value numeric(10,2),
  current_value numeric(10,2),
  unit varchar(50),
  start_date date,
  due_date date,
  status varchar(50) default 'active',
  created_by varchar(255) references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Team Memory document store.
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  athlete_id uuid references athletes(id) on delete set null,
  session_id uuid references sessions(id) on delete set null,
  ai_report_id uuid references ai_reports(id) on delete set null,
  type document_type not null,
  title varchar(255) not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_by varchar(255) references users(id) on delete set null,
  created_at timestamptz default now()
);

-- pgvector chunks for Team Memory retrieval.
create table if not exists document_embeddings (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references documents(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  chunk_index integer not null,
  content_chunk text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

-- Team Memory assistant threads.
create table if not exists assistant_threads (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  athlete_id uuid references athletes(id) on delete set null,
  title varchar(255),
  created_by varchar(255) references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Team Memory assistant messages.
create table if not exists assistant_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references assistant_threads(id) on delete cascade,
  organization_id uuid not null references organizations(id) on delete cascade,
  role varchar(50) not null,
  content text not null,
  retrieved_document_ids uuid[],
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Generated PDF/shareable report records.
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  team_id uuid references teams(id) on delete set null,
  athlete_id uuid references athletes(id) on delete set null,
  session_id uuid references sessions(id) on delete set null,
  ai_report_id uuid references ai_reports(id) on delete set null,
  title varchar(255) not null,
  report_type varchar(100),
  file_url text,
  share_token text unique,
  is_public boolean default false,
  expires_at timestamptz,
  created_by varchar(255) references users(id) on delete set null,
  created_at timestamptz default now()
);

-- Organization/self-host API keys. encrypted_key must be encrypted server-side.
create table if not exists api_keys (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  provider varchar(100) not null,
  encrypted_key text not null,
  label varchar(255),
  is_active boolean default true,
  last_used_at timestamptz,
  created_by varchar(255) references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Organization-scoped entitlement cache from billing webhooks.
-- Note: docs/PricingPolicy.md later updates commercial policy to team-level
-- entitlements. Keep this organization-level table for v3.0 compatibility;
-- add team-level entitlement migration when app billing is implemented.
create table if not exists billing_entitlements (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id) on delete cascade,
  plan subscription_tier not null default 'free',
  max_teams integer,
  max_athletes integer,
  max_staff integer,
  max_sessions_per_month integer,
  max_ai_reports_per_month integer,
  advanced_ai_analysis_enabled boolean default false,
  wearable_enabled boolean default false,
  team_memory_enabled boolean default false,
  branded_reports_enabled boolean default false,
  current_period_start timestamptz,
  current_period_end timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (organization_id)
);

-- Security and business audit trail.
create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references organizations(id) on delete cascade,
  user_id varchar(255) references users(id) on delete set null,
  action varchar(255) not null,
  entity_type varchar(100),
  entity_id uuid,
  ip_address varchar(100),
  user_agent text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Add delayed foreign keys that reference later-created tables.
do $$
begin
  alter table training_blocks
    add constraint training_blocks_drill_id_fkey
    foreign key (drill_id) references drills(id) on delete set null;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table personal_trainings
    add constraint personal_trainings_wearable_activity_id_fkey
    foreign key (wearable_activity_id) references wearable_activities(id) on delete set null;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table wearable_activities
    add constraint wearable_activities_matched_personal_training_id_fkey
    foreign key (matched_personal_training_id) references personal_trainings(id) on delete set null;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table wearable_activities
    add constraint wearable_activities_matched_session_id_fkey
    foreign key (matched_session_id) references sessions(id) on delete set null;
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Updated timestamp triggers
-- ---------------------------------------------------------------------------

drop trigger if exists users_set_updated_at on users;
create trigger users_set_updated_at
before update on users
for each row execute function set_updated_at();

drop trigger if exists organizations_set_updated_at on organizations;
create trigger organizations_set_updated_at
before update on organizations
for each row execute function set_updated_at();

drop trigger if exists teams_set_updated_at on teams;
create trigger teams_set_updated_at
before update on teams
for each row execute function set_updated_at();

drop trigger if exists athletes_set_updated_at on athletes;
create trigger athletes_set_updated_at
before update on athletes
for each row execute function set_updated_at();

drop trigger if exists sessions_set_updated_at on sessions;
create trigger sessions_set_updated_at
before update on sessions
for each row execute function set_updated_at();

drop trigger if exists session_attendance_set_updated_at on session_attendance;
create trigger session_attendance_set_updated_at
before update on session_attendance
for each row execute function set_updated_at();

drop trigger if exists wellness_checkins_set_updated_at on wellness_checkins;
create trigger wellness_checkins_set_updated_at
before update on wellness_checkins
for each row execute function set_updated_at();

drop trigger if exists nutrition_logs_set_updated_at on nutrition_logs;
create trigger nutrition_logs_set_updated_at
before update on nutrition_logs
for each row execute function set_updated_at();

drop trigger if exists wearable_connections_set_updated_at on wearable_connections;
create trigger wearable_connections_set_updated_at
before update on wearable_connections
for each row execute function set_updated_at();

drop trigger if exists session_files_set_updated_at on session_files;
create trigger session_files_set_updated_at
before update on session_files
for each row execute function set_updated_at();

drop trigger if exists team_patterns_set_updated_at on team_patterns;
create trigger team_patterns_set_updated_at
before update on team_patterns
for each row execute function set_updated_at();

drop trigger if exists drills_set_updated_at on drills;
create trigger drills_set_updated_at
before update on drills
for each row execute function set_updated_at();

drop trigger if exists performance_goals_set_updated_at on performance_goals;
create trigger performance_goals_set_updated_at
before update on performance_goals
for each row execute function set_updated_at();

drop trigger if exists assistant_threads_set_updated_at on assistant_threads;
create trigger assistant_threads_set_updated_at
before update on assistant_threads
for each row execute function set_updated_at();

drop trigger if exists api_keys_set_updated_at on api_keys;
create trigger api_keys_set_updated_at
before update on api_keys
for each row execute function set_updated_at();

drop trigger if exists billing_entitlements_set_updated_at on billing_entitlements;
create trigger billing_entitlements_set_updated_at
before update on billing_entitlements
for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists idx_organizations_slug on organizations(slug);
create index if not exists idx_org_members_user on organization_members(user_id);
create index if not exists idx_org_members_org on organization_members(organization_id);
create index if not exists idx_teams_org on teams(organization_id);
create index if not exists idx_team_staff_team on team_staff(team_id);
create index if not exists idx_team_staff_user on team_staff(user_id);
create index if not exists idx_athletes_org on athletes(organization_id);
create index if not exists idx_athletes_team on athletes(team_id);
create index if not exists idx_athletes_user on athletes(user_id);
create index if not exists idx_sessions_org on sessions(organization_id);
create index if not exists idx_sessions_team on sessions(team_id);
create index if not exists idx_sessions_scheduled_at on sessions(scheduled_at);
create index if not exists idx_attendance_session on session_attendance(session_id);
create index if not exists idx_attendance_athlete on session_attendance(athlete_id);
create index if not exists idx_training_blocks_session on training_blocks(session_id);
create index if not exists idx_personal_trainings_athlete_started on personal_trainings(athlete_id, started_at);
create index if not exists idx_checkins_athlete_date on wellness_checkins(athlete_id, checkin_date);
create index if not exists idx_nutrition_athlete_date on nutrition_logs(athlete_id, log_date);
create index if not exists idx_wearable_connections_athlete on wearable_connections(athlete_id);
create index if not exists idx_wearable_summary_athlete_date on wearable_daily_summaries(athlete_id, summary_date);
create index if not exists idx_wearable_activities_athlete_started on wearable_activities(athlete_id, started_at);
create index if not exists idx_session_files_session on session_files(session_id);
create index if not exists idx_ai_reports_org on ai_reports(organization_id);
create index if not exists idx_ai_reports_team on ai_reports(team_id);
create index if not exists idx_ai_reports_session on ai_reports(session_id);
create index if not exists idx_athlete_observations_athlete on athlete_observations(athlete_id);
create index if not exists idx_team_patterns_team on team_patterns(team_id);
create index if not exists idx_documents_org on documents(organization_id);
create index if not exists idx_documents_team on documents(team_id);
create index if not exists idx_documents_athlete on documents(athlete_id);
create index if not exists idx_embeddings_org on document_embeddings(organization_id);
create index if not exists idx_embeddings_team on document_embeddings(team_id);
create index if not exists idx_assistant_threads_org on assistant_threads(organization_id);
create index if not exists idx_assistant_messages_thread on assistant_messages(thread_id);
create index if not exists idx_reports_org on reports(organization_id);
create index if not exists idx_api_keys_org on api_keys(organization_id);
create index if not exists idx_billing_entitlements_org on billing_entitlements(organization_id);
create index if not exists idx_audit_logs_org on audit_logs(organization_id);
create index if not exists idx_audit_logs_created_at on audit_logs(created_at);

create index if not exists idx_document_embeddings_vector
on document_embeddings
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- ---------------------------------------------------------------------------
-- Supabase Storage buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('organization-logos', 'organization-logos', true),
  ('session-files', 'session-files', false),
  ('session-file-summaries', 'session-file-summaries', false),
  ('reports', 'reports', false),
  ('imports', 'imports', false)
on conflict (id) do nothing;

-- Recommended object paths:
-- avatars/{user_id}/avatar.png
-- organization-logos/{organization_id}/logo.png
-- session-files/{organization_id}/{team_id}/{session_id}/{file_name}
-- session-file-summaries/{organization_id}/{team_id}/{session_id}/{summary_id}.json
-- reports/{organization_id}/{report_id}.pdf
-- imports/{organization_id}/{import_id}.csv

-- ---------------------------------------------------------------------------
-- RLS helper functions
-- ---------------------------------------------------------------------------

create or replace function current_user_id()
returns text as $$
  select coalesce(
    auth.jwt() ->> 'sub',
    nullif(current_setting('request.jwt.claim.sub', true), '')
  );
$$ language sql stable;

create or replace function is_org_member(org_id uuid)
returns boolean as $$
  select exists (
    select 1
    from organization_members
    where organization_id = org_id
      and user_id = current_user_id()
      and is_active = true
  );
$$ language sql stable security definer set search_path = public;

create or replace function has_org_role(org_id uuid, allowed_roles organization_role[])
returns boolean as $$
  select exists (
    select 1
    from organization_members
    where organization_id = org_id
      and user_id = current_user_id()
      and role = any(allowed_roles)
      and is_active = true
  );
$$ language sql stable security definer set search_path = public;

create or replace function is_team_staff(team_uuid uuid)
returns boolean as $$
  select exists (
    select 1
    from team_staff
    where team_id = team_uuid
      and user_id = current_user_id()
  );
$$ language sql stable security definer set search_path = public;

create or replace function is_athlete_self(athlete_uuid uuid)
returns boolean as $$
  select exists (
    select 1
    from athletes
    where id = athlete_uuid
      and user_id = current_user_id()
  );
$$ language sql stable security definer set search_path = public;

create or replace function can_access_team(team_uuid uuid)
returns boolean as $$
  select exists (
    select 1
    from teams t
    where t.id = team_uuid
      and is_org_member(t.organization_id)
  );
$$ language sql stable security definer set search_path = public;

create or replace function can_read_storage_org_path(bucket text, object_name text)
returns boolean as $$
  select
    case
      when bucket in ('avatars', 'organization-logos') then auth.role() = 'authenticated'
      else is_org_member(split_part(object_name, '/', 1)::uuid)
    end;
$$ language sql stable security definer set search_path = public;

create or replace function can_write_storage_org_path(bucket text, object_name text)
returns boolean as $$
  select
    case
      when bucket = 'avatars' then auth.role() = 'authenticated'
      when bucket = 'organization-logos' then has_org_role(
        split_part(object_name, '/', 1)::uuid,
        array['owner','admin']::organization_role[]
      )
      when bucket in ('session-files', 'session-file-summaries', 'reports', 'imports') then has_org_role(
        split_part(object_name, '/', 1)::uuid,
        array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]
      )
      else false
    end;
$$ language sql stable security definer set search_path = public;

-- ---------------------------------------------------------------------------
-- RLS activation
-- ---------------------------------------------------------------------------

alter table users enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table teams enable row level security;
alter table team_staff enable row level security;
alter table athletes enable row level security;
alter table athlete_invites enable row level security;
alter table sessions enable row level security;
alter table session_attendance enable row level security;
alter table training_blocks enable row level security;
alter table personal_trainings enable row level security;
alter table wellness_checkins enable row level security;
alter table nutrition_logs enable row level security;
alter table wearable_connections enable row level security;
alter table wearable_daily_summaries enable row level security;
alter table wearable_activities enable row level security;
alter table session_files enable row level security;
alter table session_file_summaries enable row level security;
alter table ai_reports enable row level security;
alter table athlete_observations enable row level security;
alter table team_patterns enable row level security;
alter table drills enable row level security;
alter table training_plans enable row level security;
alter table performance_goals enable row level security;
alter table documents enable row level security;
alter table document_embeddings enable row level security;
alter table assistant_threads enable row level security;
alter table assistant_messages enable row level security;
alter table reports enable row level security;
alter table api_keys enable row level security;
alter table billing_entitlements enable row level security;
alter table audit_logs enable row level security;

-- ---------------------------------------------------------------------------
-- RLS policies
-- ---------------------------------------------------------------------------

drop policy if exists "Users can view own profile" on users;
create policy "Users can view own profile"
on users for select
using (id = current_user_id());

drop policy if exists "Users can update own profile" on users;
create policy "Users can update own profile"
on users for update
using (id = current_user_id())
with check (id = current_user_id());

drop policy if exists "Users can insert own profile" on users;
create policy "Users can insert own profile"
on users for insert
with check (id = current_user_id());

drop policy if exists "Members can view organizations" on organizations;
create policy "Members can view organizations"
on organizations for select
using (is_org_member(id));

drop policy if exists "Owners and admins can update organizations" on organizations;
create policy "Owners and admins can update organizations"
on organizations for update
using (has_org_role(id, array['owner','admin']::organization_role[]))
with check (has_org_role(id, array['owner','admin']::organization_role[]));

drop policy if exists "Authenticated users can create organizations" on organizations;
create policy "Authenticated users can create organizations"
on organizations for insert
with check (auth.role() = 'authenticated' and created_by = current_user_id());

drop policy if exists "Members can view organization members" on organization_members;
create policy "Members can view organization members"
on organization_members for select
using (is_org_member(organization_id));

drop policy if exists "Owners and admins can manage organization members" on organization_members;
create policy "Owners and admins can manage organization members"
on organization_members for all
using (has_org_role(organization_id, array['owner','admin']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin']::organization_role[]));

drop policy if exists "Org members can view teams" on teams;
create policy "Org members can view teams"
on teams for select
using (is_org_member(organization_id));

drop policy if exists "Coaches can manage teams" on teams;
create policy "Coaches can manage teams"
on teams for all
using (has_org_role(organization_id, array['owner','admin','head_coach']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach']::organization_role[]));

drop policy if exists "Org members can view team staff" on team_staff;
create policy "Org members can view team staff"
on team_staff for select
using (can_access_team(team_id));

drop policy if exists "Owners and admins can manage team staff" on team_staff;
create policy "Owners and admins can manage team staff"
on team_staff for all
using (
  exists (
    select 1 from teams t
    where t.id = team_id
      and has_org_role(t.organization_id, array['owner','admin','head_coach']::organization_role[])
  )
)
with check (
  exists (
    select 1 from teams t
    where t.id = team_id
      and has_org_role(t.organization_id, array['owner','admin','head_coach']::organization_role[])
  )
);

drop policy if exists "Team staff and athlete can view athletes" on athletes;
create policy "Team staff and athlete can view athletes"
on athletes for select
using (is_org_member(organization_id) or is_athlete_self(id));

drop policy if exists "Coaches can manage athletes" on athletes;
create policy "Coaches can manage athletes"
on athletes for all
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach']::organization_role[]));

drop policy if exists "Coaches can manage athlete invites" on athlete_invites;
create policy "Coaches can manage athlete invites"
on athlete_invites for all
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach']::organization_role[]));

drop policy if exists "Athletes can view own invites" on athlete_invites;
create policy "Athletes can view own invites"
on athlete_invites for select
using (accepted_by = current_user_id());

drop policy if exists "Org members can view sessions" on sessions;
create policy "Org members can view sessions"
on sessions for select
using (is_org_member(organization_id));

drop policy if exists "Coaches can manage sessions" on sessions;
create policy "Coaches can manage sessions"
on sessions for all
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach']::organization_role[]));

drop policy if exists "Org members can view attendance" on session_attendance;
create policy "Org members can view attendance"
on session_attendance for select
using (
  exists (
    select 1 from sessions s
    where s.id = session_id
      and is_org_member(s.organization_id)
  )
  or is_athlete_self(athlete_id)
);

drop policy if exists "Coaches can manage attendance" on session_attendance;
create policy "Coaches can manage attendance"
on session_attendance for all
using (
  exists (
    select 1 from sessions s
    where s.id = session_id
      and has_org_role(s.organization_id, array['owner','admin','head_coach','assistant_coach']::organization_role[])
  )
)
with check (
  exists (
    select 1 from sessions s
    where s.id = session_id
      and has_org_role(s.organization_id, array['owner','admin','head_coach','assistant_coach']::organization_role[])
  )
);

drop policy if exists "Org members can view training blocks" on training_blocks;
create policy "Org members can view training blocks"
on training_blocks for select
using (
  exists (
    select 1 from sessions s
    where s.id = session_id
      and is_org_member(s.organization_id)
  )
);

drop policy if exists "Coaches can manage training blocks" on training_blocks;
create policy "Coaches can manage training blocks"
on training_blocks for all
using (
  exists (
    select 1 from sessions s
    where s.id = session_id
      and has_org_role(s.organization_id, array['owner','admin','head_coach','assistant_coach']::organization_role[])
  )
)
with check (
  exists (
    select 1 from sessions s
    where s.id = session_id
      and has_org_role(s.organization_id, array['owner','admin','head_coach','assistant_coach']::organization_role[])
  )
);

drop policy if exists "Athlete can manage own personal trainings" on personal_trainings;
create policy "Athlete can manage own personal trainings"
on personal_trainings for all
using (is_athlete_self(athlete_id))
with check (is_athlete_self(athlete_id));

drop policy if exists "Team staff can view personal trainings" on personal_trainings;
create policy "Team staff can view personal trainings"
on personal_trainings for select
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','physiotherapist']::organization_role[]));

drop policy if exists "Athlete can manage own checkins" on wellness_checkins;
create policy "Athlete can manage own checkins"
on wellness_checkins for all
using (is_athlete_self(athlete_id))
with check (is_athlete_self(athlete_id));

drop policy if exists "Team staff can view checkins" on wellness_checkins;
create policy "Team staff can view checkins"
on wellness_checkins for select
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','physiotherapist']::organization_role[]));

drop policy if exists "Athlete can manage own nutrition logs" on nutrition_logs;
create policy "Athlete can manage own nutrition logs"
on nutrition_logs for all
using (is_athlete_self(athlete_id))
with check (is_athlete_self(athlete_id));

drop policy if exists "Nutrition staff can view nutrition logs" on nutrition_logs;
create policy "Nutrition staff can view nutrition logs"
on nutrition_logs for select
using (has_org_role(organization_id, array['owner','admin','head_coach','nutritionist']::organization_role[]));

drop policy if exists "Athlete can manage own wearable connections" on wearable_connections;
create policy "Athlete can manage own wearable connections"
on wearable_connections for all
using (is_athlete_self(athlete_id))
with check (is_athlete_self(athlete_id));

drop policy if exists "Admins can view wearable connection metadata" on wearable_connections;
create policy "Admins can view wearable connection metadata"
on wearable_connections for select
using (has_org_role(organization_id, array['owner','admin']::organization_role[]));

drop policy if exists "Org members can view wearable summaries" on wearable_daily_summaries;
create policy "Org members can view wearable summaries"
on wearable_daily_summaries for select
using (
  is_athlete_self(athlete_id)
  or has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','physiotherapist']::organization_role[])
);

drop policy if exists "System staff can manage wearable summaries" on wearable_daily_summaries;
create policy "System staff can manage wearable summaries"
on wearable_daily_summaries for all
using (has_org_role(organization_id, array['owner','admin','head_coach']::organization_role[]) or is_athlete_self(athlete_id))
with check (has_org_role(organization_id, array['owner','admin','head_coach']::organization_role[]) or is_athlete_self(athlete_id));

drop policy if exists "Org members can view wearable activities" on wearable_activities;
create policy "Org members can view wearable activities"
on wearable_activities for select
using (
  is_athlete_self(athlete_id)
  or has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','physiotherapist']::organization_role[])
);

drop policy if exists "System staff can manage wearable activities" on wearable_activities;
create policy "System staff can manage wearable activities"
on wearable_activities for all
using (has_org_role(organization_id, array['owner','admin','head_coach']::organization_role[]) or is_athlete_self(athlete_id))
with check (has_org_role(organization_id, array['owner','admin','head_coach']::organization_role[]) or is_athlete_self(athlete_id));

drop policy if exists "Org members can view session files" on session_files;
create policy "Org members can view session files"
on session_files for select
using (is_org_member(organization_id));

drop policy if exists "Coaches can manage session files" on session_files;
create policy "Coaches can manage session files"
on session_files for all
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]));

drop policy if exists "Org members can view session file summaries" on session_file_summaries;
create policy "Org members can view session file summaries"
on session_file_summaries for select
using (is_org_member(organization_id));

drop policy if exists "Coaches can manage session file summaries" on session_file_summaries;
create policy "Coaches can manage session file summaries"
on session_file_summaries for all
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]));

drop policy if exists "Org members can view ai reports" on ai_reports;
create policy "Org members can view ai reports"
on ai_reports for select
using (is_org_member(organization_id));

drop policy if exists "Coaches and analysts can manage ai reports" on ai_reports;
create policy "Coaches and analysts can manage ai reports"
on ai_reports for all
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]));

drop policy if exists "Org members can view athlete observations" on athlete_observations;
create policy "Org members can view athlete observations"
on athlete_observations for select
using (is_org_member(organization_id) or is_athlete_self(athlete_id));

drop policy if exists "Coaches and analysts can manage athlete observations" on athlete_observations;
create policy "Coaches and analysts can manage athlete observations"
on athlete_observations for all
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst','physiotherapist']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst','physiotherapist']::organization_role[]));

drop policy if exists "Org members can view team patterns" on team_patterns;
create policy "Org members can view team patterns"
on team_patterns for select
using (is_org_member(organization_id));

drop policy if exists "Coaches and analysts can manage team patterns" on team_patterns;
create policy "Coaches and analysts can manage team patterns"
on team_patterns for all
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]));

drop policy if exists "Org members can view drills" on drills;
create policy "Org members can view drills"
on drills for select
using (organization_id is null or is_org_member(organization_id));

drop policy if exists "Coaches can manage drills" on drills;
create policy "Coaches can manage drills"
on drills for all
using (organization_id is not null and has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach']::organization_role[]))
with check (organization_id is not null and has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach']::organization_role[]));

drop policy if exists "Org members can view training plans" on training_plans;
create policy "Org members can view training plans"
on training_plans for select
using (is_org_member(organization_id));

drop policy if exists "Coaches can manage training plans" on training_plans;
create policy "Coaches can manage training plans"
on training_plans for all
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach']::organization_role[]));

drop policy if exists "Org members can view performance goals" on performance_goals;
create policy "Org members can view performance goals"
on performance_goals for select
using (is_org_member(organization_id));

drop policy if exists "Coaches can manage performance goals" on performance_goals;
create policy "Coaches can manage performance goals"
on performance_goals for all
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]));

drop policy if exists "Org members can view documents" on documents;
create policy "Org members can view documents"
on documents for select
using (is_org_member(organization_id));

drop policy if exists "Coaches and analysts can manage documents" on documents;
create policy "Coaches and analysts can manage documents"
on documents for all
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]));

drop policy if exists "Org members can view embeddings" on document_embeddings;
create policy "Org members can view embeddings"
on document_embeddings for select
using (is_org_member(organization_id));

drop policy if exists "System roles can manage embeddings" on document_embeddings;
create policy "System roles can manage embeddings"
on document_embeddings for all
using (has_org_role(organization_id, array['owner','admin','head_coach','analyst']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','analyst']::organization_role[]));

drop policy if exists "Org members can view assistant threads" on assistant_threads;
create policy "Org members can view assistant threads"
on assistant_threads for select
using (is_org_member(organization_id));

drop policy if exists "Coaches can manage assistant threads" on assistant_threads;
create policy "Coaches can manage assistant threads"
on assistant_threads for all
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]));

drop policy if exists "Org members can view assistant messages" on assistant_messages;
create policy "Org members can view assistant messages"
on assistant_messages for select
using (is_org_member(organization_id));

drop policy if exists "Coaches can manage assistant messages" on assistant_messages;
create policy "Coaches can manage assistant messages"
on assistant_messages for all
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]));

drop policy if exists "Org members can view reports" on reports;
create policy "Org members can view reports"
on reports for select
using (is_public = true or is_org_member(organization_id));

drop policy if exists "Coaches can manage reports" on reports;
create policy "Coaches can manage reports"
on reports for all
using (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]));

drop policy if exists "Owners and admins can manage api keys" on api_keys;
create policy "Owners and admins can manage api keys"
on api_keys for all
using (
  organization_id is not null
  and has_org_role(organization_id, array['owner','admin']::organization_role[])
)
with check (
  organization_id is not null
  and has_org_role(organization_id, array['owner','admin']::organization_role[])
);

drop policy if exists "Owners and admins can view billing entitlements" on billing_entitlements;
create policy "Owners and admins can view billing entitlements"
on billing_entitlements for select
using (has_org_role(organization_id, array['owner','admin']::organization_role[]));

drop policy if exists "Owners and admins can manage billing entitlements" on billing_entitlements;
create policy "Owners and admins can manage billing entitlements"
on billing_entitlements for all
using (has_org_role(organization_id, array['owner','admin']::organization_role[]))
with check (has_org_role(organization_id, array['owner','admin']::organization_role[]));

drop policy if exists "Owners and admins can view audit logs" on audit_logs;
create policy "Owners and admins can view audit logs"
on audit_logs for select
using (
  organization_id is not null
  and has_org_role(organization_id, array['owner','admin']::organization_role[])
);

drop policy if exists "Owners and admins can insert audit logs" on audit_logs;
create policy "Owners and admins can insert audit logs"
on audit_logs for insert
with check (
  organization_id is null
  or has_org_role(organization_id, array['owner','admin','head_coach','assistant_coach','analyst']::organization_role[])
);

-- ---------------------------------------------------------------------------
-- Storage RLS policies
-- ---------------------------------------------------------------------------

drop policy if exists "Public can read public buckets" on storage.objects;
create policy "Public can read public buckets"
on storage.objects for select
using (bucket_id in ('avatars', 'organization-logos'));

drop policy if exists "Organization members can read private org files" on storage.objects;
create policy "Organization members can read private org files"
on storage.objects for select
using (
  bucket_id in ('session-files', 'session-file-summaries', 'reports', 'imports')
  and can_read_storage_org_path(bucket_id, name)
);

drop policy if exists "Authenticated users can upload public profile assets" on storage.objects;
create policy "Authenticated users can upload public profile assets"
on storage.objects for insert
with check (
  bucket_id in ('avatars', 'organization-logos')
  and can_write_storage_org_path(bucket_id, name)
);

drop policy if exists "Authorized staff can upload private org files" on storage.objects;
create policy "Authorized staff can upload private org files"
on storage.objects for insert
with check (
  bucket_id in ('session-files', 'session-file-summaries', 'reports', 'imports')
  and can_write_storage_org_path(bucket_id, name)
);

drop policy if exists "Authorized staff can update org files" on storage.objects;
create policy "Authorized staff can update org files"
on storage.objects for update
using (can_write_storage_org_path(bucket_id, name))
with check (can_write_storage_org_path(bucket_id, name));

drop policy if exists "Authorized staff can delete org files" on storage.objects;
create policy "Authorized staff can delete org files"
on storage.objects for delete
using (can_write_storage_org_path(bucket_id, name));

