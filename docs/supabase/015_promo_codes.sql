-- Promo codes → time-limited team plan upgrades (e.g. 1 month Pro)
-- Safe to re-run (idempotent).

create table if not exists public.promo_codes (
  id uuid primary key default uuid_generate_v4(),
  code varchar(64) not null,
  label varchar(255) not null,
  plan public.team_plan_tier not null default 'pro_team',
  duration_days integer not null default 30 check (duration_days > 0),
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  is_active boolean not null default true,
  valid_from timestamptz,
  valid_until timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (code)
);

create table if not exists public.promo_code_redemptions (
  id uuid primary key default uuid_generate_v4(),
  promo_code_id uuid not null references public.promo_codes(id) on delete restrict,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  redeemed_by varchar(255) not null references public.users(id) on delete cascade,
  plan_granted public.team_plan_tier not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  created_at timestamptz default now(),
  unique (team_id, promo_code_id)
);

drop trigger if exists set_promo_codes_updated_at on public.promo_codes;
create trigger set_promo_codes_updated_at
before update on public.promo_codes
for each row execute function public.set_updated_at();

create index if not exists idx_promo_codes_active on public.promo_codes(is_active) where is_active = true;
create index if not exists idx_promo_redemptions_team on public.promo_code_redemptions(team_id);
create index if not exists idx_promo_redemptions_org on public.promo_code_redemptions(organization_id);

alter table public.promo_codes enable row level security;
alter table public.promo_code_redemptions enable row level security;

-- Service role / admin client only (no public policies)
drop policy if exists "No direct promo_codes access" on public.promo_codes;
create policy "No direct promo_codes access"
on public.promo_codes for all
using (false)
with check (false);

drop policy if exists "No direct promo_code_redemptions access" on public.promo_code_redemptions;
create policy "No direct promo_code_redemptions access"
on public.promo_code_redemptions for all
using (false)
with check (false);

-- Launch code: 1 month Pro per team (one redemption per team)
insert into public.promo_codes (
  code,
  label,
  plan,
  duration_days,
  max_redemptions,
  is_active,
  metadata
)
values (
  'herkesicin',
  'Herkes için — 1 ay Pro Team',
  'pro_team',
  30,
  null,
  true,
  '{"campaign": "herkesicin", "locale": "tr"}'::jsonb
)
on conflict (code) do update set
  label = excluded.label,
  plan = excluded.plan,
  duration_days = excluded.duration_days,
  is_active = excluded.is_active,
  metadata = excluded.metadata,
  updated_at = now();
