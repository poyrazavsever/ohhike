# Product Requirements Document (PRD) - OhHike CoachOS v3.0

## 0. Doküman Durumu

**Doküman adı:** OhHike CoachOS PRD  
**Versiyon:** v3.0  
**Ürün tipi:** SaaS + Open Source / Self-host  
**Ana domain:** `ohhike.com`  
**Uygulama domain:** `app.ohhike.com`  
**Marka:** OhHike  
**Ürün adı:** OhHike CoachOS  
**Maskot:** Doctor Panda  
**Ana kullanıcılar:** Antrenörler, spor kulüpleri, akademiler, sporcular, performans ekipleri  
**Teknik temel:** Next.js, Clerk Auth & Billing, Supabase, Tailwind CSS, shadcn/ui, AI / RAG / veri analizi pipeline

---

## 1. Ürün Özeti

**OhHike CoachOS**, spor takımları ve antrenörler için geliştirilen AI destekli, self-host edilebilir, açık kaynak spor operasyon ve koçluk zekâsı platformudur.

Platform; antrenörlerin sporcuları, takımları, antrenmanları, maçları, bireysel çalışmalarını, beslenme takibini, günlük readiness verilerini, akıllı saat verilerini, AI raporlarını, veri analizlerini ve takım hafızasını tek bir sistemde yönetmesini sağlar.

OhHike CoachOS yalnızca bir antrenman takip uygulaması değildir. Ürün, takımın sezon boyunca ürettiği tüm verileri bir araya getirerek zamanla **takım hafızası** oluşturur. AI katmanı; antrenman notlarını, sporcu check-in verilerini, akıllı saat verilerini, kişisel antrenman kayıtlarını, beslenme takiplerini ve geçmiş raporları analiz ederek antrenöre uygulanabilir karar destek önerileri sunar.

Ürün iki kullanım modeliyle çalışır:

1. **Managed SaaS / Hosted Cloud:** Kullanıcılar OhHike sunucularını kullanır, Clerk Auth & Billing ile abonelik yönetilir.
2. **Self-hosted Open Source:** Kulüp veya teknik kullanıcı kendi sunucusunda kurar, kendi veritabanını, storage alanını ve AI / wearable API anahtarlarını kullanır.

---

## 2. Vizyon

Spor takımları her gün veri üretir:

- Antrenman katılımı
- Koç notları
- Oyuncu performans gözlemleri
- Günlük yorgunluk ve uyku durumu
- Kişisel antrenmanlar
- Beslenme alışkanlıkları
- Akıllı saat aktiviteleri
- Sakatlık ve recovery notları

Ancak bu veriler çoğunlukla dağınıktır:

- WhatsApp gruplarında kaybolur
- Koçun defterinde kalır
- Geçmiş rapor ve not klasörlerinde unutulur
- Sporcuların saatlerinde ayrı ayrı kalır
- Excel dosyalarında güncelliğini kaybeder
- Antrenman planına doğrudan yansımaz

**OhHike CoachOS’un vizyonu**, her antrenmanı, her maçı ve her sporcu girdisini takımın öğrenen hafızasına dönüştürmektir.

> Her session kaybolan bir veri değil, takım zekâsına eklenen yeni bir öğrenme kaydıdır.

---

## 3. Ana Değer Önerisi

### 3.1 Kısa Tanım

OhHike CoachOS, takımların her antrenmandan, her maçtan ve her sporcudan öğrenmesini sağlayan AI destekli spor operasyon platformudur.

### 3.2 Ürün Vaadi

- Antrenör takımı ve sporcuları tek panelden yönetir.
- Sporcular kendi dashboard’larından günlük veri girer.
- Akıllı saati olan sporcular verilerini sisteme bağlar.
- Akıllı saati olmayan sporcular manuel check-in ve antrenman kaydı girer.
- AI, takımın davranışlarını, yükünü, tekrar eden problemlerini ve gelişim alanlarını analiz eder.
- Sistem zamanla takım hafızası oluşturur.
- Kulüp isterse tüm sistemi kendi sunucusunda barındırır.

### 3.3 Ana Slogan Önerileri

- **Every session becomes team intelligence.**
- **Your team’s AI memory.**
- **Turn training data into coaching decisions.**
- **Takımını tanır, analiz eder, geliştirir.**
- **Her antrenmandan öğrenen AI koç platformu.**

---

## 4. Problem Tanımı

### 4.1 Antrenör Problemleri

Antrenörler çoğu zaman takımı sezgileriyle yönetir. Sahada çok fazla veri oluşur ama bu veriyi sistematik şekilde toplamak, anlamlandırmak ve karara dönüştürmek zordur.

Başlıca problemler:

- Oyuncu gelişim notları dağınık tutulur.
- Antrenman yükü manuel takip edilir veya hiç takip edilmez.
- Oyuncuların kişisel antrenmanları bilinmez.
- Sporcu yorgunluğu, uyku, ağrı ve stres bilgisi düzenli toplanmaz.
- Geçmiş raporlar, koç notları ve check-in kayıtları birlikte yorumlanmadan arşivde kalır.
- Aynı taktiksel hatalar tekrar eder ama geçmiş raporlarla ilişkilendirilmez.
- Antrenman planları, gerçek takım verisine göre dinamik güncellenmez.
- Akıllı saat verileri varsa bile takım paneline entegre değildir.

### 4.2 Sporcu Problemleri

Sporcular kendi gelişimlerini takip etmekte zorlanır.

Başlıca problemler:

- Günlük his, enerji, uyku ve ağrı durumu düzenli kaydedilmez.
- Kişisel antrenmanlar koç tarafından bilinmez.
- Beslenme alışkanlığı takip edilmez.
- Antrenör notları ve kişisel görevler tek yerde görünmez.
- Akıllı saat verileri sporcu tarafında kalır, takım yönetimine anlamlı şekilde yansımaz.

### 4.3 Kulüp / Akademi Problemleri

Kulüpler için problem sadece bireysel takip değil, kurumsal veri yönetimidir.

- Birden fazla takımın verisi ayrı ayrı tutulur.
- Staff rolleri ve erişim izinleri net değildir.
- Oyuncu gelişim raporları standartlaşmaz.
- Altyapı sporcularının sezonluk gelişimi kaybolur.
- Veri gizliliği ve çocuk sporcu verisi hassasiyetleri yönetilmelidir.
- Bulut kullanmak istemeyen kulüpler self-host seçeneğine ihtiyaç duyar.

---

## 5. Çözüm

OhHike CoachOS; koç, sporcu ve kulüp tarafını aynı sistemde birleştirir.

### 5.1 Temel Çözüm Mantığı

"""text
Antrenör verisi
+ Sporcu verisi
+ Wearable verisi
+ Koç notları ve geçmiş raporlar
+ AI analizleri
+ RAG takım hafızası
= Daha bilinçli antrenman ve performans kararları
"""

### 5.2 Platformun Ana İşlevleri

1. Organizasyon ve takım yönetimi
2. Sporcu profili ve oyuncu kayıt sistemi
3. Antrenör dashboard’u
4. Sporcu dashboard’u
5. Toplu antrenman takibi
6. Kişisel antrenman takibi
7. Günlük readiness / wellness check-in
8. Beslenme alışkanlığı takibi
9. Akıllı saat / wearable veri merkezi
10. Session, check-in, wearable ve geçmiş rapor analizi
11. AI koç raporları
12. Team Memory / RAG asistanı
13. Antrenman planlayıcı
14. Drill kütüphanesi
15. Load & recovery yönetimi
16. PDF ve paylaşılabilir raporlar
17. Staff collaboration
18. Self-host ve API key yönetimi

---

## 6. Hedef Kullanıcılar

### 6.1 Head Coach / Antrenör

Takımı yönetir, sporcuları ekler, antrenman oluşturur, maç/antrenman analiz raporlarını inceler, AI önerilerini kullanır.

**İhtiyaçları:**

- Sporcuları takip etmek
- Takımın genel readiness durumunu görmek
- Antrenman yükünü yönetmek
- Session verisi ve geçmiş raporlardan uygulanabilir öneri almak
- Haftalık plan oluşturmak
- Takımın tekrar eden problemlerini görmek

### 6.2 Assistant Coach / Yardımcı Antrenör

Antrenman detayları, oyuncu gözlemleri ve session notları ile çalışır.

**İhtiyaçları:**

- Session notu eklemek
- Oyuncu bazlı gözlem girmek
- Antrenman katılımı işaretlemek
- Drill planlarını görmek

### 6.3 Performance Analyst

Rapor, veri patternleri ve oyuncu gelişimiyle ilgilenir.

**İhtiyaçları:**

- Session raporlarını ve veri özetlerini incelemek
- AI analizlerini doğrulamak
- AI raporlarını düzeltmek
- Taktiksel pattern’leri takip etmek

### 6.4 Physiotherapist / Recovery Staff

Sakatlık, ağrı, recovery ve readiness tarafını takip eder.

**İhtiyaçları:**

- Ağrı ve recovery notlarını görmek
- Riskli sporcuları takip etmek
- Yük artışı ve düşük uyku sinyallerini izlemek

### 6.5 Nutritionist / Beslenme Uzmanı

Sporcuların genel beslenme alışkanlığı ve antrenman öncesi/sonrası uyumunu takip eder.

**İhtiyaçları:**

- Öğün uyumunu görmek
- Su tüketimi ve temel alışkanlıkları takip etmek
- Sporcuya özel not bırakmak

### 6.6 Athlete / Sporcu

Kendi dashboard’unu kullanır, veri girer, görevlerini takip eder, wearable bağlantısı yapar.

**İhtiyaçları:**

- Günlük check-in girmek
- Antrenman sonrası RPE girmek
- Kişisel antrenman kaydetmek
- Beslenme / su takibi yapmak
- Koç görevlerini görmek
- Kendi gelişimini anlamak

### 6.7 Club Admin / Kulüp Yöneticisi

Organizasyon, abonelik, roller ve self-host yönetimiyle ilgilenir.

**İhtiyaçları:**

- Takım ve staff yönetimi
- Billing planı kontrolü
- Veri gizliliği ayarları
- Self-host deployment ve API key yönetimi

---

## 7. Ürün Rolleri ve Yetkiler

### 7.1 Roller

| Rol | Yetki Özeti |
|---|---|
| Owner | Organizasyon, billing, tüm takımlar, tüm ayarlar |
| Admin | Takım, kullanıcı ve staff yönetimi |
| Head Coach | Takım yönetimi, session, sporcu, rapor, AI analiz |
| Assistant Coach | Session, katılım, not, oyuncu gözlemi |
| Analyst | Analiz, rapor, pattern ve veri doğrulama yönetimi |
| Physiotherapist | Recovery, ağrı, readiness, risk notları |
| Nutritionist | Beslenme logları, su ve öğün uyum notları |
| Athlete | Kendi dashboard’u ve kişisel veri girişleri |
| Viewer | Sadece görüntüleme |

### 7.2 Yetki İlkesi

- Sporcu yalnızca kendi verisini görür.
- Antrenör kendi takımındaki sporcuları görür.
- Staff rolleri yalnızca izin verilen modüllere erişir.
- Kulüp owner tüm organizasyon verisini yönetir.
- Self-host admin sistem sağlayıcılarını ve API key’leri yönetir.

---

## 8. Ana Modüller ve Özellikler

## 8.1 Organization & Club Management

Organizasyon; kulüp, akademi, bireysel koç hesabı veya okul takımı olabilir.

### Özellikler

- Organizasyon oluşturma
- Organizasyon türü seçme
- Logo yükleme
- Spor dalları seçimi
- Staff davet etme
- Rol bazlı erişim
- Plan ve abonelik yönetimi
- Self-host ayarları
- Audit log görüntüleme, gelişmiş planlarda

### Nasıl Çalışır?

1. Kullanıcı kayıt olur.
2. İlk onboarding’de organizasyon oluşturur.
3. Organizasyon altında takımlar oluşturulur.
4. Staff üyeleri davet edilir.
5. Plan limitleri organizasyon üzerinden kontrol edilir.

---

## 8.2 Team Management

Takım, organizasyon içindeki sportif çalışma birimidir.

### Özellikler

- Takım oluşturma
- Spor dalı seçimi
- Yaş grubu ve seviye
- Formasyon / oyun sistemi
- Sezon hedefi
- Haftalık antrenman sayısı
- Takım staff ataması
- Takım dashboard’u
- Takım hafızası

### Örnek Takım Profili

"""text
Takım: U17 Futbol
Spor: Futbol
Seviye: Akademi
Oyun sistemi: 4-3-3
Sezon hedefi: Geçiş savunmasını geliştirmek
Haftalık antrenman: 3 gün
"""

---

## 8.3 Athlete / Player Management

Antrenör, sporcuları sisteme kaydeder. Sporcu isterse hesabını claim ederek kendi paneline erişir.

### Özellikler

- Manuel sporcu ekleme
- CSV ile toplu sporcu import
- Davet linki gönderme
- Oyuncu profil bilgileri
- Mevki / rol / forma no
- Fiziksel bilgiler
- Dominant ayak / el
- Aktif / sakat / recovery durumları
- Oyuncu notları
- Sporcu timeline
- AI oyuncu özeti

### Sporcu Ekleme Akışı

1. Antrenör “Yeni Sporcu Ekle” butonuna tıklar.
2. Temel bilgiler girilir.
3. Sporcu e-posta veya davet linki ile sisteme davet edilir.
4. Sporcu daveti kabul ederse kendi dashboard’una erişir.
5. Sporcu, isterse wearable bağlantısını yapar.

---

## 8.4 Coach Dashboard

Antrenör dashboard’u ana karar ekranıdır.

### İçerik

- Team Readiness Score
- Training Load Overview
- Athlete Risk Alerts
- Missing Check-ins
- Wearable Sync Status
- Recent AI Analysis
- Upcoming Sessions
- Nutrition Compliance
- Team Memory Insights
- Recommended Training Focus

### Örnek AI Insight

"""text
Son 3 günde 6 oyuncunun uyku süresi 6 saatin altında. Bugünkü antrenmanda yüksek yoğunluklu sprint bloklarını azaltıp teknik geçiş oyununa ağırlık vermeni öneriyorum.
"""

---

## 8.5 Athlete Dashboard

Sporcu dashboard’u mobil öncelikli olmalıdır.

### İçerik

- Günlük check-in
- Bugünkü görevler
- Kişisel antrenman planı
- Antrenman sonrası RPE
- Beslenme / su takibi
- Wearable bağlantı durumu
- Kendi readiness skoru
- Koç notları
- Gelişim grafikleri

### Sporcu Günlük Akışı

1. Sporcu uygulamaya girer.
2. Günlük check-in’i doldurur.
3. Bugünkü takım veya kişisel görevlerini görür.
4. Antrenman sonrası RPE ve not girer.
5. Wearable bağlıysa aktivite verisi otomatik senkronize edilir.

---

## 8.6 Session & Calendar Management

Session; maç, takım antrenmanı, kişisel antrenman, recovery, test veya analiz toplantısı olabilir.

### Session Türleri

- Team Training
- Personal Training
- Match
- Friendly Match
- Recovery
- Test Day
- Analysis / Review Meeting
- Nutrition / Education Session

### Özellikler

- Session oluşturma
- Takvim görünümü
- Katılımcı sporcu seçimi
- Session amacı
- Planlanan yoğunluk
- Antrenman blokları
- Katılım takibi
- Antrenman sonrası RPE
- Koç notları
- AI raporu oluşturma

---

## 8.7 Group Training Tracking

Toplu antrenman takibi, takımın günlük çalışma verisini toplar.

### Özellikler

- Katılım listesi
- Antrenman blokları
- Planlanan / gerçekleşen süre
- RPE toplama
- Oyuncu bazlı süre
- Genel koç notu
- Oturum sonrası AI değerlendirme
- Bir sonraki session önerisi

### AI Kullanımı

AI; session hedefi, katılım, RPE, readiness, wearable özetleri ve koç notlarını birleştirerek antrenman değerlendirmesi yapar.

---

## 8.8 Personal Training Tracking

Sporcular takım dışı kişisel çalışmalarını girer. Akıllı saat varsa otomatik aktiviteyle eşleşir.

### Özellikler

- Kişisel antrenman ekleme
- Tür seçimi: koşu, gym, teknik, mobilite, recovery, maç
- Süre
- Yoğunluk / RPE
- Not
- Wearable aktivite eşleştirme
- Koç onayı, opsiyonel

### Neden Önemli?

Antrenör, sporcunun takım dışında ne kadar yük aldığını görebilir. Bu, load management için kritik veridir.

---

## 8.9 Diet & Nutrition Tracking

Bu modül diyetisyen yerine geçmez. Amaç beslenme alışkanlığını ve antrenman günlerindeki uyumu takip etmektir.

### Özellikler

- Su takibi
- Öğün check-in
- Antrenman öncesi öğün
- Antrenman sonrası toparlanma öğünü
- Protein hedefi uyumu
- Sporcu notu
- Nutritionist notu
- Takım beslenme uyum grafiği, gelişmiş planlarda

### AI Kullanımı

AI, düşük enerji, yüksek yük ve eksik beslenme kayıtlarını ilişkilendirerek öneri üretir.

---

## 8.10 Readiness & Wellness Check-in

Sporcu her gün kısa bir form doldurur.

### Alanlar

- Uyku süresi
- Uyku kalitesi
- Enerji
- Kas ağrısı
- Ağrı bölgesi
- Stres
- Motivasyon
- Hastalık belirtisi
- Antrenmana hazır hissetme
- Ek not

### Readiness Score

Readiness skoru şu kaynaklardan hesaplanır:

"""text
Manuel check-in
+ Son antrenman yükü
+ Kişisel antrenman yükü
+ Wearable verileri, varsa
+ Uyku / enerji / ağrı trendi
"""

---

## 8.11 Wearable Data Hub

Akıllı saat ve aktivite platformlarından veri alınır. Bu özellik zorunlu değildir, opsiyoneldir.

### Desteklenecek Kaynaklar

- Strava
- Garmin Health API
- Apple Health / HealthKit, mobil app veya native bridge gerektirir
- Android Health Connect, mobil app veya native bridge gerektirir
- CSV import
- Manuel giriş

### Veri Türleri

- Günlük adım
- Aktif dakika
- Aktivite süresi
- Mesafe
- Ortalama nabız
- Maksimum nabız
- Dinlenik nabız
- Uyku süresi
- Uyku kalitesi
- HRV, provider destekliyorsa
- Stres skoru, provider destekliyorsa
- Kalori, provider destekliyorsa

### Çalışma Mantığı

1. Sporcu provider seçer.
2. OAuth veya native izin akışı başlar.
3. Sporcu açık izin verir.
4. Token güvenli saklanır.
5. Sistem aktivite ve günlük özetleri senkronize eder.
6. Veriler normalize edilir.
7. AI analizlerinde bağlam olarak kullanılır.

### Önemli İlke

Wearable verisi AI model eğitimi için değil, kullanıcının kendi takım/oyuncu bağlamında analiz ve öneri üretmek için kullanılır.

---

## 8.12 Data & Report Analysis

OhHike CoachOS’un AI katmanı video analizi yapmaz. MVP ve ilk ürün odağı; session notları, sporcu check-in verileri, akıllı saat özetleri, kişisel antrenman kayıtları, beslenme alışkanlığı verileri ve geçmiş raporları birlikte analiz etmektir.

### MVP Çalışma Mantığı

1. Antrenör session amacını, antrenman bloklarını, katılımı, RPE değerlerini ve koç notlarını girer.
2. Sporcular günlük check-in, beslenme ve kişisel antrenman verilerini ekler.
3. Akıllı saat bağlantısı olan sporculardan aktivite, uyku ve nabız özetleri alınır.
4. Geçmiş AI raporları, koç notları, drill kayıtları ve takım hedefleri Team Memory’den context olarak çekilir.
5. AI structured JSON rapor üretir.
6. Rapor session’a kaydedilir.
7. Özet Team Memory’ye eklenir.

### Analiz Kaynakları

- Koç notları
- Session katılımı ve RPE
- Training blocks
- Readiness / wellness check-in
- Akıllı saat günlük özetleri
- Kişisel antrenman kayıtları
- Beslenme alışkanlığı kayıtları
- Geçmiş AI raporları
- Team Memory dokümanları
- CSV import veya manuel veri girişleri

---

## 8.13 AI Coach Reports

Her session için AI raporu üretilebilir.

### Rapor Bölümleri

- Genel özet
- Hedefe uygunluk
- Taktiksel gözlemler
- Oyuncu bazlı gözlemler
- Fiziksel yük değerlendirmesi
- Readiness etkisi
- Beslenme / uyku bağlamı
- Risk uyarıları
- Önerilen antrenman
- Önerilen bireysel çalışma

### Structured Output İlkesi

AI çıktıları JSON formatında alınmalı ve UI’da kartlara bölünmelidir.

---

## 8.14 Team Memory / RAG Assistant

Team Memory, ürünün ana farkıdır.

### Hafızaya Eklenenler

- Session raporları
- Koç notları
- Oyuncu gözlemleri
- Readiness trendleri
- Wearable özetleri
- Beslenme uyum özetleri
- Drill kullanımı
- Takım hedefleri
- Staff yorumları

### Antrenör Soruları

- Son 1 ayda en çok tekrar eden problem ne?
- Emir için bireysel gelişim planı çıkar.
- Bu hafta yüksek yük alan oyuncular kim?
- Geçiş savunması için daha önce ne çalışmıştık?
- Yarınki antrenmanı takımın yorgunluk durumuna göre planla.

---

## 8.15 Load & Recovery Management

Oyuncu yükü ve toparlanması takip edilir.

### Veri Kaynakları

- Session katılımı
- Oyuncu süresi
- RPE
- Kişisel antrenmanlar
- Wearable aktiviteleri
- Uyku ve readiness
- Ağrı ve recovery notları

### AI Uyarıları

- Ani yük artışı
- Düşük uyku + yüksek yük
- Ağrı bildirimi
- Recovery ihtiyacı
- Düşük readiness

---

## 8.16 Drill Library & Training Planner

Koçlar hazır drill kütüphanesi kullanır veya kendi drill’lerini oluşturur.

### Drill Alanları

- Spor dalı
- Amaç
- Süre
- Oyuncu sayısı
- Alan ölçüsü
- Ekipman
- Uygulama adımları
- Coaching points
- İlişkili problem türleri

### AI Planner

Koç doğal dille plan ister:

"""text
Bugün 75 dakikalık antrenman var. Takım yorgun, geçiş savunması çalışmak istiyorum.
"""

AI, readiness ve son pattern’lere göre plan üretir.

---

## 8.17 Performance Goals

Takım ve sporcu hedefleri tanımlanır.

### Takım Hedefleri

- Geçiş savunması
- Pres reaksiyonu
- Maç sonu kondisyon düşüşü
- Pas kalitesi
- Recovery uyumu

### Sporcu Hedefleri

- Uyku ortalaması
- Mobilite rutini
- Kişisel teknik çalışma
- Beslenme uyumu
- Ağrı bildirimi takibi

---

## 8.18 Reports & Exports

Raporlar kulüp, koç ve sporcu paylaşımı için önemlidir.

### Rapor Türleri

- Session report
- Match report
- Training report
- Player development report
- Weekly team report
- Load report
- Nutrition compliance report
- Readiness report
- Scout report

### Export Özellikleri

- PDF export
- Kulüp logolu rapor
- Paylaşılabilir link
- Rol bazlı görünürlük
- Oyuncu / veli paylaşımı, opsiyonel

---

## 9. İş Modeli ve Paketler

## 9.1 Free Plan

Amaç: Ürünü denetmek.

### Dahil

- 1 organizasyon
- 1 takım
- 10 sporcu
- 1 staff
- 3 session / ay
- Manuel sporcu kaydı
- Temel koç dashboard
- Temel sporcu dashboard
- Günlük check-in
- Temel antrenman takibi
- Sınırlı AI analiz

### Dahil Değil

- Gelişmiş AI veri analizi
- Team Memory / RAG
- Wearable entegrasyonu
- PDF export
- Staff collaboration
- Gelişmiş load management
- Branded reports

---

## 9.2 Coach Pro Plan

Amaç: Bireysel antrenör ve küçük takımlar.

### Dahil

- 1 organizasyon
- 3 takım
- 50 sporcu
- 3 staff
- 30 session / ay
- Sporcu portalı
- Günlük check-in
- Toplu antrenman takibi
- Kişisel antrenman takibi
- Beslenme alışkanlığı takibi
- AI Coach Reports
- Team Memory Assistant
- AI Coach Reports
- Team Memory Assistant
- Drill önerileri
- Training Planner
- PDF export
- CSV import
- Strava bağlantısı, sporcu iznine bağlı

---

## 9.3 Club Plan

Amaç: Akademiler ve kulüpler.

### Dahil

- Sınırsız takım
- Sınırsız sporcu
- Sınırsız staff
- Gelişmiş roller
- Çoklu takım dashboard
- Gelişmiş veri analizi
- Çoklu takım rapor analizi
- Team pattern detection
- Multi-team memory
- Oyuncu gelişim raporları
- Scout raporları
- Load management
- Team readiness dashboard
- Wearable integrations
- Nutrition dashboard
- Branded PDF reports
- Staff collaboration
- Audit logs
- Öncelikli destek

---

## 9.4 Self-hosted Open Source

Amaç: Veri gizliliği isteyen kulüpler ve teknik ekipler.

### Dahil

- Açık kaynak core
- Kendi sunucunda kurulum
- Kendi database
- Kendi storage
- Kendi AI key
- Kendi wearable provider key’leri
- Sınırsız takım
- Sınırsız sporcu
- Sınırsız session
- API key management
- Telemetry kapatma
- Backup / restore

### Gelir Modeli

Self-host ücretsiz core sağlayabilir. Gelir şu alanlardan oluşur:

- Managed hosting
- Priority support
- One-click deployment
- Enterprise onboarding
- Custom deployment
- SLA ve bakım paketi

---

## 10. MVP Kapsamı

Hackathon / ilk demo için ürünün daraltılmış ama güçlü versiyonu yapılmalıdır.

### Must Have

- Landing page
- Clerk auth
- Organizasyon oluşturma
- Takım oluşturma
- Sporcu ekleme
- Sporcu davet / claim akışı, basit
- Koç dashboard
- Sporcu dashboard
- Günlük check-in
- Toplu antrenman session oluşturma
- Kişisel antrenman kaydı
- Basit beslenme takibi
- AI session report
- Team Memory Assistant, basit RAG
- Pricing ekranı
- Self-host mesajı

### Should Have

- CSV import ile wearable veri simülasyonu
- PDF export mock
- Coach correction loop
- Drill library
- Player observations

### Could Have

- Gerçek Strava OAuth başlangıcı
- Readiness score grafiği
- Nutrition compliance kartı

### Won’t Have in MVP

- Forma numarası otomatik tanıma
- Canlı koç uyarıları
- Apple Health native entegrasyonu
- Garmin production entegrasyonu

---

## 11. Başarı Kriterleri

### Hackathon Başarı Kriterleri

- Ürün net şekilde SaaS tool olarak anlaşılmalı.
- Sosyal medya / rota uygulaması gibi görünmemeli.
- Koç ve sporcu dashboard’u ayrımı net olmalı.
- AI raporu gerçek veri hissi vermeli.
- Team Memory özelliği ürünün farkını göstermeli.
- Self-host hikayesi ikna edici olmalı.
- Pricing modeli anlaşılır olmalı.

### Ürünleşme Başarı Kriterleri

- Bir koç 10 dakikada takımını kurabilmeli.
- Sporcu 30 saniyede günlük check-in girebilmeli.
- Bir session sonrası 1 dakikada özet rapor alınabilmeli.
- Team Memory geçmiş veriden anlamlı cevap verebilmeli.
- Wearable olmayan sporcular sistemde eksik kalmamalı.
- Self-host kurulumu teknik kullanıcı için anlaşılır olmalı.

---

## 12. Riskler ve Sınırlar

### 12.1 Sağlık ve Medikal Sınır

OhHike CoachOS tıbbi teşhis koymaz. Ürün; performans, antrenman yükü, readiness ve genel refah takibi için karar destek aracıdır.

### 12.2 AI Sınırı

AI çıktıları öneridir. Nihai karar antrenör, kulüp staff’ı veya ilgili uzman tarafından verilmelidir.

### 12.3 Wearable Sınırı

Akıllı saat verisi sadece sporcu açık izin verirse alınır. Wearable entegrasyonu opsiyoneldir. Akıllı saati olmayan sporcular manuel veriyle sistemde tam olarak yer alabilir.

### 12.4 Veri Analizi Sınırı

AI yalnızca sisteme girilmiş veya izinli entegrasyonlardan alınmış verileri yorumlar. Video, canlı kamera, oyuncu tracking, top tracking ve pose estimation ürün kapsamı dışındadır.

### 12.5 Veri Gizliliği

Kulüplerin taktik, sporcu ve sağlık verileri hassastır. Bu nedenle self-host seçeneği ürünün stratejik parçasıdır.

---

## 13. Roadmap

### v0.1 - Hackathon MVP

- Core SaaS akışı
- Koç / sporcu dashboard
- Takım / sporcu / session yönetimi
- Basit AI rapor
- Basit Team Memory
- Pricing + self-host landing

### v0.2 - Beta

- CSV import ve geçmiş rapor içe aktarma
- Coach correction loop
- Drill library
- CSV import
- PDF export
- Gelişmiş readiness score

### v1.0 - Public Launch

- Clerk Billing
- Team Memory RAG
- Strava entegrasyonu
- Coach Pro plan
- Club plan
- Self-host Docker kurulum

### v1.5

- Garmin Health API, onay sürecine bağlı
- Nutritionist / physio rolleri
- Branded reports
- Multi-team club dashboard

### v2.0

- Gelişmiş load management
- Çoklu takım pattern analizi
- Akıllı saat entegrasyon derinleştirmesi
- Advanced load management
- Mobile app / native health bridge

---

## 14. Nihai Ürün Tanımı

OhHike CoachOS; antrenörlerin sporcuları, antrenmanları, maçları, kişisel çalışmalarını, beslenme alışkanlıklarını, readiness verilerini, wearable bağlantılarını ve AI veri analizlerini tek panelden yönetmesini sağlayan; AI ile takım hafızası oluşturan, self-host edilebilir spor zekâsı platformudur.

Ürün, akıllı saati olan ve olmayan tüm sporcular için çalışır. Wearable entegrasyonu sistemi güçlendirir ama sistemin temel şartı değildir. Esas değer; takım verisini tek yerde toplamak, AI ile anlamlandırmak ve antrenöre uygulanabilir karar desteği sunmaktır.
