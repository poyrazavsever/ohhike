-- CN7-01 — Supabase Realtime for marketplace_messages
-- Run in SQL Editor after 012_coach_network.sql (idempotent).

-- Filtered postgres_changes subscriptions need full row data on the replica.
alter table public.marketplace_messages replica identity full;

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

-- Optional verification (should return one row):
-- select schemaname, tablename
-- from pg_publication_tables
-- where pubname = 'supabase_realtime' and tablename = 'marketplace_messages';
