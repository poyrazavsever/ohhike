# OhHike CoachOS — MVP Geçiş ve Basitleştirme Planı

**Tarih:** 2026-07-06  
**Amaç:** Mevcut karmaşık yapıyı sadeleştirmek, backend'i Express.js + MongoDB'ye taşımak, kendi Custom Auth sistemimizi (JWT) kullanmak ve arayüzü Shadcn UI ile modernize etmek.

---

## 1. Büyük Resim — Ne Değişiyor?

### 1.1 Kalkacak Feature'lar
- Giyilebilir Teknoloji (Wearables)
- AI Koç Raporları
- Takım Hafızası / RAG (Team Memory)
- Coach Network / Marketplace
- Ödeme / Billing (Coming Soon)

### 1.2 Tech Stack
| Katman | Araç / Teknoloji |
|--------|------------------|
| Backend / DB | **Express.js + MongoDB** |
| Auth | **Custom Auth (JWT + Bcrypt + Cookies)** |
| Frontend | Next.js App Router |
| UI | **TailwindCSS + shadcn/ui** |

---

## 2. Geçiş Fazları (Güncel Durum)

### [Tamamlananlar]
- **Faz 0:** Express.js + MongoDB altyapısı
- **Faz 1:** Web uygulamasından eski sistemlerin (Clerk/Supabase) silinmesi
- **Faz 2:** App UI temizliği (Eski menülerin gizlenmesi)
- **Faz 3:** Custom Auth (Backend + Frontend) altyapısının kurulması
- **Faz 4:** Athlete & Session Modelleri ve API Rotaları
- **Faz 5:** Supabase kütüphanelerinin projeden tamamen silinmesi

---

### [YENİ VE ATOMİK AŞAMALAR - YAPILACAKLAR]

#### **MİMARİ & GÜVENLİK**
**Faz 6 — Auth & Token Mimarisinin Geliştirilmesi**
- 6.1 Token'ın `localStorage`'dan Next.js `cookies` sistemine aktarılması.
- 6.2 `AuthProvider` context yapısının çerezlerle uyumlu hale getirilmesi.
- 6.3 Next.js `middleware.ts` yazılarak giriş yapmamış kullanıcıların dashboard'a girmesinin engellenmesi.

#### **API ENTEGRASYONU (MOCK VERİLERİN SİLİNMESİ)**
**Faz 7 — Frontend API Entegrasyonu: Core (Organizasyon ve Takımlar)**
- 7.1 Eski Supabase veritabanı tiplerinin (`db.types.ts`) silinmesi ve MongoDB şema tiplerinin (Interfaces) oluşturulması.
- 7.2 Organizasyon verilerinin (`getOrganization`, `createOrganization`) Express API'ye bağlanması.
- 7.3 Takım verilerinin (`getTeam`, `createTeam`) Express API'ye bağlanması.
- 7.4 Yan menünün (Sidebar) gerçek takım verileriyle beslenmesi.

**Faz 8 — Frontend API Entegrasyonu: Sporcular (Athletes)**
- 8.1 Sporcu verilerinin (`getAthletes`, `createAthlete`, `updateAthlete`) Express API'ye bağlanması.
- 8.2 Sporcu Listesi sayfasının mock verilerden kurtarılması.
- 8.3 Sporcu Detay ve Profil sayfalarının API'ye bağlanması.

**Faz 9 — Frontend API Entegrasyonu: Antrenmanlar (Sessions)**
- 9.1 Antrenman verilerinin (CRUD işlemleri) Express API'ye bağlanması.
- 9.2 Antrenman Yoklaması (Attendance) ve Blokların (Training Blocks) API'ye bağlanması.
- 9.3 Takvim (Calendar) sayfasının Express verileriyle render edilmesi.

**Faz 10 — Frontend API Entegrasyonu: Günlük Veriler (Daily Data)**
- 10.1 Wellness Check-in formlarının API'ye bağlanması.
- 10.2 Beslenme (Nutrition) kayıtlarının API'ye bağlanması.
- 10.3 Kişisel antrenman (Personal Training) formlarının API'ye bağlanması.
- 10.4 `workspace.ts` içindeki devasa mock yığınının tamamen temizlenmesi.

#### **UI MODERNİZASYONU (SHADCN/UI)**
**Faz 11 — Shadcn UI Kurulumu ve Altyapı**
- 11.1 Hem `web` hem de `app` projelerine `npx shadcn@latest init` uygulanması.
- 11.2 Tailwind yapılandırmalarının (renkler, fontlar) marka kimliğine göre (DesignSystem) ayarlanması.
- 11.3 Temel bileşenlerin (`Button`, `Input`, `Form`, `Card`, `Dialog`) projeye dahil edilmesi.

**Faz 12 — Shadcn UI: Web (Tanıtım) Sayfaları**
- 12.1 `hero-section.tsx` (Ana Karşılama) ekranının Shadcn ile modernleştirilmesi.
- 12.2 `page-sections.tsx` (Özellikler) ekranının Shadcn Kartları ile tasarlanması.
- 12.3 `navbar.tsx` (Üst Menü) bileşeninin modernleştirilmesi.

**Faz 13 — Shadcn UI: App Auth & Layout**
- 13.1 `Login` sayfasının Shadcn `Form` ve `Card` ile yenilenmesi.
- 13.2 `Register` sayfasının Shadcn `Form` ve `Card` ile yenilenmesi.
- 13.3 `app-sidebar.tsx` (Yan menü) ve mobil navigasyonun Shadcn `Sheet` / `Drawer` ile revize edilmesi.

**Faz 14 — Shadcn UI: App Ana Ekranları (Dashboard & Listeler)**
- 14.1 Koç Dashboard'unun Shadcn grid ve stat kartlarıyla yeniden tasarlanması.
- 14.2 Takım yönetimi modal'larının (Yeni Takım Ekle) Shadcn `Dialog` ile yapılması.
- 14.3 Sporcu listelerinin modern bir Shadcn `Table` (DataTable) ile yapılandırılması.

**Faz 15 — Shadcn UI: App Detay Ekranları**
- 15.1 Takvim ve Antrenman planlama görünümünün yenilenmesi.
- 15.2 Yoklama ve performans girişi formlarının Shadcn `Input` ve `Select` bileşenleriyle tasarlanması.
- 15.3 Sporcu Portalı (Check-in formları) arayüzünün modernleştirilmesi.

**Faz 16 — Son Cila ve Dokümantasyon Temizliği**
- 16.1 Kullanılmayan tüm eski CSS, Tailwind eklentileri ve kütüphanelerin silinmesi.
- 16.2 Dokümantasyonların (PRD, UserFlows, Architecture) tamamen yeni mimariye uygun olacak şekilde güncellenmesi.
