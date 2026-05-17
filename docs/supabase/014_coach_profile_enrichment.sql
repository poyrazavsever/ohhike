alter table public.coach_marketplace_profiles
  add column if not exists intro_video_url text,
  add column if not exists training_philosophy text,
  add column if not exists featured_result text;
