# OhHike CoachOS — MVP Geçiş ve Basitleştirme Planı

**Tarih:** 2026-07-06  
**Amaç:** Mevcut karmaşık yapıyı sadeleştirmek, backend'i Express.js + MongoDB'ye taşımak ve MVP'ye odaklanmak.

---

## 1. Büyük Resim — Ne Değişiyor?

### 1.1 Kalkacak Feature'lar
| # | Feature | Karar |
|---|---------|-------|
| 1 | Giyilebilir Teknoloji (Wearables) | **Tamamen kalkacak** |
| 2 | AI Koç Raporları | **Tamamen kalkacak** |
| 3 | Takım Hafızası / RAG (Team Memory) | **Tamamen kalkacak** |
| 4 | Coach Network / Marketplace | **Tamamen kalkacak** |
| 5 | Ödeme / Billing | **Coming Soon olarak kalacak** |

### 1.2 Kalacak Feature'lar (MVP Core)
| # | Feature | Açıklama |
|---|---------|----------|
| 1 | Auth (Clerk) | Login, Register, Organizasyon bağlamı |
| 2 | Organizasyon ve Takım Yönetimi | Org oluşturma, takım CRUD |
| 3 | Sporcu Yönetimi | Sporcu ekleme, davet, claim |
| 4 | Seanslar (Sessions) | Antrenman/maç oluşturma, yoklama, RPE, koç notu |
| 5 | Readiness / Wellness Check-in | Sporcunun günlük uyku/enerji/ağrı girişi |
| 6 | Beslenme Takibi (Nutrition) | Su ve öğün takibi (basit) |
| 7 | Kişisel Antrenman | Sporcunun bireysel çalışma girişi |
| 8 | Koç Dashboard | Basit takım özeti ve yaklaşan seanslar |
| 9 | Sporcu Portalı | Sporcu check-in, görevler, temel dashboard |

### 1.3 Tech Stack Değişiklikleri
| Katman | Eski | Yeni |
|--------|------|------|
| Backend / DB | Supabase (PostgreSQL) | **Express.js + MongoDB** |
| Auth | Clerk | Clerk (kalıyor) |
| Frontend | Next.js App Router | Next.js App Router (kalıyor) |
| UI | Tailwind + shadcn | Tailwind + shadcn (kalıyor) |
| AI | Gemini + pgvector | **Kalkıyor** |

### 1.4 Web Değişiklikleri
- Clerk auth kalkacak (web tarafında giriş yok)
- Coach Network sayfaları kalkacak
- Web sadece statik tanıtım / landing page olacak

---

## 2. Geçiş Fazları

### Faz 0 — Hazırlık: Express.js + MongoDB altyapısı oluştur
### Faz 1 — Web basitleştirmesi (Clerk, Coach Network, Supabase kaldır)
### Faz 2 — App UI temizliği (kalkacak feature menülerini gizle)
### Faz 3 — Backend geçişi: Auth + Organization
### Faz 4 — Backend geçişi: Athlete + Session
### Faz 5 — Backend geçişi: Daily Data (Check-in, Nutrition, Personal Training)
### Faz 6 — Supabase tam temizlik
### Faz 7 — Docs temizliği ve güncelleme

---

## 3. Hedef Monorepo Yapısı

```text
ohhike/
├── apps/
│   ├── app/      # Next.js SaaS dashboard (frontend)
│   ├── web/      # Next.js marketing landing page (statik)
│   └── api/      # Express.js backend (YENİ)
├── packages/
│   ├── ui/
│   ├── eslint-config/
│   └── typescript-config/
├── docs/
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

Detaylı görev listesi: `docs/MVP-Checklist.md`
