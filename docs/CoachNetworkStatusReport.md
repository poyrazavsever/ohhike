# Coach Network — Durum Raporu

**Tarih:** 2026-05-17  
**Kapsam:** `apps/web` (marketing + coach network) ve `apps/app` (CoachOS)  
**Referans plan:** `docs/CoachNetworkPlan.md`, `docs/CoachNetworkTasks.md`

---

## 1. Özet

Coach Network MVP’sinin büyük kısmı kodda mevcut: şema, web keşif/başvuru, app teklif/remote sporcu, program atama, proof inceleme, değerlendirme ve realtime mesajlaşma. Son turda **navbar kullanıcı menüsü** (profil fotoğrafı + app tarzı dropdown), **web login/register** (`redirect_url` desteği) ve **enterprise navbar** tamamlandı.

**Tek Clerk hesabı:** Web ve app aynı Clerk uygulamasını ve `users` tablosunu paylaşır (K5).  
**Oturum (session):** Geliştirmede `localhost:3000` (web) ve `localhost:3001` (app) **ayrı origin** olduğu için giriş bir tarafta yapıldığında diğer tarafta otomatik oturum açılmaz. Production’da `ohhike.com` + `app.ohhike.com` için Clerk Dashboard’da çoklu domain / satellite yapılandırması gerekir (aşağıda §5).

---

## 2. Tamamlanan epikler (kodda doğrulandı)

| Epik | Durum | Notlar |
|------|--------|--------|
| **CN0** Şema & flag | ✅ | `012_coach_network.sql`, `NEXT_PUBLIC_COACH_NETWORK_ENABLED`, proxy 404 |
| **CN0B** Web auth | ✅ | Clerk, `/login`, `/register`, `/account-type`, sporcu onboarding |
| **CN1** Keşif | ✅ | `/find-coach`, `/coach-network/coaches/[slug]`, app profil edit |
| **CN2** Başvuru | ✅ | Apply form, app applications, web `/athlete/applications` |
| **CN3** Teklif & ilişki | ✅ | Packages, offers, accept, remote athletes |
| **CN4** Program | ✅ | Assignments, coach UI, athlete “today” (app) |
| **CN5** Proof | ⚠️ Kısmi | App: upload + review; **web’de sporcu proof yok** |
| **CN6** Reviews | ✅ | Public coach reviews (web), private rating + moderation (app) |
| **CN7** Mesajlaşma | ⚠️ Kısmi | Realtime hook + web `/athlete/messages` + app `/coach-network/messages`; badge yok |
| **CN8** AI | ⬜ | Recommended coaches, AI proof draft yok |
| **CN9** Deploy ops | ⚠️ Kısmi | Env örnekleri var; prod Clerk/Realtime checklist manuel |

---

## 3. Son eklenen: Auth & navbar

### 3.1 Kullanıcı menüsü (web)

- Bileşen: `apps/web/components/layout/navbar-user-menu.tsx`
- **Giriş yok:** Sign in, Create account
- **Giriş var (sporcu):** Applications, Messages, Reviews, My profile, Manage account (Clerk), Sign out
- **Giriş var (koç):** Open CoachOS → app dashboard
- Profil fotoğrafı Clerk `user.imageUrl` ile gösterilir

### 3.2 Login / register (web)

- Sayfalar: `/login`, `/register` — Clerk `SignIn` / `SignUp`, app ile aynı `authAppearance`
- `redirect_url` query: proxy ve korumalı sayfalardan gelen tam URL veya path güvenli şekilde işlenir (`lib/auth-redirect.ts`)
- Kayıt/giriş sonrası varsayılan: `/account-type` → sporcu/koç ayrımı

### 3.3 Navbar düzeni

- **Resources** dropdown (Self-host, Docs, Community, Blog)
- **Coach Network** dropdown (keşif veya sporcu linkleri)
- Sağ üst: GitHub + **hesap menüsü** (coach network açıkken)

---

## 4. Eksikler ve öncelikler

### P0 — Ürün / güvenlik

| # | Eksik | Yüzey | Öneri |
|---|--------|--------|--------|
| 1 | **Web sporcu proof upload** (CN5-02 web) | Web | `/athlete/proofs` veya app’e deep link |
| 2 | **Realtime RLS + Clerk JWT** (CN0-10 tam) | DB | Şu an insert admin; subscribe anon+RLS veya JWT template doğrulama |
| 3 | **CN7-01** Realtime publication prod’da açık mı | Ops | Supabase Dashboard kontrol listesi |
| 4 | **Clerk redirect URLs** web domain (CN0B-04) | Ops | `localhost:3000`, prod marketing domain |
| 5 | **`apps/web/lib/database.types.ts`** | Web | App types ile senkron (tam şema) |

### P1 — UX / tutarlılık

| # | Eksik | Not |
|---|--------|-----|
| 6 | **Sporcu ana sayfa (web)** | `/athlete/home` yok; onboarding sonrası applications/messages’a yönlendirme netleştirilmeli |
| 7 | **Teklif listesi (web)** | `/athlete/offers` index yok; sadece `/athlete/offers/[offerId]` — bildirim/link akışı |
| 8 | **Mesaj badge** (CN7-08) | Sidebar/navbar okunmamış sayısı |
| 9 | **Auth shell görsel birebir** | App’te arka plan görseli; web gradient — asset paylaşımı isteğe bağlı |
| 10 | **Çapraz domain SSO** | §5 — production Clerk satellite |

### P2 — Should have

| # | Eksik |
|---|--------|
| 11 | CN8 AI öneri + proof draft |
| 12 | Email bildirimleri (teklif, yeni mesaj) |
| 13 | `@repo/coach-network` paylaşılan hook/types (web+app duplicate azaltma) |
| 14 | E2E testler (başvuru → teklif → kabul → mesaj) |
| 15 | CN3-12 regression test otomasyonu (manuel roster yolu) |

### P3 — Bilinçli MVP sınırları (planla uyumlu)

- Manuel ödeme onayı (B1 billing yok)
- Mesajda sadece metin (dosya eki yok)
- Ödeme / Stripe entegrasyonu yok
- Hukuki consent metinleri ürün metni olarak gözden geçirilmeli

---

## 5. Tek oturum (SSO) — web + app

| Ortam | Davranış |
|--------|----------|
| **Local dev** | Aynı Clerk hesabı, **iki ayrı oturum** (3000 vs 3001). Web’de giriş → web sayfaları; app için app’te tekrar giriş gerekir. |
| **Production (hedef)** | Clerk’ta primary domain + satellite veya allowed origins; cookie domain stratejisi (`*.ohhike.com`) ile tek giriş mümkün. |

**Şu an önerilen akış:**

1. Sporcu: web’de `/register` → `/account-type` → `/athlete/onboarding` → find-coach / applications / messages  
2. Koç: web’de coach seçimi → app `/onboarding` (org oluşturma)  
3. Aynı e-posta her iki yüzeyde **aynı Clerk user id**; veri `users` + Supabase service role ile tutarlı

**Ops checklist (Clerk Dashboard):**

- [ ] Web URL: sign-in, sign-up, after sign-out  
- [ ] App URL: aynı Clerk app altında  
- [ ] Supabase JWT template `supabase` (realtime için)  
- [ ] Production’da satellite / multi-domain dokümantasyonu Clerk’tan uygulanmış

---

## 6. Route haritası (özet)

### Web (`apps/web`)

| Route | Açıklama |
|-------|----------|
| `/find-coach` | Public liste |
| `/coach-network/coaches/[slug]` | Public profil |
| `/login`, `/register` | Clerk auth |
| `/account-type` | Sporcu / koç seçimi |
| `/athlete/onboarding` | Marketplace profil |
| `/athlete/applications` | Başvurular |
| `/athlete/messages` | Mesajlar |
| `/athlete/offers/[offerId]` | Teklif detay |
| `/athlete/reviews` | Değerlendirme |
| `/coach-network/apply/[id]` | Başvuru formu |

### App (`apps/app`)

| Route | Açıklama |
|-------|----------|
| `/coach-network/*` | Profil, applications, packages, offers, remote-athletes, proofs, reviews, messages |
| `/athlete/proofs` | Proof upload (sporcu) |
| `/login`, `/register` | CoachOS auth |

---

## 7. Env kontrol listesi

**Web (`apps/web/.env.local`):**

```bash
NEXT_PUBLIC_COACH_NETWORK_ENABLED=true
NEXT_PUBLIC_WEB_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...   # app ile aynı
CLERK_SECRET_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...        # realtime subscribe
SUPABASE_SERVICE_ROLE_KEY=...            # server actions
```

**App:** Mevcut Clerk + Supabase service role (değişmedi).

Değişiklikten sonra **web ve app dev server restart**.

---

## 8. Önerilen sonraki sprint sırası

1. **CN5 web proofs** — sporcu kanıt yüklemesini web’e taşı veya app’e net CTA  
2. **CN7 ops + badge** — Realtime doğrula, okunmamış mesaj göstergesi  
3. **CN0B-04 / CN9-01** — Clerk + Dokploy prod env  
4. **Athlete home + offers list** — web sporcu deneyimini kapat  
5. **CN8** — AI öneri (isteğe bağlı)

---

## 9. İlgili dosyalar

| Konu | Dosya |
|------|--------|
| Task listesi | `docs/CoachNetworkTasks.md` |
| SQL şema | `docs/supabase/012_coach_network.sql` |
| Web proxy / 404 | `apps/web/proxy.ts` |
| Navbar kullanıcı | `apps/web/components/layout/navbar-user-menu.tsx` |
| Auth redirect | `apps/web/lib/auth-redirect.ts` |
| Mesajlar (web) | `apps/web/app/actions/coach-network-messages.ts` |
| Mesajlar (app) | `apps/app/app/actions/coach-network-messages.ts` |

---

*Bu rapor kod tabanı taraması ve `CoachNetworkTasks.md` ile karşılaştırılarak üretilmiştir. Task satırlarındaki ✅ işaretleri henüz `CoachNetworkTasks.md` içinde toplu güncellenmemiş olabilir; kaynak doğruluk için bu dosyayı referans alın.*
