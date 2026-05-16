# OhHike CoachOS — MVP Üretim Planı

**Güncelleme:** 2026-05-16  
**Amaç:** Hızlıca production’a çıkıp sunmak. Çalışan ürün öncelikli; mimari sertleştirme sonraya.

**Detaylı uyum / kırılma noktaları:** `docs/UrunUyumVeEksikler.md`  
**Migration listesi:** `docs/supabase/README.md`

---

## 0. Strateji ve bilinçli kararlar

| Karar | MVP (şimdi) | Post-MVP (en son) |
|--------|-------------|-------------------|
| Supabase erişimi | **Service role (`createSupabaseAdminClient`)** — tüm loader ve action’lar | RLS + Clerk JWT template + negatif tenant testleri |
| Auth | Clerk + webhook → `users` | JWT template zorunluluğu |
| Test | Manuel smoke checklist (deploy öncesi) | Playwright E2E, Vitest |
| Wearables | Manuel bağlantı kaydı (form) | Strava OAuth, sync, CSV |
| Billing | Placeholder / statik plan metni | Clerk Billing webhook + entitlement gate |
| AI | Session report + Team Memory (Gemini opsiyonel, rules fallback) | RAG kalite, chunking, feature gate |
| Self-host / PDF / api_keys | Yok | Ayrı faz |

**Tamamlanan ürün omurgası (plandan çıkarıldı — tekrar yazılmaz):**  
Clerk shell, onboarding, org switch, team/athlete/session CRUD, session detail + AI report, readiness/nutrition/personal training, athlete + staff invite/claim, athlete portal, drills, team memory assistant (MVP), AI reports liste + detay, migration SQL `002`–`011` repoda.

---

## 1. Dosya sahipliği (kısa)

```text
apps/app/**     → CoachOS uygulaması
apps/web/**     → Marketing / public
docs/supabase/  → SQL migration + README
docs/**         → Ürün referansı (PRD, UserFlows, bu plan)
```

Kilitli: root `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`.

**Migration kuralı:** Yeni SQL → `docs/supabase/0XX_*.sql` + `README.md` güncelle; production DB’ye elle veya CLI ile uygula.

---

## 2. Faz planı (sadece eksikler)

### FAZ M1 — Production deploy

**Çıkış:** `apps/app` canlı URL’de; yeni kullanıcı onboarding → dashboard akışı çalışır.

```text
M1.1 — Supabase production
  - Proje oluştur / prod instance seç
  - Sırayla uygula: 002 → 003 → 004 → 005 → 006 → 007 → 008 → 009 → 010 → 011
  - Service role + anon key → deploy env

M1.2 — Clerk production
  - Prod Clerk app, redirect URLs (app domain)
  - Webhook: user.created / updated / deleted → /api/webhooks/clerk
  - CLERK_WEBHOOK_SECRET prod env

M1.3 — App deploy (ör. Vercel)
  - Root: apps/app veya monorepo turbo build
  - Env: NEXT_PUBLIC_SUPABASE_*, SUPABASE_SERVICE_ROLE_KEY,
         NEXT_PUBLIC_CLERK_*, CLERK_SECRET_KEY,
         NEXT_PUBLIC_APP_URL=https://<prod-domain>,
         GEMINI_API_KEY (opsiyonel ama AI için önerilir)

M1.4 — Deploy öncesi manuel smoke (⬜ işaretle)
  - Kayıt / giriş → users satırı
  - Onboarding → org + team
  - Org switch
  - Athlete ekle → davet linki (prod URL) → claim → athlete home
  - Session oluştur → yoklama → tamamla → AI report
  - Readiness + nutrition (koç + sporcu)
  - Team Memory bir soru (Gemini yoksa rules fallback mesajı OK)
```

**Kırılma noktaları:** `UrunUyumVeEksikler.md` §9 — BP-M3 (`NEXT_PUBLIC_APP_URL`), BP-A1, BP-T1, BP-P1–P4, BP-S1–S5.

---

### FAZ M2 — Sunum öncesi kritik UX

**Çıkış:** Demo / erken müşteri gösteriminde “kırık” hissi vermeyen copy ve linkler.

```text
M2.1 — Davet ve deep link
  - Athlete + staff invite URL’leri prod APP_URL kullanıyor mu doğrula
  - Süresi dolmuş / kullanılmış token mesajları anlaşılır mı

M2.2 — Placeholder sayfalar (dürüst metin, ölü CTA yok)
  - /settings/billing — “Ödeme yakında” / waitlist, sahte checkout yok
  - /settings/integrations — wearables “manuel kayıt” veya yakında
  - /reports — boş state + “PDF yakında” (varsa)

M2.3 — Bilinen kafa karıştırıcılar (isteğe bağlı ama önerilir)
  - /athlete/dashboard → coach aggregate ise redirect veya sidebar’dan kaldır
  - AI / Team Memory: Gemini yoksa kullanıcıya net status (env eksik)

M2.4 — Hata yüzeyi
  - Supabase migration eksikse anlamlı mesaj (009 wellness vb.)
  - Kritik action hataları UI’da görünür (sessiz fail yok)
```

---

### FAZ M3 — Public site (apps/web) minimum

**Çıkış:** Landing’den app’e giden yol ve temel güven sayfaları kırık değil.

```text
M3.1 — Link audit
  - Ana CTA → app login/register
  - Kırık footer / docs linkleri düzelt veya geçici kaldır

M3.2 — Sunum için yeterli içerik
  - Pricing / product özeti (statik OK)
  - Privacy / terms stub veya gerçek metin (hosting şartına göre)
```

---

### FAZ M4 — İsteğe bağlı MVP+ (production sonrası ilk hafta)

Sadece sunumda **mutlaka** istenirse; M1–M3’ten sonra.

```text
M4.1 — Koç dashboard kartları (basit metrikler, mock AI kart yok)
M4.2 — Davet e-postası (Resend) — link-only yerine
M4.3 — /reports basit özet (DB’den liste, PDF yok)
```

---

## 3. Post-MVP backlog (en son — faz numarası yok)

Tek listede; sıra üretim stabil olduktan sonra belirlenir.

```text
Güvenlik ve kalite
  - RLS geçişi (createWorkspaceSupabase / JWT template supabase)
  - E2E otomasyon (Playwright)
  - Zod action validation
  - Org silme / arşiv

Entegrasyonlar
  - Wearable OAuth (Strava) + sync + CSV import
  - Session / file upload pipeline
  - Clerk Billing → team_billing_entitlements + feature gate

AI olgunluk
  - RAG chunking, source metadata, retrieval eval
  - AI report → documents pipeline garantisi
  - Entitlement: ai_reports, team_memory, training_planner

Ürünleştirme
  - PDF / paylaşılabilir rapor
  - Self-host /setup, api_keys UI
  - apps/web docs / open-source anlatımı derinleştirme
```

---

## 4. Teknik notlar (MVP)

```text
Supabase client (apps/app):
  createSupabaseAdminClient()  → varsayılan (loader + action)
  createActionSupabase()       → MVP’de alias → admin (readiness/nutrition/PT)
  createSupabaseServerClient() → dosya var; RLS geçişine kadar zorunlu değil

Auth:
  Clerk middleware + (protected) layout
  Onboarding: app/onboarding/ (guard dışı)

Yeni özellik eklerken:
  - organization_id filtreleri ve rol kontrollerini koru
  - Migration + README
  - Manuel smoke maddesi ekle (M1.4 veya UrunUyum §10)
```

---

## 5. Migration kaydı (referans)

Production’da **`002`–`011`** uygulanmış olmalı. Tablo: `docs/supabase/README.md`.

Yeni migration gerektiğinde numarayı artır; MVP deploy’da mevcut 011’e kadar yeterli.

---

## 6. Agent çalışma kuralı

1. Önce **FAZ M1 → M2 → M3**; Post-MVP maddelerine dokunma (kullanıcı istemedikçe).  
2. Her faz bitince `UrunUyumVeEksikler.md` §8 özetini güncelle.  
3. RLS / Clerk JWT / Vitest commit’leri geri alındı; yeniden ekleme **Post-MVP** altında planlanır.
