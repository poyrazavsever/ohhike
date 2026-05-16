# OhHike CoachOS - Iki Agent Icin Cakismasiz Gorev Dagilimi

## 0. Amac

Bu plan, iki farkli editor/agent ile ayni repo uzerinde calisirken dosya, modul ve veritabani cakislarini azaltmak icin hazirlandi.

Ana hedef:

- `docs/` altindaki CoachOS v3 urun, mimari, veri modeli ve kullanici akislarina uygun ilerlemek.
- Iki agent'in ayni dosyalari ayni anda duzenlememesini saglamak.
- Ayni veritabani tablolarinda paralel migration/action/query calismasi yapmamak.
- Kacilmaz ortak bagimliliklari faz kapilariyla siralamak.

Bu dokuman implementation checklist degil, calisma sahipligi ve faz planidir.

## 1. Proje Ozeti

OhHike CoachOS; spor takimlari, antrenorler, sporcular ve kulup ekipleri icin AI destekli, self-host edilebilir bir spor operasyon ve takim hafizasi platformudur.

Urunun cozdogu ana problem:

- Antrenman notlari, sporcu check-in'leri, wearable verileri, RPE, beslenme/su aliskanliklari ve gecmis raporlar daginik tutuluyor.
- Koclar bu veriyi sezon boyunca karar destek sistemine donusturemiyor.
- Sporcularin takim disi yukleri, uyku/enerji/agri sinyalleri ve recovery durumu antrenman planina sistematik yansimiyor.
- Kulup ve akademiler icin rol bazli erisim, veri gizliligi, raporlama ve self-host ihtiyaci var.

Hedef veri akisi:

```text
Organization
  -> Team
    -> Athlete
      -> Session / Check-in / Nutrition / Personal Training / Wearable
        -> AI Report
          -> Documents + Embeddings
            -> Team Memory Assistant
```

Mevcut kod durumu:

- `apps/web`: Marketing site buyuk olcude CoachOS mesajina uygun.
- `apps/app`: Clerk korumali shell, auth sayfalari, sidebar ve Clerk user webhook'u var.
- Supabase migration, RLS, organization/team/athlete CRUD, onboarding, billing, AI/RAG ve session/performance modulleri henuz yok.
- `README.md` ve root package metadata halen starter izleri tasiyor.

## 2. Agent Rolleri

Iki agent ayni anda calisacaksa roller net ayrilmali.

### Agent A - App Core ve Veri Temeli

Sorumluluk alani:

- SaaS uygulamasi cekirdegi.
- Auth sonrasi onboarding.
- Organization, team, athlete, staff ve billing entitlement temeli.
- Supabase schema'nin foundation kisimi.
- `apps/app` protected app iskeleti.
- Server-side auth, organization/team context, permission ve feature gate temelleri.

Agent A, urunun operasyonel veri temelini kurar.

### Agent B - Public Web, Docs ve Uygulama UX Yuzeyleri

Sorumluluk alani:

- Marketing site, docs sayfalari, self-host/open-source/security/privacy/terms icerikleri.
- Public pricing ve CTA uyumu.
- Empty state, onboarding metinleri, Doctor Panda UX dili.
- `packages/ui` icindeki ortak presentational component'ler.
- App tarafinda yalnizca Agent A'nin belirledigi component API'lerini kullanan gorsel/UX katmanlari; veri action/query yazmaz.

Agent B, urunun dis anlatimini, dokumantasyonunu ve UI dilini netlestirir.

## 3. Mutlak Cakisma Kurallari

1. Ayni dosya ayni fazda iki agent tarafindan duzenlenmez.
2. Ayni migration dosyasina iki agent dokunmaz.
3. Ayni tabloyu olusturan, degistiren veya RLS policy ekleyen is tek agent'a aittir.
4. `package.json`, `pnpm-lock.yaml`, `turbo.json`, root config ve workspace config dosyalari faz sahibi disinda degistirilmez.
5. `packages/ui` Agent B'ye aittir. Agent A yeni shared UI ihtiyaci icin once lokal component yazar veya Agent B'ye interface istegi acar.
6. `apps/app/components/layout/app-sidebar.tsx`, `apps/app/app/layout.tsx`, `apps/app/middleware.ts` Agent A'ya aittir.
7. `apps/web` tamami Agent B'ye aittir.
8. `apps/app/app/api/**` Agent A'ya aittir; Agent B API route yazmaz.
9. App veri erisimi Agent A tarafindan yazilir; Agent B veri mock'u gerekiyorsa `apps/web/lib/**` veya kendi public sayfa dosyalarinda tutar.
10. Bir agent digerinin sahip oldugu dosyada duzeltme gerektiren bug gorurse dosyayi degistirmez; not birakir veya sonraki entegrasyon fazina tasir.

## 4. Dosya Sahipligi

### Agent A Dosyalari

```text
apps/app/**
supabase/**
packages/database/**
packages/auth/**
packages/billing/**
packages/validators/**
```

Notlar:

- Su an `supabase/`, `packages/database`, `packages/auth`, `packages/billing`, `packages/validators` yok. Agent A olusturursa sahipligi Agent A'da kalir.
- `apps/app/public/**` asset dosyalarina dokunulmaz; mevcut asset'ler kullanilir.

### Agent B Dosyalari

```text
apps/web/**
packages/ui/**
docs/**
```

Notlar:

- Bu plan dosyasi Agent B alaninda gibi gorunse de ilk planlama icin ortak referans kabul edilir.
- Agent B, `docs/` icinde urun/dokuman icerigi guncelleyebilir; ancak schema veya app implementation karari degistirirse Agent A ile faz kapisinda mutabakat gerekir.

### Ortak Ama Kilitli Dosyalar

Bu dosyalar ayni fazda serbest degistirilmez:

```text
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
turbo.json
components.json
README.md
.gitignore
```

Sahiplik onerisi:

- Faz 0'da root metadata ve README: Agent B
- Dependency ekleme gerekiyorsa ilgili agent once kendi app/package dosyasini degistirir.
- Lockfile degisimi tek entegrasyon adiminda yapilir.

## 5. Veritabani Tablo Sahipligi

Ortak tablo kullanmamak icin tablolar module ownership ile ayrildi.

### Agent A Tablo Sahipligi

Foundation ve operasyon tablolari:

```text
users
organizations
organization_members
teams
team_staff
athletes
athlete_invites
team_billing_entitlements
audit_logs
system_settings
api_keys
```

Agent A sorumluluklari:

- Enum temel tipleri.
- Tenant izolasyonu.
- Organization/team context.
- Athlete claim modeli.
- Staff rolleri.
- Team bazli pricing entitlement cache.
- RLS foundation policy'leri.

### Agent B Tablo Sahipligi

Agent B normalde DB yazmaz. Ancak ileriki fazlarda sadece Agent A'nin foundation migration'i merge edildikten sonra su tablolarin schema tasarimini dokumante edebilir veya ayri migration PR'i olarak hazirlayabilir:

```text
sessions
session_attendance
training_blocks
personal_trainings
wellness_checkins
nutrition_logs
wearable_connections
wearable_daily_summaries
wearable_activities
session_files
session_file_summaries
ai_reports
athlete_observations
team_patterns
drills
training_plans
performance_goals
documents
document_embeddings
assistant_threads
assistant_messages
reports
report_exports
imports
notifications
```

Pratik onerim: Ilk iki fazda Agent B hic migration yazmasin. Agent B public/docs/UI alaninda ilerlerken Agent A foundation schema'yi kursun. Performance ve AI tablolarina gecis daha sonra ayri fazda yapilsin.

### FK Bagimlilik Kurali

Agent B'nin tablolarinin cogu `organization_id`, `team_id`, `athlete_id`, `session_id` kullanir. Bu tablolar Agent A sahipligindeki foundation tablolara FK verir.

Bu nedenle:

- Agent B, Agent A'nin foundation migration'i merge edilmeden DB migration yazmaz.
- Agent B, FK verilen foundation tablolarda kolon degisikligi yapmaz.
- Agent A, foundation kolonlarini degistirecekse Agent B'nin downstream tablolarini etkileyecegi icin faz kapisinda duyurur.

## 6. Faz Plani

### Faz 0 - Repo ve Plan Sabitleme

Amac: Iki agent calismaya baslamadan once repo kimligi, plan ve cakismazlik kurallari net olsun.

Agent A:

- `apps/app` mevcut auth, middleware, Clerk webhook ve sidebar yapisini inceler.
- Uygulama tarafinda hangi route gruplarinin olusacagini netlestirir.
- DB foundation migration taslagini hazirlar ama henuz genis AI/performance tablolarina girmez.

Agent B:

- `README.md` starter icerigini OhHike CoachOS'a uygun hale getirir.
- `docs/` icindeki eski pricing ifadelerini `PricingPolicy.md` ile uyumlu hale getirir.
- Public docs sayfalarinin bilgi mimarisini hazirlar.

Dokunulmayacaklar:

- Agent A `apps/web/**` dosyalarina dokunmaz.
- Agent B `apps/app/**` dosyalarina dokunmaz.

Cikis kriteri:

- Root README urunu dogru anlatir.
- Bu plan herkes tarafindan referans alinir.
- Pricing kaynak karari: `PricingPolicy.md` canonical kabul edilir.

### Faz 1 - App Foundation vs Public Web Tamamlama

Amac: Bir agent uygulama temelini kurarken diger agent public site ve dokumantasyonu ilerletir.

Agent A isleri:

- `supabase/migrations` altinda foundation migration:
  - enum tipleri
  - `users`
  - `organizations`
  - `organization_members`
  - `teams`
  - `team_staff`
  - `athletes`
  - `athlete_invites`
  - `team_billing_entitlements`
  - temel `audit_logs`
- `apps/app/lib/**` altinda Supabase admin/server client ayrimi.
- Clerk webhook'unun `users` disinda gerekli bootstrap alanlarini desteklemesi.
- Protected app route iskeleti:
  - `/dashboard`
  - `/onboarding`
  - `/teams`
  - `/athletes`
  - `/settings/billing`

Agent B isleri:

- `apps/web/app/docs/page.tsx` placeholder yerine gercek docs landing.
- Public sayfalar:
  - `/docs/self-host`
  - `/docs/integrations`
  - `/open-source`
  - `/security`
  - `/privacy`
  - `/terms`
- Pricing sayfasini takim bazli modelle korumak.
- Marketing CTA'larini `app.ohhike.com` / local app URL modeliyle tutarli yapmak.

Dosya cakismasi yok:

- Agent A: `apps/app/**`, `supabase/**`
- Agent B: `apps/web/**`, `docs/**`, gerekirse `packages/ui/**`

Cikis kriteri:

- Foundation migration uygulanabilir.
- Public site urun, pricing, self-host ve guvenlik mesajlarini dogru anlatir.
- Agent A'nin DB foundation'i Agent B'nin docs'unda tarif edilen modelle uyumludur.

### Faz 2 - Team Operations vs UX System

Amac: App icinde takim/sporcu operasyonlari baslarken Agent B ortak UI ve empty state sistemini guclendirir.

Agent A isleri:

- Organization onboarding:
  - organization create
  - first team create
  - owner membership
- Team CRUD.
- Athlete CRUD.
- Athlete invite token uretimi.
- Team member limit kontrolu icin entitlement helper.
- Server-side permission helper:
  - owner/admin
  - coach/staff
  - athlete

Agent B isleri:

- `packages/ui` icinde sadece presentational component'ler:
  - empty state
  - stat card
  - section header
  - dashboard card shell
  - form field wrappers
- `docs/EmptyStates.md` ile uyumlu Doctor Panda empty state copy seti.
- Marketing blog/community/docs sayfalarini urun diliyle uyumlu hale getirme.

Kritik kural:

- Agent B `apps/app` icine component entegre etmez.
- Agent A `packages/ui` component API'sini ancak Agent B merge ettikten sonra kullanir.

Cikis kriteri:

- Yeni kullanici organization + first team kurabilir.
- Coach, athlete listesi olusturabilir.
- UI component'leri shared ama data-free kalir.

### Faz 3 - Sessions ve Athlete Daily Data

Amac: Urunun gercek operasyon verisi toplanmaya baslar.

Bu fazda DB ownership yeniden netlestirilir. Eger paralel calisma devam edecekse Agent B hala migration yazmamalidir; Agent A session/performance tablolarini da ustlenmelidir. Cakismazlik icin onerilen model budur.

Agent A isleri:

- Session tablolarini ekler:
  - `sessions`
  - `session_attendance`
  - `training_blocks`
- Daily athlete data tablolarini ekler:
  - `wellness_checkins`
  - `nutrition_logs`
  - `personal_trainings`
- App route'lari:
  - `/sessions`
  - `/readiness`
  - `/nutrition`
  - `/athlete/dashboard`
- Readiness score icin ilk deterministic hesaplama.

Agent B isleri:

- Public docs tarafinda:
  - session workflow dokumani
  - athlete check-in dokumani
  - CSV template dokumani
- Empty state ve loading state metinlerini tamamlar.
- Uygulama ekranlari icin Figma'siz UI spec veya markdown wireframe dokumani yazar.

Cikis kriteri:

- Coach session olusturabilir.
- Attendance ve RPE kaydedilebilir.
- Athlete check-in ve nutrition log girebilir.
- Public docs bu akislari dogru anlatir.

### Faz 4 - Wearables, Files ve Import

Amac: Manuel veri akisini bozmadan wearable ve dosya/import katmani kurulur.

Agent A isleri:

- `wearable_connections`
- `wearable_daily_summaries`
- `wearable_activities`
- `session_files`
- `session_file_summaries`
- CSV import icin minimal parser/action.
- Token/API key encryption temel helper'i.

Agent B isleri:

- `/docs/integrations` detaylari:
  - Strava
  - Garmin
  - Apple Health
  - Android Health Connect
  - CSV fallback
- Self-host API key yonetimi anlatimi.
- Guvenlik ve gizlilik metinlerinde wearable izinleri.

Cikis kriteri:

- Manual fallback korunur.
- CSV veya mock wearable summary veri modele yazilabilir.
- Token/secrets frontend'e cikmaz.

### Faz 5 - AI Reports ve Team Memory

Amac: CoachOS'un ana farklilastiricisi olan karar destek ve hafiza katmani baslar.

Agent A isleri:

- AI/RAG tablolarini ekler:
  - `ai_reports`
  - `athlete_observations`
  - `team_patterns`
  - `documents`
  - `document_embeddings`
  - `assistant_threads`
  - `assistant_messages`
- AI provider adapter arayuzu.
- Structured output validation.
- Session analysis icin ilk server action veya route handler.
- Team Memory query icin ilk retrieval arayuzu.

Agent B isleri:

- `docs/PromptEngineering.md` senaryolarini product docs'a donusturur.
- Public siteye AI safety / no medical diagnosis mesajini guclendirir.
- AI rapor kartlari icin presentational component tasarlar.

Cikis kriteri:

- Bir completed session'dan AI report kaydi olusabilir.
- Report memory document olarak yazilabilir.
- Team Memory soru-cevap akisi mock veya real provider ile calisir.

### Faz 6 - Billing, Reports ve Self-host

Amac: SaaS planlama, export ve self-host kurulum hikayesi tamamlanir.

Agent A isleri:

- Clerk Billing webhook.
- `team_billing_entitlements` sync.
- Feature gate enforcement:
  - AI reports
  - Team Memory
  - Training Planner
  - PDF export
  - team member limit
- Reports/export tablolarinin final hali.
- Self-host setup mode icin app route iskeleti.

Agent B isleri:

- Pricing/public checkout copy.
- Self-host installation docs.
- Security/privacy/terms final polish.
- GitHub README ve contribution docs.

Cikis kriteri:

- Basic/Pro/Pro Plus ayrimi server-side uygulanir.
- Public pricing ile app entitlement ayni plan keylerini kullanir.
- Self-host yolu dokumante edilir.

## 7. Onerilen Branch ve Merge Sirasi

Iki editor icin basit model:

```text
main
  agent-a/app-foundation
  agent-b/public-docs-ui
```

Merge sirasi:

1. Agent B'nin dokuman/marketing-only degisiklikleri.
2. Agent A'nin foundation schema ve app shell degisiklikleri.
3. Lockfile veya shared dependency degisiklikleri tek entegrasyon commit'i.
4. Sonraki faz branch'leri yeniden guncel `main` uzerinden acilir.

Her faz sonunda:

```text
pnpm lint
pnpm check-types
```

En azindan ilgili app icin:

```text
pnpm --filter app lint
pnpm --filter app check-types
pnpm --filter web lint
pnpm --filter web check-types
```

## 8. Riskler ve Kararlar

### Risk: Pricing dokumanlari arasinda eski/yeni model farki

Karar:

- `docs/PricingPolicy.md` canonical kabul edilmeli.
- Basic Team / Pro Team / Pro Plus Team takim bazli model uygulanmali.
- Eski Free / Coach Pro / Club ifadeleri public sayfalardan ve app logic'ten temizlenmeli.

### Risk: Shared UI paketi cakisabilir

Karar:

- `packages/ui` sadece Agent B tarafindan degistirilir.
- Agent A acil ihtiyaclarda `apps/app/components/**` altinda lokal component kullanir.
- Ortak component ihtiyaci faz sonunda Agent B'ye aktarilir.

### Risk: DB tablolarini iki agent ayni anda tasarlarsa migration sirasi bozulur

Karar:

- Ilk uc fazda migration sahibi Agent A'dir.
- Agent B DB yazmaz; UX/docs ve public alanlarda calisir.
- AI/performance migration'larinda ikinci agent devreye alinacaksa once tablo ownership yeniden bolunur ve FK bagimliliklari netlestirilir.

### Risk: App route ve marketing route dil/CTA farki

Karar:

- Agent B public CTA ve copy dilini sahiplenir.
- Agent A app route path'lerini sahiplenir.
- Route degisikligi gerekiyorsa faz kapisinda liste halinde duyurulur.

### Risk: AI medikal/beslenme sinirlarini asabilir

Karar:

- Prompt ve UI copy `docs/PromptEngineering.md` kurallarina uymali.
- AI ciktisi "karar destek" olarak sunulmali.
- Teshis, tedavi, kesin sakatlik veya diyet recetesi dili kullanilmamali.

## 9. Ilk Yapilacaklar

Agent A icin ilk net paket:

1. `supabase/migrations` foundation schema.
2. `apps/app/lib/supabase-server.ts` ve admin client ayrimi.
3. Organization/team onboarding route iskeleti.
4. Team ve athlete CRUD icin server action/query klasorleri.
5. Permission ve entitlement helper taslagi.

Agent B icin ilk net paket:

1. Root `README.md` OhHike CoachOS'a gore yeniden yazilsin.
2. `apps/web/app/docs/page.tsx` gercek docs landing'e donussun.
3. `/open-source`, `/security`, `/privacy`, `/terms`, `/docs/self-host`, `/docs/integrations` sayfalari eklensin.
4. Pricing copy `PricingPolicy.md` ile uyumlu kalsin.
5. Empty state presentational component seti `packages/ui` altinda hazirlansin.

## 10. Kisa Sonuc

En guvenli paralel calisma modeli:

- Agent A: `apps/app` + `supabase` + app core data.
- Agent B: `apps/web` + `docs` + `packages/ui`.

Ilk fazlarda DB ve app logic tek agent'ta kalmali. Diger agent public/docs/UI alaninda hizli ilerleyebilir. Bu ayrim, ayni tabloya veya ayni dosyaya dokunma riskini ciddi sekilde azaltir ve CoachOS'un dokumanlardaki hedef mimarisine uygun sirali bir temel kurar.
