# OhHike — Yapılanlar ve Yol Haritası

**Güncelleme:** 2026-05-17  
**Amaç:** Şu ana kadar tamamlanan işler, devam edenler ve öncelik sırasıyla yapılacakların tek kaynak özeti.

**İlgili dokümanlar:**

| Doküman | İçerik |
|---------|--------|
| `docs/UrunUyumVeEksikler.md` | PRD uyumu, kırılma noktaları, E2E kapıları |
| `docs/PricingPolicy.md` | Basic / Pro / Pro Plus plan tanımları |
| `docs/supabase/README.md` | SQL migration `002`–`011` |
| `deploy/README.md` | Dokploy (app + web), env, sorun giderme |

---

## 1. Özet

OhHike CoachOS (`apps/app`) ürün omurgası büyük ölçüde hazır: auth, organizasyon, takım, sporcu, seans, günlük veri, davetler, AI raporları ve Team Memory MVP repoda. Production deploy altyapısı (Docker, Dokploy rehberi) eklendi; `apps/web` canlı ve public Faz 1 sayfaları tamamlandı. `apps/app` canlıya alınmış durumda; Clerk production DNS / FAPI zinciri doğrulandı. Kalan canlı kapı manuel kullanıcı smoke paketidir.

**Yeni ürün önceliği (senin kararın):**

1. **Billing** — Clerk Billing + `team_billing_entitlements` senkronu  
2. **Plan farkları** — Free (Basic) / Pro / Pro Plus feature gate’leri (`docs/PricingPolicy.md` §6–7)  
3. **Diğer Post-MVP özellikler** — PDF, Strava, RLS, E2E, vb.

---

## 2. Tamamlananlar

### 2.1 CoachOS uygulaması (`apps/app`)

| Alan | Durum | Notlar |
|------|--------|--------|
| Clerk auth (login, register, middleware) | ✅ kod / ◐ manuel smoke | `proxy.ts`, `ClerkProvider`; canlı FAPI DNS ve browser script doğrulandı |
| Clerk webhook → `users` | ✅ kod / ◐ canlı doğrulama | `/api/webhooks/clerk`; canonical env `CLERK_WEBHOOK_SIGNING_SECRET` |
| Onboarding (org + team) | ✅ | `app/onboarding/` |
| Org switch, workspace context | ✅ | `lib/workspace.ts` |
| Takım / sporcu CRUD | ✅ | Kadro modeli, coach-first |
| Athlete + staff davet / claim | ✅ | Link tabanlı; e-posta yok |
| Athlete portal | ✅ | check-in, nutrition, training, home |
| Sessions + yoklama + training blocks | ✅ | |
| Readiness + nutrition (koç + sporcu) | ✅ | |
| Personal training | ✅ | |
| Drills | ✅ | |
| AI session reports | ✅ | Liste + detay; Gemini opsiyonel, rules fallback |
| Team Memory Assistant | ✅ | RAG tabloları `011`, UI `/team-memory` |
| AI reports detay sayfası | ✅ | `/ai-reports/[id]` |
| Wearables + Strava OAuth | ◐ | `/wearables`, connect/callback/sync; Pro plan gate; env `STRAVA_CLIENT_ID/SECRET` |
| Health API | ✅ | `GET /api/health` — eksik env listesi |
| Prod URL davetleri | ✅ | `lib/app-url.ts` → `NEXT_PUBLIC_APP_URL` |

### 2.2 Veritabanı (repoda)

Migration dosyaları `docs/supabase/`:

| Dosya | Konu |
|-------|------|
| `002_phase1_foundation.sql` | Foundation + `team_billing_entitlements` |
| `003_sessions.sql` | Seanslar |
| `004_daily_data.sql` | Wellness, nutrition |
| `005_drills.sql` | Drill library |
| `006_wearables.sql` | Wearable tabloları |
| `007_ai_reports.sql` | AI rapor registry |
| `008_team_memory.sql` | Gözlemler, pattern |
| `009_daily_data_schema_align.sql` | Wellness kolon hizalama |
| `010_organization_staff_invites.sql` | Staff davet |
| `011_team_memory_rag.sql` | Embeddings, assistant, RPC |

**Not:** Production Supabase’de `002`–`011` sırayla uygulanmış olmalı (panel işi).

### 2.3 Billing altyapısı (kısmi — veri modeli)

| Ne var | Ne yok |
|--------|--------|
| `team_billing_entitlements` tablosu + tipler | Clerk Billing checkout |
| Yeni takımda varsayılan `basic_team` (`workspace.ts` actions) | Billing webhook → entitlement güncelleme |
| `canCreateOrganization` → Pro / Pro Plus (`lib/workspace.ts`) | Çoklu export şablonları / gelişmiş branded tasarım |
| `lib/billing/plans.ts` + `lib/billing/entitlements.ts` | Self-serve upgrade UI |
| AI reports, Team Memory, planner, wearables ve atlet limiti için server-side gate paketi | Billing webhook → gerçek plan senkronu |
| `/settings/billing` plan/limit görünümü | |

Plan tanımları: `docs/PricingPolicy.md` (Basic = Free, Pro $29, Pro Plus $79).

### 2.4 Marketing site (`apps/web`)

| Alan | Durum |
|------|--------|
| Landing, pricing, product sayfaları | ✅ |
| `output: "standalone"` + `Dockerfile.web` | ✅ |
| CTA → app URL (`lib/site-url.ts`) | ✅ — Docker build arg doğrulaması var |
| Navbar/footer asset fixleri | ✅ | Linux case-sensitive logo yolu düzeltildi |
| Dokploy deploy | ✅ | Canlı web yayında |

### 2.5 Deploy ve DevOps (kod)

| Dosya / özellik | Açıklama |
|-----------------|----------|
| `Dockerfile` | Coach app, monorepo kökünden `pnpm turbo build --filter=app`; `NEXT_PUBLIC_*` build arg yoksa fail-fast |
| `Dockerfile.web` | Marketing web; hosted default app URL + build-time doğrulama |
| `.dockerignore` | Build context |
| `deploy/README.md` | İki Dokploy app, port 3000, env, sorun giderme |
| `deploy/dokploy.env.app.example` | App env şablonu |
| `deploy/dokploy.env.web.example` | Web env şablonu |
| `deploy/docker-entrypoint-app.sh` | Env doğrulama, `HOSTNAME=0.0.0.0`, encryption key kontrolü |
| `apps/app/vercel.json` | Alternatif Vercel deploy |
| `apps/app/lib/clerk-env.ts` | Runtime Clerk keys (Docker build inline sorunu) |
| `apps/app/lib/production-env.ts` | Zorunlu env listesi |
| `apps/web/lib/site-url.ts` | App URL linkleri |
| `apps/web/scripts/validate-docker-build-env.mjs` | Web image build arg doğrulaması |

**Git (son commit’ler — örnek):** Docker deploy, Clerk encryption, HOSTNAME bind, health API, Team Memory, AI reports, MVP plan revizyonu, admin client (RLS revert sonrası).

### 2.6 Bilinçli geri alınan / ertelenen

| Konu | Durum |
|------|--------|
| Supabase RLS + Clerk JWT template | Revert edildi; MVP **admin (service role)** client |
| Vitest / E2E otomasyon | Post-MVP |
| Clerk Billing canlı entegrasyon | Sıradaki öncelik (aşağı §4) |

---

## 3. Kısmen tamamlanan / doğrulanacak

### 3.1 Production deploy (FAZ M1)

| ID | Görev | Durum |
|----|--------|--------|
| M1.1 | Supabase prod + migration `002`–`011` | ⬜ panel |
| M1.2 | Clerk prod (live keys, webhook, redirect, FAPI DNS) | ◐ live env + FAPI DNS doğrulandı; manuel register/login + webhook delivery bekliyor |
| M1.3 | Dokploy app + web (Dockerfile, context `.`, port 3000) | ✅ app + web deploy yolu çalışıyor; build-time args zorunlu hale getirildi |
| M1.4 | Manuel smoke checklist (14 akış) | ⬜ |

**Deploy sırasında çözülen teknik konular (rehber + kod):**

- Monorepo root + pnpm (Nixpacks `workspace:*` hatası)
- Web build: yanlış / eksik build-time `NEXT_PUBLIC_APP_URL`
- App: `Missing publishableKey` → runtime Clerk env + build-args
- App/Web: `NEXT_PUBLIC_*` değerleri runtime değil build sırasında da verilmek zorunda
- App: `CLERK_ENCRYPTION_KEY` (middleware dynamic `secretKey`)
- Traefik 502: container `HOSTNAME` → `0.0.0.0` bind
- Web: Linux deploy’da case-sensitive logo yolu
- Clerk prod: publishable key içindeki FAPI domain (`clerk.<domain>`) DNS çözümlemesi
- App ve web aynı container port **3000** (ayrı container — çakışma yok)

### 3.2 Sunum UX (FAZ M2)

| ID | Görev | Durum |
|----|--------|--------|
| M2.1 | Davet URL prod doğrulama | ⬜ |
| M2.2 | Billing / integrations / reports placeholder metin | ◐ billing placeholder var |
| M2.3 | `/athlete/dashboard`, Gemini status | ⬜ |
| M2.4 | Migration / action hata mesajları | ⬜ |

### 3.3 Public site (FAZ M3)

| ID | Görev | Durum |
|----|--------|--------|
| M3.1 | Link audit (CTA, footer, GitHub) | ✅ temel audit yapıldı |
| M3.2 | Privacy / terms içerik | ✅ temel sayfalar mevcut |

---

## 4. Yapılacaklar — öncelik sırası (güncel karar)

### FAZ B1 — Billing (ilk öncelik)

**Çıkış:** Kullanıcı plan seçer / yükseltir; `team_billing_entitlements` güncellenir.

| # | İş | Referans |
|---|-----|----------|
| B1.1 | Clerk Billing prod: planlar `basic_team`, `pro_team`, `pro_plus_team` | `PricingPolicy.md` §5 |
| B1.2 | Checkout (organization scope) + `team_id` metadata mapping | §5 checkout akışı |
| B1.3 | Webhook: subscription created/updated/canceled → Supabase upsert | `team_billing_entitlements` |
| B1.4 | `/settings/billing` — mevcut plan, limitler, upgrade CTA | placeholder kaldır |
| B1.5 | Env: Clerk Billing secret / webhook | `deploy/dokploy.env.app.example` güncelle |
| B1.6 | Manuel test: checkout → entitlement → UI yansıması | |

### FAZ B2 — Plan farkları (Basic / Pro / Pro Plus)

**Çıkış:** `docs/PricingPolicy.md` §6–7 ile uyumlu server-side gate’ler.

| Plan | Özet limitler / özellikler |
|------|----------------------------|
| **basic_team** (Free) | max 3 üye; AI kapalı; Team Memory kapalı; PDF yok |
| **pro_team** | 20+ üye; AI reports, Team Memory, planner, wearable özet, PDF |
| **pro_plus_team** | 50+ üye; Pro + branded reports, gelişmiş roller, yüksek AI limit |

| # | İş |
|---|-----|
| B2.1 | ✅ `lib/billing/plans.ts` — plan → entitlement flag / limit haritası |
| B2.2 | ✅ `lib/billing/entitlements.ts` — primary/team entitlement okuma + default fallback |
| B2.3 | ✅ Gate: AI report oluşturma, Team Memory, training planner, wearables, PDF export |
| B2.4 | ◐ Gate: `max_team_members` roster eklemede var; staff invite semantiği netleştirilecek |
| B2.5 | ✅ UI: AI reports, Team Memory, planner, wearables kilit kartları + sidebar Pro rozetleri |
| B2.6 | ◐ Pro Plus: `monthly_ai_report_limit` uygulanıyor; `branded_reports_enabled` ilk PDF başlığında etkili, tam branded şablon bekliyor |
| B2.7 | Yeni takım default `basic_team` (mevcut) — upgrade sonrası flag güncelleme |

**Kodda bugün var:** `canCreateOrganization` (Pro+), yeni team → `basic_team`, AI report üretim limiti, Team Memory / planner / wearables / PDF export gate’leri, sidebar Pro rozetleri ve roster limiti. Tam branded şablon ile staff invite yorumu henüz açık.

### FAZ B3 — Canlı stabilizasyon ve gelir sonrası ürün tamamlama

Sıra önerisi; ihtiyaca göre kaydırılabilir.

| Sıra | Özellik | Kapsam |
|------|---------|--------|
| 1 | Canlı auth + smoke kapatma | webhook delivery, register → onboarding → dashboard |
| 2 | `/reports` liste (PDF yok) | DB özet |
| 3 | **PDF export** | ✅ İlk AI report PDF endpoint’i + indirme bağlantıları tamam |
| 4 | **Strava** OAuth + sync | ◐ OAuth connect + manuel sync tamam; plan flag’leri `plans.ts` kaynağından; sporcu yoksa “unavailable”; webhook / auto sync bekliyor |
| 5 | Davet e-postası (Resend) | ✅ Athlete + staff invite email fallback akışı tamam |
| 6 | Dashboard metrik kartları | |
| 7 | Wearable CSV import | |
| 8 | Session file upload pipeline | |
| 9 | AI/RAG olgunluk (chunking, eval) | |
| 10 | Self-host setup UI + `api_keys` | |

### FAZ B4 — Güvenlik ve kalite (paralel veya B3 sonrası)

| İş |
|-----|
| Supabase RLS geçişi |
| Clerk JWT `supabase` template |
| Playwright E2E |
| Zod action validation |
| Org silme / arşiv |

---

## 5. Plan özellik matrisi (hedef — uygulama B2’de)

Kaynak: `docs/PricingPolicy.md` §6.1

| Özellik | Basic (Free) | Pro | Pro Plus |
|---------|:------------:|:---:|:--------:|
| Takım üyesi limiti | 3 | 20+ | 50+ |
| Takım / sporcu / seans | ✓ | ✓ | ✓ |
| Check-in, beslenme | ✓ | ✓ | ✓ |
| AI Coach Reports | — | ✓ | ✓ |
| Team Memory / RAG | — | ✓ | ✓ |
| Training Planner (AI) | — | ✓ | ✓ |
| Wearable özetleri | — | ✓ | ✓ |
| PDF export | — | ✓ | ✓ |
| Branded reports | — | — | ✓ |
| Gelişmiş roller / audit | — | — | ✓ |

---

## 6. Ortam ve deploy kontrol listesi

### App (Dokploy) — zorunlu env

```env
NEXT_PUBLIC_APP_URL=https://app.<domain>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_ENCRYPTION_KEY=<openssl rand -base64 32>
CLERK_WEBHOOK_SIGNING_SECRET=whsec_...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PORT=3000
HOSTNAME=0.0.0.0
```

Build-time arguments:

```env
NEXT_PUBLIC_APP_URL=https://app.<domain>
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

### Web (Dokploy)

```env
NEXT_PUBLIC_APP_URL=https://app.<domain>
PORT=3000
```

### Doğrulama

- [ ] `https://app.<domain>/api/health` → `ok: true`
- [x] `clerk.<domain>` DNS çözülüyor ve HTTPS cevap veriyor
- [ ] Kayıt → onboarding → dashboard
- [ ] Web CTA → app domain

---

## 7. Teknik kararlar (hatırlatma)

| Konu | MVP kararı |
|------|------------|
| Supabase erişim | Service role (`createSupabaseAdminClient`) |
| Billing veri modeli | Takım bazlı `team_billing_entitlements` |
| AI | Gemini varsa LLM; yoksa rules fallback |
| Deploy | Dokploy, iki app, Dockerfile monorepo kökü |
| Local app port | 3001 (`NEXT_PUBLIC_APP_URL`) |
| Container port | 3000 (app ve web ayrı container) |

---

## 8. Dosya indeksi (sık kullanılan)

```text
apps/app/
  app/(protected)/settings/billing/page.tsx   → billing UI (placeholder)
  app/actions/workspace.ts                  → org/team, entitlement seed
  lib/workspace.ts                          → plan, canCreateOrganization
  lib/clerk-env.ts                          → runtime Clerk keys
  lib/production-env.ts                     → health env kontrolü
  proxy.ts                                  → auth middleware + Clerk keys

apps/web/
  lib/site-url.ts                           → app URL linkleri
  app/pricing/page.tsx                      → plan linkleri (register?plan=)

deploy/
  README.md, dokploy.env.*.example, docker-entrypoint-app.sh

docs/
  PricingPolicy.md                          → plan tanımları
  UrunUyumVeEksikler.md                     → uyum + test kapıları
  supabase/README.md                        → migration sırası
```

---

## 9. Güncelleme kuralı

Bu dosya şu durumlarda güncellenir:

- Bir faz (M1, B1, B2, …) tamamlandığında ilgili satırlar ✅ yapılır.
- Yeni migration (`012_…`) eklendiğinde §2.2 ve `supabase/README.md` senkron tutulur.
- Öncelik değişince §4 sırası revize edilir.

**Son güncelleme notu:** Public web ve Docker deploy hattı canlıya alındı; Clerk production FAPI DNS zinciri doğrulandı. Aktif sıra artık `manuel canlı smoke → B1 Billing → B2 plan gate → B3 gelir sonrası ürün tamamlama`.
