# OhHike CoachOS — Ürün Uyumu ve Eksiklik Raporu

**Tarih:** 2026-05-16  
**Kaynaklar:** `PRD.md`, `UserFlows.md`, `DatabaseSchema.md`, `SystemArchitecture.md`, `SiteHaritasi.md`, `AgentGorevDagilimi.md`, `docs/supabase/README.md`, `apps/app` kod incelemesi.

---

## 1. Özet

Genel yön **doğru**: coach-first kadro modeli, organizasyon → takım → sporcu → seans/veri hiyerarşisi, migration’ların kademeli eklenmesi ve Team Operations ekranlarının büyük ölçüde çalışması PRD ve `DatabaseSchema.md` §2.3 (Athlete Claim Model) ile uyumlu.

**Production MVP hedefi:** Hızlıca canlıya alıp sunmak. Omurga (auth, org, takım, sporcu, seans, günlük veri, davetler, AI/Team Memory MVP) çalışır durumda.

**Bilinçli ertelenenler (Post-MVP):** RLS geçişi, Clerk JWT template zorunluluğu, E2E otomasyon, wearable OAuth/sync, billing sync, PDF, self-host, AI/RAG olgunluk.

**Şu anki teknik karar:** Supabase **service role (admin client)** — org/rol filtreleri uygulama katmanında. Detaylı faz planı: `docs/AgentGorevDagilimi.md`.

**Test rehberi:** Kırılma noktaları ve uçtan uca (E2E) test kapıları → [§9](#9-kırılma-noktaları-breaking-points) ve [§10](#10-uçtan-uca-test-kapıları-e2e-gates).

---

## 2. PRD MVP ile Karşılaştırma

| PRD MVP (§10 Must Have) | Doküman beklentisi | Kod durumu | Uyum |
|-------------------------|-------------------|------------|------|
| Landing page | `apps/web` marketing | `apps/web` mevcut | ✓ |
| Clerk auth | Login/register | Çalışıyor | ✓ |
| Organizasyon oluşturma | Onboarding + settings | Onboarding + ek org | ✓ |
| Takım oluşturma | Onboarding + Teams CRUD | Çalışıyor | ✓ |
| Sporcu ekleme | Koç kadrosu | CRUD + onboarding adımı | ✓ |
| Sporcu davet / claim | Token + profil bağlama | `/invite/athlete/[token]`, claim action | ◐ E-posta yok; claim sonrası athlete onboarding var |
| Koç dashboard | Metrikler, özet | `/dashboard` maskotlu UI | ◐ AI/risk kartları PRD seviyesinde değil |
| Sporcu dashboard | Kendi check-in, görevler | `/athlete/home` + athlete route seti | ✓ `/athlete/dashboard` eski coach aggregate olarak ayrıca duruyor |
| Günlük check-in | Sporcu girer | `/athlete/check-in` + `/readiness` | ✓ Sporcu self-service + staff girişi |
| Toplu session | Oluştur + yoklama | `/sessions` + `/sessions/[id]` | ✓ |
| Kişisel antrenman | `personal_trainings` | `/personal-training`, `/athlete/training` | ✓ |
| Beslenme | Günlük log | `/athlete/nutrition` + `/nutrition` | ✓ Sporcu self-service + staff girişi |
| AI session report | LLM üretimi | `/ai-reports`, session detail CTA | ◐ Rules fallback + opsiyonel Gemini; kalite katmanı MVP |
| Team Memory Assistant | RAG sohbet | `/team-memory` | ◐ Assistant + embeddings mevcut; retrieval/chunking kalite borcu var |
| Pricing ekranı | Planlar | `/settings/billing` | ◐ Placeholder; Clerk Billing sync yok |
| Self-host mesajı | Kurulum akışı | public `/self-host`, `/docs/self-host` | ◐ Public anlatım var; app setup yok |

**Should Have** (CSV wearable, PDF mock, drill library, observations): drill + observations kısmen var; CSV/PDF/gerçek AI yok.

---

## 3. UserFlows ve Athlete Model Uyumu

### 3.1 Tasarım niyeti (doğru anlaşılan model)

`UserFlows.md` §4 + `DatabaseSchema.md` §2.3:

1. Antrenör **kadro kaydı** oluşturur (`athletes`, `user_id` boş olabilir).
2. Seans, yoklama, raporlar bu kayıt üzerinden yürür.
3. İsteğe bağlı davet → sporcu **hesabını bağlar** (claim), günlük veriyi kendisi girer.

Bu **bilinçli coach-first** modeldir; “her şeyi sporcu girer” değildir.

### 3.2 Doküman vs kod farkları

| Adım | UserFlows §6 | Kod |
|------|----------------|-----|
| Davet oluşturma | Profilden veya create sonrası | Athletes satırında Invite; otomatik token yok |
| E-posta gönderimi | Var | Yok (sadece link kopyala) |
| Claim sonrası onboarding | “Profilini tamamlar” | `/athlete/onboarding` |
| Athlete dashboard | Check-in, görevler | `/athlete/home` |
| `/athlete/profile` | SiteHaritasi’nde | Route var |

**Kalan boşluk:** Davet akışı hâlâ link temelli; e-posta gönderimi, davet yaşam döngüsü ve rol bazlı test kapsamı tamamlanmalı.

---

## 4. Mimari ve Teknik Uyumsuzluklar

### 4.1 Supabase client stratejisi (MVP)

| Konu | Durum |
|------|--------|
| Varsayılan erişim | **Admin client (service role)** — bilinçli MVP kararı |
| `createActionSupabase()` | Admin’e alias (readiness, nutrition, personal training dahil) |
| `createSupabaseServerClient()` + RLS | Dosyalar repoda; **Post-MVP** geçiş |
| Zod validation | Yok; `cleanString` / manuel kontroller |

**MVP risk notu:** RLS devre dışı; org izolasyonu action’lardaki `organization_id` + rol kontrollerine bağlı. Production sonrası Post-MVP’de RLS planlanır.

### 4.2 Migration tablosu (`AgentGorevDagilimi.md` §6)

Dokümandaki §6 tablo **güncel değil**. Gerçek durum `docs/supabase/README.md` ile uyumlu:

- `003_sessions.sql` … `008_team_memory.sql` **mevcut ve app route’larına bağlı**.
- `004_wearables_files.sql` / `005_ai_rag.sql` numaraları dokümanda farklı isimlendirilmiş; dosya adları `004_daily_data`, `005_drills`, vb.

### 4.3 Onboarding route yapısı

Plan: `(protected)/onboarding/`.  
Gerçek: `app/onboarding/` (guard dışı, doğru) — uyumlu ama plan metni güncellenmeli.

### 4.4 Eksik route’lar (`SiteHaritasi.md` örnekleri)

- Self-host setup route’ları
- Billing yönetim akışının gerçek içerikleri
- `api_keys` yönetimi

---

## 5. Faz Bazlı Gerçekleşen / Eksik

### Faz 1 — Foundation ✓ (büyük ölçüde tamam)

- SQL `002_phase1_foundation.sql`, tipler, admin client, webhook, onboarding, protected shell.

### Faz 2 — Team Operations ✓ / ◐

| Görev | Durum |
|-------|--------|
| Organization create/update/switch | ✓ |
| Ek organizasyon (plan gate) | ✓ kısmi |
| Team / Athlete CRUD | ✓ |
| Athlete invite token | ✓ |
| Staff davet / rol | ✓ link + claim akışı |
| `canCreateOrganization` / entitlement | ✓ kısmi |
| Org silme / arşiv | ✗ |
| Zod validation | ✗ |

### Faz 3 — Sessions & Daily Data ✓ / ◐

| Görev | Durum |
|-------|--------|
| Sessions + attendance + blocks | ✓ |
| Readiness / nutrition | ✓ (koç girişi) |
| Kontrollü sözlük (session, attendance, drills, memory) | ✓ |
| `/sessions/[id]` | ✓ |
| `personal_trainings` | ✓ |
| Sporcu kendi check-in | ✓ |

### Faz 4 — Wearables ◐

| Görev | Durum |
|-------|--------|
| `wearable_connections` kayıt | ✓ |
| Strava OAuth / sync pipeline | ✗ |
| CSV import işleme | ✗ (provider seçeneği var, işlem yok) |

### Faz 5 — AI & Team Memory ◐

| Görev | Durum |
|-------|--------|
| Drills kütüphanesi | ✓ |
| Observations / patterns | ✓ |
| `ai_reports` tablosu + üretim akışı | ✓ rules fallback + opsiyonel Gemini |
| LLM pipeline, embeddings, assistant | ◐ MVP mevcut |
| `documents` / RAG | ✓ `011_team_memory_rag.sql` + app kullanımı |

### Faz 6 — Billing & Self-host ✗

| Görev | Durum |
|-------|--------|
| Clerk Billing webhook | ✗ |
| PDF export | ✗ placeholder metin |
| Self-host setup | ✗ |
| `api_keys` UI | ✗ |

---

## 6. Doğru Giden Akışlar (teyit)

1. **Veri hiyerarşisi** — Organization → Team → Athlete → Session/Wellness/Nutrition kod ve migration ile uyumlu.
2. **Coach-first roster** — PRD §8.3 ve claim modeli ile uyumlu; invite eksik parçalar ürün tamamlama işi.
3. **Team Operations UI** — Dashboard, teams, athletes, sessions, training-planner, calendar, load-recovery, readiness, nutrition sayfaları çalışır CRUD/registry seviyesinde.
4. **Tasarım sistemi** — DashboardHero, MetricCard, minimal coach UI son revizyonlarla `DesignSystem.md` yönüne yakın.
5. **Migration disiplini** — `docs/supabase/003`–`008` incremental; README güncel.

---

## 7. Öncelik sırası (MVP production)

Canonical plan: **`docs/AgentGorevDagilimi.md`**

| Öncelik | Faz | İçerik |
|---------|-----|--------|
| **Şimdi** | M1 | Prod Supabase (002–011), Clerk webhook, deploy, env, manuel smoke |
| **Şimdi** | M2 | Davet URL’leri, billing/integrations/reports placeholder copy, hata mesajları |
| **Şimdi** | M3 | `apps/web` link audit, temel legal/pricing |
| İsteğe bağlı | M4 | Dashboard kartları, Resend davet, basit reports listesi |
| **En son** | Post-MVP | RLS, E2E, wearables OAuth, billing, AI/RAG, PDF, self-host |

---

## 8. Sıradaki işler (özet)

**Aktif geliştirme:** FAZ M1 → M2 → M3 (`AgentGorevDagilimi.md`).

**Ertelenen (Post-MVP backlog):** RLS + Clerk JWT, Playwright, Strava/CSV, Clerk Billing, PDF, self-host, RAG kalite, Zod, org arşiv.

§9–§11 (kırılma noktaları ve E2E kapıları) manuel smoke için referans; otomasyon Post-MVP.

---

## 9. Kırılma noktaları (Breaking Points)

Kırılma noktası: iki sistemin veya iki rolün birleştiği yer; burada küçük bir hata zincirleme etki yaratır. **İlgili E2E kapısına gelindiğinde mutlaka uçtan uca test edilmeli.**

Durum etiketleri: **🟢 Şimdi test edilebilir** · **🟡 Kısmi (bilinen eksiklerle)** · **🔴 Özellik gelince**

### 9.1 Kimlik ve oturum

| ID | Kırılma noktası | Neden kritik | E2E kapısı | Durum |
|----|-----------------|--------------|------------|--------|
| **BP-A1** | Clerk sign-up/sign-in → `users` satırı | Webhook gecikmezse onboarding FK hatası | [E2E-01](#e2e-01--auth--clerk--supabase-users) | 🟢 |
| **BP-A2** | Clerk JWT → Supabase RLS (`current_user_id`) | JWT template yoksa RLS client çalışmaz | [E2E-12](#e2e-12--rls-server-client-geçişi) | ⏭️ Post-MVP (MVP admin client) |
| **BP-A3** | Oturum yokken `/invite/*` vs `(protected)/*` | Yanlış redirect, claim kesilir | [E2E-06](#e2e-06--athlete-invite--claim) | 🟢 |
| **BP-A4** | Aynı e-posta: staff hesabı ile athlete claim | Yanlış org rolü / claim reddi | [E2E-06](#e2e-06--athlete-invite--claim) | 🟢 |

### 9.2 Kiracı (organization) sınırları

| ID | Kırılma noktası | Neden kritik | E2E kapısı | Durum |
|----|-----------------|--------------|------------|--------|
| **BP-T1** | `ohhike_active_org_id` cookie ↔ `getCurrentWorkspace()` | Yanlış org’da CRUD, veri sızıntısı hissi | [E2E-02](#e2e-02--onboarding--ilk-organizasyon) · [E2E-03](#e2e-03--organizasyon-değiştirme) | 🟢 |
| **BP-T2** | İkinci organizasyon oluşturma (plan gate) | Basic’te açılmamalı; Pro’da açılmalı | [E2E-04](#e2e-04--plan-gate-ek-organizasyon) | 🟡 |
| **BP-T3** | Admin client ile cross-org `id` tahmini | Uygulama kontrolü atlanırsa başka org verisi | Manuel: yanlış org id ile action | 🟡 (MVP admin; Post-MVP RLS) |
| **BP-T4** | Takım silme → sporcular / seanslar | Cascade veya bloklama tutarlı olmalı | [E2E-05](#e2e-05--takım--sporcu-kadrosu) | 🟢 |

### 9.3 Sporcu modeli (coach-first + claim)

| ID | Kırılma noktası | Neden kritik | E2E kapısı | Durum |
|----|-----------------|--------------|------------|--------|
| **BP-P1** | `athletes.user_id` null → claim → dolu | Çift claim, yanlış bağlama | [E2E-06](#e2e-06--athlete-invite--claim) | 🟢 |
| **BP-P2** | Davet token: süre, tek kullanım, yenileme | Eski link, çift kullanım | [E2E-06](#e2e-06--athlete-invite--claim) | 🟢 |
| **BP-P3** | Profil `email` ↔ Clerk primary email | Claim reddi veya yanlış kişi | [E2E-06](#e2e-06--athlete-invite--claim) | 🟢 |
| **BP-P4** | Claim → `organization_members.role = athlete` | Dashboard / menü yanlış kalır | [E2E-07](#e2e-07--sporcu-paneli-ve-rol-ayrımı) | 🔴 |
| **BP-P5** | Koç kadro verisi vs sporcu profil güncelleme | Üzerine yazma, yetki | [E2E-07](#e2e-07--sporcu-paneli-ve-rol-ayrımı) | 🔴 |

### 9.4 Operasyon verisi (sessions & daily)

| ID | Kırılma noktası | Neden kritik | E2E kapısı | Durum |
|----|-----------------|--------------|------------|--------|
| **BP-S1** | Session oluştur → draft attendance insert | Kadro seçilmeden yoklama boş | [E2E-08](#e2e-08--seans--yoklama--bloklar) | 🟢 |
| **BP-S2** | Attendance: delete-all + insert (tam replace) | Kayıp veri, RPE/agrı sıfırlanması | [E2E-08](#e2e-08--seans--yoklama--bloklar) | 🟢 |
| **BP-S3** | Session `team_id` değişimi → attendance silinir | Koç fark etmeden kadro düşer | [E2E-08](#e2e-08--seans--yoklama--bloklar) | 🟢 |
| **BP-S4** | Sözlük dışı absence/pain/RPE (server) | UI bypass, DB’ye saçma değer | [E2E-08](#e2e-08--seans--yoklama--bloklar) | 🟢 |
| **BP-S5** | Readiness `onConflict: athlete_id, checkin_date` | Aynı gün üzerine yazma | [E2E-09](#e2e-09--readiness--nutrition) | 🟢 |
| **BP-S6** | Koç başka takımın sporcusuna check-in | Org/team scope ihlali | [E2E-09](#e2e-09--readiness--nutrition) | 🟡 |

### 9.5 Wearables, AI, billing (gelecek)

| ID | Kırılma noktası | Neden kritik | E2E kapısı | Durum |
|----|-----------------|--------------|------------|--------|
| **BP-W1** | OAuth state + token şifreleme | Token sızıntısı | [E2E-10](#e2e-10--wearable-oauth--sync) | 🔴 |
| **BP-W2** | CSV import → `wearable_activities` | Duplicate, yanlış athlete | [E2E-10](#e2e-10--wearable-oauth--sync) | 🔴 |
| **BP-AI1** | Session verisi → LLM → `ai_reports` | Halüsinasyon, boş context | [E2E-11](#e2e-11--ai-session-raporu) | 🔴 |
| **BP-AI2** | Embedding → RAG → assistant cevap | Yanlış kaynak, cross-org chunk | [E2E-13](#e2e-13--team-memory-rag) | 🔴 |
| **BP-B1** | Clerk Billing webhook → `team_billing_entitlements` | Plan drift, feature gate yanlış | [E2E-14](#e2e-14--billing--entitlement) | 🔴 |

### 9.6 Migration ve ortam

| ID | Kırılma noktası | Neden kritik | Ne zaman test |
|----|-----------------|--------------|----------------|
| **BP-M1** | `002`–`008` sırası / idempotent tekrar | Policy duplicate, eksik tablo | Her yeni migration sonrası fresh DB + mevcut DB |
| **BP-M2** | `001` + `002` çakışması | İki kaynak şema | Yeni ortam kurulumunda tek checklist |
| **BP-M3** | `NEXT_PUBLIC_APP_URL` vs gerçek host | Davet linki kırık | [E2E-06](#e2e-06--athlete-invite--claim) deploy öncesi |

---

## 10. Uçtan uca test kapıları (E2E Gates)

**Kural:** İlgili geliştirme “done” sayılmadan önce ilgili E2E kapısı **en az bir kez** manuel veya otomasyonla koşulmalı. Sonuçları bu bölümdeki tabloya tarih/not olarak işaretle.

**Ortak önkoşullar (tüm kapılar):**

- Supabase: `002`–`008` uygulanmış (`docs/supabase/README.md`).
- Clerk: webhook endpoint canlı veya local tunnel; `user.created` → `users` satırı.
- Clerk → Supabase JWT template — yalnızca [E2E-12](#e2e-12--rls-server-client-geçişi) / Post-MVP RLS için zorunlu (MVP deploy’da gerekmez).
- İki test hesabı: **Coach** (owner/head_coach), **Athlete** (ayrı Clerk user).
- Tarayıcıda çerez/storage temizliği veya ayrı profiller (karışık oturum testleri için).

**Sonuç işaretleme:** `⬜ Bekliyor` · `✅ Geçti` · `❌ Kırık` · `⏭️ Ertelendi`

---

### E2E-01 — Auth + Clerk → Supabase users

| | |
|---|---|
| **Ne zaman** | Faz 1 tamamlandığında; Clerk/webhook değişikliğinde |
| **Kırılma** | BP-A1 |
| **Durum** | ⬜ |

**Akış**

1. Yeni e-posta ile `/register` → kayıt tamamla.
2. Supabase `users` tablosunda `id = Clerk sub`, `email` doğru.
3. `/login` → logout → tekrar login.
4. (Opsiyonel) Clerk’te kullanıcı sil → webhook ile `users` silinir mi kontrol.

**DB / log**

- `users` upsert; `audit_logs` gerekmez bu adımda.

**Negatif**

- Webhook kapalıyken onboarding’e girilirse hata mesajı anlamlı mı?

---

### E2E-02 — Onboarding + ilk organizasyon

| | |
|---|---|
| **Ne zaman** | Onboarding veya `completeOnboarding` action değişince |
| **Kırılma** | BP-T1, BP-M1 |
| **Durum** | ⬜ |

**Akış**

1. Yeni coach hesabı → `/onboarding` (org yokken).
2. Org + ilk takım + (opsiyonel) 1 sporcu → Dashboard.
3. Supabase: `organizations`, `organization_members` (role `owner`), `teams`, `team_billing_entitlements`, `athletes` (varsa).
4. `audit_logs`: `organization.created`, `team.created`.

**Negatif**

- Org adı boş → kayıt olmamalı.
- Onboarding bitmiş kullanıcı `/onboarding` → `/dashboard` redirect.

---

### E2E-03 — Organizasyon değiştirme

| | |
|---|---|
| **Ne zaman** | Sidebar org switcher veya cookie mantığı değişince |
| **Kırılma** | BP-T1 |
| **Durum** | ⬜ |

**Önkoşul:** Coach hesabında ≥2 organizasyon (veya test için 2 org seed).

**Akış**

1. Org A’da sporcu/takım oluştur.
2. Sidebar’dan Org B’ye geç → liste Org B verisini gösterir.
3. Org A’ya dön → önceki veri görünür.
4. Sayfa yenile → seçim cookie’de kalır.

---

### E2E-04 — Plan gate (ek organizasyon)

| | |
|---|---|
| **Ne zaman** | Billing / entitlement değişince |
| **Kırılma** | BP-T2, BP-B1 |
| **Durum** | ⬜ |

**Akış**

1. Basic plan takımı → `/settings/organization/new` → ikinci org engelli veya upgrade mesajı.
2. (Pro seed varsa) ikinci org açılabilir.

---

### E2E-05 — Takım + sporcu kadrosu

| | |
|---|---|
| **Ne zaman** | Team/Athlete CRUD değişince |
| **Kırılma** | BP-T4, BP-P1 (henüz claim yok) |
| **Durum** | ⬜ |

**Akış**

1. `/teams` → takım oluştur / düzenle.
2. `/athletes` → sporcu ekle (forma, mevki, e-posta).
3. Düzenle → takım değiştir → listede doğru takım.
4. Sil → listeden düşer; ilişkili seans/veri davranışı not edilir.

**Negatif**

- Geçersiz e-posta reddedilir.

---

### E2E-06 — Athlete invite + claim

| | |
|---|---|
| **Ne zaman** | `createAthleteInvite`, `claimAthleteProfile`, invite sayfası değişince |
| **Kırılma** | BP-P1, BP-P2, BP-P3, BP-A3, BP-A4, BP-M3 |
| **Durum** | ⬜ |

**Akış (mutlaka 2 tarayıcı / 2 Clerk user)**

1. Coach: `/athletes` → Invite → link kopyala.
2. Athlete: gizli pencerede link → sign up veya sign in.
3. “Connect profile” → başarı → yönlendirme.
4. DB: `athletes.user_id` = athlete Clerk id; `athlete_invites.accepted_at` dolu; `organization_members.role = athlete`.
5. Coach: aynı sporcu “Claimed” görünür.
6. Eski link tekrar açılırsa “already used” / expired.

**Negatif**

- Profilde farklı e-posta ile claim → hata (e-posta tanımlıysa).
- Coach hesabıyla aynı link → staff conflict mesajı.
- Süresi dolmuş token (14 gün sonrası veya DB’de `expires_at` geçmiş).

---

### E2E-07 — Sporcu paneli ve rol ayrımı

| | |
|---|---|
| **Ne zaman** | Athlete portal veya rol guard değiştiğinde |
| **Kırılma** | BP-P4, BP-P5 |
| **Durum** | ⬜ **Özellik mevcut, otomatik E2E eksik** |

**Akış**

1. Claim sonrası sporcu onboarding / profil tamamlama.
2. Athlete login → yalnızca sporcu menüsü (check-in, nutrition, kendi seans özeti).
3. `/athletes`, `/teams` coach CRUD → athlete rolü 403 veya redirect.
4. Coach login → tam menü; başka sporcunun verisine athlete hesabıyla erişim yok.

---

### E2E-08 — Seans + yoklama + bloklar

| | |
|---|---|
| **Ne zaman** | Sessions modülü veya sözlük/attendance action değişince |
| **Kırılma** | BP-S1 … BP-S4 |
| **Durum** | ⬜ |

**Akış**

1. `/sessions` → seans oluştur (tarih, intensity, focus select).
2. Draft attendance: 2 sporcu seç → kaydet.
3. Attendance modal: biri attended, biri absence reason + pain area + RPE → kaydet.
4. Training blocks: 2 blok, intensity select → kaydet.
5. Sayfa yenile → veriler persist.
6. Edit session → takım değiştir → attendance sıfırlanma davranışını doğrula (bilerek veya düzeltme sonrası).

**Negatif**

- API/action ile RPE `99` veya geçersiz absence slug → server red.

**Çapraz**

- `/training-planner` ve `/calendar` aynı seansı gösterir.

---

### E2E-09 — Readiness + nutrition

| | |
|---|---|
| **Ne zaman** | Daily data veya sporcu self-service gelince |
| **Kırılma** | BP-S5, BP-S6 |
| **Durum** | ⬜ **Özellik mevcut, coach + athlete varyantı testlenmeli** |

**Akış**

1. Coach/staff: `/readiness` → sporcu + tarih + skorlar + pain area select → kaydet.
2. Athlete: `/athlete/check-in` → kendi kaydını gir.
3. Aynı sporcu aynı gün tekrar → üzerine yazma.
4. Coach/staff: `/nutrition`, athlete: `/athlete/nutrition` → log kaydet.
5. `/load-recovery`, `/dashboard`, `/athlete/home` metrikleri güncellenir.

---

### E2E-10 — Wearable OAuth + sync

| | |
|---|---|
| **Ne zaman** | Faz 4 entegrasyonu tamamlandığında |
| **Kırılma** | BP-W1, BP-W2 |
| **Durum** | ⬜ **Beklemede** |

**Akış (hedef)**

1. Strava (veya provider) OAuth → connection kaydı.
2. Sync job → `wearable_daily_summaries` / `activities` dolu.
3. `/wearables` ve load-recovery’de yansıma.

---

### E2E-11 — AI session raporu

| | |
|---|---|
| **Ne zaman** | Session analysis veya prompt/rule akışı değiştiğinde |
| **Kırılma** | BP-AI1 |
| **Durum** | ⬜ **Özellik mevcut, otomatik E2E eksik** |

**Akış**

1. Tamamlanmış seans + attendance + check-in verisi olan takım.
2. `/sessions/[id]` üzerinden “Generate report” → `ai_reports` dolu.
3. Gemini varsa provider alanı LLM'i, yoksa rules fallback'i yansıtır.
4. Koç UI’da özet okunabilir; medikal iddia yok (PromptEngineering).

---

### E2E-12 — RLS + server client geçişi

| | |
|---|---|
| **Ne zaman** | `createSupabaseServerClient` action’lara taşındığında |
| **Kırılma** | BP-A2, BP-T3 |
| **Durum** | ⬜ **Beklemede** |

**Akış**

1. JWT template ile coach → yalnız kendi org verisi.
2. İkinci org’un `athlete_id` ile direct action → red (RLS veya uygulama).
3. Athlete → yalnız kendi `athletes` / check-in satırları.
4. Webhook/bootstrap hâlâ admin client — regressions yok.

---

### E2E-13 — Team Memory RAG

| | |
|---|---|
| **Ne zaman** | Assistant, embeddings veya retrieval değiştiğinde |
| **Kırılma** | BP-AI2 |
| **Durum** | ⬜ **Özellik mevcut, retrieval kalite testi eksik** |

**Akış**

1. `/team-memory` → gözlem + pattern kaydet.
2. Assistant thread aç → ilgili kaynaklarla cevap al.
3. Aynı sorgu başka org verisini döndürmez.
4. Kaynaklar ve fallback davranışı görünür şekilde doğrulanır.

---

### E2E-14 — Billing + entitlement

| | |
|---|---|
| **Ne zaman** | Clerk Billing webhook + feature gate |
| **Kırılma** | BP-B1, BP-T2 |
| **Durum** | ⬜ **Beklemede** |

---

## 11. E2E yol haritası (geliştirme sırası)

Önerilen test sırası — her satır tamamlandığında ilgili kapıyı işaretle:

```text
Şimdi koşulabilir (regresyon paketi):
  E2E-01 → E2E-02 → E2E-05 → E2E-06 → E2E-07 → E2E-08 → E2E-09 → E2E-11 → E2E-13

P2 sonrası:
  E2E-12 (RLS)

Faz 8–9 sonrası:
  E2E-10, E2E-14
```

### Hızlı kontrol listesi (release öncesi minimum)

- [ ] E2E-01 Auth / webhook
- [ ] E2E-02 Onboarding
- [ ] E2E-06 Invite + claim (2 kullanıcı)
- [ ] E2E-08 Session + attendance
- [ ] Org switch smoke (E2E-03)
- [ ] Davet linki production URL (BP-M3)

---

*Bu dosya canlı tutulmalı; `AgentGorevDagilimi.md` içindeki tikler teknik görev takibi, bu dosya PRD/akış uyumu ve E2E kapıları için referanstır.*
