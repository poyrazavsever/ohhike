# OhHike CoachOS - Klasör ve Dosya Yapısı v3.0

## 0. Doküman Durumu

**Doküman adı:** OhHike CoachOS Monorepo & Folder Structure  
**Versiyon:** v3.0  
**Ürün tipi:** SaaS + Open Source / Self-host  
**Mimari yaklaşım:** Modular Monorepo / Serverless Monolith  
**Framework:** Next.js App Router  
**Dil:** TypeScript  
**UI:** Tailwind CSS + shadcn/ui  
**Auth & Billing:** Clerk Auth + Clerk Billing  
**Database:** Supabase PostgreSQL  
**Storage:** Supabase Storage / S3-compatible storage  
**AI:** LLM + RAG + pgvector + veri analizi  
**Ana uygulamalar:** Marketing site + CoachOS SaaS App + Athlete Portal + Self-host setup

---

## 1. Genel Monorepo Yaklaşımı

OhHike CoachOS tek repository içinde geliştirilecektir. Sistem iki ana yüzeye sahiptir:

"""text
ohhike.com
→ Marketing website
→ Landing, pricing, docs, open-source, self-host

app.ohhike.com
→ SaaS application
→ Coach dashboard, athlete dashboard, admin settings, AI reports, Team Memory
"""

Kod tabanı tek repo içinde tutulur ancak modüller ayrıştırılmış olmalıdır.

Amaç:

- Hızlı MVP geliştirme
- SaaS ve self-host sürümlerini aynı kod tabanından yönetme
- UI component’lerini ortak kullanma
- AI, database, billing, akıllı saat, import ve rapor logiclerini paketlerde tutma
- İleride servisleştirmeye uygun modüler yapı oluşturma

---

## 2. Önerilen Root Yapısı

"""text
ohhike/
├── apps/
│   ├── web/
│   └── app/
│
├── packages/
│   ├── ui/
│   ├── config/
│   ├── database/
│   ├── auth/
│   ├── billing/
│   ├── ai/
│   ├── rag/
│   ├── files/
│   ├── wearables/
│   ├── reports/
│   ├── validators/
│   └── shared/
│
├── supabase/
│   ├── migrations/
│   ├── seed/
│   └── functions/
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── docker-compose.selfhost.yml
│   └── nginx/
│
├── docs/
│   ├── product/
│   ├── architecture/
│   ├── self-host/
│   ├── api/
│   └── integrations/
│
├── scripts/
│   ├── seed-demo.ts
│   ├── generate-types.ts
│   ├── create-admin.ts
│   ├── process-import.ts
│   └── sync-wearables.ts
│
├── tooling/
│   ├── eslint/
│   ├── prettier/
│   ├── tailwind/
│   └── tsconfig/
│
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
├── README.md
└── LICENSE
"""

---

## 3. Uygulama Yapısı

Monorepo içinde iki ana uygulama bulunur.

---

# 3.1 `apps/web`

Public marketing site.

## Amaç

`ohhike.com` domaininde çalışan tanıtım sitesidir.

İçerikler:

- Landing page
- Pricing
- Open-source anlatımı
- Self-host anlatımı
- Docs giriş sayfaları
- Security / Privacy / Terms
- Demo CTA
- GitHub CTA

## Klasör Yapısı

"""text
apps/web/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   ├── open-source/
│   │   └── page.tsx
│   ├── docs/
│   │   ├── page.tsx
│   │   ├── self-host/
│   │   │   └── page.tsx
│   │   └── integrations/
│   │       └── page.tsx
│   ├── security/
│   │   └── page.tsx
│   ├── privacy/
│   │   └── page.tsx
│   ├── terms/
│   │   └── page.tsx
│   └── globals.css
│
├── components/
│   ├── marketing-header.tsx
│   ├── marketing-footer.tsx
│   ├── hero-section.tsx
│   ├── feature-grid.tsx
│   ├── pricing-table.tsx
│   ├── self-host-section.tsx
│   ├── doctor-panda-hero.tsx
│   └── product-preview.tsx
│
├── content/
│   ├── landing.ts
│   ├── pricing.ts
│   ├── faqs.ts
│   └── docs.ts
│
├── lib/
│   ├── metadata.ts
│   └── seo.ts
│
└── next.config.ts
"""

## Notlar

- Public site auth gerektirmez.
- SEO odaklıdır.
- App’e yönlendiren CTA’lar `app.ohhike.com` adresine gider.
- Design system, `packages/ui` üzerinden paylaşılır.
- Doctor Panda görselleri ortak asset yapısından alınır.

---

# 3.2 `apps/app`

Asıl SaaS ve self-host uygulamasıdır.

## Amaç

`app.ohhike.com` domaininde çalışan uygulama.

İçerikler:

- Auth
- Onboarding
- Coach dashboard
- Athlete dashboard
- Admin settings
- Team management
- Athlete management
- Sessions
- AI reports
- Team Memory
- Wearables
- Reports
- Billing
- Self-host setup

## Klasör Yapısı

"""text
apps/app/
├── app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── middleware.ts
│   │
│   ├── (auth)/
│   ├── (setup)/
│   ├── (onboarding)/
│   ├── (coach)/
│   ├── (athlete)/
│   ├── (admin)/
│   └── api/
│
├── components/
│   ├── app-shell/
│   ├── dashboard/
│   ├── teams/
│   ├── athletes/
│   ├── sessions/
│   ├── training/
│   ├── readiness/
│   ├── nutrition/
│   ├── wearables/
│   ├── files/
│   ├── ai-reports/
│   ├── memory/
│   ├── reports/
│   ├── billing/
│   ├── settings/
│   ├── onboarding/
│   └── panda/
│
├── features/
│   ├── organizations/
│   ├── teams/
│   ├── athletes/
│   ├── sessions/
│   ├── check-ins/
│   ├── nutrition/
│   ├── personal-training/
│   ├── wearables/
│   ├── files/
│   ├── ai-reports/
│   ├── memory/
│   ├── training-planner/
│   ├── reports/
│   ├── billing/
│   └── self-host/
│
├── lib/
│   ├── auth.ts
│   ├── permissions.ts
│   ├── entitlements.ts
│   ├── env.ts
│   ├── routes.ts
│   ├── constants.ts
│   └── utils.ts
│
├── hooks/
│   ├── use-active-organization.ts
│   ├── use-active-team.ts
│   ├── use-current-role.ts
│   ├── use-entitlements.ts
│   └── use-dashboard-filters.ts
│
├── stores/
│   ├── app-store.ts
│   ├── organization-store.ts
│   ├── team-store.ts
│   └── file-processing-store.ts
│
└── next.config.ts
"""

---

## 4. App Router Route Grupları

`apps/app/app` altında route grupları ayrılmalıdır.

---

# 4.1 `(auth)`

Clerk sign-in, sign-up ve invite akışları.

"""text
apps/app/app/(auth)/
├── sign-in/
│   └── [[...sign-in]]/
│       └── page.tsx
├── sign-up/
│   └── [[...sign-up]]/
│       └── page.tsx
└── invite/
    └── athlete/
        └── [token]/
            └── page.tsx
"""

## Sorumluluklar

- Kullanıcı girişi
- Yeni hesap oluşturma
- Sporcu davet token doğrulama
- Giriş sonrası role-based redirect

---

# 4.2 `(setup)`

Self-host ilk kurulum ekranları.

"""text
apps/app/app/(setup)/
├── setup/
│   ├── page.tsx
│   ├── admin/
│   │   └── page.tsx
│   ├── providers/
│   │   └── page.tsx
│   └── complete/
│       └── page.tsx
"""

## Sorumluluklar

- Self-host mode kontrolü
- Database migration durumu
- Storage bağlantısı
- İlk admin hesabı
- API key setup
- AI provider setup

---

# 4.3 `(onboarding)`

SaaS kullanıcı onboarding’i.

"""text
apps/app/app/(onboarding)/
└── onboarding/
    ├── page.tsx
    ├── organization/
    │   └── page.tsx
    ├── team/
    │   └── page.tsx
    ├── athletes/
    │   └── page.tsx
    └── complete/
        └── page.tsx
"""

## Sorumluluklar

- Organizasyon oluşturma
- İlk takım oluşturma
- İlk sporcuları ekleme
- Demo veri yükleme
- Dashboard’a geçiş

---

# 4.4 `(coach)`

Antrenör, analist ve staff uygulama alanı.

"""text
apps/app/app/(coach)/
├── dashboard/
│   └── page.tsx
├── teams/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [teamId]/
│       └── page.tsx
├── athletes/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   ├── import/
│   │   └── page.tsx
│   └── [athleteId]/
│       ├── page.tsx
│       └── edit/
│           └── page.tsx
├── sessions/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [sessionId]/
│       ├── page.tsx
│       ├── attendance/
│       │   └── page.tsx
│       ├── files/
│       │   └── page.tsx
│       └── analysis/
│           └── page.tsx
├── training/
│   ├── page.tsx
│   ├── plans/
│   │   ├── page.tsx
│   │   └── new/
│   │       └── page.tsx
│   └── drills/
│       ├── page.tsx
│       └── new/
│           └── page.tsx
├── readiness/
│   └── page.tsx
├── nutrition/
│   └── page.tsx
├── wearables/
│   ├── page.tsx
│   ├── providers/
│   │   └── page.tsx
│   └── import/
│       └── page.tsx
├── files/
│   ├── page.tsx
│   └── [filesId]/
│       └── page.tsx
├── ai-reports/
│   ├── page.tsx
│   └── [reportId]/
│       └── page.tsx
├── memory/
│   ├── page.tsx
│   └── documents/
│       ├── page.tsx
│       └── [documentId]/
│           └── page.tsx
└── reports/
    ├── page.tsx
    ├── new/
    │   └── page.tsx
    └── [reportId]/
        └── page.tsx
"""

## Sorumluluklar

- Takım yönetimi
- Sporcu yönetimi
- Session yönetimi
- AI analiz
- Team Memory
- Training planner
- Readiness / load / nutrition görünümü
- Wearable yönetimi
- Raporlar

---

# 4.5 `(athlete)`

Sporcu portalı.

"""text
apps/app/app/(athlete)/
└── athlete/
    ├── dashboard/
    │   └── page.tsx
    ├── check-in/
    │   └── page.tsx
    ├── training/
    │   ├── page.tsx
    │   └── new/
    │       └── page.tsx
    ├── nutrition/
    │   └── page.tsx
    ├── wearables/
    │   └── page.tsx
    ├── progress/
    │   └── page.tsx
    └── profile/
        └── page.tsx
"""

## Sorumluluklar

- Günlük check-in
- Kişisel antrenman girişi
- Nutrition log
- Wearable bağlantısı
- Koç görevleri
- Kişisel gelişim grafikleri

---

# 4.6 `(admin)`

Organizasyon, billing, staff ve sistem ayarları.

"""text
apps/app/app/(admin)/
└── settings/
    ├── profile/
    │   └── page.tsx
    ├── organization/
    │   └── page.tsx
    ├── staff/
    │   └── page.tsx
    ├── billing/
    │   └── page.tsx
    ├── integrations/
    │   └── page.tsx
    ├── api-keys/
    │   └── page.tsx
    ├── security/
    │   └── page.tsx
    ├── audit-logs/
    │   └── page.tsx
    └── self-host/
        └── page.tsx
"""

## Sorumluluklar

- Kullanıcı profili
- Organizasyon ayarları
- Staff yönetimi
- Billing
- Entegrasyonlar
- API key yönetimi
- Self-host durum ekranı
- Audit logs

---

## 5. API Route Yapısı

`apps/app/app/api` altında yer alır.

"""text
apps/app/app/api/
├── webhooks/
│   ├── clerk/
│   │   └── route.ts
│   ├── billing/
│   │   └── route.ts
│   ├── strava/
│   │   └── route.ts
│   └── garmin/
│       └── route.ts
│
├── ai/
│   ├── session-analysis/
│   │   └── route.ts
│   ├── team-memory/
│   │   └── route.ts
│   ├── training-plan/
│   │   └── route.ts
│   ├── readiness-summary/
│   │   └── route.ts
│   ├── nutrition-summary/
│   │   └── route.ts
│   └── player-development/
│       └── route.ts
│
├── files/
│   ├── upload/
│   │   └── route.ts
│   ├── process/
│   │   └── route.ts
│   ├── parse-import/
│   │   └── route.ts
│   └── [filesId]/
│       └── signed-url/
│           └── route.ts
│
├── wearables/
│   ├── strava/
│   │   ├── connect/
│   │   │   └── route.ts
│   │   └── callback/
│   │       └── route.ts
│   ├── sync/
│   │   └── route.ts
│   ├── import-csv/
│   │   └── route.ts
│   └── disconnect/
│       └── route.ts
│
├── reports/
│   ├── export/
│   │   └── route.ts
│   ├── [reportId]/
│   │   ├── download/
│   │   │   └── route.ts
│   │   └── share/
│   │       └── route.ts
│
└── imports/
    ├── athletes/
    │   └── route.ts
    ├── wearables/
    │   └── route.ts
    └── preview/
        └── route.ts
"""

## API Route İlkeleri

- CRUD işlemlerinin çoğu Server Actions ile yapılır.
- API route’lar daha çok webhook, AI, file processing, wearable OAuth ve report export için kullanılır.
- Tüm API route’larda auth, organization context ve entitlement kontrolü server-side yapılır.
- Token ve API key değerleri asla client’a ham olarak dönmez.

---

## 6. Feature Modül Yapısı

`apps/app/features` altında her ürün modülü kendi içinde organize edilir.

---

# 6.1 Genel Feature Modül Deseni

Her feature klasörü şu yapıya sahip olabilir:

"""text
features/{feature-name}/
├── actions.ts
├── queries.ts
├── mutations.ts
├── schemas.ts
├── types.ts
├── permissions.ts
├── constants.ts
├── components/
├── hooks/
└── utils.ts
"""

## Dosya Sorumlulukları

| Dosya | Sorumluluk |
|---|---|
| `actions.ts` | Server Actions |
| `queries.ts` | Okuma sorguları |
| `mutations.ts` | Yazma yardımcıları |
| `schemas.ts` | Zod validation |
| `types.ts` | Feature özel tipler |
| `permissions.ts` | Rol ve erişim kontrolü |
| `constants.ts` | Sabitler |
| `components/` | Feature UI bileşenleri |
| `hooks/` | Client hook’ları |
| `utils.ts` | Yardımcı fonksiyonlar |

---

# 6.2 `features/organizations`

"""text
features/organizations/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── permissions.ts
├── components/
│   ├── organization-switcher.tsx
│   ├── organization-form.tsx
│   ├── organization-settings-form.tsx
│   └── organization-empty-state.tsx
└── utils.ts
"""

Sorumluluklar:

- Organizasyon oluşturma
- Organization switcher
- Organization settings
- Organization member context
- Tenant izolasyonu

---

# 6.3 `features/teams`

"""text
features/teams/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── permissions.ts
├── components/
│   ├── team-card.tsx
│   ├── team-form.tsx
│   ├── team-switcher.tsx
│   ├── team-overview.tsx
│   ├── team-readiness-card.tsx
│   └── team-empty-state.tsx
└── utils.ts
"""

Sorumluluklar:

- Takım oluşturma
- Takım listesi
- Takım detay
- Aktif takım context’i
- Takım hedefleri
- Takım staff atama

---

# 6.4 `features/athletes`

"""text
features/athletes/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── permissions.ts
├── components/
│   ├── athlete-table.tsx
│   ├── athlete-card.tsx
│   ├── athlete-form.tsx
│   ├── athlete-profile-header.tsx
│   ├── athlete-invite-card.tsx
│   ├── athlete-import-dropzone.tsx
│   ├── athlete-risk-badge.tsx
│   └── athlete-empty-state.tsx
└── utils.ts
"""

Sorumluluklar:

- Sporcu CRUD
- Sporcu davet sistemi
- Athlete claim
- CSV import
- Sporcu profili
- Risk badge
- Gelişim özeti

---

# 6.5 `features/sessions`

"""text
features/sessions/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── permissions.ts
├── components/
│   ├── session-card.tsx
│   ├── session-form.tsx
│   ├── session-calendar.tsx
│   ├── session-attendance-table.tsx
│   ├── training-block-editor.tsx
│   ├── rpe-collection-panel.tsx
│   ├── session-status-badge.tsx
│   └── session-empty-state.tsx
└── utils.ts
"""

Sorumluluklar:

- Session oluşturma
- Antrenman blokları
- Katılım
- RPE
- Koç notları
- Session status
- Session completion

---

# 6.6 `features/check-ins`

"""text
features/check-ins/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── scoring.ts
├── components/
│   ├── daily-checkin-form.tsx
│   ├── readiness-score-card.tsx
│   ├── checkin-history-chart.tsx
│   ├── missing-checkins-card.tsx
│   └── readiness-empty-state.tsx
└── utils.ts
"""

Sorumluluklar:

- Günlük check-in
- Readiness score
- Uyku / enerji / ağrı / stres / motivasyon
- Missing check-ins
- Team readiness aggregate

---

# 6.7 `features/nutrition`

"""text
features/nutrition/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── scoring.ts
├── components/
│   ├── nutrition-log-form.tsx
│   ├── water-tracker.tsx
│   ├── meal-checkboxes.tsx
│   ├── nutrition-compliance-card.tsx
│   ├── nutrition-athlete-table.tsx
│   └── nutrition-empty-state.tsx
└── utils.ts
"""

Sorumluluklar:

- Su takibi
- Öğün kaydı
- Pre/post training meal
- Protein/carb hedef uyumu
- Nutritionist notları
- Nutrition compliance

---

# 6.8 `features/personal-training`

"""text
features/personal-training/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── components/
│   ├── personal-training-form.tsx
│   ├── personal-training-list.tsx
│   ├── personal-training-card.tsx
│   ├── wearable-match-card.tsx
│   └── personal-training-empty-state.tsx
└── utils.ts
"""

Sorumluluklar:

- Sporcu kişisel antrenman girişi
- RPE
- Süre / mesafe
- Wearable activity eşleştirme
- Koç review

---

# 6.9 `features/wearables`

"""text
features/wearables/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── providers.ts
├── normalize.ts
├── components/
│   ├── wearable-provider-card.tsx
│   ├── wearable-connect-button.tsx
│   ├── wearable-sync-status.tsx
│   ├── wearable-athlete-table.tsx
│   ├── wearable-import-dropzone.tsx
│   └── wearable-empty-state.tsx
└── utils.ts
"""

Sorumluluklar:

- Provider bağlantıları
- Strava OAuth
- CSV import
- Daily summary normalize
- Activity normalize
- Sync status
- Manual fallback

---

# 6.10 `features/files`

"""text
features/files/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── processing.ts
├── components/
│   ├── file-upload-dropzone.tsx
│   ├── file-library.tsx
│   ├── file-processing-status.tsx
│   ├── file-preview.tsx
│   ├── parsed-summary-list.tsx
│   ├── parsed-summary-card.tsx
│   └── file-empty-state.tsx
└── utils.ts
"""

Sorumluluklar:

- CSV / PDF / document upload
- File library
- Processing status
- Parsed summary preview
- Signed URL
- AI analysis preparation

---

# 6.11 `features/ai-reports`

"""text
features/ai-reports/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── components/
│   ├── ai-report-card.tsx
│   ├── ai-report-detail.tsx
│   ├── session-summary-card.tsx
│   ├── tactical-observations.tsx
│   ├── athlete-observations.tsx
│   ├── recommended-drills.tsx
│   ├── next-training-plan.tsx
│   ├── coach-correction-form.tsx
│   └── ai-report-empty-state.tsx
└── utils.ts
"""

Sorumluluklar:

- AI report generation trigger
- Rapor listeleme
- Rapor detay
- Coach correction
- Raporu memory’ye ekleme
- PDF export trigger

---

# 6.12 `features/memory`

"""text
features/memory/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── components/
│   ├── team-memory-chat.tsx
│   ├── memory-message.tsx
│   ├── suggested-questions.tsx
│   ├── retrieved-sources.tsx
│   ├── memory-documents-table.tsx
│   └── memory-empty-state.tsx
└── utils.ts
"""

Sorumluluklar:

- Team Memory Assistant UI
- Assistant messages
- Suggested questions
- Retrieved document sources
- Memory documents
- RAG answer flow

---

# 6.13 `features/training-planner`

"""text
features/training-planner/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── components/
│   ├── training-plan-form.tsx
│   ├── ai-training-planner.tsx
│   ├── training-plan-card.tsx
│   ├── drill-library.tsx
│   ├── drill-form.tsx
│   ├── drill-card.tsx
│   └── training-empty-state.tsx
└── utils.ts
"""

Sorumluluklar:

- Manuel training plan
- AI training planner
- Drill library
- Drill matching
- Plan blocks
- Session’a plan bağlama

---

# 6.14 `features/reports`

"""text
features/reports/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── components/
│   ├── report-list.tsx
│   ├── report-builder.tsx
│   ├── report-preview.tsx
│   ├── report-download-button.tsx
│   └── reports-empty-state.tsx
└── utils.ts
"""

Sorumluluklar:

- PDF export
- Shareable links
- Report preview
- Branded reports
- Report history

---

# 6.15 `features/billing`

"""text
features/billing/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── entitlements.ts
├── components/
│   ├── pricing-card.tsx
│   ├── usage-meter.tsx
│   ├── upgrade-modal.tsx
│   ├── billing-portal-button.tsx
│   └── plan-badge.tsx
└── utils.ts
"""

Sorumluluklar:

- Plan bilgisi
- Entitlements
- Usage meter
- Upgrade modal
- Clerk Billing portal
- Feature gates

---

# 6.16 `features/self-host`

"""text
features/self-host/
├── actions.ts
├── queries.ts
├── schemas.ts
├── types.ts
├── health-checks.ts
├── components/
│   ├── setup-checklist.tsx
│   ├── api-key-form.tsx
│   ├── provider-status-card.tsx
│   ├── storage-status-card.tsx
│   ├── migration-status-card.tsx
│   └── self-host-empty-state.tsx
└── utils.ts
"""

Sorumluluklar:

- Self-host setup
- API key management
- Provider health checks
- Storage status
- Migration status
- Backup / restore UI

---

## 7. Shared Packages

Monorepo içindeki `packages` klasörü ortak servisleri ve tekrar kullanılabilir modülleri içerir.

---

# 7.1 `packages/ui`

Ortak UI ve design system.

"""text
packages/ui/
├── src/
│   ├── components/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   ├── tabs.tsx
│   │   ├── tooltip.tsx
│   │   ├── dropdown-menu.tsx
│   │   └── chart-card.tsx
│   ├── panda/
│   │   ├── panda-avatar.tsx
│   │   ├── panda-insight-card.tsx
│   │   ├── panda-empty-state.tsx
│   │   └── panda-loading.tsx
│   ├── layouts/
│   │   ├── app-shell.tsx
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── mobile-nav.tsx
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── radius.ts
│   └── index.ts
├── package.json
└── tsconfig.json
"""

## Sorumluluklar

- shadcn/ui tabanlı component’ler
- Doctor Panda component’leri
- Layout component’leri
- Chart wrapper’ları
- Empty state component’leri
- Design tokens

---

# 7.2 `packages/config`

Ortak config dosyaları.

"""text
packages/config/
├── eslint/
│   └── index.js
├── prettier/
│   └── index.js
├── tailwind/
│   └── tailwind.config.ts
├── tsconfig/
│   ├── base.json
│   ├── next.json
│   └── package.json
└── package.json
"""

---

# 7.3 `packages/database`

Supabase client, typed queries, migrations helper ve database types.

"""text
packages/database/
├── src/
│   ├── client/
│   │   ├── browser.ts
│   │   ├── server.ts
│   │   ├── admin.ts
│   │   └── service-role.ts
│   ├── types/
│   │   ├── database.types.ts
│   │   └── generated.ts
│   ├── queries/
│   │   ├── organizations.ts
│   │   ├── teams.ts
│   │   ├── athletes.ts
│   │   ├── sessions.ts
│   │   ├── check-ins.ts
│   │   ├── nutrition.ts
│   │   ├── wearables.ts
│   │   ├── ai-reports.ts
│   │   └── memory.ts
│   ├── rls/
│   │   └── helpers.ts
│   └── index.ts
├── package.json
└── tsconfig.json
"""

## Sorumluluklar

- Supabase typed client
- Server/client ayrımı
- Service role client sadece server-side
- Common queries
- Database generated types
- RLS helper type definitions

---

# 7.4 `packages/auth`

Auth ve role helper’ları.

"""text
packages/auth/
├── src/
│   ├── clerk.ts
│   ├── supabase-auth.ts
│   ├── current-user.ts
│   ├── current-organization.ts
│   ├── roles.ts
│   ├── permissions.ts
│   ├── redirects.ts
│   └── index.ts
├── package.json
└── tsconfig.json
"""

## Sorumluluklar

- Current user resolver
- Organization context resolver
- Role checks
- Permission checks
- SaaS / self-host auth adapter
- Role-based redirects

---

# 7.5 `packages/billing`

Clerk Billing ve entitlement yönetimi.

"""text
packages/billing/
├── src/
│   ├── plans.ts
│   ├── entitlements.ts
│   ├── usage.ts
│   ├── feature-gates.ts
│   ├── clerk-billing.ts
│   ├── webhooks.ts
│   └── index.ts
├── package.json
└── tsconfig.json
"""

## Sorumluluklar

- Plan limitleri
- Feature gate kontrolü
- Kullanım sayacı
- Clerk Billing webhook mapping
- Upgrade gerektiren özellikler

---

# 7.6 `packages/ai`

LLM provider adapter’ları, prompt orchestrator ve AI scenario logic.

"""text
packages/ai/
├── src/
│   ├── providers/
│   │   ├── openai.ts
│   │   ├── gemini.ts
│   │   ├── anthropic.ts
│   │   ├── openrouter.ts
│   │   └── local.ts
│   ├── prompts/
│   │   ├── doctor-panda.ts
│   │   ├── session-analysis.ts
│   │   ├── readiness-summary.ts
│   │   ├── nutrition-summary.ts
│   │   ├── training-planner.ts
│   │   ├── player-development.ts
│   │   └── team-memory.ts
│   ├── schemas/
│   │   ├── session-analysis.schema.ts
│   │   ├── training-plan.schema.ts
│   │   ├── readiness.schema.ts
│   │   ├── nutrition.schema.ts
│   │   └── memory-answer.schema.ts
│   ├── context/
│   │   ├── build-session-context.ts
│   │   ├── build-athlete-context.ts
│   │   ├── build-team-context.ts
│   │   └── build-memory-context.ts
│   ├── orchestrator.ts
│   ├── validate-output.ts
│   ├── repair-json.ts
│   └── index.ts
├── package.json
└── tsconfig.json
"""

## Sorumluluklar

- AI provider abstraction
- System prompts
- Prompt templates
- Context builders
- Structured output validation
- JSON repair
- AI report generation
- Training plan generation

---

# 7.7 `packages/rag`

Team Memory ve vector search logic.

"""text
packages/rag/
├── src/
│   ├── chunk.ts
│   ├── embed.ts
│   ├── retrieve.ts
│   ├── rerank.ts
│   ├── memory-writer.ts
│   ├── memory-reader.ts
│   ├── answer.ts
│   ├── citations.ts
│   └── index.ts
├── package.json
└── tsconfig.json
"""

## Sorumluluklar

- Document chunking
- Embedding generation
- Vector search
- Metadata filtering
- Team Memory writing
- Assistant answer generation
- Retrieved source mapping

---

# 7.8 `packages/files`

CSV, PDF, doküman ve rapor işleme logici.

"""text
packages/files/
├── src/
│   ├── upload.ts
│   ├── signed-url.ts
│   ├── metadata.ts
│   ├── parse-import.ts
│   ├── thumbnails.ts
│   ├── processing-status.ts
│   ├── file-parser.ts
│   └── index.ts
├── package.json
└── tsconfig.json
"""

## Sorumluluklar

- File metadata parse
- CSV/report parsing
- Thumbnail generation
- Signed URL
- Storage path helper
- Processing status updates

---

# 7.9 `packages/wearables`

Wearable provider adapter’ları.

"""text
packages/wearables/
├── src/
│   ├── providers/
│   │   ├── strava.ts
│   │   ├── garmin.ts
│   │   ├── apple-health.ts
│   │   ├── health-connect.ts
│   │   ├── csv.ts
│   │   └── manual.ts
│   ├── oauth/
│   │   ├── strava-oauth.ts
│   │   └── token-refresh.ts
│   ├── normalize/
│   │   ├── daily-summary.ts
│   │   ├── activity.ts
│   │   └── sleep.ts
│   ├── sync.ts
│   ├── match-activity.ts
│   ├── token-vault.ts
│   └── index.ts
├── package.json
└── tsconfig.json
"""

## Sorumluluklar

- Strava OAuth
- Token refresh
- Garmin adapter, roadmap
- Apple Health bridge placeholder
- Health Connect bridge placeholder
- CSV parser
- Daily summary normalize
- Activity normalize
- Personal training matching
- Encrypted token handling

---

# 7.10 `packages/reports`

PDF ve rapor üretimi.

"""text
packages/reports/
├── src/
│   ├── templates/
│   │   ├── session-report.tsx
│   │   ├── athlete-development-report.tsx
│   │   ├── weekly-team-report.tsx
│   │   └── load-report.tsx
│   ├── generate-pdf.ts
│   ├── render-html.ts
│   ├── upload-report.ts
│   ├── share-link.ts
│   └── index.ts
├── package.json
└── tsconfig.json
"""

## Sorumluluklar

- Report HTML rendering
- PDF generation
- Branded reports
- Shareable links
- Report upload

---

# 7.11 `packages/validators`

Ortak Zod schema’ları.

"""text
packages/validators/
├── src/
│   ├── organization.ts
│   ├── team.ts
│   ├── athlete.ts
│   ├── session.ts
│   ├── check-in.ts
│   ├── nutrition.ts
│   ├── personal-training.ts
│   ├── wearable.ts
│   ├── ai-report.ts
│   ├── training-plan.ts
│   ├── report.ts
│   └── index.ts
├── package.json
└── tsconfig.json
"""

---

# 7.12 `packages/shared`

Ortak utility, constants, date helpers, formatters.

"""text
packages/shared/
├── src/
│   ├── constants/
│   │   ├── roles.ts
│   │   ├── sports.ts
│   │   ├── plans.ts
│   │   └── providers.ts
│   ├── formatters/
│   │   ├── date.ts
│   │   ├── duration.ts
│   │   ├── score.ts
│   │   └── file-size.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── slugify.ts
│   │   ├── safe-json.ts
│   │   └── errors.ts
│   └── index.ts
├── package.json
└── tsconfig.json
"""

---

## 8. Supabase Klasörü

"""text
supabase/
├── migrations/
│   ├── 0001_extensions.sql
│   ├── 0002_enums.sql
│   ├── 0003_core_users_orgs.sql
│   ├── 0004_teams_athletes.sql
│   ├── 0005_sessions_training.sql
│   ├── 0006_checkins_nutrition.sql
│   ├── 0007_wearables.sql
│   ├── 0008_files_ai_reports.sql
│   ├── 0009_memory_embeddings.sql
│   ├── 0010_billing_api_keys_audit.sql
│   └── 0011_rls_policies.sql
│
├── seed/
│   ├── demo-organization.sql
│   ├── demo-team.sql
│   ├── demo-athletes.sql
│   ├── demo-sessions.sql
│   ├── demo-wearables.sql
│   ├── demo-ai-reports.sql
│   └── demo-memory.sql
│
└── functions/
    ├── process-files/
    ├── sync-wearables/
    └── generate-embeddings/
"""

## Sorumluluklar

- Migration yönetimi
- Demo seed data
- Edge functions, opsiyonel
- RLS policies
- Storage bucket setup

---

## 9. Docker ve Self-host Klasörü

"""text
docker/
├── Dockerfile
├── docker-compose.yml
├── docker-compose.selfhost.yml
├── docker-compose.dev.yml
├── nginx/
│   ├── default.conf
│   └── ssl.conf
├── minio/
│   └── init-buckets.sh
└── scripts/
    ├── entrypoint.sh
    ├── wait-for-db.sh
    └── run-migrations.sh
"""

## Self-host İlkeleri

- Docker Compose ile kolay kurulum
- Postgres + pgvector
- MinIO veya S3-compatible storage
- Optional local auth
- API key management
- Migration script
- Backup / restore script

---

## 10. Docs Klasörü

"""text
docs/
├── product/
│   ├── PRD.md
│   ├── UserFlows.md
│   ├── SiteHaritasi.md
│   ├── EmptyStates.md
│   └── PromptEngineering.md
│
├── architecture/
│   ├── SystemArchitecture.md
│   ├── DatabaseSchema.md
│   ├── Monorepo.md
│   ├── RLS.md
│   ├── AIArchitecture.md
│   └── DataImportPipeline.md
│
├── self-host/
│   ├── Installation.md
│   ├── DockerCompose.md
│   ├── EnvironmentVariables.md
│   ├── APIKeys.md
│   ├── BackupRestore.md
│   └── Troubleshooting.md
│
├── api/
│   ├── Webhooks.md
│   ├── AIRoutes.md
│   ├── Wearables.md
│   └── Reports.md
│
└── integrations/
    ├── Strava.md
    ├── Garmin.md
    ├── AppleHealth.md
    ├── HealthConnect.md
    └── CSVImport.md
"""

---

## 11. Scripts Klasörü

"""text
scripts/
├── seed-demo.ts
├── seed-demo-athletes.ts
├── seed-demo-sessions.ts
├── seed-demo-wearables.ts
├── generate-types.ts
├── create-admin.ts
├── process-import.ts
├── summarize-report.ts
├── generate-embeddings.ts
├── sync-wearables.ts
├── import-athletes-csv.ts
├── import-wearables-csv.ts
└── reset-demo-data.ts
"""

## Sorumluluklar

- Demo data oluşturma
- Supabase type generation
- Self-host admin oluşturma
- Import processing testleri
- Wearable sync testleri
- Embedding generation
- CSV import testleri

---

## 12. Environment Variables

`.env.example` içinde bulunması gerekenler:

"""env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MARKETING_URL=http://localhost:3001
NEXT_PUBLIC_SELF_HOSTED=false

# Database
DATABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Auth - SaaS
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Billing
CLERK_BILLING_WEBHOOK_SECRET=

# Encryption
ENCRYPTION_KEY=

# AI Providers
OPENAI_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
OPENROUTER_API_KEY=

# Storage
STORAGE_PROVIDER=supabase
S3_ENDPOINT=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_BUCKET=

# Strava
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_WEBHOOK_VERIFY_TOKEN=

# Garmin
GARMIN_CONSUMER_KEY=
GARMIN_CONSUMER_SECRET=

# Jobs
QSTASH_TOKEN=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Observability
SENTRY_DSN=
"""

---

## 13. Naming Conventions

## 13.1 Dosya İsimlendirme

- React component: `kebab-case.tsx`
- Server Action: `actions.ts`
- Query helper: `queries.ts`
- Zod schema: `schemas.ts`
- Type file: `types.ts`
- Utility: `utils.ts`
- Constants: `constants.ts`

Örnek:

"""text
athlete-profile-header.tsx
team-readiness-card.tsx
generate-ai-session-report.ts
"""

## 13.2 Component İsimlendirme

Component isimleri PascalCase olmalıdır.

"""text
AthleteProfileHeader
TeamReadinessCard
GenerateAiReportButton
WearableProviderCard
"""

## 13.3 Server Action İsimlendirme

Action’lar fiil ile başlamalıdır.

"""text
createTeam
updateAthlete
deleteSession
submitWellnessCheckin
generateAiSessionReport
askTeamMemory
connectWearableProvider
syncWearableData
"""

## 13.4 Query İsimlendirme

"""text
getOrganizationById
getTeamsByOrganization
getAthletesByTeam
getSessionById
getTeamReadinessSummary
getRecentAiReports
getMemoryDocuments
"""

---

## 14. Server Components ve Client Components İlkeleri

## 14.1 Server Component Varsayılanı

Next.js App Router sayfaları mümkün olduğunca Server Component olmalıdır.

Kullanım:

- Database read
- Auth check
- Initial page data
- Static layout
- SEO metadata

## 14.2 Client Component Gereken Durumlar

`'use client'` sadece aşağıdaki durumlarda kullanılmalıdır:

- Form etkileşimleri
- Tab / modal / dropdown
- Chart interactivity
- Upload progress
- File preview
- Chat input
- Client state
- Drag/drop
- Real-time UI

## 14.3 Örnek Sayfa Deseni

"""text
page.tsx
→ server component
→ auth check
→ fetch initial data
→ render client component

components/client-form.tsx
→ use client
→ form state
→ server action call
"""

---

## 15. Server Actions İlkeleri

Server Actions, CRUD ve form işlemleri için ana yöntemdir.

## 15.1 Action Pattern

"""text
export async function createAthlete(input: CreateAthleteInput) {
  const user = await requireUser()
  const organization = await requireOrganization()
  await requirePermission(user, organization, 'athlete:create')
  await checkEntitlement(organization.id, 'athletes:create')

  const parsed = createAthleteSchema.parse(input)

  const athlete = await insertAthlete(parsed)

  await createAuditLog({
    action: 'athlete.created',
    entityId: athlete.id
  })

  return athlete
}
"""

## 15.2 Action İçinde Zorunlu Kontroller

- Auth
- Organization context
- Role permission
- Entitlement
- Zod validation
- DB mutation
- Audit log
- Revalidate path, gerekiyorsa

---

## 16. Feature Gate Kullanımı

Premium özelliklerde hem UI hem server-side kontrol gerekir.

## 16.1 UI Gate

"""text
<FeatureGate feature=\"advanced_ai_analysis\">
  <GenerateAiSessionAnalysisButton />
</FeatureGate>
"""

## 16.2 Server Gate

"""text
await requireEntitlement(organization.id, 'advanced_ai_analysis_enabled')
"""

## 16.3 Gate Gerektiren Özellikler

- Advanced AI analysis
- Team Memory
- Wearable integrations
- PDF export
- Branded reports
- Multi-team dashboard
- Advanced roles
- Batch upload
- High AI limits

---

## 17. AI Geliştirme İlkeleri

## 17.1 AI Kod Organizasyonu

AI çağrıları component içinde yapılmamalıdır.

Doğru yapı:

"""text
UI
→ Server Action
→ AI Orchestrator
→ Provider Adapter
→ Schema Validation
→ Database Persist
"""

## 17.2 Structured Output

Her AI senaryosu JSON schema ile doğrulanmalıdır.

Senaryolar:

- Session analysis
- Readiness summary
- Nutrition summary
- Training plan
- Player development
- Team Memory answer

## 17.3 Prompt Versiyonlama

Prompt’lar versiyonlanmalıdır.

"""text
prompt_version: session-analysis-v1
prompt_version: readiness-summary-v1
prompt_version: team-memory-v1
"""

Bu bilgi `ai_reports.prompt_version` alanına yazılmalıdır.

---

## 18. RAG / Team Memory İlkeleri

## 18.1 Memory Write

AI raporları, koç notları ve gözlemler memory’ye yazılabilir.

"""text
createMemoryDocument({
  organizationId,
  teamId,
  athleteId,
  sessionId,
  type,
  title,
  content,
  metadata
})
"""

## 18.2 Embedding

Memory document oluşturulduktan sonra:

"""text
chunk document
→ generate embeddings
→ insert document_embeddings
"""

## 18.3 Retrieval

Assistant sorusunda:

"""text
embed question
→ vector search
→ metadata filter
→ top chunks
→ answer generation
"""

---

## 19. Wearable Geliştirme İlkeleri

## 19.1 Provider Adapter Pattern

Her provider ortak interface uygulamalıdır.

"""ts
export interface WearableProvider {
  getAuthUrl?(athleteId: string): Promise<string>
  exchangeCode?(code: string): Promise<TokenResult>
  refreshToken?(connectionId: string): Promise<TokenResult>
  syncDailySummaries(connectionId: string): Promise<DailySummary[]>
  syncActivities(connectionId: string): Promise<WearableActivity[]>
}
"""

## 19.2 Manual ve CSV Fallback

Wearable olmayan sporcular için her zaman alternatif olmalıdır:

- Manual check-in
- Manual personal training
- CSV import
- Coach-entered data

## 19.3 Token Güvenliği

Token işlemleri sadece server-side yapılır.

"""text
access_token_encrypted
refresh_token_encrypted
ENCRYPTION_KEY
AES-256-GCM
"""

---

## 20. File and Import Processing İlkeleri

## 20.1 Upload

- Dosya private bucket’a yüklenir.
- Storage path organization/team/session bazlı olmalıdır.
- Büyük dosyalarda direct upload veya signed upload tercih edilir.

## 20.2 Processing

MVP:

"""text
upload
→ status pending
→ parse / summarize
→ context document saved
→ status completed
"""

## 20.3 Error Handling

- Unsupported format
- File too large
- CSV/report parsing failed
- AI summarization failed
- Storage failed

Her hata UI’da actionable empty state ile gösterilmelidir.

---

## 21. Test Yapısı

İlk MVP’de test kapsamı hafif olabilir ama kritik logic test edilmelidir.

"""text
tests/
├── unit/
│   ├── entitlements.test.ts
│   ├── readiness-score.test.ts
│   ├── load-score.test.ts
│   ├── wearable-normalize.test.ts
│   └── ai-schema-validation.test.ts
│
├── integration/
│   ├── create-athlete.test.ts
│   ├── create-session.test.ts
│   ├── submit-checkin.test.ts
│   ├── generate-ai-report.test.ts
│   └── team-memory.test.ts
│
└── e2e/
    ├── coach-onboarding.spec.ts
    ├── athlete-checkin.spec.ts
    ├── session-analysis.spec.ts
    └── billing-gate.spec.ts
"""

## Önerilen Araçlar

- Vitest
- Testing Library
- Playwright
- MSW, integration mocks
- Supabase local test db

---

## 22. Build ve Scriptler

Root `package.json` script önerisi:

"""json
{
  "scripts": {
    "dev": "turbo dev",
    "dev:web": "pnpm --filter web dev",
    "dev:app": "pnpm --filter app dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "db:generate": "supabase gen types typescript --local > packages/database/src/types/database.types.ts",
    "db:migrate": "supabase migration up",
    "db:seed": "tsx scripts/seed-demo.ts",
    "selfhost:up": "docker compose -f docker/docker-compose.selfhost.yml up -d",
    "files:process": "tsx scripts/process-import.ts",
    "wearables:sync": "tsx scripts/sync-wearables.ts"
  }
}
"""

---

## 23. Eski Yapıdan Çıkarılan Klasörler

v3.0 ile aşağıdaki eski modüller çekirdekten çıkarılmıştır:

"""text
components/map/
components/routes/
components/scavenger-hunts/
services/mapbox/
services/poi/
features/routes/
features/explore/
features/achievements/
app/(app)/explore/
app/(app)/routes/
"""

Bu modüller ileride outdoor veya challenge ürünü olarak geri dönebilir, ancak CoachOS ana ürününde yer almaz.

---

## 24. MVP İçin Minimum Dosya Yapısı

Hackathon MVP için tüm monorepo paketleri zorunlu değildir. Daha hızlı başlangıç için aşağıdaki minimal yapı yeterlidir:

"""text
apps/app/
├── app/
│   ├── (auth)/
│   ├── (onboarding)/
│   ├── (coach)/
│   ├── (athlete)/
│   └── api/
├── components/
├── features/
│   ├── organizations/
│   ├── teams/
│   ├── athletes/
│   ├── sessions/
│   ├── check-ins/
│   ├── nutrition/
│   ├── files/
│   ├── ai-reports/
│   └── memory/
├── lib/
└── hooks/

packages/
├── ui/
├── database/
├── ai/
├── rag/
└── shared/
"""

MVP sonrası şu paketler ayrıştırılabilir:

"""text
wearables
reports
billing
files
self-host
validators
"""

---

## 25. Nihai Monorepo Özeti

OhHike CoachOS monorepo yapısı şu hedefe hizmet eder:

"""text
Tek repo
→ İki ana app
→ Ortak design system
→ Modüler feature yapısı
→ AI / RAG / wearable / files paketleri
→ SaaS + self-host uyumu
"""

Bu yapı sayesinde:

- Marketing ve app birbirinden ayrılır.
- Coach ve athlete deneyimi aynı uygulama içinde role-based yönetilir.
- AI katmanı UI’dan izole edilir.
- Wearable provider’ları genişletilebilir olur.
- Import ve rapor işleme ayrı modül olarak büyüyebilir.
- Database ve RLS yapısı merkezi yönetilir.
- Self-host kullanıcılar aynı kod tabanını çalıştırabilir.
- Hackathon MVP hızlı çıkar, ürünleşme sürecinde mimari dağılmaz.