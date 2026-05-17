# OH HIKE — Coach Network MVP Geliştirme Özeti

**Tarih:** 2026-05-17  
**Durum:** Fonksiyonel MVP tamamlandı; sırada **UI/UX cilalandırma**  
**İlgili planlar:** `docs/CoachNetworkPlan.md`, `docs/CoachNetworkTasks.md`, `docs/CoachNetworkStatusReport.md`

---

## 1. Genel bakış

OH HIKE monorepo’su iki ana yüzeyden oluşur:

| Uygulama | Domain (prod örnek) | Rol |
|----------|---------------------|-----|
| **`apps/web`** | `ohhike.com` | Marketing sitesi + **Coach Network sporcu yüzeyi** (keşif, kayıt, başvuru, mesaj, teklif kabul, review) |
| **`apps/app`** | `app.ohhike.com` | **CoachOS** — takım operasyonları + **Coach Network koç yüzeyi** (profil, başvuru kutusu, teklif, remote sporcu, program, proof, mesaj) |

**Coach Network**, mevcut CoachOS’u bozmadan üzerine eklenen bir **uzaktan koçluk marketplace** katmanıdır. İki sporcu yolu bilinçli olarak ayrılmıştır:

```text
YOL A — Mevcut CoachOS (değişmedi)
  Koç org’da athletes oluşturur → davet → claim → athlete portal

YOL B — Marketplace (yeni)
  Sporcu web’de kayıt → find-coach → başvuru → teklif → kabul
  → coach org’da athletes + remote_coaching_relationships

YOL C — Kesişim
  A’daki sporcu marketplace kullanmayabilir
  B’deki sporcu user_id ile gelir; kadro otomatik bağlanır
```

**Tek kimlik:** Clerk (web + app aynı uygulama) + Supabase `public.users`.  
**Veri erişimi (MVP):** Server action’larda çoğunlukla **service role**; Realtime dinleme için tarayıcıda **anon key + Clerk JWT (`supabase` template)**.

---

## 2. Mimari (yüksek seviye)

```text
                    ┌─────────────────┐
                    │  Clerk (auth)   │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   apps/web            apps/app          Supabase
   (Next.js)           (Next.js)         PostgreSQL
         │                   │           Storage
         │                   │           Realtime
         └─────────┬─────────┘
                   │
     Coach Network server actions (admin client)
     + browser Realtime (INSERT on marketplace_messages)
```

**Feature flag:** `NEXT_PUBLIC_COACH_NETWORK_ENABLED`  
- `true` → Coach Network route’ları açık  
- Production’da **build time + runtime** set edilmeli (client bundle’a gömülür)  
- Local dev: env yoksa `development` modunda varsayılan açık

**Proxy:** `apps/web/proxy.ts`, `apps/app/proxy.ts` — auth + flag; production’da public origin için `lib/request-origin.ts` (Docker `HOSTNAME=0.0.0.0` redirect düzeltmesi).

---

## 3. Veritabanı (Supabase)

### 3.1 Migration dosyaları

| Dosya | İçerik |
|-------|--------|
| `docs/supabase/012_coach_network.sql` | Ana şema: profiller, başvuru, teklif, ilişki, mesaj, proof, review, RLS, Realtime publication |
| `docs/supabase/013_marketplace_messages_realtime.sql` | CN7-01: `replica identity full` + `supabase_realtime` publication doğrulama |
| `docs/supabase/dev_seed_coach_network_profiles.sql` | 3 demo public koç (local/test) |
| `docs/supabase/dev_upgrade_team_plan.sql` | Dev plan yükseltme (CoachOS entitlement test) |

Sıra: `docs/supabase/README.md` içindeki production migration listesi.

### 3.2 Önemli tablolar

| Tablo | Amaç |
|-------|------|
| `coach_marketplace_profiles` | Koç vitrin profili (`slug`, `is_public`, rating alanları) |
| `athlete_marketplace_profiles` | Sporcu marketplace profili (hedefler, spor ilgi alanları) |
| `coaching_packages` | Koç paket şablonları |
| `coach_network_applications` | Başvuru lifecycle |
| `coach_network_offers` | Teklif lifecycle |
| `remote_coaching_relationships` | Aktif uzaktan ilişki |
| `marketplace_conversations` + `participants` + `messages` | Thread + mesajlaşma |
| `coaching_program_assignments` | Remote sporcu program ataması |
| `training_proofs` | Antrenman kanıtı (storage: `coaching-proofs`) |
| `coach_reviews` + `coach_reputation_events` | Public review + reputation ledger |

`athletes.source`: `roster` | `marketplace` | `invite_claim` — mevcut kadro akışı korunur.

---

## 4. Epik epik tamamlanan işler

### CN0 — Altyapı ve şema ✅

- SQL migration `012`, feature flag, proxy 404 when disabled
- App `database.types.ts` güncel; web types kısmen minimal (işlevsel)

### CN0B — Web auth ve sporcu kayıt ✅

| Özellik | Detay |
|---------|--------|
| Clerk | `ClerkProvider`, `/login`, `/register`, `authAppearance` (app ile uyumlu shell) |
| Hesap tipi | `/account-type` → `athlete` \| `coach` metadata |
| Yönlendirme | Koç → `app` onboarding; sporcu → `/athlete/onboarding` |
| `users` satırı | `lib/ensure-supabase-user.ts` — web kayıtta FK hatası önlendi (webhook app’te kalsa da) |
| Navbar | Enterprise: Resources, Coaches, Coach Network dropdown, profil menüsü |
| Redirect | `lib/auth-redirect.ts`, `redirect_url` güvenli işleme |

### CN1 — Keşif ve public koç profili ✅

**Web**

| Route | Açıklama |
|-------|----------|
| `/find-coach` | Canlı Supabase listesi (filtre: spor, remote, sıralama) — mock değil |
| `/coach-network/coaches/[slug]` | Public profil, paketler, public review’lar |

**App**

| Route | Açıklama |
|-------|----------|
| `/coach-network/profile` | Marketplace profil düzenleme, `is_public`, slug |

**Lib:** `apps/web/lib/coach-network/public-queries.ts`, `CoachCard` bileşeni.

### CN2 — Başvuru ✅

**Web**

| Route | Açıklama |
|-------|----------|
| `/coach-network/apply/[coachProfileId]` | Form, consent snapshot |
| `/athlete/applications` | Sporcu başvuru listesi |

**App**

| Route | Açıklama |
|-------|----------|
| `/coach-network/applications` | Koç başvuru listesi |
| `/coach-network/applications/[id]` | Detay, durum geçişleri, (opsiyonel AI özet alanı) |

**Otomatik:** Başvuruda `marketplace_conversations` type=`application` + participants.

**Action:** `createCoachNetworkApplication` (web).

### CN3 — Teklif ve remote ilişki ✅

**App**

| Route | Açıklama |
|-------|----------|
| `/coach-network/packages` | Paket CRUD |
| Application detaydan | Teklif oluştur / gönder |
| `/coach-network/remote-athletes` | Remote sporcu listesi |
| `/coach-network/remote-athletes/[relationshipId]` | Detay, program atama, private rating |

**Web**

| Route | Açıklama |
|-------|----------|
| `/athlete/offers/[offerId]` | Teklif detay, kabul / red |

**Kabul akışı:** `acceptCoachNetworkOffer` — org’da `athletes` (`source=marketplace`), `remote_coaching_relationships`, manuel `payment_status`.

### CN4 — Program atama ✅

- Tablo: `coaching_program_assignments`
- Koç: remote athlete’e program ata (app)
- Sporcu: bugünkü program / tamamlama (app athlete portal — web’de ayrı home yok)

### CN5 — Proof ⚠️ (app tam, web yok)

**App**

| Route | Açıklama |
|-------|----------|
| `/athlete/proofs` | Upload |
| `/coach-network/proofs` | İnceleme, onay / revizyon |
| Proof thread | `marketplace_messages` ile bağlantılı |

**Web:** Sporcu proof upload sayfası **yok** (bilinçli MVP boşluğu veya sonraki UI fazında).

### CN6 — Değerlendirme ve reputation ✅

**Web**

| Route | Açıklama |
|-------|----------|
| `/athlete/reviews` | Tamamlanan ilişkiler için review listesi |
| `/athlete/reviews/[relationshipId]` | Public coach review gönderimi |
| Public profil | Onaylı review’lar + reputation skoru |

**App**

| Route | Açıklama |
|-------|----------|
| `/coach-network/reviews` | Moderation, private athlete rating |

### CN7 — Mesajlaşma (Realtime) ✅ (kod); ops doğrulama ◐

**Nasıl mesaj atılır**

1. Başvuru / teklif / proof ile thread oluşur  
2. Sporcu: `/athlete/messages` → thread → metin → Send  
3. Koç: `/coach-network/messages` → aynı thread  
4. Karşı taraf: Supabase Realtime INSERT (veya sayfa yenileme)

**Kod**

| Parça | Konum |
|-------|--------|
| List + thread UI | `conversation-thread.tsx` (web + app) |
| Realtime hook | `use-marketplace-conversation-realtime.ts` |
| Browser Supabase | `lib/supabase-browser.ts` |
| Send action | `coach-network-messages.ts` (rate limit 800ms, max 4000 char) |
| Live göstergesi | `marketplace-realtime-indicator.tsx` |

**Ops:** `docs/supabase/CN7-realtime-setup.md`, `013_marketplace_messages_realtime.sql`, Clerk JWT `supabase`, web `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

**Yok (MVP+):** Okunmamış mesaj badge (CN7-08), dosya eki.

### CN8 — AI ⬜

- Find-coach “Recommended for you” yok  
- AI başvuru özeti / proof draft yok (UI alanları kısmen hazır olabilir)

### CN9 — Deploy ◐

- `Dockerfile` / `Dockerfile.web`, `deploy/dokploy.env.*.example`, `deploy/README.md`
- Düzeltmeler: `COACH_NETWORK_ENABLED` build arg, `request-origin`, `/api/health` (web+app)
- Prod checklist manuel (Clerk domains, Realtime, env rebuild)

---

## 5. Route haritası (özet)

### Web — Coach Network (`apps/web/app/(coach-network)`)

| Route | Auth | Kullanıcı |
|-------|------|-----------|
| `/find-coach` | Public | Ziyaretçi / sporcu |
| `/coach-network/coaches/[slug]` | Public | Ziyaretçi |
| `/login`, `/register` | Public | Tümü |
| `/account-type` | Evet | Yeni kayıt |
| `/athlete/onboarding` | Evet | Sporcu |
| `/coach-network/apply/[id]` | Evet | Sporcu |
| `/athlete/applications` | Evet | Sporcu |
| `/athlete/offers/[offerId]` | Evet | Sporcu |
| `/athlete/messages`, `.../[conversationId]` | Evet | Sporcu |
| `/athlete/reviews`, `.../[relationshipId]` | Evet | Sporcu |

Marketing sayfaları (`/`, `/pricing`, `/features`, …) Coach Network’ten bağımsız çalışır.

### App — Coach Network (`apps/app/app/(protected)/coach-network`)

| Route | Kullanıcı |
|-------|-----------|
| `/coach-network/profile` | Koç |
| `/coach-network/applications`, `[id]` | Koç |
| `/coach-network/packages` | Koç |
| `/coach-network/remote-athletes`, `[relationshipId]` | Koç |
| `/coach-network/proofs`, `[id]` | Koç |
| `/coach-network/reviews` | Koç |
| `/coach-network/messages`, `[conversationId]` | Koç |

Sporcu proof: `/athlete/proofs` (app athlete portal, coach-network layout dışında).

---

## 6. Önemli lib ve server action’lar

### Web (`apps/web`)

| Dosya | Rol |
|-------|-----|
| `lib/coach-network.ts` | Feature flag |
| `lib/coach-network/public-queries.ts` | Public coach list/detail |
| `lib/coach-network/nav.ts` | Navbar “Coaches” link sabiti |
| `lib/ensure-supabase-user.ts` | `users` upsert (Clerk → Supabase) |
| `lib/auth-redirect.ts` | Post-login redirect |
| `lib/request-origin.ts` | Proxy redirect URL (prod Docker) |
| `lib/supabase-admin.ts` | Service role |
| `lib/supabase-browser.ts` | Realtime client |
| `app/actions/coach-network-*.ts` | applications, offers, messages, reviews |

### App (`apps/app`)

| Dosya | Rol |
|-------|-----|
| `lib/coach-network/*` | offers, proofs, reviews, program-assignments, accept-offer |
| `app/actions/coach-network*.ts` | marketplace profile, offers, programs, proofs, reviews, messages |
| `app/api/webhooks/clerk/route.ts` | `users` upsert (user.created) |

---

## 7. UI / bileşen envanteri (cilalandırma başlangıç noktası)

Mevcut UI **işlevsel MVP** seviyesinde: `@repo/ui`, Tailwind, tutarlı `rounded-3xl` / `card` kalıpları var; **henüz Coach Network’e özel tasarım sistemi veya motion polish yok**.

### Web — öncelikli cilalandırma alanları

1. **Marketing navbar** — `navbar.tsx`, `navbar-user-menu.tsx`, dropdown’lar  
2. **Find coach** — filtre bar, coach card grid, boş durum  
3. **Public coach profil** — hero, paket kartları, review listesi  
4. **Auth shell** — login/register (app ile görsel hizalama)  
5. **Athlete portal sayfaları** — onboarding wizard, applications, messages thread, offer detay  
6. **Apply form** — uzun form, consent, mobil

### App — öncelikli cilalandırma alanları

1. **Coach Network sidebar** grubu — ikon, aktif state, messages badge (ileride)  
2. **Applications pipeline** — liste + detay + offer compose  
3. **Remote athletes** — liste, relationship detay, program assign  
4. **Messages thread** — web ile **aynı görsel dil** (paylaşılan UX)  
5. **Proof review** — medya önizleme, durum badge’leri  
6. **Marketplace profile form** — preview / public toggle

### Ortak hedefler (UI fazı)

- [ ] Coach Network’te tek tipografi / spacing scale  
- [ ] Empty state illüstrasyon veya tutarlı ikon seti (`@iconify/react` solar)  
- [ ] Loading skeleton’lar (liste + thread)  
- [ ] Mobil breakpoint audit (özellikle web athlete + find-coach)  
- [ ] Thread UI: balon hizalama, timestamp, scroll-to-bottom on new message  
- [ ] Başarı / hata toast’ları (şu an çoğunlukla inline error)  
- [ ] Dark mode tutarlılığı (varsa theme token’ları)  
- [ ] Türkçe / İngilizce copy pass (şu an karışık EN ağırlıklı)

---

## 8. Bilinçli olarak ertelenen / küçük boşluklar

Bunlar **ürünü kırmaz**; UI fazından sonra veya ops ile kapatılır:

| Konu | Önem | Not |
|------|------|-----|
| Web sporcu proof | Orta | App’te var |
| `/athlete/offers` liste | Düşük | Teklifler applications üzerinden linkleniyor |
| Web `/athlete/home` | Düşük | App athlete home’da program var |
| Mesaj unread badge | Düşük | CN7-08 |
| CN8 AI | Düşük | Should have |
| Email (Resend) | Düşük | Teklif / yeni mesaj |
| E2E testler | Orta | Manuel test yeterli MVP için |
| `@repo/coach-network` paket | Düşük | Kod web/app’te duplicate |
| Stripe / otomatik ödeme | Plan dışı | Manuel payment onay |
| Mesaj dosya eki | v2 | Sadece text MVP |
| Clerk cross-domain SSO | Prod ops | `*.ohhike.com` satellite |

---

## 9. Ortam değişkenleri (hatırlatma)

### Web `.env.local`

```bash
NEXT_PUBLIC_COACH_NETWORK_ENABLED=true
NEXT_PUBLIC_WEB_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # Realtime için zorunlu
SUPABASE_SERVICE_ROLE_KEY=...
```

### App `.env.local`

CoachOS + aynı Clerk/Supabase + `NEXT_PUBLIC_COACH_NETWORK_ENABLED=true`.

Değişiklikten sonra **dev server restart**; production’da **image rebuild**.

---

## 10. Uçtan uca test senaryosu (smoke)

1. Seed: `dev_seed_coach_network_profiles.sql` (org owner gerekir)  
2. Web: sporcu kayıt → account-type → onboarding → find-coach → apply  
3. App: applications → teklif gönder  
4. Web: offer kabul  
5. App: remote athlete → program ata  
6. App: proof upload; koç review  
7. Web + app: aynı thread’de mesaj (Live kontrolü)  
8. Web: coach review; public profilde görünüm  
9. App: reviews moderation  

---

## 11. Sonuç: MVP tamam mı?

**Evet — Coach Network MVP iş akışı kodda tamamlandı.**

- Keşif → başvuru → teklif → kabul → program → proof → mesaj → review zinciri çalışır durumda tasarlandı ve implemente edildi.  
- Kalan işler çoğunlukla **ops (env, migration, Realtime)**, **küçük UX boşlukları** (web proof, offers list) ve **cilalandırma**dır.  
- Bir sonraki faz: **bu belgedeki §7 UI listesi** üzerinden sistematik görsel iyileştirme.

---

## 12. İlgili dokümanlar

| Dosya | İçerik |
|-------|--------|
| `docs/CoachNetworkPlan.md` | Ürün analizi ve faz planı |
| `docs/CoachNetworkTasks.md` | Epik task listesi (✅ işaretleri güncellenebilir) |
| `docs/CoachNetworkStatusReport.md` | Deploy / eksikler / P0–P3 |
| `docs/supabase/CN7-realtime-setup.md` | Mesajlaşma Realtime kurulum |
| `docs/supabase/README.md` | Migration sırası |
| `deploy/README.md` | Dokploy, 404/0.0.0.0 redirect |

---

*Bu özet, 2026-05-17 itibarıyla kod tabanı ve konuşma sürecinde yapılan işlere dayanır. UI fazı ilerledikçe §7 checklist güncellenmelidir.*
