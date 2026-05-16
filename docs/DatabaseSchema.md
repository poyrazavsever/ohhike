# OhHike CoachOS - Detaylı Veritabanı Şeması ve RLS Mimarisi v3.0

## 0. Doküman Durumu

**Doküman adı:** OhHike CoachOS Database Schema  
**Versiyon:** v3.0  
**Ürün tipi:** SaaS + Open Source / Self-host  
**Veritabanı:** PostgreSQL / Supabase  
**Auth:** Clerk Auth, SaaS tarafı  
**Self-host Auth:** Supabase Auth veya local auth adapter, opsiyonel  
**Storage:** Supabase Storage / S3-compatible storage  
**Vector Search:** pgvector  
**Ana veri modeli:** Organization → Team → Athlete → Session → Analysis → Team Memory

---

## 1. Genel Mimari Yaklaşım

OhHike CoachOS veritabanı; spor kulüpleri, antrenörler, sporcular, antrenmanlar, maçlar, kişisel çalışmalar, beslenme takibi, wearable verileri, AI analizleri ve takım hafızası üzerine kuruludur.

Eski OhHike modelindeki rota, scavenger hunt ve sosyal keşif tabloları bu versiyonda çekirdek yapıdan çıkarılmıştır. Yeni sistemin merkezinde şu yapı vardır:

"""text
organizations
  └── teams
        └── athletes
              ├── wellness_checkins
              ├── nutrition_logs
              ├── personal_trainings
              ├── wearable_daily_summaries
              └── wearable_activities

teams
  └── sessions
        ├── session_attendance
        ├── training_blocks
        ├── session_files
        ├── session_file_summaries
        ├── ai_reports
        └── documents / embeddings

documents + embeddings
  └── Team Memory / RAG Assistant
"""

---

## 2. Ana Tasarım Prensipleri

### 2.1 Multi-Tenant Mimari

Her veri bir organizasyon veya organizasyona bağlı takım / sporcu üzerinden izole edilir.

Ana tenant tablosu:

"""text
organizations
"""

Kritik tabloların çoğunda `organization_id` bulunur. Böylece SaaS ortamında farklı kulüplerin verileri birbirinden ayrılır.

### 2.2 Role-Based Access Control

Sistem aşağıdaki rolleri destekler:

"""text
owner
admin
head_coach
assistant_coach
analyst
physiotherapist
nutritionist
athlete
viewer
"""

Yetkiler `organization_members` ve isteğe bağlı `team_memberships` üzerinden yönetilir.

### 2.3 Athlete Claim Model

Antrenör sporcuları manuel olarak kaydeder. Sporcu daha sonra davet linkiyle kendi hesabını oluşturup mevcut sporcu profilini “claim” eder.

Bu sayede:

- Antrenör sporcu hesabı olmadan da oyuncu kaydı oluşturabilir.
- Sporcu sisteme sonradan dahil olabilir.
- Akıllı saat bağlantısı sporcu sisteme girdikten sonra yapılabilir.

### 2.4 Wearable Optional Model

Akıllı saat bağlantısı zorunlu değildir.

Veri kaynakları:

"""text
manual_checkin
manual_activity
csv_import
strava
garmin
apple_health
health_connect
other
"""

Akıllı saati olmayan sporcular manuel veri girebilir. Akıllı saati olan sporcular verilerini bağlayarak sistemi zenginleştirir.

### 2.5 AI Memory Model

AI analizleri, koç notları, session raporları ve sporcu gözlemleri `documents` tablosuna yazılır. Bu içerikler chunk’lanır ve `document_embeddings` tablosunda saklanır.

Bu yapı Team Memory / RAG Assistant için kullanılır.

### 2.6 Sağlık Verisi Hassasiyeti

Sporcuların readiness, ağrı, uyku, beslenme ve wearable verileri hassas kabul edilir.

Bu nedenle:

- RLS zorunludur.
- Rol bazlı veri erişimi uygulanır.
- Athlete yalnızca kendi verisini görür.
- Koçlar yalnızca yetkili oldukları takımdaki sporcuları görür.
- Self-host kurulumlarda kulüp kendi verisini kendi sunucusunda tutabilir.

---

## 3. PostgreSQL Extension’ları

Sistem için önerilen extension’lar:

"""sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
"""

Açıklamalar:

| Extension | Amaç |
|---|---|
| `uuid-ossp` | UUID üretimi |
| `pgcrypto` | Şifreleme / hash işlemleri |
| `vector` | RAG / Team Memory için embedding arama |

---

## 4. Enum Tipleri

PostgreSQL enum kullanmak veri tutarlılığını artırır.

"""sql
CREATE TYPE subscription_tier AS ENUM (
  'free',
  'coach_pro',
  'club',
  'enterprise',
  'self_hosted'
);

CREATE TYPE organization_type AS ENUM (
  'club',
  'academy',
  'individual_coach',
  'school_team',
  'university_team',
  'performance_center',
  'other'
);

CREATE TYPE organization_role AS ENUM (
  'owner',
  'admin',
  'head_coach',
  'assistant_coach',
  'analyst',
  'physiotherapist',
  'nutritionist',
  'athlete',
  'viewer'
);

CREATE TYPE sport_type AS ENUM (
  'football',
  'basketball',
  'volleyball',
  'handball',
  'running',
  'fitness',
  'tennis',
  'swimming',
  'martial_arts',
  'esports',
  'other'
);

CREATE TYPE athlete_status AS ENUM (
  'active',
  'injured',
  'recovery',
  'inactive',
  'monitoring'
);

CREATE TYPE session_type AS ENUM (
  'team_training',
  'personal_training',
  'match',
  'friendly_match',
  'recovery',
  'test_day',
  'analysis_meeting',
  'nutrition_session',
  'education_session',
  'other'
);

CREATE TYPE session_status AS ENUM (
  'draft',
  'planned',
  'in_progress',
  'completed',
  'cancelled',
  'analyzing',
  'analysis_completed',
  'analysis_failed'
);

CREATE TYPE media_type AS ENUM (
  'pdf',
  'csv',
  'document',
  'other'
);

CREATE TYPE processing_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed'
);

CREATE TYPE data_source AS ENUM (
  'manual',
  'csv_import',
  'strava',
  'garmin',
  'apple_health',
  'health_connect',
  'system',
  'ai',
  'other'
);

CREATE TYPE ai_report_type AS ENUM (
  'session_analysis',
  'match_analysis',
  'training_analysis',
  'player_development',
  'weekly_team_report',
  'load_report',
  'readiness_report',
  'nutrition_report',
  'scout_report'
);

CREATE TYPE document_type AS ENUM (
  'session_report',
  'coach_note',
  'athlete_note',
  'player_observation',
  'team_pattern',
  'training_plan',
  'drill',
  'nutrition_note',
  'recovery_note',
  'wearable_summary',
  'csv_summary',
  'ai_report',
  'other'
);

CREATE TYPE wearable_provider AS ENUM (
  'strava',
  'garmin',
  'apple_health',
  'health_connect',
  'polar',
  'fitbit',
  'manual',
  'csv_import',
  'other'
);
"""

---

## 5. Tablolar

---

# 5.1 `users`

Clerk kullanıcılarının Supabase tarafındaki yansımasıdır.

Sporcu, koç, admin veya staff fark etmeksizin sisteme giriş yapan her gerçek kullanıcı burada tutulur.

| Kolon | Tip | Kısıt | Açıklama |
|---|---|---|---|
| `id` | `VARCHAR(255)` | PRIMARY KEY | Clerk User ID |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Kullanıcı e-posta adresi |
| `display_name` | `VARCHAR(150)` | NULLABLE | Görünen ad |
| `avatar_url` | `TEXT` | NULLABLE | Profil görseli |
| `phone` | `VARCHAR(50)` | NULLABLE | Telefon |
| `locale` | `VARCHAR(20)` | DEFAULT `tr` | Dil tercihi |
| `timezone` | `VARCHAR(100)` | DEFAULT `Europe/Istanbul` | Saat dilimi |
| `last_active_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Son aktiflik |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Oluşturulma |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Güncellenme |

"""sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(150),
  avatar_url TEXT,
  phone VARCHAR(50),
  locale VARCHAR(20) DEFAULT 'tr',
  timezone VARCHAR(100) DEFAULT 'Europe/Istanbul',
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.2 `organizations`

Kulüp, akademi, bireysel koç hesabı veya okul takımı gibi ana tenant yapısıdır.

| Kolon | Tip | Kısıt | Açıklama |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Organizasyon ID |
| `name` | `VARCHAR(255)` | NOT NULL | Organizasyon adı |
| `slug` | `VARCHAR(255)` | UNIQUE, NOT NULL | URL dostu benzersiz ad |
| `type` | `organization_type` | NOT NULL | Kulüp, akademi vb. |
| `logo_url` | `TEXT` | NULLABLE | Logo |
| `country` | `VARCHAR(100)` | NULLABLE | Ülke |
| `city` | `VARCHAR(100)` | NULLABLE | Şehir |
| `subscription_tier` | `subscription_tier` | DEFAULT `free` | Plan |
| `billing_customer_id` | `VARCHAR(255)` | NULLABLE | Clerk/Stripe customer id |
| `is_self_hosted` | `BOOLEAN` | DEFAULT FALSE | Self-host modu |
| `settings` | `JSONB` | DEFAULT `{}` | Organizasyon ayarları |
| `created_by` | `VARCHAR(255)` | FK users.id | Oluşturan |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Oluşturulma |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Güncellenme |

"""sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  type organization_type NOT NULL DEFAULT 'club',
  logo_url TEXT,
  country VARCHAR(100),
  city VARCHAR(100),
  subscription_tier subscription_tier DEFAULT 'free',
  billing_customer_id VARCHAR(255),
  is_self_hosted BOOLEAN DEFAULT FALSE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.3 `organization_members`

Kullanıcıların organizasyon içindeki rollerini belirler.

| Kolon | Tip | Kısıt | Açıklama |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Üyelik ID |
| `organization_id` | `UUID` | FK | Organizasyon |
| `user_id` | `VARCHAR(255)` | FK users.id | Kullanıcı |
| `role` | `organization_role` | NOT NULL | Rol |
| `is_active` | `BOOLEAN` | DEFAULT TRUE | Aktif mi |
| `invited_by` | `VARCHAR(255)` | FK users.id | Davet eden |
| `joined_at` | `TIMESTAMPTZ` | DEFAULT NOW() | Katılım tarihi |

"""sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role organization_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT TRUE,
  invited_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (organization_id, user_id)
);
"""

---

# 5.4 `teams`

Organizasyon altındaki spor takımlarıdır.

| Kolon | Tip | Açıklama |
|---|---|---|
| `id` | `UUID` | Takım ID |
| `organization_id` | `UUID` | Organizasyon |
| `name` | `VARCHAR(255)` | Takım adı |
| `sport_type` | `sport_type` | Spor dalı |
| `age_group` | `VARCHAR(50)` | U15, U17, Senior vb. |
| `level` | `VARCHAR(100)` | Akademi, amatör, profesyonel |
| `default_formation` | `VARCHAR(50)` | 4-3-3, 4-2-3-1 vb. |
| `season_goal` | `TEXT` | Sezon hedefi |
| `weekly_training_count` | `INTEGER` | Haftalık antrenman sayısı |
| `settings` | `JSONB` | Takım ayarları |
| `created_at` | `TIMESTAMPTZ` | Oluşturulma |

"""sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sport_type sport_type NOT NULL DEFAULT 'football',
  age_group VARCHAR(50),
  level VARCHAR(100),
  default_formation VARCHAR(50),
  season_goal TEXT,
  weekly_training_count INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.5 `team_staff`

Staff kullanıcılarının belirli takımlara atanmasını sağlar.

Bir koç organizasyonda olabilir ama yalnızca belirli takımlara erişebilir.

"""sql
CREATE TABLE team_staff (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role organization_role NOT NULL,
  assigned_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, user_id, role)
);
"""

---

# 5.6 `athletes`

Antrenörün kaydettiği sporcu profilidir.

Sporcunun kullanıcı hesabı olmayabilir. `user_id` nullable tutulur. Sporcu davet alıp hesabını bağladığında `user_id` dolabilir.

| Kolon | Tip | Açıklama |
|---|---|---|
| `id` | `UUID` | Sporcu ID |
| `organization_id` | `UUID` | Organizasyon |
| `team_id` | `UUID` | Takım |
| `user_id` | `VARCHAR(255)` | Bağlı kullanıcı, nullable |
| `first_name` | `VARCHAR(100)` | Ad |
| `last_name` | `VARCHAR(100)` | Soyad |
| `display_name` | `VARCHAR(150)` | Görünen ad |
| `email` | `VARCHAR(255)` | Davet e-postası |
| `phone` | `VARCHAR(50)` | Telefon |
| `number` | `INTEGER` | Forma numarası |
| `position` | `VARCHAR(100)` | Mevki |
| `birth_date` | `DATE` | Doğum tarihi |
| `height_cm` | `NUMERIC(5,2)` | Boy |
| `weight_kg` | `NUMERIC(5,2)` | Kilo |
| `dominant_side` | `VARCHAR(50)` | Sağ/sol |
| `status` | `athlete_status` | Durum |
| `notes` | `TEXT` | Genel not |

"""sql
CREATE TABLE athletes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  display_name VARCHAR(150),
  email VARCHAR(255),
  phone VARCHAR(50),
  number INTEGER,
  position VARCHAR(100),
  birth_date DATE,
  height_cm NUMERIC(5,2),
  weight_kg NUMERIC(5,2),
  dominant_side VARCHAR(50),
  status athlete_status DEFAULT 'active',
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.7 `athlete_invites`

Sporcuların kendi hesaplarını claim etmesi için davet sistemi.

"""sql
CREATE TABLE athlete_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email VARCHAR(255),
  token TEXT UNIQUE NOT NULL,
  invited_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  accepted_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.8 `sessions`

Antrenman, maç, kişisel çalışma, recovery, test günü ve analiz toplantısı gibi tüm sportif oturumları tutar.

"""sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  type session_type NOT NULL,
  status session_status DEFAULT 'draft',
  title VARCHAR(255) NOT NULL,
  description TEXT,
  opponent VARCHAR(255),
  location VARCHAR(255),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  planned_duration_min INTEGER,
  actual_duration_min INTEGER,
  focus_area VARCHAR(255),
  planned_intensity INTEGER CHECK (planned_intensity BETWEEN 1 AND 10),
  coach_notes TEXT,
  created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.9 `session_attendance`

Bir session’a hangi sporcuların katıldığını ve performans sonrası kısa verileri tutar.

"""sql
CREATE TABLE session_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT FALSE,
  absence_reason TEXT,
  minutes_played INTEGER,
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
  athlete_note TEXT,
  coach_note TEXT,
  pain_reported BOOLEAN DEFAULT FALSE,
  pain_area VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (session_id, athlete_id)
);
"""

---

# 5.10 `training_blocks`

Bir antrenman içindeki blokları tutar.

Örnek:

- 10 dk ısınma
- 15 dk rondo
- 20 dk transition drill
- 15 dk oyun

"""sql
CREATE TABLE training_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  planned_duration_min INTEGER,
  actual_duration_min INTEGER,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
  drill_id UUID,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

`drill_id` daha sonra `drills` tablosuna foreign key olarak bağlanabilir. Döngüsel bağımlılıkları kolay yönetmek için migration sırasında sonradan constraint eklenebilir.

---

# 5.11 `personal_trainings`

Sporcuların takım dışı bireysel çalışmalarını tutar.

"""sql
CREATE TABLE personal_trainings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  source data_source DEFAULT 'manual',
  wearable_activity_id UUID,
  title VARCHAR(255),
  training_type VARCHAR(100),
  started_at TIMESTAMPTZ,
  duration_min INTEGER,
  distance_km NUMERIC(8,2),
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
  notes TEXT,
  coach_reviewed BOOLEAN DEFAULT FALSE,
  coach_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.12 `wellness_checkins`

Sporcuların günlük readiness / wellness girişlerini tutar.

Aynı sporcu için aynı gün tek kayıt önerilir.

"""sql
CREATE TABLE wellness_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source data_source DEFAULT 'manual',

  sleep_hours NUMERIC(4,2),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  energy_score INTEGER CHECK (energy_score BETWEEN 1 AND 10),
  soreness_score INTEGER CHECK (soreness_score BETWEEN 1 AND 10),
  stress_score INTEGER CHECK (stress_score BETWEEN 1 AND 10),
  motivation_score INTEGER CHECK (motivation_score BETWEEN 1 AND 10),
  readiness_score INTEGER CHECK (readiness_score BETWEEN 0 AND 100),

  pain_reported BOOLEAN DEFAULT FALSE,
  pain_area VARCHAR(100),
  illness_symptoms BOOLEAN DEFAULT FALSE,
  notes TEXT,

  ai_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (athlete_id, checkin_date)
);
"""

---

# 5.13 `nutrition_logs`

Sporcuların günlük beslenme ve su takibini tutar.

Bu tablo medikal diyet planı değil, alışkanlık ve uyum takibi içindir.

"""sql
CREATE TABLE nutrition_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,

  water_ml INTEGER DEFAULT 0,
  target_water_ml INTEGER,
  breakfast_logged BOOLEAN DEFAULT FALSE,
  lunch_logged BOOLEAN DEFAULT FALSE,
  dinner_logged BOOLEAN DEFAULT FALSE,
  snack_logged BOOLEAN DEFAULT FALSE,
  pre_training_meal BOOLEAN,
  post_training_meal BOOLEAN,
  protein_goal_met BOOLEAN,
  carb_goal_met BOOLEAN,

  athlete_notes TEXT,
  nutritionist_notes TEXT,
  ai_summary TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (athlete_id, log_date)
);
"""

---

# 5.14 `wearable_connections`

Sporcunun Strava, Garmin, Apple Health, Health Connect gibi bağlantılarını tutar.

Token alanları şifreli saklanmalıdır.

"""sql
CREATE TABLE wearable_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  provider wearable_provider NOT NULL,

  provider_user_id VARCHAR(255),
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],

  is_active BOOLEAN DEFAULT TRUE,
  last_synced_at TIMESTAMPTZ,
  sync_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (athlete_id, provider)
);
"""

---

# 5.15 `wearable_daily_summaries`

Akıllı saat veya manuel kaynaklardan günlük özet metrikleri tutar.

"""sql
CREATE TABLE wearable_daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  provider wearable_provider NOT NULL,
  summary_date DATE NOT NULL,

  steps INTEGER,
  active_minutes INTEGER,
  distance_km NUMERIC(8,2),
  calories INTEGER,

  resting_heart_rate INTEGER,
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  hrv NUMERIC(8,2),
  sleep_hours NUMERIC(4,2),
  sleep_score INTEGER CHECK (sleep_score BETWEEN 0 AND 100),
  stress_score INTEGER CHECK (stress_score BETWEEN 0 AND 100),

  raw_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (athlete_id, provider, summary_date)
);
"""

---

# 5.16 `wearable_activities`

Koşu, bisiklet, antrenman, maç dışı aktivite gibi wearable aktivitelerini tutar.

"""sql
CREATE TABLE wearable_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  provider wearable_provider NOT NULL,

  provider_activity_id VARCHAR(255),
  activity_type VARCHAR(100),
  title VARCHAR(255),
  started_at TIMESTAMPTZ,
  duration_sec INTEGER,
  distance_km NUMERIC(8,2),
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  calories INTEGER,
  elevation_gain_m NUMERIC(8,2),

  matched_personal_training_id UUID,
  matched_session_id UUID,

  raw_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (provider, provider_activity_id)
);
"""

---

# 5.17 `session_files`

Session'a yüklenen PDF, CSV, rapor veya destekleyici dokümanları tutar.

"""sql
CREATE TABLE session_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,

  uploaded_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  file_type media_type NOT NULL,
  file_name VARCHAR(255),
  file_url TEXT NOT NULL,
  storage_path TEXT,
  mime_type VARCHAR(100),
  file_size_bytes BIGINT,
  duration_sec INTEGER,

  processing_status processing_status DEFAULT 'pending',
  processing_error TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.18 `session_file_summaries`

İçe aktarılan dosyalardan çıkarılan özet parçalarını tutar.

"""sql
CREATE TABLE session_file_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES session_files(id) ON DELETE CASCADE,

  summary_text TEXT NOT NULL,
  storage_path TEXT,
  timestamp_sec INTEGER,
  chunk_index INTEGER,

  ai_caption TEXT,
  ai_detected_context JSONB DEFAULT '{}'::jsonb,
  selected_for_analysis BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.19 `ai_reports`

AI tarafından oluşturulan raporları tutar.

Session analizi, oyuncu gelişimi, haftalık takım raporu, load raporu gibi farklı rapor türleri burada saklanır.

"""sql
CREATE TABLE ai_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,

  report_type ai_report_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  confidence_score NUMERIC(4,2),

  model_provider VARCHAR(100),
  model_name VARCHAR(100),
  prompt_version VARCHAR(50),

  tactical_observations JSONB DEFAULT '[]'::jsonb,
  athlete_observations JSONB DEFAULT '[]'::jsonb,
  load_observations JSONB DEFAULT '[]'::jsonb,
  nutrition_observations JSONB DEFAULT '[]'::jsonb,
  risk_alerts JSONB DEFAULT '[]'::jsonb,
  recommended_drills JSONB DEFAULT '[]'::jsonb,
  next_training_plan JSONB DEFAULT '{}'::jsonb,

  raw_input JSONB DEFAULT '{}'::jsonb,
  raw_output JSONB DEFAULT '{}'::jsonb,

  created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.20 `athlete_observations`

AI veya koç tarafından oluşturulan sporcu bazlı gözlemleri tutar.

"""sql
CREATE TABLE athlete_observations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  athlete_id UUID NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  ai_report_id UUID REFERENCES ai_reports(id) ON DELETE SET NULL,

  source data_source DEFAULT 'manual',
  category VARCHAR(100),
  severity VARCHAR(50),
  title VARCHAR(255),
  observation TEXT NOT NULL,
  recommendation TEXT,

  is_resolved BOOLEAN DEFAULT FALSE,
  created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.21 `team_patterns`

Tekrarlayan takım problemleri veya gelişim alanları.

Örnek:

- Geçiş savunması gecikiyor
- Orta saha ve savunma arası açılıyor
- Maç sonu enerji düşüyor
- Pres tetikleyicileri geç çalışıyor

"""sql
CREATE TABLE team_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,

  pattern_type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(50),
  occurrence_count INTEGER DEFAULT 1,

  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',

  related_ai_report_id UUID REFERENCES ai_reports(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.22 `drills`

Antrenman drill kütüphanesi.

"""sql
CREATE TABLE drills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,

  sport_type sport_type NOT NULL DEFAULT 'football',
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  objective TEXT,

  duration_min INTEGER,
  difficulty VARCHAR(50),
  player_count_min INTEGER,
  player_count_max INTEGER,
  area_setup TEXT,
  equipment TEXT,
  instructions TEXT,
  coaching_points TEXT,
  tags TEXT[],

  is_system_drill BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.23 `training_plans`

AI veya koç tarafından oluşturulan antrenman planları.

"""sql
CREATE TABLE training_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,

  title VARCHAR(255) NOT NULL,
  objective TEXT,
  duration_min INTEGER,
  intensity INTEGER CHECK (intensity BETWEEN 1 AND 10),
  plan_blocks JSONB DEFAULT '[]'::jsonb,
  generated_by_ai BOOLEAN DEFAULT FALSE,
  ai_report_id UUID REFERENCES ai_reports(id) ON DELETE SET NULL,

  created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.24 `performance_goals`

Takım veya sporcu hedeflerini tutar.

"""sql
CREATE TABLE performance_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES athletes(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  target_value NUMERIC(10,2),
  current_value NUMERIC(10,2),
  unit VARCHAR(50),
  start_date DATE,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'active',

  created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.25 `documents`

RAG / Team Memory için ana doküman tablosudur.

Her AI raporu, koç notu, session özeti veya sporcu gözlemi buraya yazılabilir.

"""sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  ai_report_id UUID REFERENCES ai_reports(id) ON DELETE SET NULL,

  type document_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.26 `document_embeddings`

pgvector ile semantic search için kullanılır.

Embedding boyutu kullanılan modele göre değişebilir. Örnek olarak 1536 kullanılmıştır.

"""sql
CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,

  chunk_index INTEGER NOT NULL,
  content_chunk TEXT NOT NULL,
  embedding VECTOR(1536),

  created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.27 `assistant_threads`

Team Memory Assistant konuşmalarını tutar.

"""sql
CREATE TABLE assistant_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,

  title VARCHAR(255),
  created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.28 `assistant_messages`

Assistant konuşma mesajları.

"""sql
CREATE TABLE assistant_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID NOT NULL REFERENCES assistant_threads(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  retrieved_document_ids UUID[],
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.29 `reports`

PDF veya paylaşılabilir rapor kayıtları.

"""sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  athlete_id UUID REFERENCES athletes(id) ON DELETE SET NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  ai_report_id UUID REFERENCES ai_reports(id) ON DELETE SET NULL,

  title VARCHAR(255) NOT NULL,
  report_type VARCHAR(100),
  file_url TEXT,
  share_token TEXT UNIQUE,
  is_public BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,

  created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.30 `api_keys`

Self-host veya organizasyon bazlı provider key yönetimi.

Managed SaaS ortamında genelde sistem key’leri kullanılır. Self-host ortamda organizasyon kendi key’lerini girebilir.

"""sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  provider VARCHAR(100) NOT NULL,
  encrypted_key TEXT NOT NULL,
  label VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_by VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

# 5.31 `billing_entitlements`

Plan limitleri ve özellik erişimlerini cachelemek için kullanılır.

Clerk Billing webhook’larından sonra güncellenebilir.

"""sql
CREATE TABLE billing_entitlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  plan subscription_tier NOT NULL DEFAULT 'free',
  max_teams INTEGER,
  max_athletes INTEGER,
  max_staff INTEGER,
  max_sessions_per_month INTEGER,
  max_ai_reports_per_month INTEGER,
  advanced_ai_analysis_enabled BOOLEAN DEFAULT FALSE,
  wearable_enabled BOOLEAN DEFAULT FALSE,
  team_memory_enabled BOOLEAN DEFAULT FALSE,
  branded_reports_enabled BOOLEAN DEFAULT FALSE,

  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (organization_id)
);
"""

---

# 5.32 `audit_logs`

Özellikle Club / Enterprise / Self-host için önemli olayları tutar.

"""sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,

  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  ip_address VARCHAR(100),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
"""

---

## 6. Supabase Storage Buckets

Önerilen bucket yapısı:

| Bucket | Public | Amaç |
|---|---:|---|
| `avatars` | true | Kullanıcı / sporcu avatarları |
| `organization-logos` | true | Kulüp logoları |
| `session-files` | false | PDF, CSV, rapor ve doküman |
| `session-file-summaries` | false | Dosyalardan çıkarılan özet parçaları |
| `reports` | false | PDF raporlar |
| `imports` | false | CSV import dosyaları |

"""sql
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', true),
  ('organization-logos', 'organization-logos', true),
  ('session-files', 'session-files', false),
  ('session-file-summaries', 'session-file-summaries', false),
  ('reports', 'reports', false),
  ('imports', 'imports', false)
ON CONFLICT (id) DO NOTHING;
"""

---

## 7. Index Stratejisi

Performans için kritik index’ler:

"""sql
CREATE INDEX idx_organizations_slug ON organizations(slug);

CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);

CREATE INDEX idx_teams_org ON teams(organization_id);

CREATE INDEX idx_athletes_org ON athletes(organization_id);
CREATE INDEX idx_athletes_team ON athletes(team_id);
CREATE INDEX idx_athletes_user ON athletes(user_id);

CREATE INDEX idx_sessions_org ON sessions(organization_id);
CREATE INDEX idx_sessions_team ON sessions(team_id);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);

CREATE INDEX idx_attendance_session ON session_attendance(session_id);
CREATE INDEX idx_attendance_athlete ON session_attendance(athlete_id);

CREATE INDEX idx_checkins_athlete_date ON wellness_checkins(athlete_id, checkin_date);
CREATE INDEX idx_nutrition_athlete_date ON nutrition_logs(athlete_id, log_date);

CREATE INDEX idx_wearable_summary_athlete_date ON wearable_daily_summaries(athlete_id, summary_date);
CREATE INDEX idx_wearable_activities_athlete_started ON wearable_activities(athlete_id, started_at);

CREATE INDEX idx_ai_reports_org ON ai_reports(organization_id);
CREATE INDEX idx_ai_reports_team ON ai_reports(team_id);
CREATE INDEX idx_ai_reports_session ON ai_reports(session_id);

CREATE INDEX idx_documents_org ON documents(organization_id);
CREATE INDEX idx_documents_team ON documents(team_id);
CREATE INDEX idx_documents_athlete ON documents(athlete_id);

CREATE INDEX idx_embeddings_org ON document_embeddings(organization_id);
CREATE INDEX idx_embeddings_team ON document_embeddings(team_id);

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
"""

Vector search için:

"""sql
CREATE INDEX idx_document_embeddings_vector
ON document_embeddings
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
"""

---

## 8. RLS Yardımcı Fonksiyonları

RLS politikalarını okunabilir hale getirmek için helper function önerilir.

### 8.1 Current User ID

"""sql
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS TEXT AS $$
  SELECT request.jwt.claim('sub')::text;
$$ LANGUAGE sql STABLE;
"""

### 8.2 Organizasyon Üyesi mi?

"""sql
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE organization_id = org_id
      AND user_id = current_user_id()
      AND is_active = true
  );
$$ LANGUAGE sql STABLE;
"""

### 8.3 Organizasyon Rolü Var mı?

"""sql
CREATE OR REPLACE FUNCTION has_org_role(org_id UUID, allowed_roles organization_role[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM organization_members
    WHERE organization_id = org_id
      AND user_id = current_user_id()
      AND role = ANY(allowed_roles)
      AND is_active = true
  );
$$ LANGUAGE sql STABLE;
"""

### 8.4 Takım Staff Üyesi mi?

"""sql
CREATE OR REPLACE FUNCTION is_team_staff(team_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM team_staff
    WHERE team_id = team_uuid
      AND user_id = current_user_id()
  );
$$ LANGUAGE sql STABLE;
"""

### 8.5 Sporcu Kendi Profili mi?

"""sql
CREATE OR REPLACE FUNCTION is_athlete_self(athlete_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM athletes
    WHERE id = athlete_uuid
      AND user_id = current_user_id()
  );
$$ LANGUAGE sql STABLE;
"""

---

## 9. RLS Aktivasyonu

"""sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellness_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_daily_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_file_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE athlete_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
"""

---

## 10. Temel RLS Politikaları

Bu bölüm örnek çekirdek politikaları içerir. Üretimde role göre daha ayrıntılı ayrım yapılmalıdır.

---

### 10.1 `users`

Kullanıcı kendi profilini görebilir ve güncelleyebilir.

"""sql
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (id = current_user_id());

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (id = current_user_id());

CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (id = current_user_id());
"""

---

### 10.2 `organizations`

Üye olduğu organizasyonları görebilir.

Owner ve admin organizasyonu güncelleyebilir.

"""sql
CREATE POLICY "Members can view organizations"
ON organizations FOR SELECT
USING (is_org_member(id));

CREATE POLICY "Owners and admins can update organizations"
ON organizations FOR UPDATE
USING (has_org_role(id, ARRAY['owner','admin']::organization_role[]));

CREATE POLICY "Authenticated users can create organizations"
ON organizations FOR INSERT
WITH CHECK (created_by = current_user_id());
"""

---

### 10.3 `organization_members`

Organizasyon üyeleri üyelikleri görebilir. Owner/admin yönetebilir.

"""sql
CREATE POLICY "Members can view organization members"
ON organization_members FOR SELECT
USING (is_org_member(organization_id));

CREATE POLICY "Owners and admins can manage organization members"
ON organization_members FOR ALL
USING (has_org_role(organization_id, ARRAY['owner','admin']::organization_role[]));
"""

---

### 10.4 `teams`

Organizasyon üyeleri takımları görebilir. Owner/admin/head coach yönetebilir.

"""sql
CREATE POLICY "Org members can view teams"
ON teams FOR SELECT
USING (is_org_member(organization_id));

CREATE POLICY "Coaches can manage teams"
ON teams FOR ALL
USING (
  has_org_role(
    organization_id,
    ARRAY['owner','admin','head_coach']::organization_role[]
  )
);
"""

---

### 10.5 `athletes`

Takım staff’ı sporcuları görebilir. Sporcu kendi profilini görebilir.

"""sql
CREATE POLICY "Team staff and athlete can view athletes"
ON athletes FOR SELECT
USING (
  is_org_member(organization_id)
  OR is_athlete_self(id)
);

CREATE POLICY "Coaches can manage athletes"
ON athletes FOR ALL
USING (
  has_org_role(
    organization_id,
    ARRAY['owner','admin','head_coach','assistant_coach']::organization_role[]
  )
);
"""

---

### 10.6 `wellness_checkins`

Sporcu kendi check-in’ini yönetebilir. Yetkili staff görebilir.

"""sql
CREATE POLICY "Athlete can manage own checkins"
ON wellness_checkins FOR ALL
USING (is_athlete_self(athlete_id));

CREATE POLICY "Team staff can view checkins"
ON wellness_checkins FOR SELECT
USING (
  has_org_role(
    organization_id,
    ARRAY[
      'owner',
      'admin',
      'head_coach',
      'assistant_coach',
      'physiotherapist'
    ]::organization_role[]
  )
);
"""

---

### 10.7 `nutrition_logs`

Sporcu kendi beslenme kaydını yönetebilir. Nutritionist ve koçlar görebilir.

"""sql
CREATE POLICY "Athlete can manage own nutrition logs"
ON nutrition_logs FOR ALL
USING (is_athlete_self(athlete_id));

CREATE POLICY "Nutrition staff can view nutrition logs"
ON nutrition_logs FOR SELECT
USING (
  has_org_role(
    organization_id,
    ARRAY[
      'owner',
      'admin',
      'head_coach',
      'nutritionist'
    ]::organization_role[]
  )
);
"""

---

### 10.8 `wearable_connections`

Sporcu kendi wearable bağlantısını yönetebilir. Token değerleri uygulama katmanında asla frontend’e ham dönmemelidir.

"""sql
CREATE POLICY "Athlete can manage own wearable connections"
ON wearable_connections FOR ALL
USING (is_athlete_self(athlete_id));

CREATE POLICY "Admins can view wearable connection metadata"
ON wearable_connections FOR SELECT
USING (
  has_org_role(
    organization_id,
    ARRAY['owner','admin']::organization_role[]
  )
);
"""

---

### 10.9 `sessions`

Organizasyon üyeleri session’ları görebilir. Koçlar yönetebilir.

"""sql
CREATE POLICY "Org members can view sessions"
ON sessions FOR SELECT
USING (is_org_member(organization_id));

CREATE POLICY "Coaches can manage sessions"
ON sessions FOR ALL
USING (
  has_org_role(
    organization_id,
    ARRAY['owner','admin','head_coach','assistant_coach']::organization_role[]
  )
);
"""

---

### 10.10 `ai_reports`

Yetkili organizasyon üyeleri AI raporlarını görebilir. Rapor oluşturma server action üzerinden yapılmalıdır.

"""sql
CREATE POLICY "Org members can view ai reports"
ON ai_reports FOR SELECT
USING (is_org_member(organization_id));

CREATE POLICY "Coaches and analysts can manage ai reports"
ON ai_reports FOR ALL
USING (
  has_org_role(
    organization_id,
    ARRAY['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]
  )
);
"""

---

### 10.11 `documents` ve `document_embeddings`

Team Memory verileri organizasyon içinde izole edilir.

"""sql
CREATE POLICY "Org members can view documents"
ON documents FOR SELECT
USING (is_org_member(organization_id));

CREATE POLICY "Coaches and analysts can manage documents"
ON documents FOR ALL
USING (
  has_org_role(
    organization_id,
    ARRAY['owner','admin','head_coach','assistant_coach','analyst']::organization_role[]
  )
);

CREATE POLICY "Org members can view embeddings"
ON document_embeddings FOR SELECT
USING (is_org_member(organization_id));

CREATE POLICY "System roles can manage embeddings"
ON document_embeddings FOR ALL
USING (
  has_org_role(
    organization_id,
    ARRAY['owner','admin','head_coach','analyst']::organization_role[]
  )
);
"""

---

### 10.12 `api_keys`

API key’ler çok hassastır. Sadece owner/admin erişmelidir.

"""sql
CREATE POLICY "Owners and admins can manage api keys"
ON api_keys FOR ALL
USING (
  has_org_role(
    organization_id,
    ARRAY['owner','admin']::organization_role[]
  )
);
"""

---

## 11. Storage RLS Yaklaşımı

Storage dosya yolları organizasyon bazlı olmalıdır.

Önerilen path yapısı:

"""text
avatars/{user_id}/avatar.png
organization-logos/{organization_id}/logo.png
session-files/{organization_id}/{team_id}/{session_id}/{file_name}
session-file-summaries/{organization_id}/{team_id}/{session_id}/{summary_id}.json
reports/{organization_id}/{report_id}.pdf
imports/{organization_id}/{import_id}.csv
"""

Örnek policy:

"""sql
CREATE POLICY "Organization members can read session files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'session-files'
);

CREATE POLICY "Authenticated users can upload session files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'session-files'
);
"""

Not: Supabase Storage policy tarafında path bazlı organization check yapmak için ek helper fonksiyonlar ve signed URL stratejisi önerilir.

---

## 12. AI / RAG Veri Akışı

### 12.1 Session Analysis Akışı

"""text
Session oluşturulur
→ Koç notu, CSV veya geçmiş rapor eklenir
→ Dosya parse edilir veya özetlenir
→ Koç notu + takım profili + sporcu listesi + check-in/akıllı saat özeti + geçmiş pattern context alınır
→ AI structured JSON rapor üretir
→ ai_reports tablosuna yazılır
→ athlete_observations ve team_patterns güncellenir
→ documents tablosuna hafıza kaydı eklenir
→ document_embeddings oluşturulur
"""

### 12.2 Team Memory Sorgu Akışı

"""text
Antrenör soru sorar
→ Soru embedding’e çevrilir
→ document_embeddings üzerinden semantic search yapılır
→ En alakalı doküman chunk’ları alınır
→ LLM’e context olarak verilir
→ Cevap assistant_messages içine yazılır
"""

Örnek SQL semantic search:

"""sql
SELECT
  de.content_chunk,
  d.title,
  d.type,
  1 - (de.embedding <=> query_embedding) AS similarity
FROM document_embeddings de
JOIN documents d ON d.id = de.document_id
WHERE de.organization_id = :organization_id
  AND (:team_id IS NULL OR de.team_id = :team_id)
ORDER BY de.embedding <=> query_embedding
LIMIT 8;
"""

---

## 13. Plan Limitleri ve Feature Gate

Plan limitleri `billing_entitlements` tablosundan okunur.

Örnek feature gate:

"""text
Free:
- max_teams = 1
- max_athletes = 10
- max_sessions_per_month = 3
- advanced_ai_analysis_enabled = false
- wearable_enabled = false
- team_memory_enabled = false

Coach Pro:
- max_teams = 3
- max_athletes = 50
- max_sessions_per_month = 30
- advanced_ai_analysis_enabled = true
- wearable_enabled = true
- team_memory_enabled = true

Club:
- max_teams = unlimited
- max_athletes = unlimited
- max_staff = unlimited
- advanced_ai_analysis_enabled = true
- wearable_enabled = true
- team_memory_enabled = true
- branded_reports_enabled = true
"""

Server action’lar işlem öncesi entitlement kontrolü yapmalıdır.

---

## 14. Veri Gizliliği ve Güvenlik Notları

### 14.1 Token Güvenliği

`wearable_connections` ve `api_keys` tablolarındaki token/key alanları şifreli tutulmalıdır.

Şifreleme önerisi:

"""text
AES-256-GCM
ENCRYPTION_KEY environment variable
Decryption sadece server-side
Frontend’e token dönülmez
"""

### 14.2 AI Kullanım Sınırı

Wearable verileri model eğitimi için kullanılmamalıdır. Sistem bu verileri yalnızca kullanıcının kendi organizasyon bağlamında analiz ve öneri üretmek için kullanmalıdır.

### 14.3 Medikal Sınır

`wellness_checkins`, `nutrition_logs`, `wearable_daily_summaries` gibi tablolar performans ve refah takibi içindir. Tıbbi teşhis amacı taşımaz.

### 14.4 Çocuk Sporcular

Altyapı sporcuları için veli onayı, veri saklama politikası ve paylaşım izinleri roadmap kapsamında ayrıca ele alınmalıdır.

---

## 15. Seed Data Önerisi

Hackathon demo için önerilen seed yapısı:

"""text
Organization:
- Ankara Gençler Spor Akademisi

Teams:
- U17 Football Team

Athletes:
- 12 demo oyuncu
- 3 wearable connected
- 9 manual tracking

Sessions:
- 2 geçmiş antrenman
- 1 yeni analiz edilecek session

Documents:
- 2 geçmiş AI raporu
- 3 koç notu
- 5 oyuncu gözlemi
- 6 drill

Wearable:
- 7 günlük demo daily summary
- 5 demo activity

AI:
- 1 session analysis report
- 1 team memory assistant thread
"""

---

## 16. MVP İçin Minimum Tablo Seti

Hackathon’da tüm şema uygulanmak zorunda değildir. Minimum çalışan MVP için şu tablolar yeterlidir:

"""text
users
organizations
organization_members
teams
athletes
athlete_invites
sessions
session_attendance
personal_trainings
wellness_checkins
nutrition_logs
session_files
session_file_summaries
ai_reports
athlete_observations
team_patterns
drills
documents
document_embeddings
assistant_threads
assistant_messages
billing_entitlements
api_keys
"""

Wearable tabloları MVP’de CSV demo veya mock veriyle sonradan eklenebilir:

"""text
wearable_connections
wearable_daily_summaries
wearable_activities
"""

---

## 17. Silinen / Eski Modüller

Bu v3.0 şemasında aşağıdaki eski OhHike modülleri çekirdekten çıkarılmıştır:

"""text
routes
scavenger_hunts
route_snapshots
user_badges
public community routes
map-based exploration
gamified POI discovery
"""

Bunlar ileride ayrı bir modül olarak geri gelebilir, ancak CoachOS çekirdeğinde yer almaz.

---

## 18. Nihai Veri Modeli Özeti

OhHike CoachOS veri modeli şu ana fikre dayanır:

"""text
Organization
→ Team
→ Athlete
→ Session
→ Attendance / Check-in / Training / Nutrition / Wearable
→ AI Reports
→ Documents
→ Embeddings
→ Team Memory
"""

Bu model sayesinde sistem:

- Koçun takımı yönetmesini sağlar.
- Sporcuların veri girmesini sağlar.
- Akıllı saatleri opsiyonel veri kaynağı olarak kullanır.
- Session dosyalarını, koç notlarını ve veri analizlerini session'a bağlar.
- AI raporlarını kalıcı hale getirir.
- RAG ile takım hafızası oluşturur.
- SaaS ve self-host kullanımını destekler.