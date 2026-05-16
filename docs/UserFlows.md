# OhHike CoachOS - Detaylı Kullanıcı Akışları v3.0

## 0. Doküman Durumu

**Doküman adı:** OhHike CoachOS User Flows  
**Versiyon:** v3.0  
**Ürün tipi:** SaaS + Open Source / Self-host  
**Ana kullanıcılar:** Antrenör, sporcu, kulüp yöneticisi, performans analisti, fizyoterapist, nutritionist  
**Ana ürün alanları:** Coach Dashboard, Athlete Dashboard, Team Management, Session Tracking, Wearable Hub, AI Reports, Team Memory  
**Ana domain:** `ohhike.com`  
**Uygulama domain:** `app.ohhike.com`

---

## 1. Kullanıcı Rolleri ve Akış Mantığı

OhHike CoachOS iki ana kullanıcı tarafına sahiptir:

1. **Yöneten taraf:** Antrenör, kulüp admini, performans analisti, fizyoterapist, nutritionist.
2. **Veri giren ve takip edilen taraf:** Sporcu.

Bu yüzden tüm akışlar şu iki temel deneyim etrafında tasarlanır:

"""text
Coach Experience:
Takımı kurar, sporcuları ekler, antrenmanları yönetir, raporları okur, AI’dan karar desteği alır.

Athlete Experience:
Günlük verisini girer, kişisel antrenmanını kaydeder, beslenme/su takibini yapar, wearable bağlar, koç görevlerini görür.
"""

---

## 2. SaaS Coach Onboarding Akışı

Bu akış, yeni bir antrenörün `ohhike.com` üzerinden kayıt olup ilk takımını kurmasına kadar olan süreci kapsar.

### 2.1 Tetikleyici

Kullanıcı `ohhike.com` landing page üzerinden **Get Started**, **Start Coaching Smarter** veya **Create Your Team** butonuna tıklar.

### 2.2 Kullanıcı Adımları

1. Kullanıcı landing page’e gelir.
2. Ürün mesajını, pricing ve self-host bilgisini görür.
3. CTA butonuna tıklar.
4. Clerk sign-up ekranına yönlenir.
5. Google OAuth veya e-posta/şifre ile hesap oluşturur.
6. Başarılı kayıt sonrası `app.ohhike.com/onboarding` sayfasına yönlenir.
7. Onboarding stepper başlar.
8. Organizasyon bilgilerini girer.
9. İlk takımını oluşturur.
10. Spor dalı, yaş grubu, takım seviyesi ve sezon hedefi seçer.
11. İlk sporcularını manuel olarak ekler veya CSV import seçeneğini görür.
12. Dashboard’a yönlenir.

### 2.3 UI Durumları

#### Step 1 - Welcome

Doctor Panda karşılar:

"""text
Hoş geldin koç! Önce takımını tanıyalım, sonra her antrenmandan öğrenen bir sistem kurmaya başlayalım.
"""

CTA:

"""text
Takımımı Kur
"""

#### Step 2 - Organization

Alanlar:

- Organizasyon adı
- Organizasyon türü
- Şehir / ülke
- Logo, opsiyonel
- Kullanım amacı

Organizasyon türleri:

- Kulüp
- Akademi
- Bireysel koç
- Okul takımı
- Üniversite takımı
- Performans merkezi
- Diğer

#### Step 3 - First Team

Alanlar:

- Takım adı
- Spor dalı
- Yaş grubu
- Seviye
- Oyun sistemi / formasyon, opsiyonel
- Sezon hedefi
- Haftalık antrenman sayısı

Örnek sezon hedefleri:

- Geçiş savunmasını geliştirmek
- Pres reaksiyonunu artırmak
- Maç sonu düşüşü azaltmak
- Oyuncu gelişimini sistematik takip etmek
- Genel kondisyonu artırmak

#### Step 4 - Add Athletes

Seçenekler:

- Manuel sporcu ekle
- CSV ile içe aktar
- Daha sonra ekle

#### Step 5 - Dashboard Ready

Doctor Panda mesajı:

"""text
Harika! Takım iskeletin hazır. Şimdi ilk session’ını oluşturabilir, sporcularını davet edebilir veya günlük check-in akışını başlatabilirsin.
"""

### 2.4 Backend Süreçleri

"""text
Clerk user.created webhook
→ users tablosunda kayıt oluşturulur
→ organizations tablosuna kayıt oluşturulur
→ organization_members içine owner rolü eklenir
→ billing_entitlements free plan olarak oluşturulur
→ teams tablosuna ilk takım eklenir
→ sporcular eklenirse athletes tablosuna yazılır
"""

### 2.5 Başarı Durumu

Kullanıcı `/dashboard` sayfasına yönlenir ve şu kartları görür:

- İlk takım oluşturuldu
- Sporcu ekle
- İlk session oluştur
- Sporcuları davet et
- AI rapor için demo session yükle

---

## 3. Self-host Admin Setup Akışı

Self-host kurulumlarda kullanıcı cloud SaaS yerine kendi sunucusunda sistemi çalıştırır.

### 3.1 Tetikleyici

Kullanıcı Docker Compose, Coolify, Dokploy veya manuel VPS ile uygulamayı başlatır ve ilk kez root URL’ye gider.

### 3.2 Kullanıcı Adımları

1. Kullanıcı self-host domainine gider.
2. Sistem setup mode’da açılır.
3. Admin hesabı oluşturulur.
4. Database bağlantısı doğrulanır.
5. Storage ayarı yapılır.
6. AI provider seçilir.
7. API key girilir.
8. Wearable provider key’leri opsiyonel olarak girilir.
9. İlk organizasyon oluşturulur.
10. İlk takım oluşturulur.
11. Dashboard’a yönlenir.

### 3.3 UI Adımları

#### Step 1 - System Check

Kontrol edilenler:

- Database bağlantısı
- Storage erişimi
- ENCRYPTION_KEY varlığı
- Public URL
- Self-host mode
- Migration durumu

#### Step 2 - Admin Account

Alanlar:

- Ad soyad
- E-posta
- Şifre veya auth provider
- Admin rolü

#### Step 3 - Provider Keys

Alanlar:

- OpenAI API Key
- Gemini API Key
- OpenRouter API Key
- Strava Client ID / Secret, opsiyonel
- Garmin API bilgileri, opsiyonel
- Storage provider ayarları

#### Step 4 - Organization

SaaS onboarding ile aynıdır ancak billing adımı yoktur.

### 3.4 Backend Süreçleri

"""text
setup mode check
→ admin user oluşturulur
→ organization oluşturulur
→ organization_members owner kaydı eklenir
→ api_keys şifreli kaydedilir
→ system_settings içine SELF_HOSTED=true yazılır
→ setup_completed=true yapılır
"""

### 3.5 Başarı Durumu

Kullanıcı self-host admin paneline yönlenir.

Doctor Panda mesajı:

"""text
Kurulum tamam! Takım verilerin artık kendi sunucunda. İlk takımını oluşturarak başlayabilirsin.
"""

---

## 4. Sporcu Ekleme Akışı

Antrenör sporcuları sisteme kaydeder. Sporcu hesabı olmak zorunda değildir.

### 4.1 Tetikleyici

Coach Dashboard veya Team Detail ekranında **Sporcu Ekle** butonuna tıklanır.

### 4.2 Kullanıcı Adımları

1. Antrenör takım seçer.
2. “Sporcu Ekle” butonuna tıklar.
3. Sporcu bilgilerini girer.
4. Kaydet der.
5. Sporcu takım listesinde görünür.
6. Antrenör isterse davet linki gönderir.

### 4.3 Form Alanları

- Ad
- Soyad
- Görünen ad
- E-posta, opsiyonel ama davet için önerilir
- Telefon, opsiyonel
- Forma numarası
- Mevki / rol
- Doğum tarihi
- Boy
- Kilo
- Dominant ayak / el
- Durum: aktif, sakat, recovery, izleniyor
- Genel koç notu

### 4.4 UI Durumları

#### Başarılı Kayıt

"""text
Sporcu eklendi. Şimdi bu sporcuyu davet edebilir veya manuel olarak takip etmeye başlayabilirsin.
"""

CTA:

- Davet Gönder
- Yeni Sporcu Ekle
- Sporcu Profiline Git

### 4.5 Backend Süreçleri

"""text
createAthlete()
→ plan limit kontrolü yapılır
→ athletes tablosuna kayıt eklenir
→ audit_logs içine athlete.created yazılır
→ opsiyonel athlete_invites token oluşturulur
"""

---

## 5. Toplu Sporcu Import Akışı

CSV ile çok sayıda sporcu hızlıca eklenir.

### 5.1 Tetikleyici

Athletes sayfasında **CSV Import** butonuna tıklanır.

### 5.2 Kullanıcı Adımları

1. Antrenör CSV template indirir.
2. Sporcu listesini doldurur.
3. CSV dosyasını yükler.
4. Sistem kolonları doğrular.
5. Önizleme ekranı gösterilir.
6. Hatalı satırlar işaretlenir.
7. Kullanıcı import’u onaylar.
8. Sporcular `athletes` tablosuna eklenir.

### 5.3 CSV Kolonları

"""text
first_name
last_name
email
number
position
birth_date
height_cm
weight_kg
dominant_side
status
notes
"""

### 5.4 Hata Durumları

- Eksik zorunlu alan
- Aynı forma numarası
- Geçersiz e-posta
- Geçersiz tarih formatı
- Plan limiti aşıldı

### 5.5 Backend Süreçleri

"""text
CSV upload
→ imports bucket’a dosya yazılır
→ parse edilir
→ validation yapılır
→ preview oluşturulur
→ kullanıcı onayı sonrası bulk insert
→ audit log yazılır
"""

---

## 6. Sporcu Davet ve Claim Akışı

Sporcu, antrenörün oluşturduğu profili kendi kullanıcı hesabına bağlar.

### 6.1 Tetikleyici

Antrenör sporcu profilinden **Davet Gönder** butonuna tıklar.

### 6.2 Antrenör Adımları

1. Sporcu profiline gider.
2. E-posta varsa “Davet Gönder” der.
3. Sistem davet linki oluşturur.
4. Sporcuya e-posta veya paylaşılabilir link gönderilir.
5. Antrenör davet durumunu görür.

### 6.3 Sporcu Adımları

1. Sporcu davet linkini açar.
2. Clerk sign-up veya sign-in ekranına yönlenir.
3. Giriş sonrası davet token’ı doğrulanır.
4. Sporcu profili kendi `user_id` değeriyle eşleşir.
5. Sporcu onboarding ekranına yönlenir.
6. Profilini tamamlar.
7. Wearable bağlaması opsiyonel olarak sunulur.
8. Athlete Dashboard’a gider.

### 6.4 UI Mesajı

"""text
Profilin takımına bağlandı. Artık günlük check-in girebilir, kişisel antrenmanlarını kaydedebilir ve koçunun görevlerini takip edebilirsin.
"""

### 6.5 Backend Süreçleri

"""text
athlete_invites.token doğrulanır
→ expires_at kontrol edilir
→ accepted_by yazılır
→ accepted_at yazılır
→ athletes.user_id current user olarak güncellenir
→ organization_members içine athlete rolü eklenir
"""

---

## 7. Coach Dashboard Günlük Kullanım Akışı

Antrenörün her gün uygulamayı açtığında gördüğü ana akıştır.

### 7.1 Tetikleyici

Antrenör `app.ohhike.com/dashboard` sayfasına girer.

### 7.2 Dashboard Yüklenirken

Sistem şu verileri toplar:

- Aktif takım
- Bugünkü session’lar
- Son 7 gün check-in oranı
- Team Readiness Score
- Eksik check-in yapan sporcular
- Riskli sporcular
- Son AI raporları
- Wearable sync durumu
- Nutrition compliance
- Son team pattern’leri

### 7.3 Dashboard Kartları

#### Team Readiness Score

Gösterir:

- Takım ortalama readiness skoru
- Dünkü skorla karşılaştırma
- Düşük readiness sporcu sayısı

#### Athlete Risk Alerts

Örnek:

"""text
Emir #8: yüksek yük + düşük uyku
Mert #11: diz ağrısı bildirdi
Arda #6: son 3 oturumda yüksek RPE
"""

#### Missing Check-ins

Örnek:

"""text
Bugün 7 sporcu check-in girmedi.
"""

CTA:

- Hatırlatma gönder
- Eksik sporcuları görüntüle

#### AI Recommended Focus

Örnek:

"""text
Bugünkü takım readiness ortalaması düşük. Yüksek yoğunluklu sprint yerine teknik geçiş oyunu ve recovery blokları öneriliyor.
"""

### 7.4 Antrenör Aksiyonları

- Yeni session oluştur
- Sporcu ekle
- AI’dan haftalık plan iste
- Eksik check-in hatırlatması gönder
- AI veri analizi başlat
- Team Memory’ye soru sor

---

## 8. Athlete Dashboard Günlük Kullanım Akışı

Sporcunun günlük veri girdiği ve görevlerini takip ettiği mobil öncelikli akıştır.

### 8.1 Tetikleyici

Sporcu `app.ohhike.com/athlete` veya role-based dashboard’a girer.

### 8.2 Dashboard İçeriği

- Bugünkü readiness durumu
- Günlük check-in formu
- Bugünkü takım session’ı
- Kişisel görevler
- Su / beslenme takibi
- Antrenman sonrası RPE
- Wearable sync durumu
- Koç notları

### 8.3 Günlük Check-in CTA

Eğer check-in yapılmadıysa:

"""text
Bugünkü durumunu 30 saniyede paylaş. Bu bilgi antrenman yükünü daha doğru planlamamıza yardımcı olur.
"""

CTA:

"""text
Check-in Yap
"""

### 8.4 Check-in Tamamlandıktan Sonra

Sporcu şu mesajı görür:

"""text
Teşekkürler! Bugünkü durumun koç dashboard’una yansıdı. Eğer kendini iyi hissetmiyorsan antrenman sonrası not eklemeyi unutma.
"""

### 8.5 Backend Süreçleri

"""text
submitWellnessCheckin()
→ wellness_checkins tablosuna yazılır
→ readiness_score hesaplanır
→ athlete daily summary güncellenir
→ team readiness aggregate yeniden hesaplanır
→ risk alert gerekirse oluşturulur
"""

---

## 9. Günlük Readiness Check-in Akışı

### 9.1 Tetikleyici

Sporcu dashboard’da **Check-in Yap** butonuna tıklar.

### 9.2 Form Alanları

- Dün kaç saat uyudun?
- Uyku kaliten nasıldı? 1-10
- Enerjin nasıl? 1-10
- Kas ağrın var mı? 1-10
- Ağrı bölgesi var mı?
- Stres seviyen? 1-10
- Motivasyonun? 1-10
- Hastalık belirtisi var mı?
- Bugün antrenmana ne kadar hazır hissediyorsun? 1-10
- Ek not

### 9.3 Sistem Hesaplaması

"""text
Manual readiness input
+ son 7 gün check-in trendi
+ son session RPE
+ kişisel antrenman yükü
+ wearable sleep / HRV / resting HR, varsa
= readiness_score
"""

### 9.4 UI Sonucu

"""text
Readiness Score: 72/100

Doctor Panda:
Bugün orta seviyede hazırsın. Eğer antrenman yüksek tempoluysa ısınma ve recovery bölümlerini atlamaman önemli.
"""

### 9.5 Coach Dashboard’a Etkisi

- Team Readiness Score güncellenir.
- Riskli sporcular listesi değişebilir.
- AI öneri kartı yeniden hesaplanabilir.

---

## 10. Nutrition Log Akışı

Beslenme takibi, diyet teşhisi değil alışkanlık ve uyum takibidir.

### 10.1 Tetikleyici

Sporcu dashboard’da **Beslenme Kaydı Gir** veya **Su Takibi** alanına tıklar.

### 10.2 Form Alanları

- Su tüketimi
- Kahvaltı yaptım
- Öğle öğünü yaptım
- Akşam öğünü yaptım
- Ara öğün yaptım
- Antrenman öncesi öğün yaptım
- Antrenman sonrası toparlanma öğünü yaptım
- Protein hedefime yaklaştım
- Karbonhidrat ihtiyacımı karşıladım
- Ek not

### 10.3 UI Durumu

Örnek mesaj:

"""text
Bugünkü beslenme kaydın eklendi. Antrenman sonrası toparlanma öğünü eksik görünüyor; bunu tamamladığında recovery skorun daha sağlıklı yorumlanabilir.
"""

### 10.4 Coach / Nutritionist Tarafı

Nutritionist veya antrenör:

- Takım beslenme uyum oranını görür
- Eksik kayıt yapan sporcuları görür
- Yüksek antrenman günlerinde eksik öğünleri takip eder

### 10.5 Backend Süreçleri

"""text
nutrition_logs upsert
→ nutrition compliance hesaplanır
→ yüksek yük günüyle eşleşirse AI özet üretilebilir
→ dashboard aggregate güncellenir
"""

---

## 11. Personal Training Akışı

Sporcu takım dışı yaptığı kişisel çalışmaları kaydeder.

### 11.1 Tetikleyici

Sporcu dashboard’da **Kişisel Antrenman Ekle** butonuna tıklar.

### 11.2 Form Alanları

- Antrenman türü
- Başlık
- Tarih / saat
- Süre
- Mesafe, varsa
- Yoğunluk / RPE
- Not
- Wearable aktiviteyle eşleştir, varsa

### 11.3 Örnek Kullanım

"""text
Tür: Koşu
Süre: 45 dk
RPE: 7/10
Not: Son 10 dakika bacaklarım yoruldu.
"""

### 11.4 Coach Dashboard’a Etkisi

Antrenör şunu görebilir:

"""text
Bu sporcu dün ekstra 45 dk koşu yaptı. Bugünkü takım antrenmanında yüksek yük alması riskli olabilir.
"""

### 11.5 Backend Süreçleri

"""text
personal_trainings insert
→ weekly load calculation güncellenir
→ wearable activity varsa matched_personal_training_id yazılır
→ risk alert gerekirse oluşturulur
"""

---

## 12. Team Session Oluşturma Akışı

Antrenör takım antrenmanı veya maç oluşturur.

### 12.1 Tetikleyici

Coach Dashboard veya Sessions sayfasında **Yeni Session** butonuna tıklanır.

### 12.2 Session Türleri

- Team Training
- Match
- Friendly Match
- Recovery
- Test Day
- Data Review
- Nutrition Session
- Education Session

### 12.3 Form Alanları

- Başlık
- Tür
- Tarih / saat
- Lokasyon
- Rakip, maç ise
- Planlanan süre
- Planlanan yoğunluk
- Focus area
- Katılacak sporcular
- Koç notu
- Antrenman blokları

### 12.4 Antrenman Bloğu Örneği

"""text
10 dk dinamik ısınma
15 dk rondo
20 dk geçiş savunması oyunu
15 dk 7v7 uygulama
5 dk soğuma
"""

### 12.5 Backend Süreçleri

"""text
createSession()
→ entitlement session limit kontrolü
→ sessions tablosuna yazılır
→ selected athletes için session_attendance taslak kayıtları oluşturulur
→ training_blocks kayıtları oluşturulur
→ audit log yazılır
"""

---

## 13. Session Tamamlama ve RPE Akışı

### 13.1 Tetikleyici

Antrenman veya maç tamamlandıktan sonra koç session detail sayfasında **Session’ı Tamamla** butonuna tıklar.

### 13.2 Koç Adımları

1. Katılımı işaretler.
2. Oyuncu sürelerini girer.
3. Genel koç notu ekler.
4. Tamamla der.
5. Sporculara RPE girmeleri için bildirim / görev düşer.

### 13.3 Sporcu Adımları

1. Athlete Dashboard’da “Antrenman sonrası değerlendir” kartını görür.
2. RPE girer.
3. Ağrı var mı seçer.
4. Not ekler.
5. Gönderir.

### 13.4 Backend Süreçleri

"""text
session status completed
→ session_attendance güncellenir
→ RPE verileri toplanır
→ load score hesaplanır
→ team daily summary güncellenir
→ AI summary opsiyonel tetiklenir
"""

---

## 14. Data Import / Supporting File Akışı

### 14.1 Tetikleyici

Session detail ekranında **Koç Notu Ekle**, **Rapor İçe Aktar** veya **CSV Veri Ekle** butonuna tıklanır.

### 14.2 Kullanıcı Adımları

1. Koç session notu girer veya CSV/PDF/doküman seçer.
2. Dosya yükleme başlar.
3. Upload progress gösterilir.
4. Yükleme bitince processing status görünür.
5. Sistem dosyayı parse eder veya özetler.
6. Hazır olduğunda AI analiz butonu aktifleşir.

### 14.3 UI Status

- Uploading
- Processing
- Context ready
- Analysis ready
- Failed

### 14.4 Backend Süreçleri

"""text
file upload / note submit
→ session_files veya documents kaydı oluşturulur
→ Supabase Storage veya S3 path kaydedilir
→ processing_status=pending
→ async parsing/summarization job başlar
→ document summary oluşturulur
→ processing_status=completed
"""

---

## 15. AI Session Analysis Akışı

### 15.1 Tetikleyici

Koç session detail ekranında **AI Analiz Oluştur** butonuna tıklar.

### 15.2 Sistem Context Toplar

- Takım profili
- Sporcu listesi
- Session türü
- Session amacı
- Katılım ve RPE
- Koç notu
- Son check-in özetleri
- Nutrition özetleri
- Wearable özetleri, varsa
- Önceki takım pattern’leri
- İçe aktarılan rapor özetleri ve context dokümanları
- Drill library

### 15.3 AI Çıktısı

AI structured JSON üretir.

"""json
{
  "session_summary": {
    "title": "Transition defense needs attention",
    "summary": "The team lost compactness after possession loss.",
    "confidence_score": 0.78
  },
  "team_patterns": [
    {
      "type": "transition_defense",
      "severity": "medium",
      "observation": "The midfield reacted late in the first 6 seconds.",
      "recommendation": "Use 4v4+3 transition games."
    }
  ],
  "athlete_observations": [
    {
      "athlete_reference": "#8",
      "observation": "Late reaction after ball loss.",
      "suggested_focus": "First 5-second defensive reaction."
    }
  ],
  "recommended_drills": [
    {
      "title": "4v4+3 Transition Game",
      "duration_min": 20
    }
  ]
}
"""

### 15.4 UI Rapor Kartları

- Session Summary
- Team Patterns
- Athlete Observations
- Risk Alerts
- Recommended Drills
- Next Training Plan
- Coach Correction

### 15.5 Backend Süreçleri

"""text
generateAiSessionReport()
→ entitlement AI limit kontrolü
→ context builder çalışır
→ AI provider çağrılır
→ JSON schema validation yapılır
→ ai_reports kaydı oluşturulur
→ athlete_observations oluşturulur
→ team_patterns güncellenir
→ documents kaydı oluşturulur
→ embeddings oluşturulur
"""

---

## 16. Coach Correction Loop Akışı

AI yanlış veya eksik analiz yaparsa koç düzeltir.

### 16.1 Tetikleyici

AI rapor kartında **Düzelt** butonuna tıklanır.

### 16.2 Kullanıcı Adımları

1. Koç gözlemi düzenler.
2. Yanlış oyuncu referansını düzeltir.
3. Öneriyi kabul eder veya reddeder.
4. Kendi notunu ekler.
5. Kaydeder.

### 16.3 Örnek

AI:

"""text
#8 top kaybından sonra geç reaksiyon verdi.
"""

Koç düzeltmesi:

"""text
Bu oyuncu #6 idi. #8 pozisyonu kapatıyordu.
"""

### 16.4 Backend Süreçleri

"""text
correction kaydı oluşturulur
→ ai_report raw_output correction metadata ile güncellenir
→ athlete_observations düzeltilebilir
→ documents içine coach correction note eklenir
→ embeddings güncellenir
→ Team Memory sonraki cevaplarda bunu dikkate alır
"""

---

## 17. Team Memory Assistant Akışı

### 17.1 Tetikleyici

Koç `/memory` sayfasında veya dashboard’daki Assistant widget üzerinden soru sorar.

### 17.2 Örnek Sorular

- Son 1 ayda en çok tekrar eden problem ne?
- Emir için bireysel gelişim planı çıkar.
- Bu hafta yüksek yük alan sporcular kim?
- Geçiş savunması için daha önce ne çalışmıştık?
- Yarınki antrenmanı takımın yorgunluk durumuna göre planla.
- Son 3 maçta ikinci yarı düşüşünün nedeni ne olabilir?

### 17.3 Sistem Akışı

"""text
Soru alınır
→ organization/team context belirlenir
→ query embedding oluşturulur
→ documents + document_embeddings semantic search
→ ilgili doküman chunk’ları alınır
→ kullanıcı rolüne göre hassas veri filtrelenir
→ LLM cevap üretir
→ assistant_messages tablosuna kaydedilir
"""

### 17.4 UI Cevap Örneği

"""text
Son 4 session raporunda en çok tekrar eden konu geçiş savunması. Özellikle top kaybından sonraki ilk 6 saniyede orta saha hattının geri dönüşü gecikiyor. Bu hafta 4v4+3 transition drill ve düşük-orta yoğunluklu kompakt blok çalışması öneriyorum.
"""

### 17.5 Kaynak Gösterimi

Assistant cevabının altında şu kaynaklar gösterilebilir:

- 12 Mayıs Antrenman Analizi
- 9 Mayıs Maç Raporu
- Koç düzeltme notu
- #8 oyuncu gözlemi

---

## 18. Training Planner Akışı

### 18.1 Tetikleyici

Koç **Antrenman Planla** veya Team Memory üzerinden plan isteği yapar.

### 18.2 Kullanıcı Girdisi

Örnek:

"""text
Bugün 75 dakikalık antrenman var. Takım biraz yorgun. Geçiş savunmasını çalışmak istiyorum.
"""

### 18.3 Sistem Context Toplar

- Bugünkü readiness ortalaması
- Riskli oyuncular
- Son team pattern’leri
- Takım hedefleri
- Haftalık session yoğunluğu
- Drill library
- Maç takvimi

### 18.4 AI Çıktısı

"""text
75 Dakikalık Plan

10 dk mobilite + düşük tempo ısınma
12 dk 5v2 rondo
20 dk 4v4+3 geçiş savunması oyunu
18 dk 7v7 kontrollü oyun
10 dk duran top tekrarı
5 dk soğuma ve geri bildirim
"""

### 18.5 Backend Süreçleri

"""text
createTrainingPlan()
→ AI context builder
→ drill matching
→ structured training plan output
→ training_plans tablosuna kayıt
→ opsiyonel session’a bağlama
"""

---

## 19. Wearable Bağlantı Akışı

### 19.1 Tetikleyici

Sporcu Athlete Dashboard’da **Cihaz Bağla** butonuna tıklar.

### 19.2 Provider Seçimi

- Strava
- Garmin
- Apple Health
- Health Connect
- CSV Import
- Manuel giriş

### 19.3 Strava Akışı

1. Sporcu Strava seçer.
2. OAuth consent ekranına yönlenir.
3. Gerekli izinleri verir.
4. Callback endpoint token alır.
5. Token şifreli saklanır.
6. İlk sync başlar.
7. Aktivite özetleri sisteme düşer.

### 19.4 Garmin Akışı

1. Sporcu Garmin seçer.
2. Sistem Garmin Health API erişimi varsa bağlantı başlatır.
3. Kullanıcı izin verir.
4. Garmin Connect senkronize ettikçe veriler çekilir.

Not:

"""text
Garmin entegrasyonu production için API erişim/onay süreci gerektirir.
"""

### 19.5 Apple Health / Health Connect Akışı

Web app için doğrudan tam erişim pratik değildir. Native mobile app veya bridge gerekir.

MVP’de gösterim:

"""text
Coming soon / Mobile bridge required
"""

### 19.6 CSV Fallback

Akıllı saat entegrasyonu yoksa veya MVP’de hızlı demo gerekiyorsa CSV import kullanılır.

CSV alanları:

"""text
date
steps
active_minutes
distance_km
sleep_hours
sleep_score
avg_heart_rate
max_heart_rate
resting_heart_rate
hrv
stress_score
"""

### 19.7 Backend Süreçleri

"""text
connectWearableProvider()
→ token encrypted save
→ syncWearableData()
→ normalize provider payload
→ wearable_daily_summaries
→ wearable_activities
→ match personal training
→ recompute readiness/load
"""

---

## 20. Wearable Sync ve AI Kullanım Akışı

### 20.1 Günlük Sync

Sistem periyodik olarak wearable verilerini senkronize eder.

"""text
cron / webhook / manual sync
→ active wearable_connections bulunur
→ provider API çağrılır
→ data normalize edilir
→ günlük özetler güncellenir
→ readiness ve load skorları yeniden hesaplanır
"""

### 20.2 AI Ne Yapar?

AI şu yorumları üretir:

- Düşük uyku + yüksek yük uyarısı
- Antrenman dışı fazla aktivite uyarısı
- Recovery önerisi
- Riskli sporcu listesi
- Takım readiness trendi
- Haftalık yük özeti

### 20.3 Örnek AI Insight

"""text
Son 48 saatte 3 oyuncunun antrenman dışı aktivite yükü yükselmiş ve uyku skorları düşmüş. Bugünkü session’da sprint tekrarlarını azaltıp teknik-taktik bloklara ağırlık vermeni öneriyorum.
"""

---

## 21. Load & Recovery Takip Akışı

### 21.1 Veri Kaynakları

- Takım antrenmanı
- Maç süresi
- Kişisel antrenman
- RPE
- Wearable aktivite
- Uyku
- Ağrı bildirimi
- Recovery notu

### 21.2 Sistem Hesaplaması

"""text
Training Load =
session duration x RPE
+ personal training load
+ wearable activity load
+ match minutes factor
"""

### 21.3 Risk Alert Üretimi

Risk alert örnekleri:

- Ani yük artışı
- Düşük uyku
- Artan kas ağrısı
- Tekrarlayan ağrı bölgesi
- Yüksek RPE trendi
- Recovery eksikliği

### 21.4 Coach Dashboard

Riskli sporcular kart olarak gösterilir.

"""text
Mert #11
Risk: Orta
Sebep: 2 gündür diz ağrısı + yüksek RPE
Öneri: Bugünkü temaslı oyunda süre kısıtla.
"""

---

## 22. Reports & Export Akışı

### 22.1 Tetikleyici

Koç AI rapor, session rapor veya oyuncu gelişim ekranında **PDF Export** butonuna tıklar.

### 22.2 Rapor Türleri

- Session report
- Match report
- Training report
- Player development report
- Weekly team report
- Load report
- Readiness report
- Nutrition report
- Scout report

### 22.3 Kullanıcı Adımları

1. Rapor türü seçilir.
2. Tarih aralığı seçilir.
3. Takım veya sporcu seçilir.
4. Kulüp logosu dahil edilsin mi seçilir.
5. PDF oluşturulur.
6. İndirme veya paylaşılabilir link sunulur.

### 22.4 Backend Süreçleri

"""text
generateReport()
→ entitlement PDF kontrolü
→ report data collector
→ HTML template render
→ PDF generate
→ reports bucket’a upload
→ reports tablosuna kayıt
"""

---

## 23. Staff Collaboration Akışı

### 23.1 Tetikleyici

Owner veya admin staff davet eder.

### 23.2 Staff Rolleri

- Head Coach
- Assistant Coach
- Analyst
- Physiotherapist
- Nutritionist
- Viewer

### 23.3 Akış

1. Admin staff davet eder.
2. Rol seçer.
3. Takım erişimi seçer.
4. Davet gönderilir.
5. Staff hesabını oluşturur.
6. Rolüne uygun dashboard’a erişir.

### 23.4 Rol Bazlı Örnekler

#### Analyst

- Rapor ve veri özeti ekleyebilir
- AI raporları görebilir
- Koç düzeltmesi ekleyebilir
- Nutrition verisini göremez, izin verilmediyse

#### Physiotherapist

- Readiness ve ağrı notlarını görebilir
- Load risk alert görebilir
- Billing ve AI key ayarlarını göremez

#### Nutritionist

- Nutrition logları görebilir
- Sporcu beslenme notu yazabilir
- Hassas takım analiz raporlarını göremez, izin verilmediyse

---

## 24. Billing ve Plan Upgrade Akışı

### 24.1 Tetikleyici

Kullanıcı plan limitine takılır veya pricing sayfasından upgrade seçer.

### 24.2 Limit Örnekleri

- Free plan 10 sporcu sınırı
- Free plan gelişmiş AI analizi kapalı
- Free plan Team Memory kapalı
- Session limiti doldu
- PDF export premium

### 24.3 UI Mesajı

"""text
Bu özellik Coach Pro planında kullanılabilir. Gelişmiş AI analizi, Team Memory ve sporcu portalını açmak için planını yükselt.
"""

CTA:

- Planı Yükselt
- Paketleri İncele
- Self-host Seçeneklerini Gör

### 24.4 Backend Süreçleri

"""text
Clerk Billing checkout
→ billing webhook
→ organizations.subscription_tier güncellenir
→ billing_entitlements güncellenir
→ feature gate aktif olur
"""

---

## 25. Feature Gate Akışları

Her premium özellik öncesinde server-side entitlement kontrolü yapılır.

### 25.1 Advanced AI Analysis Gate

"""text
canUseAdvancedAiAnalysis(organizationId)
→ false ise upgrade modal
→ true ise upload/analysis devam eder
"""

### 25.2 Team Memory Gate

"""text
canUseTeamMemory(organizationId)
→ false ise limited preview
→ true ise assistant açılır
"""

### 25.3 Wearable Gate

"""text
canUseWearables(organizationId)
→ false ise upgrade CTA
→ true ise provider connect flow
"""

### 25.4 Team / Athlete Limit Gate

"""text
createTeam()
→ max_teams kontrolü

createAthlete()
→ max_athletes kontrolü
"""

---

## 26. Error ve Fallback Akışları

### 26.1 AI Yanıt Vermiyor

UI mesajı:

"""text
Doctor Panda şu an raporu tamamlayamadı. Verilerin kaybolmadı; birkaç dakika sonra tekrar deneyebilirsin.
"""

Aksiyonlar:

- Tekrar dene
- Koç notunu kaydet
- Destek al

### 26.2 Veri İçe Aktarılamadı

UI mesajı:

"""text
Dosya veya veri kaydı işlenirken bir sorun oluştu. Farklı bir CSV/PDF deneyebilir veya sadece koç notlarıyla analiz oluşturabilirsin.
"""

Fallback:

- Manual notes analysis
- Retry processing
- CSV template kontrolü

### 26.3 Wearable Sync Hatası

UI mesajı:

"""text
Cihaz verileri şu an senkronize edilemedi. Manuel check-in kullanmaya devam edebilirsin.
"""

Aksiyonlar:

- Yeniden bağla
- Tekrar senkronize et
- Manuel veri gir

### 26.4 Plan Limiti

UI mesajı:

"""text
Bu ayki AI analiz limitine ulaştın. Yeni analiz oluşturmak için planını yükseltebilir veya gelecek dönemi bekleyebilirsin.
"""

### 26.5 Yetki Hatası

UI mesajı:

"""text
Bu alanı görüntüleme yetkin yok. Erişim gerekiyorsa organizasyon yöneticinle iletişime geç.
"""

---

## 27. Notification ve Reminder Akışları

Bildirimler MVP’de basit e-posta veya in-app task olarak başlayabilir.

### 27.1 Check-in Hatırlatma

Tetikleyici:

"""text
Saat 10:00’a kadar check-in girmeyen sporcular
"""

Mesaj:

"""text
Bugünkü durumunu paylaşmayı unutma. Bu bilgi antrenman yükünü daha doğru planlamamıza yardımcı olur.
"""

### 27.2 RPE Hatırlatma

Tetikleyici:

"""text
Session tamamlandıktan sonra RPE girmeyen sporcular
"""

### 27.3 Wearable Sync Sorunu

Tetikleyici:

"""text
Son 3 gündür senkronize olmayan provider
"""

### 27.4 AI Report Ready

Tetikleyici:

"""text
AI session report tamamlandı
"""

Mesaj:

"""text
Yeni antrenman analiz raporun hazır.
"""

---

## 28. Hackathon Demo Akışı

Jüri sunumu için önerilen uçtan uca demo.

### 28.1 Demo Senaryosu

"""text
Bir U17 futbol takımı var.
Koç OhHike’a giriş yapıyor.
Takımını ve sporcularını görüyor.
Bazı sporcular wearable bağlı, bazıları manuel takipte.
Bugünkü readiness düşük.
Koç antrenman session’ı oluşturuyor.
Koç notu ve örnek veri yüklüyor.
AI analiz raporu oluşturuyor.
Team Memory’ye soru soruyor.
Pricing ve self-host modeli gösteriliyor.
"""

### 28.2 Demo Adımları

1. Landing page: ürün mesajı.
2. Coach login.
3. Coach Dashboard: takım readiness, risk alert.
4. Athlete list: connected/manual sporcular.
5. Athlete Dashboard örneği: check-in ve kişisel antrenman.
6. Session detail: antrenman bilgisi.
7. Koç notu, check-in ve hazır demo akıllı saat verisi.
8. AI report generate.
9. Report cards.
10. Coach correction.
11. Team Memory: “Son 1 ayda tekrar eden problem ne?”
12. Pricing: Free / Coach Pro / Club / Self-host.
13. Self-host mesajı: “Your team data stays yours.”

---

## 29. Eski Akışlardan Çıkarılanlar

v3.0 ile aşağıdaki eski OhHike akışları çekirdekten kaldırılmıştır:

"""text
Scavenger Hunt
Public route creation
Map-based explore
Community routes
POI discovery
Gamification badges
Route completion
Location geofencing
Hiking route sharing
"""

Bu akışlar ileride ayrı bir outdoor modül olarak değerlendirilebilir; CoachOS çekirdeğinde yer almaz.

---

## 30. Nihai Akış Özeti

OhHike CoachOS kullanıcı akışları şu temel döngüye dayanır:

"""text
Coach creates team
→ Coach adds athletes
→ Athletes claim profiles
→ Athletes submit daily data
→ Coach creates sessions
→ Athletes and wearables feed data
→ Coach adds notes or imports reports
→ AI generates reports
→ Reports become Team Memory
→ Coach asks questions
→ AI suggests next actions
"""

Bu döngü her antrenman ve maçla güçlenir. Sistem zamanla yalnızca veri saklayan bir araç değil, takımın gelişim hafızası haline gelir.