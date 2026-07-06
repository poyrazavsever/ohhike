# OhHike CoachOS - PRD (v4.0 — MVP)

**Güncelleme:** 2026-07-06  
**Ürün tipi:** Web App (SaaS)  
**Ana domain:** ohhike.com  
**Uygulama domain:** app.ohhike.com  
**Marka:** OhHike  
**Maskot:** Doctor Panda  
**Ana kullanıcılar:** Antrenörler, spor kulüpleri, sporcular  
**Tech:** Next.js, Express.js, MongoDB, Tailwind CSS, shadcn/ui (Custom JWT Auth)

---

## 1. Ürün Özeti

**OhHike CoachOS**, spor takımları ve antrenörler için geliştirilen bir koçluk operasyon platformudur.
Antrenörlerin takımları, sporcuları, antrenmanları, günlük readiness verilerini ve beslenme takibini tek bir sistemde yönetmesini sağlar.

---

## 2. Problem Tanımı

### Antrenör Problemleri
- Oyuncu gelişim notları dağınık tutulur.
- Antrenman yükü manuel takip edilir veya hiç takip edilmez.
- Sporcu yorgunluğu, uyku ve stres bilgisi düzenli toplanmaz.
- Aynı taktiksel hatalar tekrar eder ama geçmiş raporlarla ilişkilendirilmez.

### Sporcu Problemleri
- Günlük his, enerji ve ağrı durumu düzenli kaydedilmez.
- Kişisel antrenmanlar koç tarafından bilinmez.
- Beslenme alışkanlığı takip edilmez.

---

## 3. Çözüm

OhHike CoachOS; koç ve sporcu tarafını aynı sistemde birleştirir.

### MVP İşlevleri
1. Organizasyon ve takım yönetimi
2. Sporcu profili ve kayıt sistemi
3. Antrenör dashboard'u
4. Sporcu dashboard'u
5. Toplu antrenman takibi
6. Kişisel antrenman takibi
7. Günlük readiness / wellness check-in
8. Beslenme alışkanlığı takibi

---

## 4. Hedef Kullanıcılar

| Rol | Açıklama |
|-----|----------|
| Head Coach | Takımı yönetir, sporcuları ekler, antrenman oluşturur |
| Assistant Coach | Session notu ekler, oyuncu gözlemi girer |
| Athlete | Günlük check-in girer, kişisel antrenman kaydeder |

---

## 5. Roller ve Yetkiler

| Rol | Yetki |
|-----|-------|
| Owner | Organizasyon, tüm takımlar, tüm ayarlar |
| Admin | Takım, kullanıcı ve staff yönetimi |
| Head Coach | Takım yönetimi, session, sporcu |
| Assistant Coach | Session, katılım, not |
| Athlete | Kendi dashboard'u ve kişisel veri girişleri |
| Viewer | Sadece görüntüleme |

---

## 6. Modüller

### 6.1 Organization & Team Management
- Organizasyon oluşturma ve türü seçme
- Takım oluşturma (spor dalı, yaş grubu, sezon hedefi)
- Staff davet etme ve rol atama

### 6.2 Athlete Management
- Manuel sporcu ekleme
- Davet linki gönderme
- Sporcu claim (profil devralma)
- Oyuncu profil bilgileri (mevki, forma no, fiziksel bilgiler)

### 6.3 Session & Calendar
- Antrenman/maç seansı oluşturma
- Antrenman blokları
- Katılım takibi (yoklama)
- RPE toplama
- Koç notları

### 6.4 Readiness / Wellness Check-in
- Uyku, enerji, ağrı, stres, motivasyon
- Readiness Score hesaplama

### 6.5 Nutrition Tracking
- Su tüketimi takibi
- Öğün check-in
- Antrenman öncesi/sonrası beslenme uyumu

### 6.6 Personal Training
- Kişisel antrenman kaydı
- Süre, tür, RPE, not
- Koç görünürlüğü

---

## 7. İş Modeli

MVP tamamen **ücretsiz** sunulacaktır. Ödeme altyapısı ileride eklenecek (Coming Soon).

---

## 8. Kaldırılan Modüller

| Modül | Neden |
|-------|-------|
| Wearables (Akıllı Saat) | MVP kapsam dışı |
| AI Coach Reports | MVP kapsam dışı |
| Team Memory / RAG | MVP kapsam dışı |
| Coach Network / Marketplace | MVP kapsam dışı |
| Drill Kütüphanesi | MVP kapsam dışı |
| Training Planner (AI) | MVP kapsam dışı |
| Billing | Coming Soon |
| PDF Export | Coming Soon |
| Self-host | MVP kapsam dışı |
