# OhHike CoachOS — MVP Geçiş Checklist

**Tarih:** 2026-07-06  
**Referans:** `docs/MVP-Plan.md`

---

## Faz 0 — Hazırlık ve Altyapı
- [x] `apps/api/` Express.js projesi oluştur
- [x] Mongoose bağımlılığı ekle
- [x] MongoDB bağlantı helper'ı yaz
- [x] İlk Mongoose model: `User` schema
- [x] Clerk webhook route → MongoDB
- [x] CORS middleware ekle
- [x] `turbo.json` → `api#dev` task ekle
- [x] Next.js proxy/rewrite ayarı

## Faz 1 — Web Basitleştirmesi
- [x] Clerk kaldır (web)
- [x] Supabase kaldır (web)
- [x] `proxy.ts` sil
- [x] Clerk/Coach Network lib dosyalarını sil
- [x] Login/Register sayfalarını sil
- [x] Coach Network sayfalarını sil
- [x] Landing page sadeleştir (AI, Wearable, Coach Network referansları kaldır)
- [x] Pricing → Coming Soon
- [x] Web `.env.local` temizle

## Faz 2 — App UI Temizliği
- [ ] Sidebar'dan kalkacak feature menülerini gizle/sil
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
