# OhHike CoachOS Pricing Policy

## 1. Amaç

OhHike CoachOS ücretlendirmesi kullanıcı bazlı değil, takım bazlıdır.

Bir organizasyon birden fazla takım oluşturabilir. Her takım kendi plan seviyesine sahip olur. Bir kullanıcının Pro olması gibi bir model yoktur; Pro olan entity takımdır.

Bu doküman, eski Free / Coach Pro / Club modelinin yerine geçer ve `PRD.md` içindeki 9.1, 9.2 ve 9.3 paket tanımlarını v3.1 itibarıyla günceller.

## 2. Temel Model

```text
Organization
  └── Team
        └── Team subscription plan
```

- Clerk Auth kullanıcı, oturum ve organizasyon üyeliğini yönetir.
- Clerk Billing takım planı satın alma ve abonelik yaşam döngüsünü yönetir.
- Supabase tarafında takım bazlı entitlement cache tutulur.
- Feature gate kontrolleri kullanıcıya değil, aktif takımın planına göre yapılır.

## 3. Planlar

### 3.1 Basic Team

Başlangıç ve deneme planıdır.

- Fiyat: `Free`
- 3 takım üyesi
- Temel takım yönetimi
- Temel sporcu yönetimi
- Temel session ve takvim yönetimi
- Günlük check-in
- Beslenme / su alışkanlığı takibi
- Manuel veri girişi
- AI özellikleri yok
- Team Memory yok
- AI Coach Report yok
- AI Training Planner yok

### 3.2 Pro Team

Aktif kullanılan takım planıdır.

- Fiyat: `$29 / month`
- 20+ takım üyesi
- Basic özelliklerinin tamamı
- AI Coach Reports
- Team Memory / RAG Assistant
- Data & Report Analysis
- Readiness ve load insight üretimi
- Drill önerileri
- Training Planner
- PDF export
- Wearable veri özetleri

### 3.3 Pro Plus Team

Daha büyük takımlar, akademiler ve gelişmiş operasyonlar içindir.

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

## 4. Team Member Tanımı

Takım üyesi; ilgili takıma bağlı ve aktif erişimi olan şu rolleri kapsar:

- Head Coach
- Assistant Coach
- Analyst
- Physiotherapist
- Nutritionist
- Athlete
- Viewer

Organization owner/admin rolleri takım üyesi sayımına dahil edilebilir; nihai uygulamada bu kural billing ayarlarında netleştirilmelidir.

## 5. Clerk Billing Kurgusu

Clerk Billing planları organization scope ile çalıştırılır; OhHike tarafında seçilen plan bir takım entitlement kaydına bağlanır.

Checkout akışı:

```text
Kullanıcı pricing sayfasında takım için plan seçer
→ Clerk Auth ile giriş yapar
→ Aktif organization ve team context belirlenir
→ Clerk Billing checkout başlatılır
→ webhook subscription event alır
→ team_billing_entitlements güncellenir
→ aktif takım için feature gate açılır
```

Clerk Billing tarafında önerilen plan keyleri:

- `basic_team`
- `pro_team`
- `pro_plus_team`

Plan period:

- `month`
- `annual`

Checkout `for: "organization"` ile açılır. OhHike, checkout metadata veya iç mapping ile subscription kaydını ilgili `team_id` ile ilişkilendirir.

## 6. Entitlement Modeli

Takım bazlı entitlement alanları:

```text
team_id
plan
max_team_members
ai_features_enabled
ai_reports_enabled
team_memory_enabled
training_planner_enabled
wearable_enabled
pdf_export_enabled
branded_reports_enabled
monthly_ai_report_limit
current_period_start
current_period_end
clerk_subscription_id
clerk_plan_id
```

Önerilen değerler:

| Plan | max_team_members | AI | Team Memory | PDF | Branded |
|---|---:|---|---|---|---|
| Basic Team | 3 | Kapalı | Kapalı | Kapalı | Kapalı |
| Pro Team | 20+ | Açık | Açık | Açık | Kapalı |
| Pro Plus Team | 50+ | Açık | Açık | Açık | Açık |

## 6.1 Plan Karşılaştırması

| Özellik | Basic Team | Pro Team | Pro Plus Team |
|---|---:|---:|---:|
| Fiyat | Free | `$29 / month` | `$79 / month` |
| Takım üyesi | 3 | 20+ | 50+ |
| Team and athlete management | Var | Var | Var |
| Session and calendar workflow | Var | Var | Var |
| Daily check-ins | Var | Var | Var |
| Nutrition and water habits | Var | Var | Var |
| AI Coach Reports | Yok | Var | Var |
| Team Memory / RAG Assistant | Yok | Var | Var |
| Data and report analysis | Yok | Var | Var |
| Readiness and load insights | Yok | Var | Var |
| AI Training Planner | Yok | Var | Var |
| Wearable summaries | Yok | Var | Var |
| PDF export | Yok | Var | Var |
| Branded reports | Yok | Yok | Var |
| Advanced roles and visibility | Yok | Yok | Var |
| Priority support | Yok | Yok | Var |
| Advanced audit and data controls | Yok | Yok | Var |

## 7. Feature Gate İlkesi

Her premium işlem server-side aktif takım entitlement değerine göre kontrol edilir.

Örnekler:

- AI rapor oluşturma → `ai_reports_enabled`
- Team Memory sorgusu → `team_memory_enabled`
- AI training planner → `training_planner_enabled`
- PDF export → `pdf_export_enabled`
- Branded report → `branded_reports_enabled`
- Takıma üye daveti → `max_team_members`

## 8. Eski Dokümanlarla Uyumluluk

Bu model aşağıdaki eski ifadelerin yerine geçer:

- Free plan 1 takım / 10 sporcu
- Coach Pro kullanıcı veya organizasyon planı
- Club plan sınırsız takım modeli

Yeni politika:

- Basic, Pro ve Pro Plus takım planlarıdır.
- AI özellikleri Basic içinde bulunmaz.
- Pro ve Pro Plus AI özelliklerini açar.
- Organizasyon birden fazla takım barındırabilir; her takımın planı ayrı değerlendirilebilir.

## 9. Self-host

Self-host modeli SaaS billing’den ayrıdır.

Self-host kurulumlarında Clerk Billing zorunlu değildir. Teknik ekip kendi deployment, database, storage, AI key ve wearable provider keylerini yönetir. Ticari olarak managed hosting, enterprise support veya custom deployment ayrıca fiyatlandırılabilir.
