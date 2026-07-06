# OhHike CoachOS - Site Haritası (v4.0 — MVP)

**Güncelleme:** 2026-07-06

---

## 1. Genel Routing

```text
ohhike.com         → Statik tanıtım / landing page (auth yok)
app.ohhike.com     → SaaS dashboard (Clerk auth)
localhost:3002     → Express.js API (backend)
```

---

## 2. Web (apps/web) — Statik Tanıtım

```text
/                  → Landing page
/features          → Özellikler
/pricing           → Coming Soon
/about             → Hakkında
/privacy           → Gizlilik
/terms             → Kullanım koşulları
/security          → Güvenlik
```

**Not:** Web'de auth yok. CTA butonları `app.ohhike.com`'a yönlendirir.

---

## 3. App (apps/app) — Coach Dashboard

### Auth
```text
/login             → Clerk sign-in
/register          → Clerk sign-up
/onboarding        → Org + team oluşturma
/invite/:token     → Sporcu davet claim
```

### Protected (Koç/Staff)
```text
/dashboard         → Ana panel (readiness özeti, yaklaşan seanslar)
/teams             → Takım listesi
/teams/new         → Yeni takım
/teams/:id         → Takım detay
/athletes          → Sporcu listesi
/athletes/new      → Yeni sporcu
/athletes/:id      → Sporcu detay
/sessions          → Seans listesi
/sessions/new      → Yeni seans
/sessions/:id      → Seans detay + yoklama
/readiness         → Takım readiness görünümü
/nutrition         → Beslenme uyum görünümü
/personal-training → Kişisel antrenman listesi
/calendar          → Takvim
/reports           → Raporlar (temel)
/settings          → Profil, organizasyon, staff
/settings/billing  → Coming Soon
```

### Sporcu Portalı
```text
/athlete/home        → Sporcu ana sayfa
/athlete/check-in    → Günlük check-in formu
/athlete/nutrition   → Beslenme girişi
/athlete/training    → Kişisel antrenman girişi
/athlete/profile     → Profil
```

---

## 4. API (apps/api) — Express.js

```text
POST   /api/webhooks/clerk           → Clerk user sync
GET    /api/v1/organizations         → Org listesi
POST   /api/v1/organizations         → Org oluştur
GET    /api/v1/teams                 → Takım listesi
POST   /api/v1/teams                 → Takım oluştur
CRUD   /api/v1/athletes              → Sporcu CRUD
POST   /api/v1/athletes/invite       → Sporcu davet
POST   /api/v1/athletes/claim        → Sporcu claim
CRUD   /api/v1/sessions              → Seans CRUD
POST   /api/v1/sessions/:id/attendance → Yoklama
CRUD   /api/v1/wellness-checkins     → Check-in CRUD
CRUD   /api/v1/nutrition-logs        → Beslenme CRUD
CRUD   /api/v1/personal-trainings    → Kişisel antrenman CRUD
GET    /api/health                   → Health check
```

---

## 5. Kaldırılan Route'lar

| Eski Route | Durum |
|------------|-------|
| `/wearables` | Kaldırıldı |
| `/ai-reports` | Kaldırıldı |
| `/team-memory` | Kaldırıldı |
| `/coach-network` | Kaldırıldı |
| `/training-planner` | Kaldırıldı |
| `/drills` | Kaldırıldı |
| `/load-recovery` | Kaldırıldı |
| `/find-coach` (web) | Kaldırıldı |
| `/login`, `/register` (web) | Kaldırıldı |
