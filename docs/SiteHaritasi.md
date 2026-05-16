# OhHike CoachOS - Site Haritası ve Sayfa Hiyerarşisi v3.0

## 0. Doküman Durumu

**Doküman adı:** OhHike CoachOS Sitemap  
**Versiyon:** v3.0  
**Ürün tipi:** SaaS + Open Source / Self-host  
**Ana domain:** `ohhike.com`  
**Uygulama domain:** `app.ohhike.com`  
**Ana kullanıcı rolleri:** Coach, Athlete, Admin, Analyst, Physiotherapist, Nutritionist, Viewer  
**Ana navigasyon modeli:** Role-based dashboard + organization/team context  
**Eski yapıdan farkı:** Harita, rota, scavenger hunt ve community keşif yapısı çıkarılmıştır. Yeni yapı spor takımı operasyonu ve AI koç zekâsı üzerine kuruludur.

---

## 1. Genel Routing Yaklaşımı

OhHike CoachOS iki ana alan üzerinden çalışır:

"""text
ohhike.com
→ Public marketing website
→ SEO, ürün anlatımı, pricing, docs, open-source/self-host mesajı

app.ohhike.com
→ Auth protected SaaS app
→ Coach dashboard, athlete dashboard, teams, sessions, AI reports, memory, settings
"""

Self-host kurulumlarda domain kullanıcıya bağlıdır:

"""text
localhost:3000
coachos.yourclub.com
ohhike.internal
"""

Self-host ortamda marketing sayfaları opsiyonel olabilir. Sistem doğrudan setup ve app dashboard ile başlayabilir.

---

## 2. Route Grupları

Next.js App Router için önerilen route grupları:

"""text
app/
├── (marketing)/
├── (auth)/
├── (setup)/
├── (app)/
├── (athlete)/
├── (admin)/
└── api/
"""

### 2.1 `(marketing)`

Public web sitesi.

### 2.2 `(auth)`

Clerk sign-in / sign-up sayfaları.

### 2.3 `(setup)`

Self-host ilk kurulum ekranları.

### 2.4 `(app)`

Antrenör, staff ve kulüp kullanıcılarının ana uygulama alanı.

### 2.5 `(athlete)`

Sporcu dashboard ve sporcu odaklı mobil öncelikli alan.

### 2.6 `(admin)`

Organization owner/admin ayarları, billing, staff, API key, audit log.

### 2.7 `api`

Webhook, AI, files, akıllı saat, reports ve import endpointleri.

---

## 3. Public / Marketing Site

Public sayfalar SEO’ya açık, auth gerektirmeyen ve ürünün SaaS + self-host değer önerisini anlatan sayfalardır.

---

## 3.0 Public Web Durumu ve Hedef Harita

Bu bölüm `apps/web` için mevcut kod durumunu, hedef public site yapısını ve navigasyon sözleşmesini ayrı ayrı tanımlar.

### 3.0.1 Mevcut Kod Durumu

`apps/web` içinde bugün gerçekten bulunan public route’lar:

| Route | Durum | Not |
|---|---|---|
| `/` | Var | Landing page |
| `/features` | Var | Genel ürün yetenekleri |
| `/pricing` | Var | Takım bazlı güncel pricing |
| `/docs` | Var | Genel dokümantasyon giriş sayfası |
| `/about` | Var | Marka ve kurucu hikayesi |
| `/community` | Var | Mock community etkinliği |
| `/blog` | Var | Mock blog liste sayfası |
| `/blog/[slug]` | Var | Mock blog detay sayfası |
| `/self-host` | Var | Self-host ürün anlatımı |
| `/docs/self-host` | Var | Docs ağacı altında self-host rehberi |
| `/security` | Var | Güven/trust sayfası |
| `/contact` | Var | İletişim sayfası |
| `/privacy` | Var | Gizlilik politikası |
| `/terms` | Var | Kullanım şartları |

Hedef haritada olup henüz route’u bulunmayan public sayfalar:

| Route | Bugünkü durum |
|---|---|
| `/roadmap` | Eksik |
| `/features/coach-dashboard` | Eksik |
| `/features/check-ins` | Eksik |
| `/features/team-memory` | Eksik |
| `/features/ai-reports` | Eksik |
| `/docs/integrations` | Eksik |

### 3.0.2 Hedef Public Web Haritası

`apps/web` için önerilen nihai public route ağacı:

```text
/
├── /features
│   ├── /features/coach-dashboard
│   ├── /features/check-ins
│   ├── /features/team-memory
│   ├── /features/ai-reports
│   ├── /features/training-planner
│   └── /features/wearables
│
├── /pricing
├── /self-host
├── /open-source
├── /roadmap
│
├── /docs
│   ├── /docs/self-host
│   ├── /docs/integrations
│   ├── /docs/api-keys
│   ├── /docs/deployment
│   └── /docs/troubleshooting
│
├── /security
├── /privacy
├── /terms
├── /contact
│
├── /about
├── /blog
│   └── /blog/[slug]
└── /community
```

### 3.0.3 Öncelik Sırası

#### Faz 1 - Güvenilir Public Site

Tamamlanan çekirdek sayfalar:

1. `/self-host`
2. `/docs`
3. `/docs/self-host`
4. `/security`
5. `/privacy`
6. `/terms`
7. `/contact`

Bu faz sonunda public site temel ürün anlatımı, self-host açıklaması ve güven/yasal katmanlarıyla eksiksiz çalışır hale gelir.

#### Faz 2 - Ürün Anlatımını Derinleştirme

1. `/open-source`
2. `/docs/integrations`
3. `/roadmap`
4. `/features/coach-dashboard`
5. `/features/check-ins`
6. `/features/team-memory`
7. `/features/ai-reports`

#### Faz 3 - İçerik ve SEO Genişlemesi

1. `/features/training-planner`
2. `/features/wearables`
3. `/docs/api-keys`
4. `/docs/deployment`
5. `/docs/troubleshooting`
6. Blog ve community içeriklerinin gerçek içerik sistemine taşınması

### 3.0.4 Navigasyon Sözleşmesi

Navbar ve footer yalnızca şu route tiplerine link vermelidir:

1. Kod tabanında bugün gerçekten var olan route’lar
2. Aynı geliştirme fazı içinde tamamlanacak route’lar
3. Harici olarak gerçekten yayında olan bağlantılar

Henüz oluşturulmamış sayfalara navigasyondan link verilmez. Böylece kullanıcıya 404 üreten boş yollar gösterilmez.

### 3.0.5 Önerilen Navbar Yapısı

Faz 1 tamamlandıktan sonra önerilen ana navbar:

```text
Home
Features
Pricing
Deployment
  - Self-host
  - Docs
Community
  - Community
  - Blog
About
Get Started
```

Üst navigasyonda iki dropdown kullanılır:

```text
Deployment
- Self-host
- Docs

Community
- Community
- Blog
```

`Self-host Docs` üst navigasyona ayrıca eklenmez; ileride `Docs` bilgi mimarisinin bir alt sayfasıdır. `Security` güven katmanıdır ve footer içinde kalır.

### 3.0.6 Önerilen Footer Yapısı

```text
Product
- Features
- Pricing
- Self-host

Docs
- Documentation

Company
- About
- Contact
- Privacy
- Terms

Resources
- Blog
- Community
- Security
- GitHub
```

Eksik route’lar tamamlanana kadar footer yalnızca mevcut veya aynı faz içinde tamamlanan sayfalara link vermelidir.

### 3.0.7 Public Web Sayfa Aileleri

`apps/web` içinde her sayfa aynı layout şablonunu kullanmaz. Sayfa amacı değiştikçe bilgi yoğunluğu, hero boyutu, görsel kullanım ve container yapısı da değişir.

#### 1. Marketing Pages

Örnek route’lar:

- `/`
- `/features`
- `/pricing`
- `/self-host`
- ileride `/open-source`

Amaç:

- Ürün vaadini anlatmak
- Kullanıcıyı özellik, fiyat veya kurulum kararına yaklaştırmak
- Marka görsellerini ve maskotu kontrollü şekilde kullanmak

Tasarım kuralları:

- İlk viewport güçlü bir hero taşıyabilir.
- Hero yalnızca metin bloğu değil; sahne, ürün hissi veya konuyla ilgili güçlü görsel bağlam içermelidir.
- Ana içerik `max-w-7xl` ritminde ilerler.
- Sayfa section’ları tek tip kart yığınına dönüşmez; tam genişlik band, grid, karşılaştırma veya framed tool düzenleri bağlama göre seçilir.
- CTA’lar görünürdür ama her section CTA ile boğulmaz.

Mevcut referanslar:

- Landing hero ve section ritmi
- `/features` içindeki büyük hero + tekrar eden feature shell yapısı
- `/pricing` içindeki tek sayfa yoğunlaştırılmış pricing kompozisyonu

#### 2. Docs Pages

Örnek route’lar:

- `/docs`
- `/docs/self-host`
- ileride `/docs/integrations`
- ileride `/docs/api-keys`
- ileride `/docs/deployment`
- ileride `/docs/troubleshooting`

Amaç:

- Kullanıcıyı konu başlıkları arasında gezdirmek
- Teknik bilgiyi okunabilir ve sürdürülebilir şekilde sunmak
- Self-host, deployment ve entegrasyon içeriklerini tek bir dokümantasyon ağacında toplamak

Tasarım kuralları:

- `Docs`, üst navigasyondaki tek giriş noktasıdır.
- `/docs/self-host` gibi route’lar docs ağacının alt sayfalarıdır; üst navigasyonda bağımsız ürün sayfası gibi görünmez.
- Landing-style full-screen hero kullanılmaz.
- Ana layout içerik odaklıdır: docs sidebar / bölüm navigasyonu + dar okuma kolonu + gerektiğinde sağ içindekiler sütunu.
- Uzun metin, liste, tablo ve kod blokları için rahat okuma genişliği korunur.
- Dokümantasyon sayfaları pazarlama kartlarıyla değil, bilgi mimarisiyle yönlendirilir.

#### 3. Trust / Legal Pages

Örnek route’lar:

- `/security`
- `/privacy`
- `/terms`

Amaç:

- Güven, veri işleme ve yasal sınırları açıkça anlatmak
- Kullanıcıya satış yapmak değil, netlik vermek

Tasarım kuralları:

- Navbar’da yer almaz; footer’dan erişilir.
- Full-screen marketing hero kullanılmaz.
- Kompakt page header + uzun okuma alanı kullanılır.
- Genişlik tercihi `max-w-4xl` veya `max-w-5xl` aralığıdır.
- Başlık hiyerarşisi sade, ton ciddi ve metin odaklıdır.
- Gerekirse kısa callout blokları kullanılır; tekrarlı feature card grid’leri kullanılmaz.

#### 4. Company / Content Pages

Örnek route’lar:

- `/about`
- `/contact`
- `/blog`
- `/community`

Amaç:

- Marka, ekip, iletişim ve içerik deneyimlerini taşımak

Tasarım kuralları:

- Sayfa bağlamına göre özgün kompozisyon seçilir.
- `/about` hikaye odaklı olabilir.
- `/contact` form veya yönlendirme odaklıdır.
- `/blog` içerik grid’i kullanabilir.
- `/community` etkinlik veya katılım odaklı bloklar kullanabilir.
- Bu grup için tek zorunlu layout yoktur; marka dili korunur ama sayfa tipi kendi işini yapar.

### 3.0.8 Public Web Layout Kuralları

#### Container sistemi

| Kullanım | Önerilen genişlik |
|---|---|
| Marketing hero / geniş section | `max-w-6xl` veya `max-w-7xl` |
| Marketing içerik section’ları | `max-w-7xl` |
| Docs okuma alanı | ana kolon yaklaşık `max-w-3xl`, shell daha geniş olabilir |
| Legal / trust içerik | `max-w-4xl` veya `max-w-5xl` |
| Blog / community grid | `max-w-7xl` |

#### Hero sistemi

- Marketing hero yalnızca ürün anlatımı için kullanılır.
- Docs, legal ve trust sayfaları aynı full-screen hero kalıbını tekrar etmez.
- Her sayfa ailesi aynı yüksekliği, aynı background overlay’i ve aynı kart grid’ini kullanmak zorunda değildir.
- Hero metni ile sayfanın geri kalanı arasında görsel bağlam farkı olmalıdır; tüm sayfalar birbirinin varyasyonu gibi görünmemelidir.

#### Kart kullanımı

- Kartlar yalnızca gerçekten çerçevelenmesi gereken tekrar eden öğeler için kullanılır.
- Sayfa bölümleri kart içine kart mantığıyla kurulmaz.
- Legal ve docs içerikleri feature card grid’ine dönüştürülmez.

#### Maskot ve görsel kullanımı

- Maskot marketing ve marka sayfalarında bağlama uygun biçimde kullanılabilir.
- Docs ve legal sayfalarda maskot zorunlu değildir; içerik ciddiyetini zayıflatıyorsa kullanılmaz.
- Görseller dekor değil, sayfanın konusunu taşıyan bağlam unsurlarıdır.

### 3.0.9 Tasarım Yenileme Sırası

1. `Docs` sayfa ailesi için layout sistemi tanımlanır.
2. `/docs` yeniden tasarlanır.
3. `/self-host` marketing sayfası mevcut landing/features kalitesine çıkarılır.
4. Trust/legal sayfaları için sade layout sistemi kurulur.
5. `/security`, `/privacy`, `/terms` yeniden yapılır.
6. `/contact` kendi company/content kompozisyonuna alınır.
7. Geçici jenerik `ContentHero / ContentSection / TextSection` yaklaşımı kaldırılır veya yalnızca gerçekten uygun olan sınırlı alanlarda tutulur.

---

# 3.1 `GET /`

## Sayfa adı

Landing Page

## Amaç

OhHike CoachOS’un ana değer önerisini anlatmak, kullanıcıyı kayıt olmaya veya demo izlemeye yönlendirmek.

## Ana mesaj

"""text
Every session becomes team intelligence.
"""

Alternatif Türkçe mesaj:

"""text
Her antrenmandan öğrenen AI koç platformu.
"""

## İçerik Blokları

### Hero Section

İçerik:

- OhHike logosu
- Doctor Panda maskotu
- Ana başlık
- Alt açıklama
- CTA butonları
- Dashboard mockup görseli

Başlık önerisi:

"""text
AI-powered coaching intelligence for modern sports teams.
"""

Türkçe:

"""text
Modern spor takımları için AI destekli koçluk zekâsı.
"""

Alt metin:

"""text
Takımını, sporcularını, antrenmanlarını, akıllı saat verilerini, check-inleri ve AI raporlarını tek panelde yönet. OhHike CoachOS her session’dan takım hafızası oluşturur.
"""

CTA’lar:

- Get Started
- View Demo
- Explore Self-host
- See Pricing

### Problem Section

Anlatılacak problemler:

- Veriler dağınık
- Oyuncu gelişimi sistematik takip edilmiyor
- Akıllı saat verileri koç paneline bağlanmıyor
- Koç notları, check-inler ve geçmiş raporlar birlikte analiz edilmeden kalıyor
- Antrenman planları gerçek veriye göre güncellenmiyor

### Solution Section

Çözüm blokları:

- Coach dashboard
- Athlete dashboard
- Wearable Data Hub
- AI data analysis
- Team Memory / RAG
- Training planner
- Self-host privacy

### Feature Section

Öne çıkarılacak özellikler:

- Team & Athlete Management
- Group Training Tracking
- Personal Training Tracking
- Readiness Check-ins
- Nutrition Tracking
- Wearable Integrations
- AI Coach Reports
- Team Memory Assistant
- Data Analysis
- Training Planner
- Self-host Deployment

### How It Works Section

"""text
1. Takımını oluştur
2. Sporcularını ekle
3. Günlük check-in ve antrenman verilerini topla
4. Koç notu veya rapor ekle
5. AI rapor al
6. Team Memory’ye soru sor
7. Bir sonraki antrenmanı daha doğru planla
"""

### Pricing Preview

Planlar:

- Basic Team
- Pro Team
- Pro Plus Team

### Open Source / Self-host Section

Ana mesaj:

"""text
Your team data stays yours.
"""

Türkçe:

"""text
Takım veriniz sizde kalır.
"""

Anlatılacaklar:

- Docker Compose ile kurulum
- Kendi database
- Kendi storage
- Kendi AI key
- Kendi wearable provider key’leri
- Managed hosting opsiyonu

### Footer

Linkler:

- Product
- Pricing
- Docs
- Self-host
- GitHub
- Security
- Privacy
- Terms
- Contact

---

# 3.2 `GET /pricing`

## Amaç

Takım bazlı Basic Team, Pro Team ve Pro Plus Team planlarını karşılaştırmak.

## İçerik

Pricing kartları:

### Basic Team

- Fiyat: `Free`
- 3 takım üyesi
- Temel takım yönetimi
- Temel sporcu yönetimi
- Temel session ve takvim yönetimi
- Günlük check-in
- Beslenme / su alışkanlığı takibi
- Manuel veri girişi
- AI özellikleri yok

### Pro Team

- Fiyat: `$29 / month`
- 20+ takım üyesi
- Basic özelliklerinin tamamı
- AI Coach Reports
- Team Memory / RAG Assistant
- Data & Report Analysis
- Readiness ve load insight üretimi
- Training Planner
- PDF export
- Wearable veri özetleri

### Pro Plus Team

- Fiyat: `$79 / month`
- 50+ takım üyesi
- Pro özelliklerinin tamamı
- Gelişmiş Team Memory
- Gelişmiş AI rapor limitleri
- Multi-staff collaboration
- Gelişmiş roller ve görünürlük kontrolleri
- Branded reports
- Öncelikli destek
- Gelişmiş audit ve veri yönetimi

## CTA’lar

- Start Basic
- Upgrade Team
- Choose Pro Plus
- Read Self-host Docs

---

# 3.3 `GET /self-host`

## Amaç

Self-host modelinin kimler için uygun olduğunu, hosted SaaS ile farkını ve teknik sorumluluk sınırlarını anlatmak.

## İçerik Blokları

- Self-host neden var?
- Hangi ekipler self-host seçmeli?
- Hosted SaaS vs self-host karşılaştırması
- Kendi database, storage, AI key ve wearable provider key yönetimi
- Docker Compose / VPS / Coolify / Dokploy seçenekleri
- Veri sahipliği ve gizlilik avantajları
- Kurulum rehberi CTA’sı
- Open-source CTA’sı

## Ana mesaj

```text
Your team data stays yours.
```

## CTA’lar

- Read Self-host Docs
- Explore Open Source
- Start with Hosted Cloud

---

# 3.4 `GET /open-source`

## Amaç

OhHike CoachOS’un açık kaynak ve self-host vizyonunu anlatmak.

## İçerik Blokları

- Open-source core nedir?
- Self-host neden önemli?
- Hangi özellikler açık kaynak?
- Hosted SaaS ile self-host farkı
- Data privacy
- Deployment options
- GitHub CTA
- Contribution guide CTA

## Ana mesaj

"""text
Open-source core. Managed cloud when you need it.
"""

Türkçe:

"""text
Açık kaynak çekirdek. İhtiyacın olduğunda yönetilen bulut.
"""

---

# 3.5 `GET /docs`

## Amaç

Ürün dokümantasyonunun ana giriş sayfası.

## Bölümler

- Getting Started
- Self-host Installation
- Environment Variables
- Database Setup
- AI Provider Setup
- Wearable Integrations
- Clerk Auth
- Clerk Billing
- Supabase
- API Keys
- Security
- Deployment
- Troubleshooting

---

# 3.6 `GET /docs/self-host`

## Amaç

Self-host kurulum rehberi.

## İçerik

- Sistem gereksinimleri
- Docker Compose kurulumu
- ENV ayarları
- Database migration
- Storage ayarı
- Admin hesabı oluşturma
- AI key ekleme
- Wearable provider key ekleme
- Backup / restore
- Update guide

---

# 3.7 `GET /docs/integrations`

## Amaç

Wearable ve üçüncü parti entegrasyonların açıklanması.

## Alt bölümler

- Strava
- Garmin
- Apple Health
- Android Health Connect
- CSV Import
- AI Providers
- Storage Providers

---

# 3.8 `GET /security`

## Amaç

Veri gizliliği ve güvenlik yaklaşımını anlatmak.

## İçerik

- RLS yaklaşımı
- Token encryption
- Private file storage
- Self-host privacy
- Role-based access
- Athlete data protection
- AI usage boundaries
- No medical diagnosis statement

---

# 3.9 `GET /privacy`

## Amaç

Gizlilik politikası.

Özellikle şunlar açık olmalı:

- Sporcu verileri
- Wearable verileri
- AI kullanım sınırları
- Rapor, CSV ve destekleyici dosya verileri
- Self-host sorumlulukları
- Veri silme talepleri

---

# 3.10 `GET /terms`

## Amaç

Kullanım şartları.

Özellikle belirtilecekler:

- AI karar destek aracıdır
- Tıbbi teşhis vermez
- Nihai karar antrenör ve uzmanlara aittir
- Wearable bağlantısı kullanıcı iznine bağlıdır
- Self-host kurulumlarda veri sorumluluğu kullanıcıya aittir

---

# 3.11 `GET /contact`

## Amaç

Demo, destek, iş ortaklığı ve self-host / enterprise sorularını tek bir iletişim yüzeyinde toplamak.

## İçerik

- Genel iletişim formu
- Demo talebi
- Self-host / enterprise görüşme talebi
- Güvenlik bildirimi veya support yönlendirmesi
- GitHub ve community kanallarına yönlendirme

## CTA’lar

- Request Demo
- Contact Support
- View Docs

---

## 4. Auth Sayfaları

---

# 4.1 `GET /sign-in`

## Amaç

Kullanıcı girişi.

## İçerik

- Clerk `<SignIn />`
- OhHike branding
- Doctor Panda küçük karşılama
- “Continue to CoachOS” mesajı

## Redirect Mantığı

"""text
Giriş yapan kullanıcı:
- onboarding tamamlanmadıysa /onboarding
- athlete claim token varsa /invite/athlete/[token]
- role athlete ise /athlete/dashboard
- role coach/admin ise /dashboard
"""

---

# 4.2 `GET /sign-up`

## Amaç

Yeni kullanıcı kaydı.

## İçerik

- Clerk `<SignUp />`
- Google OAuth
- Email/password
- Product role selection, opsiyonel

Rol seçimi:

- I’m a coach
- I’m an athlete
- I’m a club admin

---

# 4.3 `GET /invite/athlete/[token]`

## Amaç

Sporcunun davet linkiyle profili claim etmesini sağlamak.

## Akış

- Token doğrulanır
- Kullanıcı giriş yapmamışsa sign-up/sign-in
- Giriş sonrası athlete profile bağlanır
- Athlete onboarding başlar

## UI

"""text
Takımına katılmaya hazırsın.
Profilini bağla ve günlük takiplerini başlat.
"""

CTA:

- Continue
- Sign in
- Create account

---

## 5. Self-host Setup Sayfaları

Self-host kurulumlarda ilk kullanımda açılır.

---

# 5.1 `GET /setup`

## Amaç

Self-host ilk kurulum ana ekranı.

## İçerik

- System status
- Database connection
- Storage status
- Encryption key status
- Migration status
- Admin account status

CTA:

- Start Setup

---

# 5.2 `GET /setup/admin`

## Amaç

İlk admin hesabını oluşturmak.

## Alanlar

- Ad soyad
- E-posta
- Şifre
- Organizasyon adı

---

# 5.3 `GET /setup/providers`

## Amaç

AI, storage ve wearable provider key’lerini girmek.

## Alanlar

- OpenAI API key
- Gemini API key
- OpenRouter API key
- Strava Client ID / Secret
- Garmin config
- Storage config

Not:

"""text
Provider key’leri şifreli saklanır ve frontend’e ham olarak dönmez.
"""

---

# 5.4 `GET /setup/complete`

## Amaç

Kurulum tamamlandı ekranı.

CTA:

- Go to Dashboard
- Create First Team
- Read Docs

---

## 6. App Layout ve Role-Based Navigation

Protected uygulama alanı role-based çalışır.

---

## 6.1 Coach / Staff Sidebar

Ana menüler:

"""text
Dashboard
Teams
Athletes
Sessions
Training
Readiness
Nutrition
Wearables
Files
AI Reports
Team Memory
Reports
Settings
"""

---

## 6.2 Athlete Bottom Navigation

Mobil öncelikli navigation:

"""text
Today
Check-in
Training
Nutrition
Progress
Profile
"""

---

## 6.3 Admin Navigation

"""text
Organization
Staff
Billing
Entitlements
Integrations
API Keys
Self-host
Audit Logs
Security
"""

---

## 7. Protected Coach App Sayfaları

---

# 7.1 `GET /dashboard`

## Sayfa adı

Coach Dashboard

## Amaç

Antrenörün takımın günlük durumunu tek ekranda görmesi.

## Ana Bileşenler

- Organization switcher
- Team switcher
- Date selector
- Team Readiness Score
- Training Load Overview
- Athlete Risk Alerts
- Missing Check-ins
- Wearable Sync Status
- Nutrition Compliance
- Upcoming Sessions
- Recent AI Reports
- Team Memory Insight
- Recommended Training Focus

## Hızlı Aksiyonlar

- New Session
- Add Athlete
- Ask Team Memory
- Generate Training Plan
- Add Coach Note
- Send Check-in Reminder

## Empty State

Eğer takım yoksa:

"""text
Henüz bir takım oluşturmadın. OhHike’ın takım hafızasını başlatmak için ilk takımını kur.
"""

CTA:

- Create Team

Eğer sporcu yoksa:

"""text
Takımın hazır ama sporcu listen boş. İlk sporcuları ekleyerek takip sistemini başlat.
"""

CTA:

- Add Athlete
- Import CSV

---

# 7.2 `GET /teams`

## Amaç

Organizasyon altındaki takımları listelemek.

## Bileşenler

- Team cards
- Sport type
- Age group
- Athlete count
- Last session
- Readiness average
- Active patterns
- Staff assigned

## Aksiyonlar

- Create Team
- Edit Team
- Archive Team
- Open Team Dashboard

---

# 7.3 `GET /teams/new`

## Amaç

Yeni takım oluşturmak.

## Form Alanları

- Takım adı
- Spor dalı
- Yaş grubu
- Seviye
- Oyun sistemi
- Sezon hedefi
- Haftalık antrenman sayısı
- Staff ataması

---

# 7.4 `GET /teams/[teamId]`

## Amaç

Takım detay dashboard’u.

## Bileşenler

- Team overview
- Athlete roster
- Team readiness trend
- Recent sessions
- Active team patterns
- Training focus
- Team Memory snapshot
- Staff list

## Sekmeler

"""text
Overview
Athletes
Sessions
Readiness
Load
Nutrition
Patterns
Reports
Settings
"""

---

## 8. Athlete / Player Management Sayfaları

---

# 8.1 `GET /athletes`

## Amaç

Tüm sporcuları listelemek.

## Bileşenler

- Search
- Filters
- Team filter
- Status filter
- Position filter
- Wearable connected filter
- Risk status filter
- Athlete table
- Bulk actions

## Tablo Kolonları

- Sporcu
- Takım
- Forma no
- Pozisyon
- Durum
- Readiness
- Son check-in
- Wearable
- Son yük
- Risk

## Aksiyonlar

- Add Athlete
- Import CSV
- Send Invites
- Export

---

# 8.2 `GET /athletes/new`

## Amaç

Yeni sporcu oluşturmak.

## Form Alanları

- Takım
- Ad
- Soyad
- E-posta
- Telefon
- Forma no
- Pozisyon
- Doğum tarihi
- Boy
- Kilo
- Dominant taraf
- Durum
- Not

---

# 8.3 `GET /athletes/[athleteId]`

## Amaç

Sporcu profil ve gelişim ekranı.

## Bileşenler

- Profile header
- Readiness history
- Load trend
- Personal training history
- Nutrition compliance
- Wearable status
- Coach notes
- AI athlete summary
- Observations
- Goals
- Reports

## Sekmeler

"""text
Overview
Check-ins
Training
Nutrition
Wearables
Observations
Goals
Reports
Settings
"""

---

# 8.4 `GET /athletes/[athleteId]/edit`

## Amaç

Sporcu bilgilerini düzenlemek.

## Yetki

- Owner
- Admin
- Head Coach
- Assistant Coach

---

# 8.5 `GET /athletes/import`

## Amaç

CSV ile toplu sporcu import.

## İçerik

- CSV template download
- File upload
- Column mapping
- Validation preview
- Error rows
- Import confirmation

---

## 9. Athlete Portal Sayfaları

Athlete portal, sporcu için sade ve mobil öncelikli bir deneyim sunar.

---

# 9.1 `GET /athlete/dashboard`

## Amaç

Sporcunun günlük ana ekranı.

## Bileşenler

- Today readiness card
- Daily check-in CTA
- Today’s session
- Coach tasks
- Nutrition tracker
- Personal training shortcut
- Wearable sync status
- Progress snapshot
- Doctor Panda insight

## Empty State

"""text
Bugünkü durumunu paylaşarak koçunun antrenmanı daha doğru planlamasına yardımcı ol.
"""

CTA:

- Check-in Yap

---

# 9.2 `GET /athlete/check-in`

## Amaç

Günlük readiness check-in formu.

## Alanlar

- Uyku süresi
- Uyku kalitesi
- Enerji
- Kas ağrısı
- Ağrı bölgesi
- Stres
- Motivasyon
- Hastalık belirtisi
- Antrenmana hazır hissetme
- Ek not

---

# 9.3 `GET /athlete/training`

## Amaç

Sporcunun kişisel ve takım antrenmanlarını görmesi.

## Bileşenler

- Upcoming team sessions
- Personal training list
- Add personal training
- RPE pending tasks
- Completed trainings

---

# 9.4 `GET /athlete/training/new`

## Amaç

Kişisel antrenman eklemek.

## Form Alanları

- Antrenman türü
- Başlık
- Tarih / saat
- Süre
- Mesafe
- RPE
- Not
- Wearable activity eşleştir

---

# 9.5 `GET /athlete/nutrition`

## Amaç

Beslenme ve su takibi.

## Bileşenler

- Water tracker
- Meal checkboxes
- Pre-training meal
- Post-training meal
- Protein goal
- Carb goal
- Notes

---

# 9.6 `GET /athlete/wearables`

## Amaç

Akıllı saat ve aktivite platformu bağlantılarını yönetmek.

## Provider Kartları

- Strava
- Garmin
- Apple Health
- Health Connect
- CSV Import
- Manual

## Her Kartta

- Connected / Not connected
- Last sync
- Connect button
- Reconnect
- Disconnect

---

# 9.7 `GET /athlete/progress`

## Amaç

Sporcunun kendi gelişimini görmesi.

## Bileşenler

- Readiness trend
- Training load trend
- Personal training history
- Check-in streak
- Nutrition consistency
- Coach observations
- Goals

---

# 9.8 `GET /athlete/profile`

## Amaç

Sporcunun profil ve hesap ayarları.

## Alanlar

- Profil bilgileri
- Avatar
- Bildirim tercihleri
- Veri izinleri
- Wearable izinleri
- Takım bilgisi

---

## 10. Sessions Sayfaları

---

# 10.1 `GET /sessions`

## Amaç

Takım session’larını listelemek.

## Bileşenler

- Calendar view
- List view
- Team filter
- Session type filter
- Status filter
- Upcoming / Completed tabs

## Aksiyonlar

- New Session
- Import Schedule
- Generate Weekly Plan

---

# 10.2 `GET /sessions/new`

## Amaç

Yeni session oluşturmak.

## Form Alanları

- Takım
- Tür
- Başlık
- Tarih / saat
- Lokasyon
- Rakip
- Planlanan süre
- Planlanan yoğunluk
- Focus area
- Katılımcılar
- Training blocks
- Koç notu

---

# 10.3 `GET /sessions/[sessionId]`

## Amaç

Session detay ekranı.

## Bileşenler

- Session header
- Attendance
- Training blocks
- Coach notes
- Athlete RPE
- Files
- AI analysis status
- Reports
- Team Memory references

## Aksiyonlar

- Mark as Completed
- Add Note/File
- Generate AI Analysis
- Export Report
- Add Coach Note

---

# 10.4 `GET /sessions/[sessionId]/attendance`

## Amaç

Katılım ve sporcu sürelerini yönetmek.

## Bileşenler

- Athlete checklist
- Minutes played
- RPE status
- Pain reported
- Notes

---

# 10.5 `GET /sessions/[sessionId]/files`

## Amaç

Koç notları, geçmiş raporlar, CSV ve destekleyici dosyaları yönetmek.

## Bileşenler

- Upload area
- Files list
- Processing status
- Parsed summary preview
- Error status
- Analyze button

---

# 10.6 `GET /sessions/[sessionId]/analysis`

## Amaç

AI session analiz raporunu göstermek.

## Bileşenler

- Session Summary
- Tactical Observations
- Athlete Observations
- Risk Alerts
- Recommended Drills
- Next Training Plan
- Coach Correction
- Add to Memory status

---

## 11. Training Planner Sayfaları

---

# 11.1 `GET /training`

## Amaç

Antrenman planlarını ve drill kütüphanesini yönetmek.

## Sekmeler

"""text
Plans
Drills
AI Planner
Templates
"""

---

# 11.2 `GET /training/plans`

## Amaç

Takım veya sporcu bazlı antrenman planlarını listelemek.

## Bileşenler

- Plan cards
- Team filter
- Athlete filter
- Date filter
- AI generated tag

---

# 11.3 `GET /training/plans/new`

## Amaç

Manuel veya AI destekli antrenman planı oluşturmak.

## Seçenekler

- Manual Plan
- Generate with AI

---

# 11.4 `GET /training/drills`

## Amaç

Drill kütüphanesini listelemek.

## Filtreler

- Spor dalı
- Kategori
- Süre
- Zorluk
- Oyuncu sayısı
- Etiket

---

# 11.5 `GET /training/drills/new`

## Amaç

Yeni drill oluşturmak.

## Alanlar

- Başlık
- Spor dalı
- Amaç
- Süre
- Oyuncu sayısı
- Alan kurulumu
- Ekipman
- Uygulama adımları
- Coaching points
- Etiketler

---

## 12. Readiness Sayfaları

---

# 12.1 `GET /readiness`

## Amaç

Takım readiness durumunu analiz etmek.

## Bileşenler

- Team readiness trend
- Athlete readiness table
- Missing check-ins
- Risk alerts
- Sleep trend
- Soreness trend
- Stress trend

---

# 12.2 `GET /readiness/athletes/[athleteId]`

## Amaç

Sporcu readiness detay analizi.

## Bileşenler

- Günlük check-in geçmişi
- Uyku trendi
- Enerji trendi
- Ağrı geçmişi
- AI readiness summary
- Koç notları

---

## 13. Nutrition Sayfaları

---

# 13.1 `GET /nutrition`

## Amaç

Takım beslenme ve su uyumunu takip etmek.

## Bileşenler

- Nutrition compliance overview
- Water target completion
- Meal logging completion
- Pre/post training meal status
- Athlete table
- Nutritionist notes

---

# 13.2 `GET /nutrition/athletes/[athleteId]`

## Amaç

Sporcu beslenme alışkanlığı detay ekranı.

## Bileşenler

- Water trend
- Meal consistency
- Training day nutrition
- Notes
- AI summary

---

## 14. Wearables Sayfaları

---

# 14.1 `GET /wearables`

## Amaç

Takım wearable bağlantı durumunu görmek.

## Bileşenler

- Connected athletes count
- Manual tracking count
- Sync errors
- Provider distribution
- Last sync times
- Athlete wearable table

---

# 14.2 `GET /wearables/providers`

## Amaç

Organization-level wearable provider ayarları.

## Provider’lar

- Strava
- Garmin
- Apple Health
- Health Connect
- CSV Import

## Not

Apple Health ve Health Connect için native mobile bridge gerekebileceği belirtilmelidir.

---

# 14.3 `GET /wearables/import`

## Amaç

CSV ile wearable / performans verisi import etmek.

## İçerik

- Template download
- Upload
- Mapping
- Preview
- Import result

---

## 15. Files & Imports Sayfaları

---

# 15.1 `GET /files`

## Amaç

Organizasyon veya takım genelindeki medya dosyalarını görmek.

## Bileşenler

- Files library
- Session filter
- Type filter
- Processing status
- Upload date
- Uploaded by

---

# 15.2 `GET /files/[fileId]`

## Amaç

Tek medya dosyası detay ekranı.

## Bileşenler

- File preview / parsed summary
- Metadata
- Processing status

- Related session
- Related AI report

---

## 16. AI Reports Sayfaları

---

# 16.1 `GET /ai-reports`

## Amaç

Tüm AI raporlarını listelemek.

## Filtreler

- Report type
- Team
- Athlete
- Session
- Date
- Confidence score

## Rapor Türleri

- Session analysis
- Match analysis
- Training analysis
- Player development
- Weekly team report
- Load report
- Readiness report
- Nutrition report
- Scout report

---

# 16.2 `GET /ai-reports/[reportId]`

## Amaç

AI rapor detayını göstermek.

## Bileşenler

- Report summary
- Observations
- Athlete observations
- Risk alerts
- Recommended drills
- Training plan
- Related documents
- Coach correction
- Export PDF

---

## 17. Team Memory Sayfaları

---

# 17.1 `GET /memory`

## Amaç

Team Memory Assistant ekranı.

## Bileşenler

- Chat interface
- Team selector
- Athlete context selector, opsiyonel
- Suggested questions
- Retrieved sources
- Past threads

## Suggested Questions

"""text
Son 1 ayda en çok tekrar eden problem ne?
Bu hafta yüksek yük alan sporcular kim?
Emir için bireysel gelişim planı çıkar.
Geçiş savunması için daha önce ne çalışmıştık?
Yarınki antrenmanı takımın yorgunluk durumuna göre planla.
"""

---

# 17.2 `GET /memory/documents`

## Amaç

Team Memory’ye eklenmiş dokümanları listelemek.

## Doküman Türleri

- Session report
- Coach note
- Athlete observation
- Team pattern
- Training plan
- Drill
- Wearable summary
- Nutrition summary

---

# 17.3 `GET /memory/documents/[documentId]`

## Amaç

Tek memory dokümanını göstermek.

## Bileşenler

- Title
- Type
- Related team
- Related athlete
- Related session
- Content
- Metadata
- Embedding status

---

## 18. Reports Sayfaları

---

# 18.1 `GET /reports`

## Amaç

Export edilmiş veya oluşturulabilir raporları yönetmek.

## Rapor Türleri

- Session report
- Match report
- Player development report
- Weekly team report
- Load report
- Readiness report
- Nutrition report
- Scout report

---

# 18.2 `GET /reports/new`

## Amaç

Yeni rapor oluşturmak.

## Alanlar

- Rapor türü
- Takım
- Sporcu, opsiyonel
- Session, opsiyonel
- Tarih aralığı
- Logo kullan
- Paylaşılabilir link oluştur

---

# 18.3 `GET /reports/[reportId]`

## Amaç

Rapor detayını görüntülemek.

## Aksiyonlar

- Download PDF
- Copy share link
- Regenerate
- Delete

---

## 19. Settings Sayfaları

---

# 19.1 `GET /settings/profile`

## Amaç

Kullanıcı profil ayarları.

## Alanlar

- Display name
- Avatar
- Locale
- Timezone
- Notification preferences

---

# 19.2 `GET /settings/organization`

## Amaç

Organizasyon ayarları.

## Alanlar

- Organizasyon adı
- Slug
- Logo
- Şehir / ülke
- Spor dalları
- Varsayılan timezone
- Veri saklama ayarları

---

# 19.3 `GET /settings/staff`

## Amaç

Staff ve rollerin yönetimi.

## İçerik

- Staff listesi
- Rol
- Takım erişimi
- Davet durumu
- Remove / update role

---

# 19.4 `GET /settings/billing`

## Amaç

Clerk Billing ve plan yönetimi.

## İçerik

- Current plan
- Usage
- Limits
- Upgrade CTA
- Billing portal
- Invoice history

---

# 19.5 `GET /settings/integrations`

## Amaç

Organization-level entegrasyon ayarları.

## İçerik

- Strava
- Garmin
- AI providers
- Email provider
- Storage provider
- CSV import settings

---

# 19.6 `GET /settings/api-keys`

## Amaç

Self-host veya organization-level API key yönetimi.

## Alanlar

- OpenAI API key
- Gemini API key
- OpenRouter key
- Strava Client Secret
- Garmin key
- Storage secret

Not:

"""text
API key’ler şifreli saklanır. Kaydedildikten sonra ham değer tekrar gösterilmez.
"""

---

# 19.7 `GET /settings/security`

## Amaç

Güvenlik ve veri erişim ayarları.

## İçerik

- Active sessions
- 2FA yönlendirmesi
- Data export
- Data deletion
- Athlete privacy
- AI data usage policy

---

# 19.8 `GET /settings/audit-logs`

## Amaç

Önemli olayları görüntülemek.

## Log türleri

- Staff invited
- Athlete created
- Files uploaded
- AI report generated
- Wearable connected
- API key changed
- Billing changed

---

# 19.9 `GET /settings/self-host`

## Amaç

Self-host kurulum durumunu ve ayarlarını yönetmek.

## İçerik

- System status
- Version
- Database status
- Storage status
- AI provider status
- ENV status
- Backup / restore
- Update instructions

---

## 20. API Route Haritası

---

## 20.1 Webhooks

"""text
POST /api/webhooks/clerk
POST /api/webhooks/billing
POST /api/webhooks/strava
POST /api/webhooks/garmin
"""

---

## 20.2 AI Routes

"""text
POST /api/ai/session-analysis
POST /api/ai/team-memory
POST /api/ai/training-plan
POST /api/ai/readiness-summary
POST /api/ai/nutrition-summary
POST /api/ai/player-development
"""

---

## 20.3 Files Routes

"""text
POST /api/files/upload
POST /api/files/process
POST /api/imports/csv
GET  /api/files/[fileId]/signed-url
"""

---

## 20.4 Wearable Routes

"""text
GET  /api/wearables/strava/connect
GET  /api/wearables/strava/callback
POST /api/wearables/sync
POST /api/wearables/import-csv
POST /api/wearables/disconnect
"""

---

## 20.5 Reports Routes

"""text
POST /api/reports/export
GET  /api/reports/[reportId]/download
POST /api/reports/[reportId]/share
"""

---

## 20.6 Imports Routes

"""text
POST /api/imports/athletes
POST /api/imports/wearables
POST /api/imports/preview
"""

---

## 21. Global Empty / Error Page Routes

---

# 21.1 `GET /not-found`

404 sayfası.

Mesaj:

"""text
Doctor Panda bu sayfayı bulamadı. Belki takım hafızasında da yoktur.
"""

CTA:

- Dashboard’a dön

---

# 21.2 `GET /unauthorized`

Yetki hatası.

Mesaj:

"""text
Bu alana erişim yetkin yok. Gerekli olduğunu düşünüyorsan organizasyon yöneticinle iletişime geç.
"""

---

# 21.3 `GET /upgrade-required`

Premium feature gate sayfası.

Mesaj:

"""text
Bu özellik Coach Pro veya Club planında kullanılabilir.
"""

CTA:

- Planları İncele
- Self-host Seçenekleri

---

# 21.4 `GET /maintenance`

Bakım modu.

Mesaj:

"""text
Doctor Panda kısa bir bakım molasında. Birazdan tekrar sahadayız.
"""

---

## 22. Eski Route’lardan Çıkarılanlar

v3.0 ile birlikte aşağıdaki route’lar ana uygulama çekirdeğinden kaldırılmıştır:

"""text
/explore
/routes
/routes/[id]
/routes/new
/scavenger-hunts
/achievements
/map
/community-routes
/public-routes
"""

Bu sayfalar eski OhHike keşif uygulaması içindi. CoachOS ürününde ana akış takımlar, sporcular, session’lar, AI raporlar ve takım hafızası üzerine kuruludur.

---

## 23. Önerilen Route Ağacı

Aşağıdaki yapı Next.js App Router için hedef route ağacıdır:

"""text
app/
├── (marketing)/
│   ├── page.tsx
│   ├── pricing/page.tsx
│   ├── open-source/page.tsx
│   ├── docs/page.tsx
│   ├── docs/self-host/page.tsx
│   ├── docs/integrations/page.tsx
│   ├── security/page.tsx
│   ├── privacy/page.tsx
│   └── terms/page.tsx
│
├── (auth)/
│   ├── sign-in/[[...sign-in]]/page.tsx
│   ├── sign-up/[[...sign-up]]/page.tsx
│   └── invite/athlete/[token]/page.tsx
│
├── (setup)/
│   ├── setup/page.tsx
│   ├── setup/admin/page.tsx
│   ├── setup/providers/page.tsx
│   └── setup/complete/page.tsx
│
├── (app)/
│   ├── dashboard/page.tsx
│   ├── teams/page.tsx
│   ├── teams/new/page.tsx
│   ├── teams/[teamId]/page.tsx
│   ├── athletes/page.tsx
│   ├── athletes/new/page.tsx
│   ├── athletes/import/page.tsx
│   ├── athletes/[athleteId]/page.tsx
│   ├── sessions/page.tsx
│   ├── sessions/new/page.tsx
│   ├── sessions/[sessionId]/page.tsx
│   ├── sessions/[sessionId]/attendance/page.tsx
│   ├── sessions/[sessionId]/files/page.tsx
│   ├── sessions/[sessionId]/analysis/page.tsx
│   ├── training/page.tsx
│   ├── training/plans/page.tsx
│   ├── training/plans/new/page.tsx
│   ├── training/drills/page.tsx
│   ├── training/drills/new/page.tsx
│   ├── readiness/page.tsx
│   ├── nutrition/page.tsx
│   ├── wearables/page.tsx
│   ├── wearables/providers/page.tsx
│   ├── wearables/import/page.tsx
│   ├── files/page.tsx
│   ├── files/[fileId]/page.tsx
│   ├── ai-reports/page.tsx
│   ├── ai-reports/[reportId]/page.tsx
│   ├── memory/page.tsx
│   ├── memory/documents/page.tsx
│   ├── memory/documents/[documentId]/page.tsx
│   ├── reports/page.tsx
│   ├── reports/new/page.tsx
│   └── reports/[reportId]/page.tsx
│
├── (athlete)/
│   ├── athlete/dashboard/page.tsx
│   ├── athlete/check-in/page.tsx
│   ├── athlete/training/page.tsx
│   ├── athlete/training/new/page.tsx
│   ├── athlete/nutrition/page.tsx
│   ├── athlete/wearables/page.tsx
│   ├── athlete/progress/page.tsx
│   └── athlete/profile/page.tsx
│
├── (admin)/
│   └── settings/
│       ├── profile/page.tsx
│       ├── organization/page.tsx
│       ├── staff/page.tsx
│       ├── billing/page.tsx
│       ├── integrations/page.tsx
│       ├── api-keys/page.tsx
│       ├── security/page.tsx
│       ├── audit-logs/page.tsx
│       └── self-host/page.tsx
│
└── api/
    ├── webhooks/
    │   ├── clerk/route.ts
    │   ├── billing/route.ts
    │   ├── strava/route.ts
    │   └── garmin/route.ts
    ├── ai/
    │   ├── session-analysis/route.ts
    │   ├── team-memory/route.ts
    │   ├── training-plan/route.ts
    │   ├── readiness-summary/route.ts
    │   ├── nutrition-summary/route.ts
    │   └── player-development/route.ts
    ├── files/
    │   ├── upload/route.ts
    │   ├── process/route.ts
    │   ├── imports/csv/route.ts
    │   └── [fileId]/signed-url/route.ts
    ├── wearables/
    │   ├── strava/connect/route.ts
    │   ├── strava/callback/route.ts
    │   ├── sync/route.ts
    │   ├── import-csv/route.ts
    │   └── disconnect/route.ts
    ├── reports/
    │   ├── export/route.ts
    │   ├── [reportId]/download/route.ts
    │   └── [reportId]/share/route.ts
    └── imports/
        ├── athletes/route.ts
        ├── wearables/route.ts
        └── preview/route.ts
"""

---

## 24. Nihai Site Haritası Özeti

OhHike CoachOS v3.0 site haritası şu yapıya dayanır:

"""text
Public Website:
Ürünü anlatır, pricing ve self-host değer önerisini sunar.

Coach App:
Takım, sporcu, session, AI rapor ve Team Memory yönetimini sağlar.

Athlete Portal:
Sporcunun günlük veri girmesini ve kendi gelişimini takip etmesini sağlar.

Admin Settings:
Organization, billing, staff, integration, API key ve self-host ayarlarını yönetir.

API Layer:
AI, dosya/import, akıllı saat, webhook ve report işlemlerini destekler.
"""

Bu yapı, OhHike’ı sosyal keşif uygulamasından çıkarıp net bir **AI destekli spor takımı SaaS tool’u** haline getirir.
