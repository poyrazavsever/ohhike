-- Organization staff invites for /settings/staff and /invite/staff/[token]
-- Safe to run after 002_phase1_foundation.sql

create table if not exists public.organization_staff_invites (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  email varchar(255),
  role organization_role not null,
  token text unique not null,
  invited_by varchar(255) references public.users(id) on delete set null,
  accepted_by varchar(255) references public.users(id) on delete set null,
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz default now(),
  constraint organization_staff_invites_role_check check (
    role in (
      'admin',
      'head_coach',
      'assistant_coach',
      'analyst',
      'physiotherapist',
      'nutritionist',
      'viewer'
    )
  )
);

create index if not exists idx_org_staff_invites_token
  on public.organization_staff_invites(token);

create index if not exists idx_org_staff_invites_org
  on public.organization_staff_invites(organization_id);

alter table public.organization_staff_invites enable row level security;

drop policy if exists "Owners and admins can manage staff invites" on public.organization_staff_invites;
create policy "Owners and admins can manage staff invites"
on public.organization_staff_invites for all
using (
  public.has_org_role(
    organization_id,
    array['owner', 'admin']::organization_role[]
  )
)
with check (
  public.has_org_role(
    organization_id,
    array['owner', 'admin']::organization_role[]
  )
);
