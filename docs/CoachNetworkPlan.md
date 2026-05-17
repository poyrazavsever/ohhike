# Coach Network & Remote Coaching Marketplace — Analiz ve Faz Planı

**Versiyon:** v1.0 (uygulama planı)  
**PRD kaynağı:** Coach Network & Remote Coaching Marketplace PRD v1.0  
**İlgili:** `docs/DurumVeYolHaritasi.md`, `docs/PricingPolicy.md`, `docs/DatabaseSchema.md`  
**Güncelleme:** 2026-05-17

---

## 1. Özet ve karar

Bu feature, mevcut **CoachOS takım operasyonlarının üzerine** eklenen ikinci bir katmandır. Takım/org/athlete/session yapısı **bozulmaz**; uzaktan koçluk ilişkileri ayrı bir **marketplace lifecycle** ile yönetilir.

**Ürün bölünmesi (senin kararın):**

| Yüzey | Rol | Kullanıcı |
|--------|-----|-----------|
| **`apps/web`** | Keşif, public profil, başvuru başlangıcı, (ileride) mesajlaşma, SEO | Sporcu ağırlıklı + ziyaretçi |
| **`apps/app`** | Başvuru kutusu, teklif, ilişki, program, proof, değerlendirme, AI özet | Antrenör ağırlıklı + sporcu yönetim paneli |

**Auth:** İki uygulama da **aynı Clerk uygulaması** kullanmalı (tek `users` tablosu, tek oturum). Web’de bugün Clerk yok → eklenmeli. Kayıt/giriş sonrası rol bazlı yönlendirme:

- Antrenör / staff → `app.<domain>` (CoachOS)
- Sporcu (marketplace odaklı) → `app.<domain>/athlete/...` veya web’de kısıtlı portal

---

## 2. Mevcut altyapıyla ilişki

### 2.1 Zaten var (yeniden yazma)

| Modül | CoachOS | Coach Network’te kullanım |
|--------|---------|---------------------------|
| `users` + Clerk webhook | ✅ | Tüm profiller |
| `organizations` / `teams` / `athletes` | ✅ | Teklif kabul → `athletes` kaydı |
| `personal_trainings` | ✅ | Program atama (genişletilir) |
| `wellness_checkins` / `nutrition_logs` | ✅ | İzinli paylaşım |
| `wearable_*` | ✅ | İzinli özet |
| `ai_reports` | ✅ | Paket “AI dahil” gate |
| `team_billing_entitlements` | ✅ | Marketplace Pro gate (ileride) |
| Storage buckets | ✅ | Proof medya (private) |

### 2.2 Kısmen / yok

| PRD modülü | Durum |
|------------|--------|
| Coach public profile | ❌ |
| Coach discovery | ❌ (web `/community` mock) |
| Application & offer | ❌ |
| Remote coaching relationship | ❌ (org athlete ≠ marketplace contract) |
| Coaching packages | ❌ |
| Proof (marketplace) | ❌ (session_files farklı amaç) |
| Threaded messaging | ❌ |
| Rating / trust score | ❌ |
| AI matchmaking | ❌ |
| Coach Network Q&A | ❌ (ayrı sosyal modül) |

### 2.3 Mimari ilke

```text
Organization / Team (mevcut)     Remote Coaching (yeni)
        │                                │
        │    offer_accepted              │
        └──────────────► athletes + remote_coaching_relationships
```

- **Takım içi sporcu:** Mevcut kadro modeli (`athletes`, coach-first).
- **Marketplace sporcu:** Teklif kabulünde antrenörün **workspace organization**’ına `athlete` + `remote_coaching_relationships` satırı.
- Sporcu **aynı anda birden fazla uzaktan antrenör** → MVP’de **1 aktif remote ilişki** veya “aynı org içinde çoklu coach” kuralı netleştirilmeli (öneri: org başına 1 aktif marketplace coach, v2’de çoklu).

---

## 3. Web vs App — route haritası

### 3.1 `apps/web` (public + sporcu keşif)

| Route | Açıklama | Auth |
|-------|----------|------|
| `/find-coach` veya `/coach-network` | Keşif, filtre, coach card | Hayır |
| `/coach-network/coaches/[slug]` | Public coach profile | Hayır |
| `/coach-network/apply/[coachId]` | Başvuru formu | Evet (Clerk) |
| `/coach-network/my-applications` | Sporcu başvuru durumu | Evet |
| `/coach-network/messages` | Thread listesi (v1.1+) | Evet |
| `/login`, `/register` | Clerk (yeni) | — |

CTA’lar: “Antrenör paneline git” → `NEXT_PUBLIC_APP_URL` (mevcut `getAppUrl`).

### 3.2 `apps/app` (yönetim)

| Route | Açıklama | Rol |
|-------|----------|-----|
| `/coach-network/profile` | Kendi marketplace profilini düzenle | Coach |
| `/coach-network/applications` | Gelen başvurular | Coach |
| `/coach-network/offers` | Teklif taslağı / gönderim | Coach |
| `/coach-network/remote-athletes` | Aktif uzaktan sporcular | Coach |
| `/coach-network/packages` | Paket CRUD | Coach |
| `/athlete/coaches` | Bağlı antrenörler, teklifler | Athlete |
| `/athlete/applications` | Başvurularım | Athlete |
| `/athlete/proofs` | Proof yükleme | Athlete |
| Proof review | Remote athlete detay / session alt akış | Coach |

Sidebar: yeni grup **“Coach Network”** (Pro gate: `wearable_enabled` benzeri yeni flag `marketplace_enabled` veya Pro plan varsayılan).

---

## 4. Auth stratejisi (web + app)

### 4.1 Tek Clerk instance

| Env | Web | App |
|-----|-----|-----|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Aynı | Aynı |
| `CLERK_SECRET_KEY` | Server routes | Server |
| Redirect URLs | `https://www.<domain>/...` | `https://app.<domain>/...` |

Web’e eklenecek: `@clerk/nextjs`, `middleware.ts`, `(auth)/login`, `(auth)/register`, `ClerkProvider` layout’ta.

### 4.2 Rol ve yönlendirme

Mevcut `organization_members.role` + athlete portal ayrımı korunur.

| Kayıt tipi | İlk akış |
|------------|----------|
| Antrenör | App onboarding → org + team → marketplace profil kurulumu |
| Sporcu | Web’de hedef/profil → find-coach → başvuru; isteğe bağlı app `/athlete/onboarding` |

**Önemli:** Marketplace sporcu, Clerk `users` satırına sahip olmalı (webhook). Başvuru `user_id` ile bağlanır.

### 4.3 Paylaşılan Supabase

- Web server actions / route handlers: **service role** (MVP, app ile aynı pattern) veya anon + RLS (Post-MVP).
- Public coach list: SSR + sadece `is_public = true` profiller.

---

## 5. Veri modeli (öneri — migration `012_coach_network.sql`)

Aşağıdaki tablolar **idempotent** migration ile eklenir. Enum’lar PRD statüleriyle hizalı.

### 5.1 Çekirdek tablolar

| Tablo | Amaç |
|-------|------|
| `coach_marketplace_profiles` | Public profil (user_id, slug, bio, specialties[], sports[], modes[], pricing_display, capacity, response_time_avg, is_public, verified_at) |
| `coaching_packages` | Antrenör paket şablonları |
| `coach_network_applications` | Sporcu → antrenör başvurusu + form JSON + status |
| `coach_network_offers` | Antrenör → sporcu teklifi + package snapshot + status |
| `remote_coaching_relationships` | Kabul sonrası ilişki (coach_user_id, athlete_id, org_id, offer_id, status, payment_status) |
| `coaching_program_assignments` | Program atama (links personal_training veya yeni program header) |
| `training_proofs` | Proof kayıtları + storage path + status |
| `proof_review_threads` | MVP threaded feedback (messages JSON veya `marketplace_messages`) |
| `coach_reviews` | Sporcu → antrenör public yorum (moderation) |
| `coach_reputation_events` | Puan olayları (basit ledger) |

### 5.2 Mevcut tablolarla bağlar

| Yeni | Mevcut |
|------|--------|
| `remote_coaching_relationships.athlete_id` | `athletes.id` |
| `remote_coaching_relationships.organization_id` | Coach workspace org |
| `coach_marketplace_profiles.user_id` | `users.id` (Clerk sub) |
| `training_proofs.assignment_id` | Program assignment |

### 5.3 Storage

- Yeni bucket: `coaching-proofs` (private, signed URL).
- Public coach avatar: mevcut `avatars` veya profile URL.

### 5.3 Billing (MVP)

PRD §24.3: **gerçek ödeme yok**.

- `remote_coaching_relationships.payment_status`: `pending_manual` | `confirmed_manual` | `waived_demo`
- Coach panelde “Ödemeyi onayla” butonu (admin/owner).
- Paket fiyatları **gösterim amaçlı**.

İleride: Clerk Billing / Stripe Connect → B1 planına bağlanır.

---

## 6. Feature gate ve planlar

| Özellik | Basic | Pro | Pro Plus |
|---------|:-----:|:---:|:--------:|
| Marketplace profil yayınlama | — | ✓ | ✓ |
| Başvuru alma | — | ✓ | ✓ |
| Remote athlete slot (ör. 5 / 20) | — | 5 | 20 |
| AI başvuru özeti | — | ✓ | ✓ |
| AI eşleştirme | — | — | ✓ |

Yeni entitlement alanı (opsiyonel): `marketplace_enabled` veya mevcut Pro flags yeterli (MVP: `pro_team` = marketplace açık).

---

## 7. Faz planı (uygulama sırası)

### Faz CN-0 — Temel (1–2 hafta)

**Çıkış:** Mimari onay, şema, boş kabuklar.

| # | İş | Web | App |
|---|-----|-----|-----|
| 0.1 | Bu plan + ER diyagramı `docs/` | ✓ | |
| 0.2 | `012_coach_network.sql` + README | | ✓ |
| 0.3 | `database.types.ts` + Zod şemalar (minimal) | | ✓ |
| 0.4 | Clerk web kurulumu (login/register) | ✓ | (var) |
| 0.5 | Feature flag `COACH_NETWORK_ENABLED` | ✓ | ✓ |
| 0.6 | Navbar: Find Coach link | ✓ | |

**Bağımlılık:** M1 smoke ve Strava tamamlanmış olması önerilir ama bloklayıcı değil.

---

### Faz CN-1 — Keşif ve public profil (1–2 hafta)

**Çıkış:** Sporcu antrenör bulur ve profili okur (giriş şart değil).

| # | İş | Web | App |
|---|-----|-----|-----|
| 1.1 | `/find-coach` liste + filtre (sport, remote, rating sort) | ✓ | |
| 1.2 | `/coach-network/coaches/[slug]` public profil | ✓ | |
| 1.3 | Coach card bileşeni (rating, fiyat, rozet mock) | ✓ | |
| 1.4 | `coach_marketplace_profiles` CRUD | | ✓ `/coach-network/profile` |
| 1.5 | Profil yayınla / taslak (`is_public`) | | ✓ |
| 1.6 | SEO metadata + sitemap girişi | ✓ | |

**PRD Must Have:** Coach public profile, Find coach page, Coach card.

---

### Faz CN-2 — Başvuru (1–2 hafta)

**Çıkış:** Sporcu başvurur; antrenör listede görür.

| # | İş | Web | App |
|---|-----|-----|-----|
| 2.1 | Athlete marketplace profil (semi-private) | ✓ | ✓ (edit) |
| 2.2 | Başvuru formu + data sharing consent | ✓ | |
| 2.3 | `coach_network_applications` insert + status `sent` | ✓ | |
| 2.4 | Coach inbox list + detay | | ✓ |
| 2.5 | Status: viewed, rejected, request_info | | ✓ |
| 2.6 | AI başvuru özeti (Gemini, optional) | | ✓ |

**PRD Must Have:** Application form, Coach application inbox.

---

### Faz CN-3 — Teklif ve ilişki (2 hafta)

**Çıkış:** Teklif → kabul (manuel ödeme) → remote athlete CoachOS’ta.

| # | İş | Web | App |
|---|-----|-----|-----|
| 3.1 | `coaching_packages` CRUD | | ✓ |
| 3.2 | Offer oluştur (paketten veya custom) | | ✓ |
| 3.3 | Sporcu teklif görüntüle / kabul | ✓ | ✓ |
| 3.4 | Kabul: `remote_coaching_relationships` + `athletes` upsert | | ✓ |
| 3.5 | `payment_status` manuel onay | | ✓ |
| 3.6 | `/coach-network/remote-athletes` liste | | ✓ |

**PRD Must Have:** Offer creation, Offer accept (demo/manual), Remote athlete relationship.

**Kritik teknik:** `workspace.ts` içinde remote athlete’i mevcut loader’lara dahil et (org filter).

---

### Faz CN-4 — Program ve ilerleme (1–2 hafta)

**Çıkış:** Antrenör program atar; sporcu takip eder.

| # | İş | Web | App |
|---|-----|-----|-----|
| 4.1 | Program assignment modeli | | ✓ |
| 4.2 | Mevcut `personal_training` / planner entegrasyonu | | ✓ |
| 4.3 | Athlete “bugünkü program” widget | | ✓ `/athlete/home` |
| 4.4 | Coach uyum / tamamlanma özeti | | ✓ dashboard kart |

**PRD Must Have:** Program assignment (basit).

---

### Faz CN-5 — Proof (2 hafta)

**Çıkış:** Sporcu yükler; antrenör onaylar.

| # | İş | Web | App |
|---|-----|-----|-----|
| 5.1 | `coaching-proofs` storage + signed URL | | ✓ |
| 5.2 | Athlete proof upload UI | | ✓ |
| 5.3 | Coach proof review + status | | ✓ |
| 5.4 | Proof thread (feedback mesajları) | | ✓ |
| 5.5 | Program adherence güncelleme | | ✓ |

**PRD Must Have:** Proof upload, Proof review.

---

### Faz CN-6 — Değerlendirme ve güven (1 hafta)

| # | İş | Web | App |
|---|-----|-----|-----|
| 6.1 | Coach review (relationship completed) | ✓ profilde | ✓ |
| 6.2 | Coach internal athlete note (private) | | ✓ |
| 6.3 | Basit reputation score | ✓ | ✓ |
| 6.4 | Report review / moderation queue (basit) | | ✓ admin |

**PRD Must Have:** Rating mock veya basit review, Coach reputation (basit).

---

### Faz CN-7 — AI ve öneriler (1 hafta, Should Have)

| # | İş | Web | App |
|---|-----|-----|-----|
| 7.1 | “Sana uygun antrenörler” (kural + Gemini) | ✓ | |
| 7.2 | Match açıklama metni | ✓ | |
| 7.3 | AI feedback taslağı (coach) | | ✓ |

---

### Faz CN-8 — Mesajlaşma web (2 hafta, v1.1)

PRD MVP: tam chat değil **threaded conversation**.

| # | İş | Web | App |
|---|-----|-----|-----|
| 8.1 | `marketplace_threads` + messages | ✓ | ✓ read |
| 8.2 | Başvuru / teklif / proof thread tipleri | ✓ | ✓ |
| 8.3 | Bildirim e-posta (Resend) | ✓ | |

**Not:** İlk MVP’de proof feedback thread app içinde kalabilir; web mesajlaşma CN-8’e ertelenebilir.

---

### Faz CN-9 — Coach Network sosyal köprü (Post-MVP)

| # | İş |
|---|-----|
| 9.1 | `/coach-network/questions` Q&A |
| 9.2 | Drill paylaşımı → profilde göster |
| 9.3 | Community puanı → reputation |

---

## 8. PRD MVP eşlemesi (§30)

| PRD Must Have | Faz |
|---------------|-----|
| Coach public profile | CN-1 |
| Find coach page | CN-1 |
| Coach card | CN-1 |
| Athlete application form | CN-2 |
| Coach application inbox | CN-2 |
| Offer creation | CN-3 |
| Offer accept (manual) | CN-3 |
| Remote athlete relationship | CN-3 |
| Program assignment (basit) | CN-4 |
| Proof upload | CN-5 |
| Proof review | CN-5 |
| Rating / reputation (basit) | CN-6 |
| Coach Network bağlantısı (basit) | CN-9 |

**Won’t Have (MVP):** Ödeme, escrow, video call, sertifika doğrulama, tam moderation AI, hareket tanıma → plan dışı.

---

## 9. Riskler ve önlemler (kısa)

| Risk | Önlem |
|------|--------|
| İki uygulamada auth drift | Tek Clerk app, shared env doc |
| Org/athlete model karmaşası | `remote_coaching_relationships` açık lifecycle; dokümante kurallar |
| Proof gizliliği | Private bucket, signed URL, public default kapalı |
| Medikal içerik | UI uyarı + report + AI filter (v1.1) |
| Scope creep (sosyal feed) | CN-9 ayrı; feed yok |
| Web’de ağır coach paneli | Yönetim sadece app’te kalır |

---

## 10. Mevcut backlog ile sıralama

`docs/DurumVeYolHaritasi.md` ile birleşik önerilen sıra:

```text
1. M1.4 — Canlı smoke (kısa)
2. B1 — Billing (gerçek checkout)          ← gelir
3. CN-0 → CN-3 — Marketplace çekirdek     ← bu feature (keşif + başvuru + teklif)
4. Strava webhook (B3)                     ← paralel olabilir
5. CN-4 → CN-6 — Program + proof + review
6. CN-7, CN-8 — AI + mesajlaşma web
7. B4 — RLS / E2E
```

**Gerekçe:** CN-3’ten önce billing şart değil (manuel ödeme); ama Pro gate için B2 zaten kısmen var. CN-1–2 **web + Clerk** ile hackathon demosu yapılabilir.

---

## 11. İlk sprint önerisi (CN-0 + CN-1)

Hafta 1 deliverable:

1. Migration `012` + types  
2. Web Clerk login/register  
3. `/find-coach` + 3 seed coach profil (demo)  
4. App `/coach-network/profile` edit + publish  
5. `DurumVeYolHaritasi.md` §4’e CN faz linki  

---

## 12. Kilitlenen kararlar (2026-05-17)

| # | Karar |
|---|--------|
| D1 | Web mesajlaşma: **Supabase Realtime**, basit text thread |
| D2 | Sporcu kayıt: **web** (Clerk + athlete onboarding) |
| D3 | Public profil URL: `/coach-network/coaches/[slug]` |
| D4 | Her antrenör = kendi org; remote sporcu o org’a eklenir |
| D5 | Mevcut roster/davet akışı **bozulmaz** (YOL A + YOL B birlikte) |
| D6 | Tek Clerk prod instance (web + app) |

**Task task plan:** `docs/CoachNetworkTasks.md` (~81 task, 9 epik, 5 sprint).

---

## 13. Sonraki adım

Onay sonrası kod sırası:

1. `docs/supabase/012_coach_network.sql` taslağı  
2. `apps/web` Clerk + `/find-coach` iskelet  
3. `apps/app` `/coach-network/profile` + actions  

Bu dosya yaşayan plandır; faz tamamlandıkça güncellenir.
