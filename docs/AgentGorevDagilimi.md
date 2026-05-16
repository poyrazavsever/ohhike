# OhHike CoachOS - Gelistirme Plani ve Faz Tanimi

## 0. Genel Durum

Bu plan, tek agent ile OhHike CoachOS'u dokumanlardaki hedef mimariye gore adim adim insa etmek icin hazirlanmistir.

Temel ilkeler:

- `docs/` altindaki CoachOS v3 urun, mimari, veri modeli ve kullanici akislarina tam uyum.
- Her faz sonunda calisabilir, test edilebilir bir urun katmani olmali.
- Supabase migration'lari `docs/supabase/` klasorune kaydedilir, `docs/supabase/README.md` guncellenir.
- `apps/web` tamamlandi; odak `apps/app` uzerinde.

---

## 1. Proje Ozeti

OhHike CoachOS; spor takimlari, antrenorler, sporcular ve kulup ekipleri icin AI destekli, self-host edilebilir bir spor operasyon ve takim hafizasi platformudur.

Urunun cozdugu ana problem:

- Antrenman notlari, sporcu check-in'leri, wearable verileri, RPE, beslenme/su aliskanliklari ve gecmis raporlar daginik tutuluyor.
- Koclar bu veriyi sezon boyunca karar destek sistemine donusturemiyor.
- Sporcularin takim disi yukleri, uyku/enerji/agri sinyalleri ve recovery durumu antrenman planina sistematik yansimiyor.
- Kulup ve akademiler icin rol bazli erisim, veri gizliligi, raporlama ve self-host ihtiyaci var.

Hedef veri akisi:

```text
Organization
  -> Team
    -> Athlete
      -> Session / Check-in / Nutrition / Personal Training / Wearable
        -> AI Report
          -> Documents + Embeddings
            -> Team Memory Assistant
```

Mevcut kod durumu (Faz 1 baslangici):

- `apps/web`: Marketing site tamamlandi. Dokunulmayacak.
- `apps/app`:
  - Clerk korumalı shell, auth sayfalari (login/register), AppSidebar, AppShell mevcut.
  - Clerk user webhook → Supabase `users` sync calisiyor.
  - `lib/supabase.ts` yalnizca anon client. Server/admin ayrimi yok.
  - Supabase migration, RLS, onboarding, organization/team/athlete CRUD, billing, AI/RAG modulleri henuz yok.
  - Sidebar'da tum nav linkleri tanimli ama hicbir route sayfasi mevcut degil.

---

## 2. Dosya ve Klasor Sahipligi

```text
apps/app/**              → Tum app gelistirmesi burada
apps/web/**              → DOKUNULMAYACAK (tamamlandi)
packages/ui/**           → Ortak presentational component'ler
docs/**                  → Urun/mimari referans, plan ve migration kayitlari
docs/supabase/           → SQL migration dosyalari ve README
```

Kilitli dosyalar (degistirilmez):

```text
package.json (root)
pnpm-lock.yaml
pnpm-workspace.yaml
turbo.json
.gitignore
```

---

## 3. Migration Yonetimi

Butun Supabase migration SQL'leri `docs/supabase/` klasorune kaydedilir.

Kural:

- Her migration ayri numarali bir `.sql` dosyasidir. Mevcut `001_initial_schema.sql` korundugu icin Faz 1 foundation calismasi `002_phase1_foundation.sql` olarak kaydedildi.
- Her yeni migration sonrasi `docs/supabase/README.md` guncellenir.
- Supabase Dashboard SQL Editor'a elle yapistirilerek uygulanir veya Supabase CLI ile migrate edilir.
- Cakisma olmamasi icin migration sirasi dosya numarasiyla belirlenir.

---

## 4. Faz Plani

---

### FAZ 1 — Supabase Foundation + Onboarding + Route Iskeleti

**Amac:** Urunun calisabilir veritabani temelini kurmak, auth sonrasi yonlendirme mantigini tanimlamak ve temel app route iskeletini olusturmak.

**Kapsam:** `apps/app` — veri katmani, auth akisi, onboarding, route iskeleti.

**Web'e dokunulmaz.**

---

#### Blok 1 — Supabase Foundation (DB Katmani)

##### 1.1 — Foundation Migration SQL

Dosya: `docs/supabase/002_phase1_foundation.sql`

Icerigi:

```text
Extensions:
  - uuid-ossp
  - pgcrypto
  - vector

Enum tipleri:
  - subscription_tier
  - organization_type
  - organization_role
  - sport_type
  - athlete_status
  - session_type
  - session_status
  - media_type
  - processing_status
  - data_source
  - ai_report_type
  - document_type
  - wearable_provider

Tablolar:
  - users
  - organizations
  - organization_members
  - teams
  - team_staff
  - athletes
  - athlete_invites
  - billing_entitlements
  - audit_logs

Index'ler:
  - organizations(slug)
  - organization_members(user_id, organization_id)
  - teams(organization_id)
  - athletes(organization_id, team_id, user_id)
  - audit_logs(organization_id, created_at)

RLS Helper Fonksiyonlari:
  - current_user_id()         → JWT sub claim'den kullanici id'sini dondurur
  - is_org_member(org_id)     → Kullanici org'a uye mi?
  - has_org_role(org_id, roles[]) → Kullanicinin belirli rolleri var mi?
  - is_team_staff(team_id)    → Kullanici takim staff'i mi?
  - is_athlete_self(athlete_id) → Bu sporcu mevcut kullanici mi?

RLS Aktivasyonu:
  - Tum tablolara ALTER TABLE ... ENABLE ROW LEVEL SECURITY

RLS Politikalari:
  - users: kendi profilini gorur/gunceller/ekler
  - organizations: uyeler gorur; owner/admin gunceller; authenticated kullanici olusturur
  - organization_members: uyeler gorur; owner/admin yonetir
  - teams: org uyeler gorur; owner/admin/head_coach yonetir
  - team_staff: org uyeler gorur; owner/admin yonetir
  - athletes: org uyeler ve sporcu kendi profilini gorur; coach'lar yonetir
  - athlete_invites: davet eden veya davet edilen gorur
  - billing_entitlements: owner/admin gorur
  - audit_logs: owner/admin gorur

Storage Buckets:
  - avatars (public: true)
  - organization-logos (public: true)
```

`docs/supabase/README.md` guncellenir: `002_phase1_foundation.sql` eklenir, kapsami belirtilir.

---

##### 1.2 — TypeScript Tip Tanimlari

Dosya: `apps/app/lib/database.types.ts`

- Schema'daki tum tablo satirlarini karsilayan TypeScript interface/type tanimlari.
- `Row`, `Insert`, `Update` varyantlari her tablo icin tanimlanir.
- Enum tipleri TypeScript union type olarak tanimlanir.

---

#### Blok 2 — Supabase Client Mimarisi

##### 2.1 — Server Component Client

Dosya: `apps/app/lib/supabase-server.ts`

- `createServerClient()` fonksiyonu: Next.js Server Component ve Server Action'lardan cagrilir.
- Clerk JWT'sini Supabase'e aktarir: `auth().getToken({ template: 'supabase' })`.
- RLS, Clerk user context ile calismis olur.
- Cookie bazli session yoktur; her istekte Clerk token alinir.

##### 2.2 — Admin Client

Dosya: `apps/app/lib/supabase-admin.ts`

- `createAdminClient()` fonksiyonu: `SUPABASE_SERVICE_ROLE_KEY` kullanir.
- RLS bypass eder; sadece webhook ve kritik server action'larda kullanilir.
- Mevcut webhook (`apps/app/app/api/webhooks/clerk/route.ts`) bu client'a gecis yapar.

##### 2.3 — Mevcut `lib/supabase.ts` Duzeltme

- Anon client client-side bilesenler icin korunur.
- Server ve admin client ayri dosyalara tasindi; eski dosyadan import'lar guncellenir.

---

#### Blok 3 — Auth Sonrasi Yonlendirme ve Route Gruplari

##### 3.1 — Route Grubu Yapisi

Mevcut `app/` dizini yeniden duzenlenir:

```text
apps/app/app/
  (auth)/
    login/[[...login]]/page.tsx      → mevcut
    register/[[...register]]/page.tsx → mevcut
  (protected)/
    layout.tsx                        → auth + onboarding guard
    page.tsx                          → /dashboard'a redirect
    dashboard/
      page.tsx
    onboarding/
      page.tsx
      _components/
        onboarding-stepper.tsx
        step-welcome.tsx
        step-organization.tsx
        step-first-team.tsx
        step-add-athletes.tsx
        step-done.tsx
      actions.ts
    teams/
      page.tsx
    athletes/
      page.tsx
    sessions/
      page.tsx
    settings/
      billing/
        page.tsx
  api/
    webhooks/
      clerk/
        route.ts                      → mevcut, admin client'a gecis yapilir
  globals.css
  layout.tsx
```

##### 3.2 — Protected Layout (Onboarding Guard)

Dosya: `apps/app/app/(protected)/layout.tsx`

Mantik:

```text
1. Clerk auth kontrolu (proxy.ts zaten yapiyor ama layout'ta da dogrulama)
2. Supabase'de organization_members kaydina bak
3. Kayit yoksa → /onboarding'e redirect
4. Kayit varsa → devam et (children render edilir)
```

- Server component olarak yazilir.
- `createServerClient()` kullanilir.
- Onboarding sayfasi bu layout'un disinda olur (sonsuz dongu engeli).

---

#### Blok 4 — Onboarding Akisi

UserFlows.md §2 referans alinir.

##### 4.1 — Onboarding Page (Server Component)

Dosya: `apps/app/app/(protected)/onboarding/page.tsx`

- Kullanicinin zaten organizasyonu varsa `/dashboard`'a redirect.
- `OnboardingStepper` client component'ini render eder.

##### 4.2 — Onboarding Stepper (Client Component)

Dosya: `apps/app/app/(protected)/onboarding/_components/onboarding-stepper.tsx`

5 adimli stepper:

```text
Step 1 — Welcome
  Doctor Panda karsilama mesaji.
  CTA: "Takimimı Kur"

Step 2 — Organization
  Alanlar:
  - Organizasyon adi (required)
  - Organizasyon turu (club/academy/individual_coach/school_team/university_team/performance_center/other)
  - Sehir (optional)
  - Ulke (optional)

Step 3 — First Team
  Alanlar:
  - Takim adi (required)
  - Spor dali (required)
  - Yas grubu (optional)
  - Seviye (optional)
  - Sezon hedefi (optional)
  - Haftalik antrenman sayisi (optional)

Step 4 — Add Athletes
  Secenekler:
  - Manuel sporcu ekle (ad, soyad, pozisyon, forma no)
  - Daha sonra ekle (skip)

Step 5 — Ready
  Doctor Panda tebrik mesaji.
  CTA: "Dashboard'a Git"
```

##### 4.3 — Onboarding Server Actions

Dosya: `apps/app/app/(protected)/onboarding/actions.ts`

```text
createOrganization(data):
  - organizations tablosuna INSERT
  - organization_members tablosuna owner kaydi INSERT
  - billing_entitlements tablosuna free plan INSERT
  - audit_logs INSERT (organization.created)
  - Return: { organizationId, teamId? }

createFirstTeam(organizationId, data):
  - Plan limiti kontrolu (max_teams)
  - teams tablosuna INSERT
  - audit_logs INSERT (team.created)

addInitialAthletes(organizationId, teamId, athletes[]):
  - Plan limiti kontrolu (max_athletes)
  - athletes tablosuna bulk INSERT
  - audit_logs INSERT (athletes.created)
```

Her action:
- `createAdminClient()` veya `createServerClient()` kullanir.
- Zod ile input validation.
- Hata durumunda anlamli mesaj dondurur.

---

#### Blok 5 — Route Skeleton Sayfalari

Her sayfa basit placeholder — gercek icerik sonraki fazlarda gelir.

| Route | Dosya | Gosterecegi |
|---|---|---|
| `/dashboard` | `dashboard/page.tsx` | "Coach Dashboard" baslik, bos kart grid |
| `/teams` | `teams/page.tsx` | "Teams" baslik, bos empty state |
| `/athletes` | `athletes/page.tsx` | "Athletes" baslik, bos empty state |
| `/sessions` | `sessions/page.tsx` | "Sessions" baslik, bos empty state |
| `/settings/billing` | `settings/billing/page.tsx` | Plan bilgisi placeholder |

Her sayfa `AppShell` ile sarmalanir.

---

#### Blok 6 — Webhook Refactor

Dosya: `apps/app/app/api/webhooks/clerk/route.ts`

Degisiklikler:

```text
- Mevcut inline supabase client → createAdminClient() ile degistirilir.
- CLERK_WEBHOOK_SECRET dogrulama calistirilir (verifyWebhook).
- user.created ve user.updated event'leri: users tablosuna upsert (mevcut mantik korunur).
- user.deleted event'i: users tablosundan silme (mevcut mantik korunur).
```

---

#### Faz 1 Cikis Kriterleri

```text
✓ Supabase'de tum foundation tablolari ve RLS aktif
✓ TypeScript tip tanimlari mevcut
✓ Server client, admin client ve anon client ayri dosyalarda
✓ Kullanici login olunca:
    - Organizasyonu yoksa → /onboarding'e yonlenir
    - Organizasyonu varsa → /dashboard'a yonlenir
✓ Onboarding akisi tamamlanabiliyor (org + team + opsiyonel athlete)
✓ /dashboard, /teams, /athletes, /sessions, /settings/billing sayfalari yuklenebiliyor (placeholder)
✓ Webhook admin client kullaniyor, signing secret dogrulamasi calisiyor
```

---

### FAZ 2 — Team Operations ve CRUD (Planlama Asamas&#305;)

**Amac:** Onboarding sonrasi gercek operasyon ekranlari.

```text
Agent gorevleri:
- Organization onboarding: create/update organization
- Organization switcher/manager: sidebar uzerinden aktif organizasyon secimi
- Organization CRUD: yeni organizasyon ekle, ad/tip/sehir/ulke guncelle, sil/arsivle
- Plan gate: Basic hesapta 1 organizasyon ve 3 team member limiti
- Plan gate: Pro ve Pro Plus hesaplarda ek organizasyon ve daha yuksek member limitleri
- Team CRUD: liste, detay, duzenle, sil
- Athlete CRUD: liste, detay, form, duzenle, sil
- Athlete invite token olusturma
- Staff yonetimi: davet, rol atama
- Entitlement helper: max_teams, max_athletes kontrolu
- Permission helper: owner/admin/coach/athlete rol kontrolleri
```

Organization management plan:

```text
Sidebar:
  - Ust bolumde aktif organization adi ve aktif team adi gosterilir.
  - Dropdown/popover:
    - Organizasyon degistir
    - Organization settings
    - New organization (plan gate ile)
    - Delete/archive organization (owner only)

Data model:
  - Ilk asamada organizations + organization_members yeterli.
  - Ek plan kapilari icin team_billing_entitlements aktif team planini okur.
  - Basic: max_organizations = 1, max_team_members = 3
  - Pro: multiple organizations enabled, max_team_members >= 20
  - Pro Plus: multiple organizations enabled, max_team_members >= 50, advanced roles

Server helpers:
  - getCurrentWorkspace()
  - getUserOrganizations()
  - canCreateOrganization(userId)
  - canInviteTeamMember(teamId)
  - requireOrgRole(organizationId, roles)

UX:
  - Basic kullanici 2. organizasyon acmaya calisirsa upgrade card gosterilir.
  - Organization silme destructive confirm ile yapilir.
  - Silme ilk asamada hard delete yerine archive/delete guard ile planlanir.
```

Faz 2 planlamasi Faz 1 cikis kriterleri karsilanainca yapilacak.

---

### FAZ 3 — Sessions ve Athlete Daily Data (Planlama Asamas&#305;)

**Amac:** Urunun gercek operasyon verisi toplanmaya baslar.

```text
Migration: 002_sessions.sql
  - sessions
  - session_attendance
  - training_blocks
  - wellness_checkins
  - nutrition_logs
  - personal_trainings

App route'lari:
  - /sessions (liste + olustur)
  - /sessions/[id] (detay + tamamla + RPE)
  - /readiness (check-in akisi)
  - /nutrition (gunluk log)
  - /athlete/dashboard (sporcu ozet)
```

---

### FAZ 4 — Wearables, Files ve Import (Planlama Asamas&#305;)

```text
Migration: 003_wearables_files.sql
  - wearable_connections
  - wearable_daily_summaries
  - wearable_activities
  - session_files
  - session_file_summaries

Entegrasyonlar:
  - Strava OAuth
  - CSV import
  - Dosya upload (Supabase Storage)
  - Token sifreleme (AES-256-GCM)
```

---

### FAZ 5 — AI Reports ve Team Memory (Planlama Asamas&#305;)

```text
Migration: 004_ai_rag.sql
  - ai_reports
  - athlete_observations
  - team_patterns
  - drills
  - training_plans
  - performance_goals
  - documents
  - document_embeddings
  - assistant_threads
  - assistant_messages

AI Katmani:
  - LLM provider adapter (OpenAI / Gemini / OpenRouter)
  - Structured JSON output validation (Zod)
  - Session analysis pipeline
  - Team Memory RAG sorgu akisi
  - document_embeddings ivfflat index
```

---

### FAZ 6 — Billing, Reports ve Self-host (Planlama Asamas&#305;)

```text
- Clerk Billing webhook
- billing_entitlements sync
- Feature gate enforcement (server-side)
- PDF rapor export
- Self-host setup akisi
- api_keys yonetimi
- reports ve report_exports tablolari
```

---

## 5. Teknik Kararlar

### Supabase Client Stratejisi

```text
createServerClient()   → Server Component, Server Action
createAdminClient()    → Webhook, kritik admin islemler (RLS bypass)
createBrowserClient()  → Client Component (anon key)
```

### Auth Akisi

```text
Clerk auth → proxy.ts middleware (rota koruma)
                ↓
          (protected)/layout.tsx
                ↓
    organization_members kontrol
    Yok ise → /onboarding
    Var ise → devam
```

### RLS Stratejisi

```text
Clerk JWT → Supabase'e token olarak gecilir
current_user_id() → JWT sub claim'i okur
RLS her sorguda aktif → cok-kiracili izolasyon saglanir
Admin client → yalnizca guvenilir server-side kodda
```

### Validation

```text
Her server action → Zod schema validation
Plan limiti kontrolu → billing_entitlements tablosundan
Entitlement yoksa → error response ile feature blocked mesaji
```

### Hata Yonetimi

```text
Server action'lar { data, error } pattern ile doner
UI katmani error mesajini kullaniciya gosterir
Kritik hatalar audit_logs'a yazilir
```

---

## 6. Migration Kayit Tablosu

| Dosya | Durum | Kapsam |
|---|---|---|
| `docs/supabase/001_initial_schema.sql` | Mevcut | Genis v3.0 schema referansi; session, wearable, AI/RAG dahil tam kapsam |
| `docs/supabase/002_phase1_foundation.sql` | Hazir | Foundation overlay, RLS, storage, `team_billing_entitlements` |
| `docs/supabase/003_sessions.sql` | Faz 3 | sessions, attendance, training_blocks, checkins, nutrition, personal_trainings |
| `docs/supabase/004_wearables_files.sql` | Faz 4 | wearable tablolar, session_files |
| `docs/supabase/005_ai_rag.sql` | Faz 5 | ai_reports, documents, embeddings, assistant |
| `docs/supabase/006_billing_reports.sql` | Faz 6 | reports, api_keys, system_settings |

---

## 7. Riskler ve Kararlar

### Risk: Pricing modeli tutarsizligi

Karar:

- `docs/PricingPolicy.md` canonical kaynak.
- Uygulama `billing_entitlements` tablosunu takip eder.
- Team bazli: Basic / Pro / Pro Plus.

### Risk: RLS Clerk entegrasyonu

Karar:

- Clerk JWT template olarak Supabase'e verilmeli.
- Supabase Dashboard → Authentication → JWT Templates → Clerk template olusturulacak.
- `current_user_id()` fonksiyonu `request.jwt.claim('sub')` ile calisir.

### Risk: Onboarding sonsuz dongusu

Karar:

- `/onboarding` sayfasi `(protected)/layout.tsx` guard'inin DISINDA olmali.
- Guard sadece organization_members yoksa /onboarding'e yonlendirir.
- Onboarding sayfasinin kendisi ayri layout veya guard kontrol mantigi olmadan render edilir.

### Risk: Admin client ile RLS bypass

Karar:

- `createAdminClient()` yalnizca webhook ve kritik bootstrap islemlerinde kullanilir.
- Server Action'larda default olarak `createServerClient()` tercih edilir.
- Admin client kullanimi kod reviewda isaret edilmeli.

### Risk: AI medikal siniri

Karar:

- `docs/PromptEngineering.md` kurallari tum AI ciktilarinda zorunlu.
- AI ciktisi "karar destek" olarak sunulur; teshis, tedavi, diyet recetesi dili kullanilmaz.
- UI copy bu siniri yansitmali.
