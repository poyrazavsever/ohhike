# OhHike CoachOS - Proje Özellikleri (MVP v4.0)

**Güncelleme:** 2026-07-06  
**Durum:** MVP — basitleştirilmiş yapı

---

## Projenin Amacı

**OhHike CoachOS**, spor takımları ve antrenörler için geliştirilen bir koçluk operasyon platformudur.
Antrenman verileri, oyuncu yoklamaları ve günlük readiness (hazırbulunuşluk) verilerini tek bir merkezde toplar.
Antrenöre takımını daha bilinçli yönetme imkânı sunar.

---

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js (App Router), React, TypeScript |
| UI | Tailwind CSS, shadcn/ui |
| Auth | Clerk |
| Backend | Express.js |
| Veritabanı | MongoDB (Mongoose) |
| Monorepo | Turborepo, pnpm workspaces |

---

## MVP'de Aktif Olan Modüller

### 1. Auth (Clerk)
Login, Register ve organizasyon bağlamı yönetimi.

### 2. Organizasyon ve Takım Yönetimi
Kulüp/akademi/bireysel koç hesabı oluşturma, altına takımlar açma ve personele rol bazlı yetki verme.

### 3. Sporcu Yönetimi
Sporcuların manuel veya davet linkiyle takıma eklenmesi. "Athlete Claim" modeli ile sporcu sonradan profilini devralabilir.

### 4. Seanslar ve Takvim
Antrenman, maç veya recovery seanslarının planlanması. Yoklama, antrenman blokları, RPE ve koç notları.

### 5. Readiness / Wellness Check-in
Sporcuların günlük uyku, enerji, kas ağrısı ve stres verilerini girdiği kısa anket. Readiness Score hesaplama.

### 6. Beslenme Takibi (Nutrition)
Günlük su tüketimi ve antrenman öncesi/sonrası öğün uyumu takibi. Alışkanlık odaklı, kalori hesabı yok.

### 7. Kişisel Antrenman (Personal Training)
Sporcuların takım dışı bireysel çalışmalarını kaydetmesi. Koçun, sporcunun takım dışı yükünü görebilmesi.

### 8. Koç Dashboard
Takımın genel readiness durumu, yaklaşan seanslar ve temel metrikler.

### 9. Sporcu Portalı
Sporcuların günlük check-in, görevler ve kendi temel dashboard'ları.

---

## Devre Dışı / Coming Soon Modüller

| Modül | Durum |
|-------|-------|
| Giyilebilir Teknoloji (Wearables) | Kaldırıldı |
| AI Koç Raporları | Kaldırıldı |
| Takım Hafızası / RAG (Team Memory) | Kaldırıldı |
| Coach Network / Marketplace | Kaldırıldı |
| Drill Kütüphanesi | Kaldırıldı |
| Training Planner (AI) | Kaldırıldı |
| Load Recovery | Kaldırıldı |
| Ödeme / Billing | Coming Soon |
| PDF Export | Coming Soon |

---

## Web (apps/web)
Sadece statik tanıtım / landing page. Auth yok, coach network yok. CTA butonları `app` uygulamasına yönlendirir.
