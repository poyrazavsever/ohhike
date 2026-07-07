# OhHike CoachOS - Sistem Mimarisi (v4.0 — MVP)

**Güncelleme:** 2026-07-07  
**Mimari yaklaşım:** Modüler Monorepo — Next.js frontend + Express.js backend  
**Core stack:** Next.js, TypeScript, Express.js, MongoDB, Tailwind CSS, shadcn/ui, Custom Auth (JWT)  
**Veri modeli:** Organization → Team → Athlete → Session → Check-in

---

## 1. Genel Mimari

```text
Client Layer (Next.js)
  ├── Coach Dashboard
  ├── Athlete Portal
  └── Marketing Website (statik)

Application Layer (Express.js)
  ├── REST API (/api/v1/*)
  ├── Custom JWT Auth Middleware
  ├── Route Handlers (CRUD)
  └── Validation (Zod)

Data Layer (MongoDB)
  ├── Mongoose Models
  ├── Organization-scoped queries
  └── Indexes

Auth Layer
  └── Custom Auth (login, register, JWT token verification with cookies)
```

---

## 2. Monorepo Yapısı

```text
ohhike/
├── apps/
│   ├── app/      # Next.js — SaaS dashboard (frontend)
│   ├── web/      # Next.js — Marketing landing page (statik, auth yok)
│   └── api/      # Express.js — REST API backend
├── packages/
│   ├── ui/       # Paylaşılan React bileşenleri (shadcn/ui)
│   ├── eslint-config/
│   └── typescript-config/
├── docs/
├── turbo.json
└── pnpm-workspace.yaml
```

---

## 3. Uygulamalar

### 3.1 `apps/app` — Coach Dashboard
- **Port:** 3001 (dev)
- **Amaç:** Antrenör ve sporcu paneli. Auth gerektirir.
- **Tech:** Next.js App Router, Custom Auth (Cookies), API çağrıları (Express backend'e)
- **Route grupları:** `(protected)/` altında tüm korumalı sayfalar

### 3.2 `apps/web` — Marketing Site
- **Port:** 3000 (dev)
- **Amaç:** Statik tanıtım sayfası. Auth yok.
- **İçerik:** Landing, features, pricing (coming soon), about, privacy, terms
- **CTA'lar:** `app.ohhike.com`'a yönlendirir

### 3.3 `apps/api` — Express.js Backend
- **Port:** 3002 (dev)
- **Amaç:** Tüm CRUD işlemleri ve iş mantığı
- **Auth:** Custom JWT token doğrulama middleware
- **DB:** MongoDB (Mongoose)

---

## 4. Veri Akışı

```text
Next.js (frontend)
  → fetch("/api/v1/teams", { headers: { Cookie: "token=<jwt-token>" } })
  → Express.js (backend)
    → JWT token doğrula
    → Mongoose ile MongoDB sorgusu
    → JSON yanıt döndür
  → Next.js UI güncelle
```

---

## 5. Veri Modeli (MongoDB)

```text
users              → { email, passwordHash, displayName, avatarUrl }
organizations      → { name, slug, type, logoUrl, createdBy }
organization_members → { organizationId, userId, role, isActive }
teams              → { organizationId, name, sportType, ageGroup, seasonGoal }
team_staff         → { teamId, userId, role }
athletes           → { organizationId, teamId, userId?, firstName, lastName, position, status }
athlete_invites    → { athleteId, organizationId, teamId, token, email, expiresAt }
sessions           → { organizationId, teamId, type, status, title, scheduledAt, coachNotes }
session_attendance → { sessionId, athleteId, attended, rpe, coachNote }
training_blocks    → { sessionId, title, orderIndex, plannedDurationMin, intensity }
wellness_checkins  → { organizationId, athleteId, checkinDate, sleepHours, energyScore, readinessScore }
nutrition_logs     → { organizationId, athleteId, logDate, waterMl, breakfastLogged, ... }
personal_trainings → { organizationId, athleteId, title, trainingType, durationMin, rpe }
```

---

## 6. Güvenlik

- **Auth:** Tüm API istekleri Custom JWT token (Cookie üzerinden) ile doğrulanır.
- **Organization isolation:** Her sorgu `organizationId` ile filtrelenir.
- **Rol bazlı erişim:** `organization_members.role` ile kontrol edilir.
- **CORS:** Express'te sadece izin verilen origin'ler kabul edilir.

---

## 7. Kaldırılan Katmanlar (Eski → Yeni)

| Eski Katman | Durum |
|------------|-------|
| Supabase (PostgreSQL + RLS + Storage) | **Kaldırıldı** → MongoDB |
| Clerk (Auth & User Management) | **Kaldırıldı** → Custom JWT Auth |
| AI Layer (Gemini + pgvector + RAG) | **Kaldırıldı** |
| Wearable Integration (Strava, Garmin) | **Kaldırıldı** |
| Coach Network / Marketplace | **Kaldırıldı** |
| Billing (Stripe / RevenueCat) | **Ertelendi** (Coming Soon) |