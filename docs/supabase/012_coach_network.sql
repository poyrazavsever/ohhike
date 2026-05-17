-- Coach Network & Remote Coaching Marketplace (CN0)
-- Safe to run after 011_team_memory_rag.sql

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$
begin
  create type public.athlete_source as enum (
    'roster',
    'invite_claim',
    'marketplace'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.coach_network_application_status as enum (
    'draft',
    'submitted',
    'under_review',
    'accepted',
    'declined',
    'withdrawn',
    'expired'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.coach_network_offer_status as enum (
    'draft',
    'sent',
    'accepted',
    'declined',
    'expired',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.remote_coaching_relationship_status as enum (
    'pending_payment',
    'active',
    'paused',
    'completed',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.remote_coaching_payment_status as enum (
    'pending_manual',
    'confirmed_manual',
    'waived_demo'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.marketplace_conversation_type as enum (
    'application',
    'offer',
    'coaching',
    'proof'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.marketplace_participant_role as enum (
    'coach',
    'athlete',
    'system'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.marketplace_message_type as enum (
    'text',
    'system'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.training_proof_status as enum (
    'pending',
    'approved',
    'needs_revision',
    'rejected'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.coaching_program_assignment_status as enum (
    'active',
    'completed',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.coach_reputation_event_type as enum (
    'review',
    'completion',
    'dispute',
    'adjustment'
  );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Marketplace profiles & packages
-- ---------------------------------------------------------------------------

create table if not exists public.coach_marketplace_profiles (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  coach_user_id varchar(255) not null references public.users(id) on delete cascade,
  slug varchar(120) not null,
  display_name varchar(150) not null,
  headline varchar(255),
  bio text,
  photo_url text,
  specialties text[] default '{}'::text[],
  sports public.sport_type[] default '{}'::public.sport_type[],
  coaching_modes text[] default '{}'::text[],
  languages text[] default '{}'::text[],
  location_country varchar(100),
  location_city varchar(100),
  years_experience integer,
  certifications jsonb default '[]'::jsonb,
  pricing_display varchar(120),
  capacity integer,
  response_time_avg_hours numeric(6, 2),
  is_public boolean not null default false,
  is_accepting_clients boolean not null default true,
  verified_at timestamptz,
  average_rating numeric(3, 2),
  review_count integer not null default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (slug),
  unique (organization_id),
  unique (coach_user_id)
);

create table if not exists public.athlete_marketplace_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id varchar(255) not null references public.users(id) on delete cascade,
  display_name varchar(150) not null,
  bio text,
  photo_url text,
  sport_interests public.sport_type[] default '{}'::public.sport_type[],
  goals text,
  timezone varchar(80),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id)
);

create table if not exists public.coaching_packages (
  id uuid primary key default uuid_generate_v4(),
  coach_profile_id uuid not null references public.coach_marketplace_profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title varchar(200) not null,
  description text,
  duration_weeks integer,
  price_cents integer,
  currency varchar(3) not null default 'USD',
  deliverables jsonb default '[]'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Conversations (before applications for optional thread link)
-- ---------------------------------------------------------------------------

create table if not exists public.marketplace_conversations (
  id uuid primary key default uuid_generate_v4(),
  conversation_type public.marketplace_conversation_type not null,
  context_id uuid,
  organization_id uuid references public.organizations(id) on delete set null,
  last_message_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.coach_network_applications (
  id uuid primary key default uuid_generate_v4(),
  athlete_user_id varchar(255) not null references public.users(id) on delete cascade,
  athlete_marketplace_profile_id uuid references public.athlete_marketplace_profiles(id) on delete set null,
  coach_profile_id uuid not null references public.coach_marketplace_profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  package_id uuid references public.coaching_packages(id) on delete set null,
  conversation_id uuid references public.marketplace_conversations(id) on delete set null,
  status public.coach_network_application_status not null default 'draft',
  athlete_message text,
  coach_response text,
  form_data jsonb default '{}'::jsonb,
  metadata jsonb default '{}'::jsonb,
  submitted_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.coach_network_offers (
  id uuid primary key default uuid_generate_v4(),
  application_id uuid not null references public.coach_network_applications(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  coach_user_id varchar(255) not null references public.users(id) on delete cascade,
  athlete_user_id varchar(255) not null references public.users(id) on delete cascade,
  package_id uuid references public.coaching_packages(id) on delete set null,
  conversation_id uuid references public.marketplace_conversations(id) on delete set null,
  title varchar(200) not null,
  description text,
  terms text,
  package_snapshot jsonb default '{}'::jsonb,
  price_cents integer,
  currency varchar(3) not null default 'USD',
  status public.coach_network_offer_status not null default 'draft',
  payment_status public.remote_coaching_payment_status not null default 'pending_manual',
  expires_at timestamptz,
  sent_at timestamptz,
  accepted_at timestamptz,
  declined_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.remote_coaching_relationships (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  athlete_id uuid references public.athletes(id) on delete set null,
  athlete_user_id varchar(255) not null references public.users(id) on delete cascade,
  coach_user_id varchar(255) not null references public.users(id) on delete cascade,
  coach_profile_id uuid not null references public.coach_marketplace_profiles(id) on delete cascade,
  application_id uuid references public.coach_network_applications(id) on delete set null,
  offer_id uuid references public.coach_network_offers(id) on delete set null,
  status public.remote_coaching_relationship_status not null default 'pending_payment',
  payment_status public.remote_coaching_payment_status not null default 'pending_manual',
  started_at timestamptz,
  ended_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (offer_id)
);

alter table public.coach_network_offers
  drop constraint if exists coach_network_offers_remote_relationship_id_fkey;

alter table public.coach_network_offers
  add column if not exists remote_relationship_id uuid references public.remote_coaching_relationships(id) on delete set null;

create table if not exists public.marketplace_conversation_participants (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.marketplace_conversations(id) on delete cascade,
  user_id varchar(255) not null references public.users(id) on delete cascade,
  participant_role public.marketplace_participant_role not null,
  last_read_at timestamptz,
  created_at timestamptz default now(),
  unique (conversation_id, user_id)
);

create table if not exists public.marketplace_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.marketplace_conversations(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete set null,
  sender_user_id varchar(255) not null references public.users(id) on delete cascade,
  body text not null,
  message_type public.marketplace_message_type not null default 'text',
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.coaching_program_assignments (
  id uuid primary key default uuid_generate_v4(),
  relationship_id uuid not null references public.remote_coaching_relationships(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  assigned_by varchar(255) references public.users(id) on delete set null,
  title varchar(200) not null,
  description text,
  program_metadata jsonb default '{}'::jsonb,
  status public.coaching_program_assignment_status not null default 'active',
  starts_at date,
  ends_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.training_proofs (
  id uuid primary key default uuid_generate_v4(),
  relationship_id uuid not null references public.remote_coaching_relationships(id) on delete cascade,
  assignment_id uuid references public.coaching_program_assignments(id) on delete set null,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  submitted_by varchar(255) not null references public.users(id) on delete cascade,
  title varchar(200) not null,
  notes text,
  proof_date date not null default current_date,
  storage_paths jsonb default '[]'::jsonb,
  media_urls text[] default '{}'::text[],
  status public.training_proof_status not null default 'pending',
  coach_feedback text,
  reviewed_by varchar(255) references public.users(id) on delete set null,
  reviewed_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.coach_reviews (
  id uuid primary key default uuid_generate_v4(),
  relationship_id uuid not null references public.remote_coaching_relationships(id) on delete cascade,
  coach_profile_id uuid not null references public.coach_marketplace_profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  athlete_user_id varchar(255) not null references public.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  title varchar(200),
  body text,
  is_public boolean not null default true,
  moderated_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (relationship_id, athlete_user_id)
);

create table if not exists public.coach_reputation_events (
  id uuid primary key default uuid_generate_v4(),
  coach_profile_id uuid not null references public.coach_marketplace_profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  event_type public.coach_reputation_event_type not null,
  points_delta integer not null default 0,
  reference_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- athletes: marketplace source columns
-- ---------------------------------------------------------------------------

alter table public.athletes
  add column if not exists source public.athlete_source not null default 'roster';

alter table public.athletes
  add column if not exists marketplace_user_id varchar(255) references public.users(id) on delete set null;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

drop trigger if exists set_coach_marketplace_profiles_updated_at on public.coach_marketplace_profiles;
create trigger set_coach_marketplace_profiles_updated_at
before update on public.coach_marketplace_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_athlete_marketplace_profiles_updated_at on public.athlete_marketplace_profiles;
create trigger set_athlete_marketplace_profiles_updated_at
before update on public.athlete_marketplace_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_coaching_packages_updated_at on public.coaching_packages;
create trigger set_coaching_packages_updated_at
before update on public.coaching_packages
for each row execute function public.set_updated_at();

drop trigger if exists set_marketplace_conversations_updated_at on public.marketplace_conversations;
create trigger set_marketplace_conversations_updated_at
before update on public.marketplace_conversations
for each row execute function public.set_updated_at();

drop trigger if exists set_coach_network_applications_updated_at on public.coach_network_applications;
create trigger set_coach_network_applications_updated_at
before update on public.coach_network_applications
for each row execute function public.set_updated_at();

drop trigger if exists set_coach_network_offers_updated_at on public.coach_network_offers;
create trigger set_coach_network_offers_updated_at
before update on public.coach_network_offers
for each row execute function public.set_updated_at();

drop trigger if exists set_remote_coaching_relationships_updated_at on public.remote_coaching_relationships;
create trigger set_remote_coaching_relationships_updated_at
before update on public.remote_coaching_relationships
for each row execute function public.set_updated_at();

drop trigger if exists set_coaching_program_assignments_updated_at on public.coaching_program_assignments;
create trigger set_coaching_program_assignments_updated_at
before update on public.coaching_program_assignments
for each row execute function public.set_updated_at();

drop trigger if exists set_training_proofs_updated_at on public.training_proofs;
create trigger set_training_proofs_updated_at
before update on public.training_proofs
for each row execute function public.set_updated_at();

drop trigger if exists set_coach_reviews_updated_at on public.coach_reviews;
create trigger set_coach_reviews_updated_at
before update on public.coach_reviews
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists idx_coach_marketplace_profiles_org on public.coach_marketplace_profiles(organization_id);
create index if not exists idx_coach_marketplace_profiles_slug on public.coach_marketplace_profiles(slug);
create index if not exists idx_coach_marketplace_profiles_public on public.coach_marketplace_profiles(is_public) where is_public = true;
create index if not exists idx_athlete_marketplace_profiles_user on public.athlete_marketplace_profiles(user_id);
create index if not exists idx_coaching_packages_profile on public.coaching_packages(coach_profile_id);
create index if not exists idx_coach_network_applications_coach on public.coach_network_applications(coach_profile_id, status);
create index if not exists idx_coach_network_applications_athlete on public.coach_network_applications(athlete_user_id, status);
create index if not exists idx_coach_network_offers_application on public.coach_network_offers(application_id);
create index if not exists idx_remote_coaching_relationships_org on public.remote_coaching_relationships(organization_id);
create index if not exists idx_remote_coaching_relationships_athlete on public.remote_coaching_relationships(athlete_id);
create index if not exists idx_remote_coaching_relationships_coach on public.remote_coaching_relationships(coach_user_id);
create index if not exists idx_marketplace_conversations_context on public.marketplace_conversations(conversation_type, context_id);
create index if not exists idx_marketplace_participants_user on public.marketplace_conversation_participants(user_id);
create index if not exists idx_marketplace_messages_conversation on public.marketplace_messages(conversation_id, created_at);
create index if not exists idx_training_proofs_relationship on public.training_proofs(relationship_id, status);
create index if not exists idx_coach_reviews_profile on public.coach_reviews(coach_profile_id) where is_public = true;
create index if not exists idx_athletes_source on public.athletes(source);
create index if not exists idx_athletes_marketplace_user on public.athletes(marketplace_user_id) where marketplace_user_id is not null;

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_marketplace_conversation_participant(conv_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.marketplace_conversation_participants
    where conversation_id = conv_id
      and user_id = public.current_user_id()
  );
$$;

create or replace function public.can_view_coach_marketplace_profile(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.coach_marketplace_profiles cp
    where cp.id = profile_id
      and (
        cp.is_public = true
        or cp.coach_user_id = public.current_user_id()
        or public.is_org_member(cp.organization_id)
      )
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.coach_marketplace_profiles enable row level security;
alter table public.athlete_marketplace_profiles enable row level security;
alter table public.coaching_packages enable row level security;
alter table public.coach_network_applications enable row level security;
alter table public.coach_network_offers enable row level security;
alter table public.remote_coaching_relationships enable row level security;
alter table public.marketplace_conversations enable row level security;
alter table public.marketplace_conversation_participants enable row level security;
alter table public.marketplace_messages enable row level security;
alter table public.coaching_program_assignments enable row level security;
alter table public.training_proofs enable row level security;
alter table public.coach_reviews enable row level security;
alter table public.coach_reputation_events enable row level security;

-- coach_marketplace_profiles
drop policy if exists "Public or members can view coach marketplace profiles" on public.coach_marketplace_profiles;
create policy "Public or members can view coach marketplace profiles"
on public.coach_marketplace_profiles for select
using (
  is_public = true
  or coach_user_id = public.current_user_id()
  or public.is_org_member(organization_id)
);

drop policy if exists "Coaches can manage own marketplace profile" on public.coach_marketplace_profiles;
create policy "Coaches can manage own marketplace profile"
on public.coach_marketplace_profiles for all
using (
  coach_user_id = public.current_user_id()
  or public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach']::organization_role[]
  )
)
with check (
  coach_user_id = public.current_user_id()
  or public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach']::organization_role[]
  )
);

-- athlete_marketplace_profiles
drop policy if exists "Users can view relevant athlete marketplace profiles" on public.athlete_marketplace_profiles;
create policy "Users can view relevant athlete marketplace profiles"
on public.athlete_marketplace_profiles for select
using (
  user_id = public.current_user_id()
  or exists (
    select 1
    from public.coach_network_applications a
    join public.coach_marketplace_profiles cp on cp.id = a.coach_profile_id
    where a.athlete_user_id = athlete_marketplace_profiles.user_id
      and (
        cp.coach_user_id = public.current_user_id()
        or public.is_org_member(cp.organization_id)
      )
  )
);

drop policy if exists "Athletes can manage own marketplace profile" on public.athlete_marketplace_profiles;
create policy "Athletes can manage own marketplace profile"
on public.athlete_marketplace_profiles for all
using (user_id = public.current_user_id())
with check (user_id = public.current_user_id());

-- coaching_packages
drop policy if exists "Anyone can view active public coach packages" on public.coaching_packages;
create policy "Anyone can view active public coach packages"
on public.coaching_packages for select
using (
  exists (
    select 1
    from public.coach_marketplace_profiles cp
    where cp.id = coaching_packages.coach_profile_id
      and (
        (cp.is_public = true and coaching_packages.is_active = true)
        or cp.coach_user_id = public.current_user_id()
        or public.is_org_member(cp.organization_id)
      )
  )
);

drop policy if exists "Coaches can manage coaching packages" on public.coaching_packages;
create policy "Coaches can manage coaching packages"
on public.coaching_packages for all
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

-- applications
drop policy if exists "Athletes and coaches can view applications" on public.coach_network_applications;
create policy "Athletes and coaches can view applications"
on public.coach_network_applications for select
using (
  athlete_user_id = public.current_user_id()
  or public.is_org_member(organization_id)
  or exists (
    select 1 from public.coach_marketplace_profiles cp
    where cp.id = coach_profile_id
      and cp.coach_user_id = public.current_user_id()
  )
);

drop policy if exists "Athletes can create applications" on public.coach_network_applications;
create policy "Athletes can create applications"
on public.coach_network_applications for insert
with check (athlete_user_id = public.current_user_id());

drop policy if exists "Athletes can update own applications" on public.coach_network_applications;
create policy "Athletes can update own applications"
on public.coach_network_applications for update
using (athlete_user_id = public.current_user_id())
with check (athlete_user_id = public.current_user_id());

drop policy if exists "Coaches can update org applications" on public.coach_network_applications;
create policy "Coaches can update org applications"
on public.coach_network_applications for update
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

-- offers
drop policy if exists "Parties can view offers" on public.coach_network_offers;
create policy "Parties can view offers"
on public.coach_network_offers for select
using (
  athlete_user_id = public.current_user_id()
  or coach_user_id = public.current_user_id()
  or public.is_org_member(organization_id)
);

drop policy if exists "Coaches can manage offers" on public.coach_network_offers;
create policy "Coaches can manage offers"
on public.coach_network_offers for all
using (
  coach_user_id = public.current_user_id()
  or public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach']::organization_role[]
  )
)
with check (
  coach_user_id = public.current_user_id()
  or public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach']::organization_role[]
  )
);

drop policy if exists "Athletes can update offer acceptance" on public.coach_network_offers;
create policy "Athletes can update offer acceptance"
on public.coach_network_offers for update
using (athlete_user_id = public.current_user_id())
with check (athlete_user_id = public.current_user_id());

-- remote relationships
drop policy if exists "Parties can view remote coaching relationships" on public.remote_coaching_relationships;
create policy "Parties can view remote coaching relationships"
on public.remote_coaching_relationships for select
using (
  athlete_user_id = public.current_user_id()
  or coach_user_id = public.current_user_id()
  or public.is_org_member(organization_id)
);

drop policy if exists "Coaches can manage remote coaching relationships" on public.remote_coaching_relationships;
create policy "Coaches can manage remote coaching relationships"
on public.remote_coaching_relationships for all
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

-- conversations & messaging
drop policy if exists "Participants can view conversations" on public.marketplace_conversations;
create policy "Participants can view conversations"
on public.marketplace_conversations for select
using (public.is_marketplace_conversation_participant(id));

drop policy if exists "Participants can view conversation participants" on public.marketplace_conversation_participants;
create policy "Participants can view conversation participants"
on public.marketplace_conversation_participants for select
using (public.is_marketplace_conversation_participant(conversation_id));

drop policy if exists "Participants can view messages" on public.marketplace_messages;
create policy "Participants can view messages"
on public.marketplace_messages for select
using (public.is_marketplace_conversation_participant(conversation_id));

drop policy if exists "Participants can send messages" on public.marketplace_messages;
create policy "Participants can send messages"
on public.marketplace_messages for insert
with check (
  sender_user_id = public.current_user_id()
  and public.is_marketplace_conversation_participant(conversation_id)
);

-- program assignments & proofs
drop policy if exists "Org and athlete can view program assignments" on public.coaching_program_assignments;
create policy "Org and athlete can view program assignments"
on public.coaching_program_assignments for select
using (
  public.is_org_member(organization_id)
  or public.is_athlete_self(athlete_id)
);

drop policy if exists "Coaches can manage program assignments" on public.coaching_program_assignments;
create policy "Coaches can manage program assignments"
on public.coaching_program_assignments for all
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

drop policy if exists "Parties can view training proofs" on public.training_proofs;
create policy "Parties can view training proofs"
on public.training_proofs for select
using (
  public.is_org_member(organization_id)
  or public.is_athlete_self(athlete_id)
);

drop policy if exists "Athletes can submit training proofs" on public.training_proofs;
create policy "Athletes can submit training proofs"
on public.training_proofs for insert
with check (
  submitted_by = public.current_user_id()
  and public.is_athlete_self(athlete_id)
);

drop policy if exists "Coaches can review training proofs" on public.training_proofs;
create policy "Coaches can review training proofs"
on public.training_proofs for update
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

-- reviews & reputation
drop policy if exists "Public can view published coach reviews" on public.coach_reviews;
create policy "Public can view published coach reviews"
on public.coach_reviews for select
using (is_public = true or athlete_user_id = public.current_user_id() or public.is_org_member(organization_id));

drop policy if exists "Athletes can create coach reviews" on public.coach_reviews;
create policy "Athletes can create coach reviews"
on public.coach_reviews for insert
with check (athlete_user_id = public.current_user_id());

drop policy if exists "Org can moderate coach reviews" on public.coach_reviews;
create policy "Org can moderate coach reviews"
on public.coach_reviews for update
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

drop policy if exists "Org members can view reputation events" on public.coach_reputation_events;
create policy "Org members can view reputation events"
on public.coach_reputation_events for select
using (public.is_org_member(organization_id));

drop policy if exists "System roles can insert reputation events" on public.coach_reputation_events;
create policy "System roles can insert reputation events"
on public.coach_reputation_events for insert
with check (
  public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach']::organization_role[]
  )
);

-- ---------------------------------------------------------------------------
-- Realtime (marketplace messages)
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'marketplace_messages'
  ) then
    alter publication supabase_realtime add table public.marketplace_messages;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Storage: coaching-proofs (private)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('coaching-proofs', 'coaching-proofs', false)
on conflict (id) do nothing;

drop policy if exists "Org members can read coaching proof objects" on storage.objects;
create policy "Org members can read coaching proof objects"
on storage.objects for select
using (
  bucket_id = 'coaching-proofs'
  and (
    (storage.foldername(name))[1] is not null
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  )
);

drop policy if exists "Athletes and coaches can upload coaching proof objects" on storage.objects;
create policy "Athletes and coaches can upload coaching proof objects"
on storage.objects for insert
with check (
  bucket_id = 'coaching-proofs'
  and (
    (storage.foldername(name))[1] is not null
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  )
);

drop policy if exists "Org coaches can update coaching proof objects" on storage.objects;
create policy "Org coaches can update coaching proof objects"
on storage.objects for update
using (
  bucket_id = 'coaching-proofs'
  and (
    (storage.foldername(name))[1] is not null
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  )
)
with check (
  bucket_id = 'coaching-proofs'
  and (
    (storage.foldername(name))[1] is not null
    and public.is_org_member(((storage.foldername(name))[1])::uuid)
  )
);
