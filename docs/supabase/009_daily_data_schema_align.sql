-- Align wellness_checkins / nutrition_logs when 001_initial_schema ran before 004_daily_data.
-- 004 uses CREATE TABLE IF NOT EXISTS, so existing 001 tables are not altered automatically.
-- Safe to run multiple times.

-- wellness_checkins: app + 004_daily_data column set
alter table public.wellness_checkins
  add column if not exists fatigue integer check (fatigue between 1 and 10);

alter table public.wellness_checkins
  add column if not exists muscle_soreness integer check (muscle_soreness between 1 and 10);

alter table public.wellness_checkins
  add column if not exists stress integer check (stress between 1 and 10);

alter table public.wellness_checkins
  add column if not exists mood integer check (mood between 1 and 10);

alter table public.wellness_checkins
  add column if not exists notes text;

alter table public.wellness_checkins
  add column if not exists created_by varchar(255) references public.users(id) on delete set null;

-- Backfill from legacy 001 column names when present
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'wellness_checkins'
      and column_name = 'energy_score'
  ) then
    execute $sql$
      update public.wellness_checkins
      set fatigue = energy_score
      where fatigue is null and energy_score is not null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'wellness_checkins'
      and column_name = 'soreness_score'
  ) then
    execute $sql$
      update public.wellness_checkins
      set muscle_soreness = soreness_score
      where muscle_soreness is null and soreness_score is not null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'wellness_checkins'
      and column_name = 'stress_score'
  ) then
    execute $sql$
      update public.wellness_checkins
      set stress = stress_score
      where stress is null and stress_score is not null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'wellness_checkins'
      and column_name = 'motivation_score'
  ) then
    execute $sql$
      update public.wellness_checkins
      set mood = motivation_score
      where mood is null and motivation_score is not null
    $sql$;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'wellness_checkins'
      and column_name = 'athlete_notes'
  ) then
    execute $sql$
      update public.wellness_checkins
      set notes = athlete_notes
      where notes is null and athlete_notes is not null
    $sql$;
  end if;
end $$;

-- nutrition_logs: 004 column set (001 used meal flags / water_ml)
alter table public.nutrition_logs
  add column if not exists hydration_score integer check (hydration_score between 1 and 10);

alter table public.nutrition_logs
  add column if not exists meal_quality integer check (meal_quality between 1 and 10);

alter table public.nutrition_logs
  add column if not exists protein_servings integer;

alter table public.nutrition_logs
  add column if not exists carbs_timing varchar(100);

alter table public.nutrition_logs
  add column if not exists supplements text;

alter table public.nutrition_logs
  add column if not exists notes text;

alter table public.nutrition_logs
  add column if not exists created_by varchar(255) references public.users(id) on delete set null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'nutrition_logs'
      and column_name = 'athlete_notes'
  ) then
    execute $sql$
      update public.nutrition_logs
      set notes = athlete_notes
      where notes is null and athlete_notes is not null
    $sql$;
  end if;
end $$;
