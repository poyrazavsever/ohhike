-- OhHike CoachOS drill library migration
-- Scope: organization-owned drill library foundation for the /drills route.
-- Safe to run after 001_initial_schema.sql and foundation migrations.

create table if not exists public.drills (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid references public.organizations(id) on delete cascade,
  created_by varchar(255) references public.users(id) on delete set null,
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

drop trigger if exists set_drills_updated_at on public.drills;
create trigger set_drills_updated_at
before update on public.drills
for each row execute function set_updated_at();

create index if not exists idx_drills_org on public.drills(organization_id);
create index if not exists idx_drills_sport_type on public.drills(sport_type);
create index if not exists idx_drills_category on public.drills(category);

do $$
begin
  alter table public.training_blocks
    add constraint training_blocks_drill_id_fkey
    foreign key (drill_id) references public.drills(id) on delete set null;
exception when duplicate_object then null;
end $$;

alter table public.drills enable row level security;

drop policy if exists "Org members can view drills" on public.drills;
create policy "Org members can view drills"
on public.drills for select
using (
  is_system_drill = true
  or (
    organization_id is not null
    and public.is_org_member(organization_id)
  )
);

drop policy if exists "Coaches can manage drills" on public.drills;
create policy "Coaches can manage drills"
on public.drills for all
using (
  organization_id is not null
  and public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach', 'analyst']::organization_role[]
  )
)
with check (
  organization_id is not null
  and public.has_org_role(
    organization_id,
    array['owner', 'admin', 'head_coach', 'assistant_coach', 'analyst']::organization_role[]
  )
);
