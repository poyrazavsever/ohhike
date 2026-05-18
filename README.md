<p align="center">
  <img src="apps/web/public/logo/newLogo.png" alt="OhHike Logo" width="170" />
</p>

<h1 align="center">OhHike CoachOS Monorepo</h1>

<p align="center">
  <b>AI destekli spor operasyon platformu</b><br/>
  Antrenörler, kulüpler ve sporcular için modern bir koçluk işletim sistemi.
</p>

<p align="center">
  <img src="apps/web/public/maskotlar/hazirlik.png" alt="Maskot Hazırlık" width="48" />
  <img src="apps/web/public/maskotlar/kosu.png" alt="Maskot Koşu" width="48" />
  <img src="apps/web/public/maskotlar/kutlama.png" alt="Maskot Kutlama" width="48" />
</p>

---

## ✨ Proje Özeti

OhHike CoachOS, takım verisini tek bir noktada toplayıp aksiyona dönüştüren bir platformdur:

- Seans, yoklama, wellness, nutrition ve personal training verisi
- Wearable kaynakları (opsiyonel) ile zengin performans görünümü
- AI Reports + Team Memory (RAG) ile karar desteği
- SaaS ve self-host senaryoları için aynı kod tabanı

> Bu repository; ürün uygulamalarını, paylaşılan paketleri, deployment altyapısını ve dokümantasyonu tek Turborepo yapısında birleştirir.

---

## 🧭 Monorepo Haritası

```text
ohhike/
├── apps/
│   ├── app/                 # CoachOS uygulaması (operasyon + AI)
│   └── web/                 # Marketing + coach discovery yüzeyi
├── packages/
│   ├── ui/                  # Paylaşılan React UI bileşenleri
│   ├── eslint-config/       # ESLint preset'leri
│   └── typescript-config/   # TS config preset'leri
├── docs/                    # PRD, mimari, DB, roadmap ve ürün dokümanları
├── deploy/                  # Dokploy env örnekleri + deployment rehberi
├── Dockerfile               # apps/app image build
├── Dockerfile.web           # apps/web image build
├── turbo.json               # Turborepo task pipeline
└── pnpm-workspace.yaml      # Workspace tanımı
```

---

## 🧩 Uygulamalar

| Uygulama | Amaç | Dev URL |
|---|---|---|
| `apps/app` | Coach dashboard, takım yönetimi, AI raporlar, Team Memory, billing gate | `http://localhost:3001` |
| `apps/web` | Landing, pricing, coach discovery, app CTA akışları | `http://localhost:3000` |

---

## 🛠️ Teknoloji Stack'i

- **Monorepo & Build:** Turborepo, pnpm workspaces
- **Uygulama Katmanı:** Next.js App Router, React, TypeScript
- **UI:** Tailwind CSS, shadcn/ui, `packages/ui`
- **Auth & Billing:** Clerk
- **Data:** Supabase (PostgreSQL + Storage)
- **AI:** Gemini tabanlı analiz + Team Memory / RAG
- **Deploy:** Docker + Dokploy (app/web ayrı servis)

---

## 🚀 Hızlı Başlangıç

### Önkoşullar

- Node.js `>=18`
- pnpm `9.x`

### Kurulum

```bash
pnpm install
```

### Tüm workspace'i çalıştır

```bash
pnpm dev
```

### Tek uygulama çalıştır

```bash
pnpm turbo dev --filter=app
pnpm turbo dev --filter=web
```

### Kalite komutları

```bash
pnpm build
pnpm lint
pnpm check-types
```

---

## 🔐 Ortam Değişkenleri

Özellikle `NEXT_PUBLIC_*` değerleri build-time'da bundle'a yazılır. Docker build sırasında eksik env'ler image'in fail-fast etmesine neden olabilir.

Kritik env seti:

- **URL:** `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_WEB_URL`
- **Auth:** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`
- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **AI:** `GEMINI_API_KEY` (+ model değişkenleri)

Örnek env dosyaları:

- `deploy/dokploy.env.app.example`
- `deploy/dokploy.env.web.example`

---

## 🗄️ Veritabanı ve Migration

Supabase SQL dosyaları `docs/supabase/` altında tutulur. Production için özellikle `002`–`011` migration setinin sıralı uygulanması beklenir.

Başlangıç: `docs/supabase/README.md`

Kapsanan ana modüller:

- Foundation / entitlement
- Sessions
- Daily data
- Wearables
- AI reports
- Team memory + RAG

---

## 📦 Deploy (Docker / Dokploy)

Bu repo **iki ayrı servis** olarak deploy edilir:

- **Coach App** → `Dockerfile`
- **Marketing Web** → `Dockerfile.web`

Dikkat edilmesi gerekenler:

1. Build context repo root (`.`) olmalı.
2. `NEXT_PUBLIC_*` değerleri doğru şekilde build-time'a geçilmeli.
3. Health endpoint: `/api/health`

Detaylı rehber: `deploy/README.md`

---

## 📚 Dokümantasyon Dizini

- Ürün kapsamı: `docs/PRD.md`
- Sistem mimarisi: `docs/SystemArchitecture.md`
- Monorepo yaklaşımı: `docs/Monorepo.md`
- Kullanıcı akışları: `docs/UserFlows.md`
- Veritabanı şeması: `docs/DatabaseSchema.md`
- Pricing & feature gate: `docs/PricingPolicy.md`
- Coach Network planı: `docs/CoachNetworkPlan.md`
- Güncel durum/yol haritası: `docs/DurumVeYolHaritasi.md`

---

## 🧠 Kısa Teknik Değerlendirme

Proje artık starter şablonundan çıkıp üretim odaklı bir ürün kod tabanına evrilmiş durumda:

- CoachOS çekirdek operasyon akışları aktif ve dokümante
- AI Reports + Team Memory altyapısı yerleşik
- Billing/entitlement modeli net bir faz planıyla ilerliyor
- Coach Network için web+app tarafında genişleyebilir bir yol haritası mevcut
- Deploy tarafında fail-fast kontroller ve operasyon rehberleri güçlü

<p align="center">
  <img src="apps/web/public/maskotlar/suIcme.png" alt="Maskot Su İçme" width="40" />
  <img src="apps/web/public/maskotlar/dinlenme.png" alt="Maskot Dinlenme" width="40" />
  <img src="apps/web/public/maskotlar/basardin.png" alt="Maskot Başardın" width="40" />
</p>
