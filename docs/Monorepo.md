# OhHike CoachOS - Monorepo Yapısı (v4.0 — MVP)

**Güncelleme:** 2026-07-06  
**Araçlar:** Turborepo, pnpm workspaces  
**Framework:** Next.js App Router (frontend) + Express.js (backend)  
**Dil:** TypeScript

---

## 1. Genel Yapı

```text
ohhike/
├── apps/
│   ├── app/                 # CoachOS dashboard (Next.js frontend)
│   ├── web/                 # Marketing landing page (Next.js, statik)
│   └── api/                 # REST API backend (Express.js + MongoDB)
├── packages/
│   ├── ui/                  # Paylaşılan React UI bileşenleri (shadcn/ui)
│   ├── eslint-config/       # ESLint preset'leri
│   └── typescript-config/   # TS config preset'leri
├── docs/                    # Dokümantasyon
├── Dockerfile               # apps/app image build
├── Dockerfile.web           # apps/web image build
├── turbo.json               # Turborepo task pipeline
├── pnpm-workspace.yaml      # Workspace tanımı
└── package.json
```

---

## 2. Uygulamalar

| Uygulama | Amaç | Dev Port |
|----------|------|----------|
| `apps/app` | Coach dashboard, takım yönetimi, sporcu portalı | `localhost:3001` |
| `apps/web` | Landing page, statik tanıtım (auth yok) | `localhost:3000` |
| `apps/api` | Express.js REST API, MongoDB, Clerk webhook | `localhost:3002` |

---

## 3. `apps/app` — Coach Dashboard

```text
apps/app/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/
│   ├── register/
│   ├── onboarding/
│   ├── invite/
│   └── (protected)/
│       ├── dashboard/
│       ├── teams/
│       ├── athletes/
│       ├── sessions/
│       ├── readiness/
│       ├── nutrition/
│       ├── personal-training/
│       ├── calendar/
│       ├── reports/
│       └── settings/
├── components/
├── hooks/
├── lib/
└── next.config.js
```

---

## 4. `apps/web` — Marketing Site

```text
apps/web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Landing
│   ├── features/
│   ├── pricing/              # Coming Soon
│   ├── about/
│   ├── privacy/
│   ├── terms/
│   └── security/
├── components/
├── lib/
└── next.config.js
```

**Not:** Web'de Clerk auth **yok**. Sadece statik sayfalardır.

---

## 5. `apps/api` — Express.js Backend

```text
apps/api/
├── src/
│   ├── index.ts              # Express server entry
│   ├── lib/
│   │   └── database.ts       # MongoDB/Mongoose bağlantısı
│   ├── middleware/
│   │   ├── auth.ts           # Clerk token doğrulama
│   │   └── cors.ts           # CORS ayarları
│   ├── models/
│   │   ├── User.ts
│   │   ├── Organization.ts
│   │   ├── Team.ts
│   │   ├── Athlete.ts
│   │   ├── Session.ts
│   │   ├── WellnessCheckin.ts
│   │   ├── NutritionLog.ts
│   │   └── PersonalTraining.ts
│   └── routes/
│       ├── webhooks.ts
│       ├── organizations.ts
│       ├── teams.ts
│       ├── athletes.ts
│       ├── sessions.ts
│       ├── wellness.ts
│       ├── nutrition.ts
│       └── personal-training.ts
├── package.json
└── tsconfig.json
```

---

## 6. Paylaşılan Paketler

| Paket | Amaç |
|-------|------|
| `packages/ui` | shadcn/ui tabanlı ortak React bileşenleri |
| `packages/eslint-config` | ESLint kuralları |
| `packages/typescript-config` | TypeScript ayarları |

---

## 7. Turbo Pipeline

```json
{
  "tasks": {
    "build": { "dependsOn": ["^build"] },
    "dev": { "cache": false, "persistent": true },
    "lint": { "dependsOn": ["^lint"] },
    "check-types": { "dependsOn": ["^check-types"] }
  }
}
```

---

## 8. Kaldırılan Yapılar

| Eski | Durum |
|------|-------|
| `packages/database` (Supabase) | Kaldırıldı — MongoDB doğrudan `apps/api` içinde |
| `packages/ai`, `packages/rag` | Kaldırıldı |
| `packages/billing` | Ertelendi |
| `packages/wearables` | Kaldırıldı |
| `supabase/migrations/` | Kaldırıldı |