-- Manual Pro upgrade (until Clerk Billing is live)
-- Run in Supabase SQL Editor. Replace the email below.

-- 1) Find user + primary team (first team in org)
-- SELECT u.id, u.email, t.id AS team_id, t.name, e.plan
-- FROM public.users u
-- JOIN public.organization_members om ON om.user_id = u.id
-- JOIN public.teams t ON t.organization_id = om.organization_id
-- LEFT JOIN public.team_billing_entitlements e ON e.team_id = t.id
-- WHERE u.email = 'mustafaoguztargiz@gmail.com'
-- ORDER BY t.created_at ASC;

-- 2) Upgrade all teams in that user's organizations to Pro
UPDATE public.team_billing_entitlements e
SET
  plan = 'pro_team',
  max_team_members = 20,
  ai_features_enabled = true,
  ai_reports_enabled = true,
  team_memory_enabled = true,
  training_planner_enabled = true,
  wearable_enabled = true,
  pdf_export_enabled = true,
  branded_reports_enabled = false,
  monthly_ai_report_limit = 100,
  updated_at = now()
FROM public.teams t
JOIN public.organization_members om ON om.organization_id = t.organization_id
JOIN public.users u ON u.id = om.user_id
WHERE e.team_id = t.id
  AND u.email = 'mustafaoguztargiz@gmail.com';
