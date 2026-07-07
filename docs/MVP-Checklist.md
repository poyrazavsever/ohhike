# OhHike CoachOS — MVP Geçiş Checklist

**Tarih:** 2026-07-06  
**Referans:** `docs/MVP-Plan.md`

---

## [Tamamlananlar]

### Faz 0-5 (Geçmiş Altyapı ve Veritabanı Geçişleri)
- [x] Express.js + MongoDB API projesi kurulumu ve ilk modellerin yazılması.
- [x] Web (Tanıtım) uygulamasından Clerk, Supabase ve kullanılmayan özelliklerin silinmesi.
- [x] App (SaaS) uygulamasında kullanılmayacak menülerin gizlenmesi.
- [x] Backend'de Custom JWT Auth (Giriş/Kayıt) sisteminin yazılması ve Clerk paketlerinin silinmesi.
- [x] Athlete, Session, WellnessCheckin, NutritionLog Express modelleri ve rotalarının oluşturulması.
- [x] Supabase kütüphanelerinin projeden kökten temizlenmesi.

---

## [YAPILACAKLAR - YENİ VE ATOMİK PLAN]

### MİMARİ & GÜVENLİK
#### Faz 6 — Auth & Token Mimarisinin Geliştirilmesi
- [x] 6.1 Token'ın `localStorage`'dan `cookies`'e taşınması
- [x] 6.2 `AuthProvider` context yapısının çerezlerle uyumlu hale getirilmesi
- [x] 6.3 Next.js `middleware.ts` yazılarak giriş yapmamış kullanıcıların dashboard'a erişiminin engellenmesi

### API ENTEGRASYONU (MOCK VERİLERİN SİLİNMESİ)
#### Faz 7 — Frontend API Entegrasyonu: Core (Organizasyon ve Takımlar)
- [x] 7.1 Eski `db.types.ts` dosyasının silinip MongoDB interface tiplerinin oluşturulması
- [x] 7.2 Organizasyon verilerinin (`getOrganization`, `createOrganization`) Express'e bağlanması
- [x] 7.3 Takım verilerinin (`getTeam`, `createTeam`) Express API'ye bağlanması
- [x] 7.4 Yan menünün (Sidebar) gerçek takım verileriyle beslenmesi

#### Faz 8 — Frontend API Entegrasyonu: Sporcular (Athletes)
- [x] 8.1 Sporcu verilerinin (CRUD işlemleri) Express API'ye bağlanması
- [x] 8.2 Sporcu Listesi sayfasının mock verilerden kurtarılması
- [x] 8.3 Sporcu Detay ve Profil sayfalarının API'ye bağlanması

#### Faz 9 — Frontend API Entegrasyonu: Antrenmanlar (Sessions)
- [x] 9.1 Antrenman verilerinin (CRUD işlemleri) Express API'ye bağlanması
- [x] 9.2 Antrenman Yoklaması (Attendance) ve Blokların API'ye bağlanması
- [x] 9.3 Takvim (Calendar) sayfasının Express verileriyle render edilmesi

#### Faz 10 — Frontend API Entegrasyonu: Günlük Veriler (Daily Data)
- [x] 10.1 Wellness Check-in formlarının API'ye bağlanması
- [x] 10.2 Beslenme (Nutrition) kayıtlarının API'ye bağlanması
- [x] 10.3 Kişisel antrenman formlarının API'ye bağlanması
- [x] 10.4 `workspace.ts` içindeki devasa mock yığınının tamamen temizlenmesi

### UI MODERNİZASYONU (SHADCN/UI)
#### Faz 11 — Shadcn UI Kurulumu ve Altyapı
- [x] 11.1 `apps/web` projesine `npx shadcn@latest init` uygulanması
- [x] 11.2 `apps/app` projesine `npx shadcn@latest init` uygulanması
- [x] 11.3 Tailwind yapılandırmalarının marka kimliğine göre ayarlanması
- [x] 11.4 Temel bileşenlerin (`Button`, `Input`, `Form`, `Card`, `Dialog`) dahil edilmesi

#### Faz 12 — Shadcn UI: Web (Tanıtım) Sayfaları
- [x] 12.1 `hero-section.tsx` (Ana Karşılama) ekranının Shadcn ile modernleştirilmesi
- [x] 12.2 `page-sections.tsx` (Özellikler) ekranının Shadcn Kartları ile tasarlanması
- [x] 12.3 `navbar.tsx` (Üst Menü) bileşeninin modernleştirilmesi

#### Faz 13 — Shadcn UI: App Auth & Layout
- [x] 13.1 `Login` sayfasının Shadcn `Form` ve `Card` ile yenilenmesi
- [x] 13.2 `Register` sayfasının Shadcn `Form` ve `Card` ile yenilenmesi
- [x] 13.3 `app-sidebar.tsx` (Yan menü) ve mobil navigasyonun modernleştirilmesi

#### Faz 14 — Shadcn UI: App Ana Ekranları (Dashboard & Listeler)
- [ ] 14.1 Koç Dashboard'unun Shadcn grid ve stat kartlarıyla yeniden tasarlanması
- [ ] 14.2 Takım yönetimi modal'larının Shadcn `Dialog` ile yapılması
- [ ] 14.3 Sporcu listelerinin modern bir Shadcn `Table` (DataTable) ile yapılandırılması

#### Faz 15 — Shadcn UI: App Detay Ekranları
- [ ] 15.1 Takvim ve Antrenman planlama görünümünün yenilenmesi
- [ ] 15.2 Yoklama ve performans formlarının Shadcn `Input` ve `Select` ile tasarlanması
- [ ] 15.3 Sporcu Portalı (Check-in formları) arayüzünün modernleştirilmesi

#### Faz 16 — Son Cila ve Dokümantasyon Temizliği
- [ ] 16.1 Kullanılmayan tüm eski CSS, Tailwind eklentileri ve kütüphanelerin silinmesi
- [ ] 16.2 Dokümantasyonların (PRD, UserFlows, Architecture) tamamen yeni mimariye uygun olarak güncellenmesi
