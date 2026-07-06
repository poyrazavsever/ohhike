# OhHike CoachOS — MVP Geçiş Checklist

**Tarih:** 2026-07-06  
**Referans:** `docs/MVP-Plan.md`

---

## Faz 0 — Hazırlık ve Altyapı
- [ ] `apps/api/` Express.js projesi oluştur
- [ ] Mongoose bağımlılığı ekle
- [ ] MongoDB bağlantı helper'ı yaz
- [ ] İlk Mongoose model: `User` schema
- [ ] Clerk webhook route → MongoDB
- [ ] CORS middleware ekle
- [ ] `turbo.json` → `api#dev` task ekle
- [ ] Next.js proxy/rewrite ayarı

## Faz 1 — Web Basitleştirmesi
- [ ] Clerk kaldır (web)
- [ ] Supabase kaldır (web)
- [ ] `proxy.ts` sil
- [ ] Clerk/Coach Network lib dosyalarını sil
- [ ] Login/Register sayfalarını sil
- [ ] Coach Network sayfalarını sil
- [ ] Landing page sadeleştir (AI, Wearable, Coach Network referansları kaldır)
- [ ] Pricing → Coming Soon
- [ ] Web `.env.local` temizle

## Faz 2 — App UI Temizliği
- [ ] Sidebar'dan kalkacak feature menülerini gizle
- [ ] Dashboard'dan AI/Wearable kartlarını kaldır
- [ ] Settings/Billing → Coming Soon
- [ ] Kalkacak route'ları redirect veya 404 yap

## Faz 3 — Backend: Auth + Organization
- [ ] Organization, OrgMember, Team, TeamStaff modelleri
- [ ] Express CRUD route'ları
- [ ] Clerk auth middleware (Express)
- [ ] Next.js actions → API çağrılarına dönüştür
- [ ] Onboarding akışını bağla

## Faz 4 — Backend: Athlete + Session
- [ ] Athlete, AthleteInvite, Session, Attendance, TrainingBlock modelleri
- [ ] Express CRUD route'ları
- [ ] Next.js frontend → yeni API'ye bağla

## Faz 5 — Backend: Daily Data
- [ ] WellnessCheckin, NutritionLog, PersonalTraining modelleri
- [ ] Express CRUD route'ları
- [ ] Next.js frontend → yeni API'ye bağla

## Faz 6 — Supabase Tam Temizlik
- [ ] `@supabase/supabase-js` kaldır (app)
- [ ] Supabase lib dosyalarını sil
- [ ] AI, Coach Network, Strava, Billing lib'lerini sil
- [ ] Kalkacak API route'larını sil
- [ ] Env ve turbo.json temizle
- [ ] Grep ile doğrula: sıfır Supabase/Gemini referansı

## Faz 7 — Docs Temizliği
- [ ] Gereksiz docs dosyalarını sil
- [ ] Kalan docs dosyalarını MVP'ye göre güncelle
- [ ] `docs/supabase/` dizinini sil
