-- Team Memory RAG: documents, embeddings, assistant threads/messages + vector search.
-- Safe to run after 008_team_memory.sql (or 001 if full schema was applied).

create extension if not exists vector;

do $$
begin
  create type public.document_type as enum (
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

create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  athlete_id uuid references public.athletes(id) on delete set null,
  session_id uuid references public.sessions(id) on delete set null,
  ai_report_id uuid references public.ai_reports(id) on delete set null,
  type public.document_type not null,
  title varchar(255) not null,
  content text not null,
  metadata jsonb default '{}'::jsonb,
  created_by varchar(255) references public.users(id) on delete set null,
  created_at timestamptz default now()
);

create table if not exists public.document_embeddings (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references public.documents(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  chunk_index integer not null,
  content_chunk text not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

create table if not exists public.assistant_threads (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  athlete_id uuid references public.athletes(id) on delete set null,
  title varchar(255),
  created_by varchar(255) references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.assistant_messages (
  id uuid primary key default uuid_generate_v4(),
  thread_id uuid not null references public.assistant_threads(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role varchar(50) not null,
  content text not null,
  retrieved_document_ids uuid[],
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

drop trigger if exists set_assistant_threads_updated_at on public.assistant_threads;
create trigger set_assistant_threads_updated_at
before update on public.assistant_threads
for each row execute function public.set_updated_at();

create index if not exists idx_documents_org on public.documents(organization_id);
create index if not exists idx_documents_team on public.documents(team_id);
create index if not exists idx_embeddings_org on public.document_embeddings(organization_id);
create index if not exists idx_assistant_threads_org on public.assistant_threads(organization_id);
create index if not exists idx_assistant_messages_thread on public.assistant_messages(thread_id);

create index if not exists idx_document_embeddings_vector
on public.document_embeddings
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

alter table public.documents enable row level security;
alter table public.document_embeddings enable row level security;
alter table public.assistant_threads enable row level security;
alter table public.assistant_messages enable row level security;

drop policy if exists "Org members can view documents" on public.documents;
create policy "Org members can view documents"
on public.documents for select
using (public.is_org_member(organization_id));

drop policy if exists "Coaches and analysts can manage documents" on public.documents;
create policy "Coaches and analysts can manage documents"
on public.documents for all
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

drop policy if exists "Org members can view embeddings" on public.document_embeddings;
create policy "Org members can view embeddings"
on public.document_embeddings for select
using (public.is_org_member(organization_id));

drop policy if exists "System roles can manage embeddings" on public.document_embeddings;
create policy "System roles can manage embeddings"
on public.document_embeddings for all
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

drop policy if exists "Org members can view assistant threads" on public.assistant_threads;
create policy "Org members can view assistant threads"
on public.assistant_threads for select
using (public.is_org_member(organization_id));

drop policy if exists "Coaches can manage assistant threads" on public.assistant_threads;
create policy "Coaches can manage assistant threads"
on public.assistant_threads for all
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

drop policy if exists "Org members can view assistant messages" on public.assistant_messages;
create policy "Org members can view assistant messages"
on public.assistant_messages for select
using (public.is_org_member(organization_id));

drop policy if exists "Coaches can manage assistant messages" on public.assistant_messages;
create policy "Coaches can manage assistant messages"
on public.assistant_messages for all
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

create or replace function public.match_document_embeddings(
  query_embedding vector(1536),
  match_organization_id uuid,
  match_team_id uuid default null,
  match_count integer default 8
)
returns table (
  id uuid,
  document_id uuid,
  content_chunk text,
  similarity double precision
)
language sql
stable
as $$
  select
    de.id,
    de.document_id,
    de.content_chunk,
    1 - (de.embedding <=> query_embedding) as similarity
  from public.document_embeddings de
  where de.organization_id = match_organization_id
    and de.embedding is not null
    and (
      match_team_id is null
      or de.team_id is null
      or de.team_id = match_team_id
    )
  order by de.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;
