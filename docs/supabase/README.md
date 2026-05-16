# Supabase Schema Source

Bu klasor, OhHike CoachOS Supabase tarafinin guncel SQL referansini tutar.

## Dosyalar

- `001_initial_schema.sql`: Ilk migration. Extension, enum, tablo, index, storage bucket, RLS helper, tablo RLS policy ve storage policy tanimlarini icerir.

## Kapsam

`001_initial_schema.sql` su ana bloklari kurar:

- PostgreSQL extension'lari: `uuid-ossp`, `pgcrypto`, `vector`
- CoachOS enum tipleri
- Ana tablolar:
  - auth/tenant: `users`, `organizations`, `organization_members`
  - takim/sporcu: `teams`, `team_staff`, `athletes`, `athlete_invites`
  - session/veri: `sessions`, `session_attendance`, `training_blocks`, `personal_trainings`, `wellness_checkins`, `nutrition_logs`
  - wearable/file: `wearable_connections`, `wearable_daily_summaries`, `wearable_activities`, `session_files`, `session_file_summaries`
  - AI/RAG: `ai_reports`, `athlete_observations`, `team_patterns`, `drills`, `training_plans`, `performance_goals`, `documents`, `document_embeddings`, `assistant_threads`, `assistant_messages`
  - admin/billing/audit: `reports`, `api_keys`, `billing_entitlements`, `audit_logs`
- Supabase Storage bucket'lari:
  - `avatars`
  - `organization-logos`
  - `session-files`
  - `session-file-summaries`
  - `reports`
  - `imports`
- RLS helper fonksiyonlari
- Tablo RLS policy'leri
- Storage object policy'leri

## Notlar

- `docs/DatabaseSchema.md` v3.0 kaynak alinmistir.
- `billing_entitlements` v3.0 dokumanindaki organization-level modeli takip eder. `docs/PricingPolicy.md` takim bazli v3.1 modeli tarif ettigi icin billing implementasyonu sirasinda ek bir `team_billing_entitlements` migration'i yazilmalidir.
- Ilk organization/member bootstrap islemleri service role veya server-side admin client ile yapilmalidir; RLS normal client ile owner kaydi olmayan organizasyonu yonetmeye izin vermez.
