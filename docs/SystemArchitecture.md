# OhHike CoachOS - Detaylı Sistem Mimarisi ve Teknoloji Yığını v3.0

## 0. Doküman Durumu

**Doküman adı:** OhHike CoachOS System Architecture  
**Versiyon:** v3.0  
**Ürün tipi:** SaaS + Open Source / Self-host  
**Ana domain:** `ohhike.com`  
**Uygulama domain:** `app.ohhike.com`  
**Mimari yaklaşım:** Modular Serverless Monolith + Self-host uyumlu monorepo  
**Core stack:** Next.js, TypeScript, Clerk, Supabase, Tailwind CSS, shadcn/ui  
**AI stack:** LLM, RAG, pgvector, structured output, veri analizi  
**Veri modeli:** Organization → Team → Athlete → Session → AI Report → Team Memory

---

## 1. Ürün Mimarisinin Amacı

OhHike CoachOS; spor takımları, antrenörler, sporcular ve kulüpler için geliştirilen AI destekli bir spor operasyon platformudur.

Sistem şu temel ihtiyaçları karşılayacak şekilde tasarlanır:

- Antrenörlerin takımları yönetmesi
- Sporcuların kendi dashboard’larından veri girmesi
- Takım ve kişisel antrenmanların takip edilmesi
- Beslenme alışkanlığı ve readiness verilerinin toplanması
- Akıllı saat bağlantılarından veri alınması
- Antrenman notları, check-in verileri, akıllı saat özetleri ve geçmiş raporların AI ile analiz edilmesi
- Her session’dan takım hafızasına veri eklenmesi
- RAG tabanlı Team Memory Assistant ile geçmiş veriden cevap alınması
- Hosted SaaS ve self-host kullanım modellerinin aynı kod tabanı üzerinden desteklenmesi

---

## 2. Yüksek Seviye Mimari

OhHike CoachOS mimarisi aşağıdaki ana katmanlardan oluşur:

"""text
Client Layer
  ├── Coach Dashboard
  ├── Athlete Dashboard
  ├── Admin / Club Dashboard
  ├── Marketing Website
  └── Self-host Setup UI

Application Layer
  ├── Next.js App Router
  ├── Server Actions
  ├── Route Handlers
  ├── Middleware
  └── Feature Gate / Entitlement Layer

Data Layer
  ├── Supabase PostgreSQL
  ├── Supabase RLS
  ├── Supabase Storage
  ├── pgvector
  └── Audit Logs

AI Layer
  ├── LLM Provider Adapter
  ├── RAG / Team Memory Engine
  ├── Prompt Orchestrator
  └── Structured Output Validator

Data Processing Layer
  ├── CSV Import
  ├── Report Ingestion
  ├── Data Normalization
  ├── Summary Generation
  └── Async Analysis Jobs

Integration Layer  ├── Clerk Auth
  ├── Clerk Billing
  ├── Strava
  ├── Garmin Health API
  ├── Apple Health / HealthKit Bridge
  ├── Android Health Connect Bridge
  ├── CSV Import
  └── Email / Notification Provider

Deployment Layer
  ├── Managed SaaS
  ├── Vercel / Cloud Runtime
  ├── Managed Supabase
  ├── Docker Compose
  ├── Coolify / Dokploy
  └── Self-host Storage
"""

---

## 3. Mimari Yaklaşım

## 3.1 Modular Serverless Monolith

İlk versiyon için OhHike CoachOS, mikroservis yerine modüler bir serverless monolith olarak geliştirilmelidir.

Neden?

- Hackathon ve MVP geliştirme hızını artırır.
- Next.js App Router ile frontend ve backend aynı kod tabanında yönetilir.
- Server Actions ile CRUD işlemleri hızlı kurulur.
- Route Handlers ile AI, webhook, upload ve entegrasyon endpoint’leri oluşturulur.
- Self-host kurulumu daha kolay olur.
- Sistem büyüdükçe modüller servisleştirilebilir.

## 3.2 Modülerlik İlkesi

Kod tabanı tek repo olabilir; ancak iş mantığı net modüllere ayrılmalıdır.

"""text
auth
billing
organizations
teams
athletes
sessions
training
nutrition
readiness
wearables`nfiles`nai
rag
reports
settings
self-host
"""

Her modül kendi validation, action, query, component ve service katmanına sahip olmalıdır.

---

## 4. Kullanılan Teknoloji Yığını

## 4.1 Core

| Katman | Teknoloji | Amaç |
|---

## 5. Ana Domain ve Uygulama Yapısı

## 5.1 Public Website

**Domain:** `ohhike.com`

Amaç:

- Ürün tanıtımı
- SaaS değer önerisi
- Pricing
- Self-host mesajı
- Docs
- GitHub linki
- Demo CTA

Public sayfalar:

"""text
/
 /pricing
 /docs
 /docs/self-host
 /docs/integrations
 /docs/api-keys
 /open-source
 /security
 /privacy
 /terms
"""

---

## 5.2 SaaS App

**Domain:** `app.ohhike.com`

Amaç:

- Koç paneli
- Sporcu paneli
- Organizasyon yönetimi
- AI analizler
- Team Memory
- Billing
- Settings

Protected app route grupları:

"""text
/app
  /dashboard
  /teams
  /athletes
  /sessions
  /training
  /readiness
  /nutrition
  /wearables
  /files
  /ai-reports
  /memory
  /reports
  /settings
"""

---

## 5.3 Self-host Deployment

Self-host ortamda domain kullanıcıya bağlıdır:

"""text
localhost:3000
coachos.clubdomain.com
ohhike.internal
"""

Self-host ortamda public marketing sayfaları opsiyonel olabilir. Sistem doğrudan setup ekranıyla başlayabilir.

---

## 6. Katmanlı Sistem Mimarisi

## 6.1 Presentation Layer

Kullanıcı arayüzü katmanıdır.

### İçerikler

- Coach Dashboard
- Athlete Dashboard
- Organization Admin
- Session Analysis UI
- AI Report Cards
- Team Memory Chat
- Wearable Connection UI
- Nutrition Forms
- Readiness Forms
- Training Planner
- Pricing ve Billing UI

### Sorumluluklar

- Kullanıcı verisini okunabilir göstermek
- Form girişlerini toplamak
- Server Actions çağırmak
- AI raporlarını kartlara dönüştürmek
- Rol bazlı görünürlük uygulamak
- Loading / empty / error state yönetmek

---

## 6.2 Application Layer

Next.js server tarafındaki uygulama mantığıdır.

### Sorumluluklar

- Auth kontrolü
- Organization context çözme
- Role / permission kontrolü
- Billing entitlement kontrolü
- CRUD işlemleri
- AI job tetikleme
- Wearable sync çağrıları
- Dosya/import işleme başlatma
- RAG retrieval başlatma
- Audit log yazma

### Örnek Server Action’lar

"""text
createOrganization()
inviteStaffMember()
createTeam()
createAthlete()
claimAthleteProfile()
createSession()
submitWellnessCheckin()
submitNutritionLog()
createPersonalTraining()
uploadSessionFile()
generateAiSessionReport()
askTeamMemory()
createTrainingPlan()
connectWearableProvider()
syncWearableData()
"""

---

## 6.3 Data Layer

Ana veri saklama katmanıdır.

### Bileşenler

- PostgreSQL tables
- RLS policies
- Supabase Storage
- pgvector embeddings
- Audit logs
- Billing entitlements
- Encrypted API keys

### Temel Veri İzolasyonu

"""text
Organization ID
→ Team ID
→ Athlete ID
→ Session ID
"""

Her sorguda organizasyon bağlamı kontrol edilmelidir.

---

## 6.4 AI Layer
  ├── LLM Provider Adapter
  ├── RAG / Team Memory Engine
  ├── Prompt Orchestrator
  └── Structured Output Validator

Data Processing Layer
  ├── CSV Import
  ├── Report Ingestion
  ├── Data Normalization
  ├── Summary Generation
  └── Async Analysis Jobs

Integration Layer
Dış servislerle iletişim katmanıdır.

### Entegrasyonlar

- Clerk Auth
- Clerk Billing
- Supabase
- Strava
- Garmin Health API
- Apple Health / HealthKit bridge
- Android Health Connect bridge
- Email provider
- AI providers
- S3-compatible storage
- CSV import

---

## 7. Ana Veri Akışları

---

# 7.1 Coach Onboarding Flow

"""text
Kullanıcı ohhike.com’a gelir
→ Get Started
→ Clerk sign-up
→ app.ohhike.com onboarding
→ Organization oluşturur
→ İlk takımını oluşturur
→ Sporcuları manuel ekler veya CSV import yapar
→ Staff davet eder
→ Dashboard’a yönlenir
"""

Sistem tarafı:

"""text
Clerk user.created webhook
→ users tablosu oluşturulur
→ organization oluşturulur
→ organization_members owner kaydı eklenir
→ billing_entitlements free plan oluşturulur
"""

---

# 7.2 Athlete Invite / Claim Flow

"""text
Antrenör sporcu kaydı oluşturur
→ athlete_invites token üretir
→ sporcu davet linkini açar
→ Clerk ile kayıt olur veya giriş yapar
→ token doğrulanır
→ athlete.user_id güncellenir
→ sporcu dashboard açılır
"""

Bu model sayesinde sporcu daha sisteme kayıt olmadan takım içinde yer alabilir.

---

# 7.3 Daily Check-in Flow

"""text
Sporcu dashboard’a girer
→ Günlük check-in formunu doldurur
→ Uyku, enerji, ağrı, stres, motivasyon verisi gönderilir
→ wellness_checkins tablosuna yazılır
→ readiness_score hesaplanır
→ AI kısa öneri üretir
→ Koç dashboard’daki Team Readiness Score güncellenir
"""

AI context:

"""text
athlete profile
+ son 7 gün check-in
+ son antrenman RPE
+ wearable summary, varsa
+ bugünkü takım session bilgisi
"""

---

# 7.4 Nutrition Log Flow

"""text
Sporcu günlük öğün / su takibi girer
→ nutrition_logs tablosuna yazılır
→ antrenman günüyle ilişkilendirilir
→ AI düşük enerji + beslenme eksikliği ilişkisini yorumlayabilir
→ Nutritionist veya koç dashboard’da uyum oranını görür
"""

---

# 7.5 Personal Training Flow

"""text
Sporcu kişisel antrenman girer
→ personal_trainings tablosuna yazılır
→ wearable activity ile eşleşebilir
→ weekly load hesabına eklenir
→ koç dashboard’da takım dışı yük görünür
"""

Örnek:

"""text
Sporcu dün 45 dk koşu yaptı
Bugün takım antrenmanı yüksek yoğunluklu
AI, bu sporcunun toplam haftalık yükünü dikkate alır
"""

---

# 7.6 Group Training Session Flow

"""text
Koç session oluşturur
→ Katılacak sporcular seçilir
→ Training blocks eklenir
→ Session tamamlanır
→ Katılım işaretlenir
→ Sporcular RPE girer
→ Koç not yazar
→ AI session summary oluşturabilir
→ Team Memory’ye eklenir
"""

---

# 7.7 Data & Report Analysis Flow

"""text
Koç session notlarını, katılımı, RPE ve training block verilerini tamamlar
→ sporcu check-in, nutrition ve personal training verileri toplanır
→ akıllı saat özeti varsa context'e eklenir
→ geçmiş AI raporları, koç notları ve team pattern'leri Team Memory'den çekilir
→ AI structured JSON rapor döndürür
→ ai_reports kaydı oluşturulur
→ athlete_observations ve team_patterns güncellenir
→ documents tablosuna hafıza kaydı yazılır
→ embeddings oluşturulur
"""

---

# 7.8 Team Memory / RAG Flow

"""text
Koç assistant’a soru sorar
→ soru embedding’e çevrilir
→ organization/team filtreleriyle semantic search yapılır
→ ilgili document chunk’ları alınır
→ LLM’e context olarak verilir
→ cevap üretilir
→ assistant_messages tablosuna kaydedilir
"""

Örnek soru:

"""text
Son 1 ayda takımın en çok tekrar eden problemi ne?
"""

Örnek cevap:

"""text
Son 4 session raporuna göre en sık tekrar eden problem geçiş savunması. Özellikle top kaybından sonraki ilk 6 saniyede orta saha hattının reaksiyonu gecikiyor. Bu hafta düşük-orta yoğunluklu 4v4+3 transition drill öneriyorum.
"""

---

# 7.9 Wearable Sync Flow

"""text
Sporcu wearable provider seçer
→ OAuth / native permission başlar
→ Kullanıcı açık izin verir
→ token şifreli saklanır
→ sync job çalışır
→ daily summaries ve activities çekilir
→ normalize edilir
→ wearable_daily_summaries / wearable_activities tablolarına yazılır
→ readiness ve load hesaplarına dahil edilir
"""

Destek yaklaşımı:

"""text
Strava:
- SaaS web app içinde OAuth ile daha hızlı entegre edilebilir.

Garmin:
- API erişimi onay sürecine bağlıdır.

Apple Health:
- Web uygulamasından direkt erişim pratik değildir.
- Native iOS app veya bridge gerekir.

Android Health Connect:
- Native Android app veya bridge gerekir.

CSV:
- MVP ve self-host için en güvenli fallback.
"""

---

# 7.10 Billing / Entitlement Flow

"""text
Kullanıcı pricing sayfasından plan seçer
→ Clerk Billing checkout
→ subscription.created webhook
→ billing_entitlements güncellenir
→ feature gate aktif olur
"""

Feature gate örnekleri:

"""text
advanced_ai_analysis_enabled
wearable_enabled
team_memory_enabled
branded_reports_enabled
max_teams
max_athletes
max_ai_reports_per_month
max_sessions_per_month
"""

---

# 7.11 Self-host Setup Flow

"""text
Kullanıcı repo’yu indirir
→ docker-compose up
→ app ilk açılışta setup mode görür
→ admin hesabı oluşturulur
→ database migration çalışır
→ AI provider key girilir
→ storage ayarı yapılır
→ wearable provider key’leri opsiyonel girilir
→ ilk organization oluşturulur
→ sistem kullanılabilir hale gelir
"""

---

## 8. AI Mimarisi

## 8.1 AI Orchestrator

Tüm AI işlemlerini yöneten merkezi servis olmalıdır.

"""text
Input Collector
→ Context Builder
→ Prompt Selector
→ Provider Adapter
→ Schema Validator
→ Result Persister
→ Memory Writer
"""

### Görevleri

- Hangi AI senaryosunun çalışacağını belirler
- İlgili context’i toplar
- Prompt template seçer
- AI provider çağrısı yapar
- JSON schema doğrular
- Hatalı çıktı varsa retry / repair yapar
- Sonucu DB’ye yazar
- Gerekirse Team Memory dokümanı oluşturur

---

## 8.2 Structured Output

AI çıktıları serbest metin olarak bırakılmamalıdır. Her ana senaryo için Zod schema veya JSON schema tanımlanmalıdır.

Örnek Session Analysis Output:

"""json
{
  "session_summary": {
    "title": "Transition defense needs attention",
    "summary": "The team struggled to stay compact after losing possession.",
    "confidence_score": 0.78
  },
  "team_patterns": [
    {
      "type": "transition_defense",
      "severity": "medium",
      "observation": "The midfield line reacts late after ball loss.",
      "recommendation": "Use 4v4+3 transition games with a 6-second recovery rule."
    }
  ],
  "athlete_observations": [
    {
      "athlete_reference": "#8",
      "observation": "Reacted late during defensive transition.",
      "suggested_focus": "First 5-second reaction after possession loss."
    }
  ],
  "recommended_drills": [
    {
      "title": "4v4+3 Transition Game",
      "duration_min": 20,
      "purpose": "Improve compactness and reaction after ball loss."
    }
  ],
  "next_training_plan": {
    "duration_min": 60,
    "blocks": [
      {
        "title": "Dynamic warm-up",
        "duration_min": 10
      },
      {
        "title": "Rondo under pressure",
        "duration_min": 12
      },
      {
        "title": "Transition defense game",
        "duration_min": 25
      },
      {
        "title": "Cool down and feedback",
        "duration_min": 13
      }
    ]
  }
}
"""

---

## 8.3 Prompt Context Kaynakları

AI raporları için kullanılabilecek context kaynakları:

"""text
organization profile
team profile
athlete profiles
session data
session attendance
training blocks
coach notes
athlete check-ins
nutrition logs
wearable summaries
wearable activities
previous AI reports
team patterns
drill library
selected context documents
manual analyst notes
"""

---

## 8.4 RAG / Team Memory Engine

Team Memory, OhHike CoachOS’un ana farklılaştırıcı teknik özelliğidir.

### Memory Yazma

Her önemli olay sonrasında memory kaydı oluşturulabilir:

"""text
AI session report
Coach note
Athlete observation
Weekly report
Wearable summary
Nutrition summary
Training plan
Resolved pattern
"""

### Memory Okuma

Sorgularda şu filtreler kullanılır:

"""text
organization_id
team_id
athlete_id, optional
document_type
date range
similarity score
role permission
"""

### Retrieval Pipeline

"""text
Question
→ embedding
→ vector search
→ metadata filter
→ top chunks
→ rerank, optional
→ LLM answer
→ cited memory references, optional
"""

---

## 9. Wearable Integration Mimarisi

## 9.1 İlkeler

- Wearable bağlantısı opsiyoneldir.
- Akıllı saati olmayan sporcu manuel girişle tam deneyim alabilir.
- Her sporcu kendi verisi için açık izin verir.
- Token’lar şifreli saklanır.
- Veriler normalize edilir.
- AI model training amacıyla kullanılmaz.
- Sadece organizasyon bağlamında analiz ve öneri için kullanılır.

## 9.2 Provider Adapter Model

"""text
services/wearables/
  ├── providers/
  │   ├── strava.ts
  │   ├── garmin.ts
  │   ├── apple-health.ts
  │   ├── health-connect.ts
  │   ├── csv.ts
  │   └── manual.ts
  ├── normalize.ts
  ├── sync.ts
  ├── match-activity.ts
  └── token-vault.ts
"""

## 9.3 Normalize Edilen Veri Modeli

"""text
Daily Summary:
- steps
- active_minutes
- distance_km
- calories
- sleep_hours
- sleep_score
- resting_heart_rate
- avg_heart_rate
- max_heart_rate
- hrv
- stress_score

Activity:
- activity_type
- started_at
- duration_sec
- distance_km
- avg_heart_rate
- max_heart_rate
- calories
- elevation_gain
"""

---

## 10. Data Import ve File Processing Mimarisi

## 10.1 MVP

MVP'de dosya işleme; CSV import, geçmiş rapor yükleme ve destekleyici dokümanları Team Memory'ye kazandırma üzerine kuruludur.

"""text
Upload CSV / report / note
→ Validate file type and organization scope
→ Parse or summarize content
→ Normalize into analysis context
→ Store as document
→ Generate embeddings when useful
"""

## 10.2 Async Job İhtiyacı

Büyük CSV importları, geçmiş rapor özetleme ve embedding üretimi request-response içinde yapılmamalıdır.

## 10.3 Processing Status

Dosya/import kayıtları şu statülere sahip olmalıdır:

"""text
pending
processing
completed
failed
"""

UI, status'a göre kullanıcıyı bilgilendirir.

---

## 11. Feature Gate ve Plan Yönetimi

Her premium özellik server-side kontrol edilmelidir.

## 11.1 Feature Gate Katmanı

"""text
canCreateTeam(organizationId)
canAddAthlete(organizationId)
canCreateSession(organizationId)
canRunAiAnalysis(organizationId)
canUseAdvancedAiAnalysis(organizationId)
canUseTeamMemory(organizationId)
canUseWearables(organizationId)
canExportPdf(organizationId)
"""

## 11.2 Planlar

"""text
Free:
- 1 team
- 10 athletes
- 3 sessions/month
- limited AI
- insufficient session data
- no wearables
- no Team Memory

Coach Pro:
- 3 teams
- 50 athletes
- 30 sessions/month
- advanced AI analysis
- Team Memory
- wearables
- PDF export

Club:
- unlimited teams
- unlimited athletes
- advanced roles
- multi-team memory
- branded reports
- audit logs
- advanced analytics

Self-host:
- unlimited local usage
- own AI key
- own storage
- own wearable keys
"""

---

## 12. Güvenlik Mimarisi

## 12.1 Auth Güvenliği

- Tüm protected route’lar middleware ile korunur.
- Server action’larda auth tekrar kontrol edilir.
- Organization context server-side çözülür.
- Role kontrolü frontend’e bırakılmaz.

## 12.2 RLS Güvenliği

Supabase RLS zorunludur.

Temel ilkeler:

"""text
Athlete:
- Kendi verisini görebilir
- Kendi check-in, nutrition, personal training verisini girebilir

Coach:
- Yetkili olduğu takımın sporcularını görebilir
- Session ve raporları yönetebilir

Admin / Owner:
- Organizasyon genelinde yönetim yapabilir

Sensitive Staff:
- Nutritionist sadece nutrition verisine erişebilir
- Physiotherapist readiness/recovery verisine erişebilir
"""

## 12.3 Token / API Key Güvenliği

Aşağıdaki veriler şifreli saklanmalıdır:

"""text
AI provider API keys
Wearable access tokens
Wearable refresh tokens
Storage provider secrets
Webhook secrets
"""

Şifreleme:

"""text
AES-256-GCM
ENCRYPTION_KEY env variable
Server-side decrypt
Never expose to frontend
"""

## 12.4 Dosya Güvenliği

- Signed URL ile geçici erişim verilir.
- Role-based file access uygulanır.
- Import, rapor ve doküman dosyaları public URL ile sunulmaz.
- Reports private olur, share token opsiyoneldir.

## 12.5 Audit Logging

Audit log tutulması gereken olaylar:

"""text
user login
organization created
staff invited
athlete created
athlete data exported
wearable connected
wearable disconnected
AI report generated
file imported
billing plan changed
API key created/updated
self-host setting changed
"""

---

## 13. Self-host Mimarisi

## 13.1 Self-host Hedefi

Self-host versiyon, kulüplerin verilerini kendi sunucusunda tutmasını sağlar.

### Neden önemli?

- Sporcu verileri hassastır.
- Çocuk sporcu verileri olabilir.
- Sporcu, sağlık, performans ve kulüp rapor verileri gizlidir.
- Kulüp kendi veri politikasını uygulamak isteyebilir.
- Bazı kurumlar cloud kullanmak istemeyebilir.

## 13.2 Self-host Bileşenleri

"""text
web app
postgres
supabase compatible storage or S3
optional local auth
optional local AI provider
redis, optional
worker, optional
"""

## 13.3 Docker Compose Örneği

"""yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/ohhike
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
      - SELF_HOSTED=true
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      - db

  db:
    image: pgvector/pgvector:pg16
    environment:
      - POSTGRES_DB=ohhike
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - db_data:/var/lib/postgresql/data

  storage:
    image: minio/minio
    command: server /data --console-address ':9001'
    ports:
      - '9000:9000'
      - '9001:9001'
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
    volumes:
      - storage_data:/data

volumes:
  db_data:
  storage_data:
"""

---

## 14. Deployment Mimarisi

## 14.1 SaaS Deployment

"""text
GitHub
→ main branch
→ CI checks
→ Vercel build
→ Supabase migrations
→ Production deploy
"""

SaaS bileşenleri:

- Vercel
- Managed Supabase
- Clerk
- Clerk Billing
- Supabase Storage
- AI Provider
- Email Provider
- Background Job Provider

## 14.2 Staging Deployment

Staging ortamı production verisinden ayrılmalıdır.

"""text
staging.ohhike.com
app-staging.ohhike.com
separate Supabase project
separate Clerk instance
separate AI key limits
"""

## 14.3 Self-host Deployment

Desteklenecek yöntemler:

"""text
Docker Compose
Coolify
Dokploy
Railway, opsiyonel
Fly.io, opsiyonel
Manual VPS
"""

---

## 15. Observability ve Monitoring

## 15.1 Loglanacak Metrikler

"""text
AI request count
AI cost estimate
AI failure rate
file processing duration
wearable sync duration
RAG retrieval latency
session creation count
daily active coaches
daily active athletes
check-in completion rate
billing conversion
"""

## 15.2 Error Tracking

Önerilen araçlar:

"""text
Sentry
Axiom
Logtail
OpenTelemetry, roadmap
"""

## 15.3 AI Monitoring

AI çıktılarında takip edilmesi gerekenler:

"""text
schema validation failures
hallucination reports
coach correction count
low confidence reports
retry count
provider timeout
cost per report
"""

---

## 16. Cache ve Performans

## 16.1 Cache Edilebilecek Veriler

"""text
organization settings
billing entitlements
team list
athlete list
drill library
dashboard summaries
report previews
"""

## 16.2 Recompute Edilecek Veriler

Aşağıdaki özetler cron veya event sonrası hesaplanabilir:

"""text
team readiness score
weekly load score
nutrition compliance
missing check-ins
athlete risk alerts
team pattern counts
wearable sync summaries
"""

---

## 17. API Route Yapısı

Önerilen API endpoint’leri:

"""text
/api/webhooks/clerk
/api/webhooks/billing
/api/webhooks/strava

/api/ai/session-analysis
/api/ai/team-memory
/api/ai/training-plan
/api/ai/readiness-summary

/api/files/upload
/api/files/process
/api/imports/csv

/api/wearables/strava/connect
/api/wearables/strava/callback
/api/wearables/sync

/api/reports/export
/api/imports/csv
"""

Server Actions birçok CRUD işleminde tercih edilir. API route’lar daha çok webhook, AI stream, upload ve entegrasyonlar için kullanılmalıdır.

---

## 18. Data Consistency ve Event Model

## 18.1 Event Tetikleyen İşlemler

"""text
Athlete check-in submitted
→ recompute athlete readiness
→ recompute team readiness

Session completed
→ collect attendance + RPE
→ update load summaries
→ optionally generate AI summary

File imported
→ start processing job

AI report generated
→ create memory document
→ create embeddings
→ update team patterns

Wearable synced
→ update daily summaries
→ match personal trainings
→ recompute load
"""

## 18.2 Event Outbox, Roadmap

İleri aşamada event outbox pattern önerilir.

"""text
event_outbox
- id
- organization_id
- event_type
- payload
- status
- created_at
- processed_at
"""

Bu, async job güvenilirliğini artırır.

---

## 19. MVP Mimari Kapsamı

Hackathon / ilk demo için minimum mimari:

"""text
Next.js App Router
Clerk Auth
Supabase PostgreSQL
Supabase Storage
Organizations
Teams
Athletes
Sessions
Check-ins
Nutrition Logs
Personal Trainings
Session Notes and File Imports
Simple AI Report
Simple Team Memory
Pricing Page
Self-host Messaging
"""

MVP’de mock veya basitleştirilebilir:

"""text
Wearable:
- CSV import veya demo seed data

Data import:
- CSV import veya geçmiş rapor yükleme

RAG:
- documents + simple embedding search veya keyword fallback

Billing:
- pricing UI + Clerk Billing integration, mümkünse
"""

---

## 20. Roadmap Mimari Kapsamı

## 20.1 v0.1 Hackathon MVP

- Koç dashboard
- Sporcu dashboard
- Takım ve sporcu yönetimi
- Daily check-in
- Basit nutrition log
- Session oluşturma
- CSV/report upload
- AI report
- Team Memory demo
- Pricing
- Self-host anlatımı

## 20.2 v0.2 Beta

- Geçmiş rapor ve CSV parsing
- RAG embeddings
- Coach correction loop
- PDF export
- CSV wearable import
- Drill library
- Training planner

## 20.3 v1.0 Launch

- Clerk Billing aktif
- Strava OAuth
- Wearable daily summaries
- Team Memory production
- Club plan
- Self-host Docker
- Role-based dashboards

## 20.4 v2.0 Advanced Intelligence

- Pose estimation
- Çoklu takım trend analizi
- Gelişmiş readiness/load modelleme
- Garmin integration
- Native mobile health bridge
- Advanced load management
- Multi-team intelligence

---

## 21. Eski Mimariden Çıkarılanlar

v3.0 ile birlikte eski OhHike mimarisindeki bazı modüller çekirdekten çıkarılmıştır.

Çıkarılan veya roadmap dışına alınanlar:

"""text
Mapbox-first explore UI
Scavenger hunts
Public community routes
Route drawing
POI discovery
Gamification badges
Location-based quests
Public route feed
"""

Bu modüller ileride farklı bir yan ürün veya outdoor challenge paketi olarak dönebilir, ancak CoachOS çekirdeğinde yer almaz.

---

## 22. Nihai Mimari Özeti

OhHike CoachOS mimarisi şu ana fikre dayanır:

"""text
Coach + Athlete Data
→ Structured Sports Operations
→ AI Analysis
→ Team Memory
→ Actionable Coaching Decisions
"""

Sistem:

- SaaS olarak hızlı kullanılabilir.
- Self-host olarak güvenli kurulabilir.
- Akıllı saat verisi olan ve olmayan sporcuları destekler.
- AI analizini session notları, check-in ve akıllı saat verileriyle başlatır.
- RAG ile takım hafızası oluşturur.
- Koç, sporcu ve kulüp rollerini tek mimaride birleştirir.
- İleride gelişmiş akıllı saat entegrasyonları ve çoklu takım veri zekasına genişleyebilir.