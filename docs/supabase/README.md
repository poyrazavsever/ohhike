# Supabase Schema Source

Bu klasor, OhHike CoachOS Supabase tarafinin guncel SQL referansini tutar.

## Dosyalar

- `001_initial_schema.sql`: Ilk migration. Extension, enum, tablo, index, storage bucket, RLS helper, tablo RLS policy ve storage policy tanimlarini icerir.
- `002_phase1_foundation.sql`: Faz 1 foundation overlay. Mevcut `001_initial_schema.sql` dosyasini ezmeden foundation tablolari, RLS helper/policy'leri ve takim bazli `team_billing_entitlements` modelini idempotent sekilde kurar.
- `003_sessions.sql`: Sessions modulunun minimal temelini kurar. `sessions`, `session_attendance`, `training_blocks`, index'ler ve RLS policy'lerini icerir.
- `004_daily_data.sql`: Performance Data baslangici icin `wellness_checkins` ve `nutrition_logs` tablolarini, index'leri ve RLS policy'lerini idempotent sekilde kurar.
- `005_drills.sql`: Drill Library icin `drills` tablosunu, `training_blocks.drill_id` baglantisini, index'leri ve RLS policy'lerini idempotent sekilde kurar.
- `006_wearables.sql`: Wearables sayfasi icin `wearable_connections`, `wearable_daily_summaries`, `wearable_activities`, index'ler ve RLS policy'lerini idempotent sekilde kurar.
- `007_ai_reports.sql`: AI Reports sayfasi icin `ai_reports` tablosunu, enum tipini, index'leri ve RLS policy'lerini idempotent sekilde kurar.
- `008_team_memory.sql`: Team Memory icin `athlete_observations`, `team_patterns`, enum, index'ler ve RLS policy'lerini idempotent sekilde kurar.
- `009_daily_data_schema_align.sql`: `001` ile olusturulmus `wellness_checkins` / `nutrition_logs` tablolarina `004` ile uyumlu kolonlari ekler (`created_by`, `fatigue`, vb.).
- `010_organization_staff_invites.sql`: Settings → Staff ve `/invite/staff/[token]` icin `organization_staff_invites` tablosu ve RLS policy'leri.
- `011_team_memory_rag.sql`: Team Memory Assistant icin `documents`, `document_embeddings`, `assistant_threads`, `assistant_messages` ve `match_document_embeddings` RPC.
- `012_coach_network.sql`: Coach Network marketplace — profiller, paketler, basvuru/teklif, remote coaching, mesajlasma (Realtime), proof, review ve `athletes.source`.

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
- `002_phase1_foundation.sql`, `docs/PricingPolicy.md` v3.1 kararini uygulamak icin `team_billing_entitlements` tablosunu ekler. Bundan sonraki app onboarding ve feature gate isleri takim bazli entitlement okumalidir.
- `003_sessions.sql`, Faz 3 session akisini app tarafinda baslatmak icin incremental ve idempotent olarak tutulur. `001_initial_schema.sql` zaten uygulanmissa tablo/policy'leri ezmeden gunceller.
- `004_daily_data.sql`, `/readiness` ve `/nutrition` route'lari icin incremental daily data katmanidir. `001_initial_schema.sql` zaten uygulanmissa tablo/policy'leri ezmeden gunceller.
- `005_drills.sql`, `/drills` route'u ve Training Planner drill baglantilari icin incremental library katmanidir.
- `006_wearables.sql`, `/wearables` route'u icin provider connection ve normalized wearable data katmanidir.
- `007_ai_reports.sql`, `/ai-reports` route'u icin rapor kaydi ve ileride AI uretim pipeline'ina baglanacak rapor registry katmanidir.
- `008_team_memory.sql`, `/team-memory` route'u icin manuel/AI gozlem ve takim pattern registry katmanidir.
- `009_daily_data_schema_align.sql`, `001` sonrasi `004` calistirildiginda eksik kalan daily data kolonlarini tamamlar. Check-in hatasi (`created_by` schema cache) goruluyorsa bu dosyayi Supabase SQL Editor'de calistirin.
- `010_organization_staff_invites.sql`, staff davet linkleri icin tabloyu kurar. Staff invite olustururken tablo bulunamadi hatasi aliyorsaniz bu dosyayi Supabase SQL Editor'de calistirin.
- `011_team_memory_rag.sql`, `/team-memory` assistant sohbeti ve vector arama icin tablolari kurar. Assistant veya embedding hatasi aliyorsaniz bu dosyayi calistirin; `GEMINI_API_KEY` ile embedding + LLM cevaplari acilir.
- `012_coach_network.sql`, Coach Network (find-coach, basvuru, teklif, mesajlasma, remote athlete, program, proof, `coach_reviews`, `coach_reputation_events`) icin tablolari kurar. CN6: sporcu public review (web), koç private rating (`remote_coaching_relationships.metadata`), reputation ledger + profil `average_rating`/`review_count` senkronu.
- `dev_seed_coach_network_profiles.sql`, `/find-coach` demo listesi icin 3 public antrenor profili (en az 1 org + owner gerekir).
- Ilk organization/member bootstrap islemleri service role veya server-side admin client ile yapilir (MVP varsayilan).

## Production migration (FAZ M1)

Yeni Supabase projesinde **sirayla** SQL Editor'de calistir (her dosya idempotent):

```text
002_phase1_foundation.sql
003_sessions.sql
004_daily_data.sql
005_drills.sql
006_wearables.sql
007_ai_reports.sql
008_team_memory.sql
009_daily_data_schema_align.sql
010_organization_staff_invites.sql
011_team_memory_rag.sql
012_coach_network.sql
```

`001_initial_schema.sql` yalnizca sifirdan tam schema kuruyorsan; cogu ortamda `002`–`011` yeterli.

Deploy sonrasi: `GET /api/health` — eksik env listesini dondurur.

## App client kullanimi (MVP)

| Client | Dosya | Kullanim |
|--------|-------|----------|
| `createSupabaseAdminClient()` | `lib/supabase-admin.ts` | Varsayilan — loader, action, webhook |
| `createActionSupabase()` | `lib/supabase-action.ts` | MVP alias → admin client |
| `createSupabaseServerClient()` | `lib/supabase-server.ts` | Post-MVP RLS icin hazir; su an zorunlu degil |
