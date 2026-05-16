# OhHike CoachOS — Ürün Uyumu ve Eksiklik Raporu

**Tarih:** 2026-05-16  
**Kaynaklar:** `PRD.md`, `UserFlows.md`, `DatabaseSchema.md`, `SystemArchitecture.md`, `SiteHaritasi.md`, `AgentGorevDagilimi.md`, `docs/supabase/README.md`, `apps/app` kod incelemesi.

---

## 1. Özet

Genel yön **doğru**: coach-first kadro modeli, organizasyon → takım → sporcu → seans/veri hiyerarşisi, migration’ların kademeli eklenmesi ve Team Operations ekranlarının büyük ölçüde çalışması PRD ve `DatabaseSchema.md` §2.3 (Athlete Claim Model) ile uyumlu.

Ancak PRD **MVP** ve `UserFlows.md` hedefleri ile **uygulama arasında önemli boşluklar** var: sporcu tarafı paneli, claim sonrası onboarding, gerçek AI/RAG, wearable OAuth, staff davet, kişisel antrenman ve RLS’li server client kullanımı henüz tamamlanmamış veya yanlış yorumlanmış parçalar içeriyor.

**Sonuç:** Ürün omurgası (Faz 1 + kısmen Faz 2–3 app) iyi ilerliyor; fark yaratan özellikler (AI, Team Memory RAG, sporcu self-service, billing) çoğunlukla **kayıt/registry UI** seviyesinde.

---

## 2. PRD MVP ile Karşılaştırma

| PRD MVP (§10 Must Have) | Doküman beklentisi | Kod durumu | Uyum |
|-------------------------|-------------------|------------|------|
| Landing page | `apps/web` marketing | `apps/web` mevcut | ✓ |
| Clerk auth | Login/register | Çalışıyor | ✓ |
| Organizasyon oluşturma | Onboarding + settings | Onboarding + ek org | ✓ |
| Takım oluşturma | Onboarding + Teams CRUD | Çalışıyor | ✓ |
| Sporcu ekleme | Koç kadrosu | CRUD + onboarding adımı | ✓ |
| Sporcu davet / claim | Token + profil bağlama | `/invite/athlete/[token]`, claim action | ◐ E-posta yok; claim sonrası profil tamamlama yok |
| Koç dashboard | Metrikler, özet | `/dashboard` maskotlu UI | ◐ AI/risk kartları PRD seviyesinde değil |
| Sporcu dashboard | Kendi check-in, görevler | `/athlete/dashboard` | ✗ Koç için tüm sporcuların özeti; sporcu paneli değil |
| Günlük check-in | Sporcu girer | `/readiness` | ◐ Koç sporcu adına giriyor |
| Toplu session | Oluştur + yoklama | `/sessions` CRUD + attendance | ✓ Detay sayfası (`/sessions/[id]`) yok |
| Kişisel antrenman | `personal_trainings` | — | ✗ Tablo migration’da var, app yok |
| Beslenme | Günlük log | `/nutrition` | ◐ Koç tarafı form |
| AI session report | LLM üretimi | `/ai-reports` | ✗ Manuel kayıt (`model_provider: manual`) |
| Team Memory Assistant | RAG sohbet | `/team-memory` | ✗ Gözlem/pattern registry; assistant yok |
| Pricing ekranı | Planlar | `/settings/billing` | ◐ Placeholder; Clerk Billing sync yok |
| Self-host mesajı | Kurulum akışı | — | ✗ App’te self-host setup yok |

**Should Have** (CSV wearable, PDF mock, drill library, observations): drill + observations kısmen var; CSV/PDF/gerçek AI yok.

---

## 3. UserFlows ve Athlete Model Uyumu

### 3.1 Tasarım niyeti (doğru anlaşılan model)

`UserFlows.md` §4 + `DatabaseSchema.md` §2.3:

1. Antrenör **kadro kaydı** oluşturur (`athletes`, `user_id` boş olabilir).
2. Seans, yoklama, raporlar bu kayıt üzerinden yürür.
3. İsteğe bağlı davet → sporcu **hesabını bağlar** (claim), günlük veriyi kendisi girer.

Bu **bilinçli coach-first** modeldir; “her şeyi sporcu girer” değildir.

### 3.2 Doküman vs kod farkları

| Adım | UserFlows §6 | Kod |
|------|----------------|-----|
| Davet oluşturma | Profilden veya create sonrası | Athletes satırında Invite; otomatik token yok |
| E-posta gönderimi | Var | Yok (sadece link kopyala) |
| Claim sonrası onboarding | “Profilini tamamlar” | Yok → doğrudan `/dashboard` |
| Athlete dashboard | Check-in, görevler | Koç aggregate görünümü |
| `/athlete/profile` | SiteHaritasi’nde | Route yok |

**Yanlış giden:** UI tam profil formu gösterip claim’in de aynı bilgiyi topladığı izlenimi veriyor; claim yalnızca `user_id` + `organization_members` bağlıyor.

**Eksik:** Claim sonrası sporcu onboarding ve rol bazlı navigasyon (sporcu vs koç menüsü).

---

## 4. Mimari ve Teknik Uyumsuzluklar

### 4.1 Supabase client stratejisi (`AgentGorevDagilimi.md` §5)

| Beklenen | Gerçek |
|----------|--------|
| Server Action’larda varsayılan `createServerClient()` + RLS | `workspace.ts` ve onboarding **yalnızca** `createSupabaseAdminClient()` |
| `createSupabaseServerClient()` RLS ile | Dosya var (`lib/supabase-server.ts`) ama **hiçbir yerde kullanılmıyor** |
| Zod ile action validation | Yok; `cleanString` / manuel kontroller |

**Risk:** Tüm org verisi service role ile okunuyor; uygulama katmanında rol kontrolü var ama RLS tasarımı devre dışı kalıyor.

### 4.2 Migration tablosu (`AgentGorevDagilimi.md` §6)

Dokümandaki §6 tablo **güncel değil**. Gerçek durum `docs/supabase/README.md` ile uyumlu:

- `003_sessions.sql` … `008_team_memory.sql` **mevcut ve app route’larına bağlı**.
- `004_wearables_files.sql` / `005_ai_rag.sql` numaraları dokümanda farklı isimlendirilmiş; dosya adları `004_daily_data`, `005_drills`, vb.

### 4.3 Onboarding route yapısı

Plan: `(protected)/onboarding/`.  
Gerçek: `app/onboarding/` (guard dışı, doğru) — uyumlu ama plan metni güncellenmeli.

### 4.4 Eksik route’lar (`SiteHaritasi.md` örnekleri)

- `/sessions/[id]` — session detay / tamamlama
- `/athlete/profile` — sporcu profil tamamlama
- Self-host setup route’ları
- Staff invite akışı

---

## 5. Faz Bazlı Gerçekleşen / Eksik

### Faz 1 — Foundation ✓ (büyük ölçüde tamam)

- SQL `002_phase1_foundation.sql`, tipler, admin client, webhook, onboarding, protected shell.

### Faz 2 — Team Operations ◐

| Görev | Durum |
|-------|--------|
| Organization create/update/switch | ✓ |
| Ek organizasyon (plan gate) | ✓ kısmi |
| Team / Athlete CRUD | ✓ |
| Athlete invite token | ✓ |
| Staff davet / rol | ✗ placeholder `/settings/staff` |
| `canCreateOrganization` / entitlement | ✓ kısmi |
| Org silme / arşiv | ✗ |
| Zod validation | ✗ |

### Faz 3 — Sessions & Daily Data ◐

| Görev | Durum |
|-------|--------|
| Sessions + attendance + blocks | ✓ |
| Readiness / nutrition | ✓ (koç girişi) |
| Kontrollü sözlük (session, attendance, drills, memory) | ✓ |
| `/sessions/[id]` | ✗ |
| `personal_trainings` | ✗ |
| Sporcu kendi check-in | ✗ |

### Faz 4 — Wearables ◐

| Görev | Durum |
|-------|--------|
| `wearable_connections` kayıt | ✓ |
| Strava OAuth / sync pipeline | ✗ |
| CSV import işleme | ✗ (provider seçeneği var, işlem yok) |

### Faz 5 — AI & Team Memory ◐

| Görev | Durum |
|-------|--------|
| Drills kütüphanesi | ✓ |
| Observations / patterns | ✓ |
| `ai_reports` tablosu + manuel form | ✓ kayıt only |
| LLM pipeline, embeddings, assistant | ✗ |
| `documents` / RAG | ✗ migration 001’de var, app yok |

### Faz 6 — Billing & Self-host ✗

| Görev | Durum |
|-------|--------|
| Clerk Billing webhook | ✗ |
| PDF export | ✗ placeholder metin |
| Self-host setup | ✗ |
| `api_keys` UI | ✗ |

---

## 6. Doğru Giden Akışlar (teyit)

1. **Veri hiyerarşisi** — Organization → Team → Athlete → Session/Wellness/Nutrition kod ve migration ile uyumlu.
2. **Coach-first roster** — PRD §8.3 ve claim modeli ile uyumlu; invite eksik parçalar ürün tamamlama işi.
3. **Team Operations UI** — Dashboard, teams, athletes, sessions, training-planner, calendar, load-recovery, readiness, nutrition sayfaları çalışır CRUD/registry seviyesinde.
4. **Tasarım sistemi** — DashboardHero, MetricCard, minimal coach UI son revizyonlarla `DesignSystem.md` yönüne yakın.
5. **Migration disiplini** — `docs/supabase/003`–`008` incremental; README güncel.

---

## 7. Öncelikli Düzeltme / Tamamlama Önerileri

**P0 — Ürün tutarlılığı**

1. Sporcu claim sonrası onboarding + `/athlete/profile` (veya claim içi form).
2. Gerçek **athlete dashboard** (rol=`athlete` için check-in, kendi verisi).
3. Sidebar / route guard: sporcu vs koç ayrımı.

**P1 — MVP vaadi**

4. AI report: en azından session verisinden LLM özeti (manuel kayıt yerine veya yanında).
5. Readiness/nutrition: sporcu self-service girişi.
6. `personal_trainings` minimal CRUD.
7. Davet e-postası (Resend vb.) veya net “link only” UX metni.

**P2 — Mimari sağlamlık**

8. Server Action’larda `createSupabaseServerClient()` + RLS; admin yalnızca bootstrap/webhook.
9. Zod şemaları.
10. Staff invite akışı.

**P3 — Fark özellikleri**

11. Team Memory RAG assistant.
12. Wearable OAuth + sync.
13. Clerk Billing + entitlement sync.

---

## 8. Sıradaki İşler (kısa liste)

Önceki geliştirme sırasına göre **tamamlananlar**: settings iskeleti, UI foundation, sessions/drills/team-memory sözlük normalizasyonu, athlete invite/claim, attendance sözlüğü.

**Sıradaki mantıklı paketler:**

1. Athlete claim sonrası profil + sporcu dashboard (P0)
2. `sessions/[id]` detay sayfası
3. Sporcu self-service readiness (P1)
4. Server client + RLS geçişi (P2)
5. AI report MVP pipeline (P1)

---

*Bu dosya canlı tutulmalı; `AgentGorevDagilimi.md` içindeki tikler teknik görev takibi, bu dosya PRD/akış uyumu için referanstır.*
