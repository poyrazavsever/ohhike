# OhHike CoachOS - Gelistirme Plani ve Faz Tanimi

## 0. Genel Durum

Bu plan, tek agent ile OhHike CoachOS'u dokumanlardaki hedef mimariye gore adim adim insa etmek icin hazirlanmistir.

Temel ilkeler:

- `docs/` altindaki CoachOS v3 urun, mimari, veri modeli ve kullanici akislarina tam uyum.
- Her faz sonunda calisabilir, test edilebilir bir urun katmani olmali.
- Supabase migration'lari `docs/supabase/` klasorune kaydedilir, `docs/supabase/README.md` guncellenir.
- `apps/web` public site cekirdegi ve Faz 1 sayfalari mevcut; bundan sonraki web isi bilgi mimarisi, docs ve urun anlatimini derinlestirmektir.

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

Mevcut kod durumu (2026-05-16 guncellemesi):

- `apps/web`: Marketing site cekirdegi mevcut; public bilgi mimarisi ve eksik sayfalar halen olgunlastiriliyor.
- `apps/app`:
  - ✓ Clerk korumali shell, auth, AppSidebar, AppShell, onboarding (`app/onboarding/`).
  - ✓ Clerk webhook → `users` sync (`createSupabaseAdminClient`).
  - ✓ `lib/supabase.ts` (anon), `lib/supabase-server.ts` (`createSupabaseServerClient`), `lib/supabase-admin.ts`.
  - ✓ Migration SQL `002`–`011` (`docs/supabase/README.md` ile uyumlu).
  - ✓ Team Operations: org switch, team/athlete/session CRUD, session detail, readiness, nutrition, drills, personal training, wearables (kayit), settings iskeleti.
  - ✓ Athlete invite/claim, athlete onboarding, athlete portal (`/athlete/*`), kontrollu sozluk (`lib/coach-vocabulary.ts`).
  - ✓ Staff invite/claim akisi (`/settings/staff`, `/invite/staff/[token]`).
  - ◐ AI katmani: session AI report generation (rules + opsiyonel Gemini), Team Memory Assistant, documents/embeddings/RAG altyapisi mevcut; kalite, retrieval ve entitlement katmani halen MVP.
  - ◐ Server Action'larin bir bolumu `createActionSupabase()` ile RLS'e gecirildi (readiness, nutrition, personal training); workspace sorgulari ve bircok action halen **admin client** kullaniyor.
  - ✗ Wearable OAuth/sync, dosya upload/import pipeline, Clerk Billing sync, PDF export, self-host setup, `api_keys` UI henuz yok.
  - Detayli uyum/eksik analizi: `docs/UrunUyumVeEksikler.md`.
- Kirilma noktalari ve E2E test kapilari: `docs/UrunUyumVeEksikler.md` §9–§11 (ozellik "done" olmadan ilgili E2E kosulmali).

---

## 2. Dosya ve Klasor Sahipligi

```text
apps/app/**              → Tum app gelistirmesi burada
apps/web/**              → Public marketing site, docs ve legal/trust sayfalari
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

#### Blok 1 — Supabase Foundation (DB Katmani) ✓

##### 1.1 — Foundation Migration SQL ✓

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

##### 1.2 — TypeScript Tip Tanimlari ✓

Dosya: `apps/app/lib/database.types.ts` (Faz 3–5 tablolari icin genisletildi; 001'deki tum tablolar henuz tiplerde degil)

- Schema'daki tum tablo satirlarini karsilayan TypeScript interface/type tanimlari.
- `Row`, `Insert`, `Update` varyantlari her tablo icin tanimlanir.
- Enum tipleri TypeScript union type olarak tanimlanir.

---

#### Blok 2 — Supabase Client Mimarisi ◐

##### 2.1 — Server Component Client ◐

Dosya: `apps/app/lib/supabase-server.ts` (`createSupabaseServerClient` — dosya var, action'larda kullanilmiyor)

- `createServerClient()` fonksiyonu: Next.js Server Component ve Server Action'lardan cagrilir.
- Clerk JWT'sini Supabase'e aktarir: `auth().getToken({ template: 'supabase' })`.
- RLS, Clerk user context ile calismis olur.
- Cookie bazli session yoktur; her istekte Clerk token alinir.

##### 2.2 — Admin Client ✓

Dosya: `apps/app/lib/supabase-admin.ts`

- `createAdminClient()` fonksiyonu: `SUPABASE_SERVICE_ROLE_KEY` kullanir.
- RLS bypass eder; sadece webhook ve kritik server action'larda kullanilir.
- Mevcut webhook (`apps/app/app/api/webhooks/clerk/route.ts`) bu client'a gecis yapar.

##### 2.3 — Mevcut `lib/supabase.ts` Duzeltme ✓

- Anon client client-side bilesenler icin korunur.
- Server ve admin client ayri dosyalara tasindi.
- ◐ Action katmani hala cogunlukla admin client'a bagli (RLS bypass).

---

#### Blok 3 — Auth Sonrasi Yonlendirme ve Route Gruplari ✓

##### 3.1 — Route Grubu Yapisi ✓

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

##### 3.2 — Protected Layout (Onboarding Guard) ✓

Dosya: `apps/app/app/(protected)/layout.tsx` (onboarding `app/onboarding/` — guard disinda)

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

#### Blok 4 — Onboarding Akisi ✓

UserFlows.md §2 referans alinir.

##### 4.1 — Onboarding Page (Server Component) ✓

Dosya: `apps/app/app/(protected)/onboarding/page.tsx`

- Kullanicinin zaten organizasyonu varsa `/dashboard`'a redirect.
- `OnboardingStepper` client component'ini render eder.

##### 4.2 — Onboarding Stepper (Client Component) ✓

Dosya: `apps/app/app/onboarding/_components/onboarding-stepper.tsx`

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

##### 4.3 — Onboarding Server Actions ✓

Dosya: `apps/app/app/onboarding/actions.ts`

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
- ✓ `createSupabaseAdminClient()` kullanir.
- ✗ Zod ile input validation (henuz yok).
- ✓ Hata durumunda anlamli mesaj dondurur.

---

#### Blok 5 — Route Skeleton Sayfalari ✓ (icerik Faz 2–5 ile genisletildi)

Ilk placeholder'lar tamamlandi; asagidaki route'lar gercek CRUD/registry UI ile calisir:

| Route | Durum |
|---|---|
| `/dashboard`, `/teams`, `/athletes`, `/sessions` | ✓ |
| `/readiness`, `/nutrition`, `/load-recovery`, `/calendar`, `/training-planner` | ✓ |
| `/drills`, `/wearables`, `/ai-reports`, `/team-memory`, `/reports` | ◐ route'lar mevcut; wearables/reports halen kismi, AI/Team Memory MVP |
| `/settings/*` (profile, org, billing, staff, integrations) | ◐ staff aktif; billing/integrations halen kismi |
| `/invite/athlete/[token]` | ✓ |
| `/athlete/dashboard` | ◐ koç aggregate (sporcu paneli degil) |

---

#### Blok 6 — Webhook Refactor ✓

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

### FAZ 2 — Team Operations ve CRUD ✓ / ◐

**Amac:** Onboarding sonrasi gercek operasyon ekranlari.

```text
Agent gorevleri:
- ✓ Organization onboarding: create/update organization
- ✓ Organization switcher/manager: sidebar uzerinden aktif organizasyon secimi
- ◐ Organization CRUD: yeni organizasyon ekle, guncelle (sil/arsivle yok)
- ◐ Plan gate: team_billing_entitlements + canCreateOrganization
- ✓ Team CRUD: liste, duzenle, sil
- ✓ Athlete CRUD: liste, form, duzenle, sil
- ✓ Athlete invite token olusturma (link; e-posta yok)
- ✓ Staff yonetimi: davet linki, claim akisi, aktif uye listesi
- ◐ Entitlement helper: plan okuma var; tum limitler enforced degil
- ✓ Permission helper: rol kontrolleri action'larda (admin client ile)
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

---

### FAZ 3 — Sessions ve Athlete Daily Data ✓ / ◐

**Amac:** Urunun gercek operasyon verisi toplanmaya baslar.

```text
Migration: ✓ docs/supabase/003_sessions.sql, 004_daily_data.sql, 009_daily_data_schema_align.sql
  - ✓ sessions, session_attendance, training_blocks
  - ✓ wellness_checkins, nutrition_logs
  - ✓ personal_trainings

App route'lari:
  - ✓ /sessions (liste + olustur + attendance + blocks)
  - ✓ /sessions/[id] (detay + tamamla + AI report CTA)
  - ✓ /readiness, /nutrition (koç + yetkili staff girisi)
  - ✓ /personal-training
  - ✓ /athlete/onboarding, /athlete/home, /athlete/check-in, /athlete/nutrition, /athlete/training, /athlete/profile
  - ◐ /athlete/dashboard coach aggregate olarak halen duruyor; gercek sporcu deneyimi `/athlete/home` altina tasindi
  - ✓ Kontrollu sozluk: session focus/intensity, attendance, drills, team-memory
```

---

### FAZ 4 — Wearables, Files ve Import ◐

```text
Migration: ✓ docs/supabase/006_wearables.sql
  - ✓ wearable_connections (kayit formu)
  - ✗ summaries/activities sync, session_files

Entegrasyonlar:
  - ✗ Strava OAuth
  - ✗ CSV import isleme
  - ✗ Dosya upload pipeline
  - ✗ Token sifreleme (AES-256-GCM)
```

---

### FAZ 5 — AI Reports ve Team Memory ◐

```text
Migration: ✓ 005_drills.sql, 007_ai_reports.sql, 008_team_memory.sql, 011_team_memory_rag.sql
  - ✓ drills, ai_reports, observations, patterns
  - ✓ documents, embeddings, assistant_threads, assistant_messages, vector match RPC

AI Katmani:
  - ✓ MVP Gemini adapter (`lib/ai/gemini.ts`)
  - ✓ Session analysis pipeline (rules fallback + opsiyonel Gemini)
  - ✓ Team Memory Assistant (keyword + vector retrieval, rules fallback + opsiyonel Gemini)
  - ◐ RAG kalite iyilestirmesi: gercek chunking, kaynak tipinin korunmasi, corpus refresh, retrieval degerlendirmesi
  - ◐ Entitlement/limit kontrolu AI tarafinda tam degil
```

---

### FAZ 6 — Billing, Reports ve Self-host ✗ / ◐

```text
- ✗ Clerk Billing webhook
- ◐ team_billing_entitlements okuma; tam sync yok
- ◐ Feature gate kismi
- ✗ PDF rapor export
- ✗ Self-host setup akisi
- ✗ api_keys yonetimi
- ◐ /reports sayfasi (placeholder metin)
```

---

## 4.1 Guncel Eksik Analizi ve Bundan Sonraki Yol

Mevcut sistem korunarak ilerlenmesi gereken ana eksikler:

### P0 — Guvenlik, tutarlilik ve kalite

1. `createSupabaseAdminClient()` kullanan normal okuma/yazma akislarini kademeli olarak `createActionSupabase()` / RLS'e tasimak.
2. `workspace.ts`, athlete portal query'leri ve AI/Team Memory action'lari icin tenant izolasyonunu RLS + negatif testlerle dogrulamak.
3. E2E test altyapisini kurmak; en az auth, onboarding, athlete claim, org switch, readiness/nutrition, session detail + AI report, Team Memory thread akislari icin kapilar yazmak.
4. `docs/UrunUyumVeEksikler.md`, `docs/SiteHaritasi.md` ve bu belgeyi her buyuk faz sonunda kodla senkron tutmak.

### P1 — MVP vaatlerini tamamlama

1. Wearable OAuth + sync pipeline (ilk hedef: Strava).
2. CSV import ve session/file upload pipeline.
3. Clerk Billing webhook + takim bazli entitlement sync.
4. Feature gate'leri gercek plan alanlarina baglamak:
   - `ai_reports_enabled`
   - `team_memory_enabled`
   - `training_planner_enabled`
   - `wearable_enabled`
   - `max_team_members`
5. PDF/report export MVP.

### P2 — AI/RAG olgunlastirma

1. Team Memory corpus ingestion'i otomatik ve izlenebilir hale getirmek.
2. Tek chunk yerine coklu chunking ve source metadata korumasi.
3. AI report -> documents -> embeddings zincirini event tabanli veya garantili senkron hale getirmek.
4. Retrieval kalite olcumu, cited source gorunurlugu, missing-data davranisi ve prompt version takibi.

### P3 — Self-host ve urunlestirme

1. Self-host setup flow (`/setup/*`) ve provider key yonetimi.
2. `api_keys` UI, backup/restore, migration health ve sistem check ekranlari.
3. Public web docs, legal/trust ve open-source anlatimini tamamlamak.

---

## 4.2 Guncel Faz Plani

### FAZ 7 — RLS Sertlestirme ve Test Temeli

**Amac:** Mevcut urun davranisini bozmadan veri erisimini gercek multi-tenant mimariye yaklastirmak.

```text
Adim 1:
  - createSupabaseAdminClient kullanilan action/query listesi cikarilir.
  - Bootstrap, webhook, audit log gibi admin kalmasi gerekenler isaretlenir.

Adim 2:
  - Dusuk riskli query'ler RLS client'a tasinir.
  - Readiness/nutrition/personal training pattern'i referans alinir.

Adim 3:
  - Org switch, athlete claim, staff claim, coach/athlete route guard icin negatif tenant testleri yazilir.

Adim 4:
  - E2E test altyapisi ve smoke suite eklenir.
```

**Cikis kriteri:**

- Normal kullanici verisi varsayilan olarak RLS client ile okunur/yazilir.
- Admin client listesi acik ve gerekcelidir.
- Kritik kimlik/tenant akislari testlidir.

### FAZ 8 — Wearables, Files ve Import

**Amac:** Manuel veri disinda gercek dis kaynak verisini sisteme almak.

```text
Adim 1:
  - Strava OAuth connect/callback/disconnect.
  - Token sifreleme ve refresh akisi.

Adim 2:
  - wearable_daily_summaries / wearable_activities sync job.

Adim 3:
  - CSV import preview + normalize + athlete eslestirme.

Adim 4:
  - session file upload + summary ingestion temel akisi.
```

**Cikis kriteri:**

- En az bir wearable provider'dan gercek veri gelir.
- CSV ve dosya yukleme tekrarli kayit uretmeden islenir.

### FAZ 9 — Billing ve Feature Gate

**Amac:** PricingPolicy v3.1'i urun davranisina gercekten baglamak.

```text
Adim 1:
  - Clerk Billing checkout metadata -> team_id mapping.
  - Billing webhook -> team_billing_entitlements sync.

Adim 2:
  - AI Reports, Team Memory, Training Planner, Wearables, member invite islemlerine server-side gate.

Adim 3:
  - /settings/billing'i placeholder olmaktan cikar.
```

**Cikis kriteri:**

- Plan degisimi feature access'i server tarafinda degistirir.
- Basic/Pro/Pro Plus limitleri testlidir.

### FAZ 10 — AI ve Team Memory Olgunlastirma

**Amac:** Calisan AI MVP'yi guvenilir urun katmanina donusturmek.

```text
Adim 1:
  - AI report ciktilarini documents/embeddings'e garantili bagla.
  - Source type ve metadata kaybini kaldir.

Adim 2:
  - Multi-chunk ingestion + refresh/update stratejisi.

Adim 3:
  - Retrieval eval setleri, prompt regression ve kaynak gosterimi.

Adim 4:
  - Team Memory assistant icin entitlement, hata, empty state ve audit davranislari.
```

**Cikis kriteri:**

- Team Memory cevaplari izlenebilir kaynaklarla gelir.
- AI fallback, missing-data ve medical boundary davranislari testlidir.

### FAZ 11 — Reports, Self-host ve Public Urunlestirme

**Amac:** Hosted + self-host vaatlerini kapatmak.

```text
Adim 1:
  - PDF/report export MVP.
  - Paylasilabilir rapor veya indirme akisi.

Adim 2:
  - /setup flow, system check, provider keys, api_keys UI.

Adim 3:
  - Public docs, integrations, security/legal, open-source anlatimi.
```

**Cikis kriteri:**

- Self-host kurulum akisi dokuman + UI olarak calisir.
- Public site ana vaatleri bos link veya placeholder olmadan tasir.

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
| `docs/supabase/001_initial_schema.sql` | ✓ Mevcut | Genis v3.0 schema referansi |
| `docs/supabase/002_phase1_foundation.sql` | ✓ Uygulandi | Foundation, RLS, `team_billing_entitlements` |
| `docs/supabase/003_sessions.sql` | ✓ Uygulandi | sessions, attendance, training_blocks |
| `docs/supabase/004_daily_data.sql` | ✓ Uygulandi | wellness_checkins, nutrition_logs |
| `docs/supabase/005_drills.sql` | ✓ Uygulandi | drills + training_blocks.drill_id |
| `docs/supabase/006_wearables.sql` | ✓ Uygulandi | wearable_connections, summaries, activities |
| `docs/supabase/007_ai_reports.sql` | ✓ Uygulandi | ai_reports |
| `docs/supabase/008_team_memory.sql` | ✓ Uygulandi | athlete_observations, team_patterns |
| `docs/supabase/009_daily_data_schema_align.sql` | ✓ Uygulandi | daily data kolon uyumu |
| `docs/supabase/010_organization_staff_invites.sql` | ✓ Uygulandi | staff invite linkleri |
| `docs/supabase/011_team_memory_rag.sql` | ✓ Uygulandi | documents, embeddings, assistant threads/messages, vector RPC |
| `personal_trainings` | ✓ App aktif | 001 schema + personal training UI/action |
| `reports`, `api_keys`, self-host | ◐ / ✗ | reports placeholder; api_keys ve self-host setup henuz yok |

Guncel ozet: `docs/supabase/README.md`

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

Guncel durum:

- Readiness, nutrition ve personal training action'lari RLS client'a gecmistir.
- Workspace query katmani, AI generation ve Team Memory action'lari dahil bircok alan halen admin client kullanir.
- Faz 7'nin ana amaci bu borcu kontrollu bicimde kapatmaktir.

### Risk: AI medikal siniri

Karar:

- `docs/PromptEngineering.md` kurallari tum AI ciktilarinda zorunlu.
- AI ciktisi "karar destek" olarak sunulur; teshis, tedavi, diyet recetesi dili kullanilmaz.
- UI copy bu siniri yansitmali.

### Risk: Dokumanlarin koddan geri kalmasi

Karar:

- `docs/UrunUyumVeEksikler.md`, `docs/AgentGorevDagilimi.md`, `docs/supabase/README.md` her buyuk faz sonunda birlikte guncellenir.
- Bir ozellik tamamlandiginda sadece kod degil, ilgili durum tablosu ve route/migration listesi de degisir.
- Kod durumuna aykiri eski raporlar karar kaynagi olarak kullanilmaz; once guncellenir.
