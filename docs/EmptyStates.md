# OhHike CoachOS - Empty States & Onboarding UX v3.0

## 0. Doküman Durumu

**Doküman adı:** OhHike CoachOS Empty States & Onboarding UX  
**Versiyon:** v3.0  
**Ürün tipi:** SaaS + Open Source / Self-host  
**Ana kullanıcılar:** Coach, Athlete, Admin, Analyst, Physiotherapist, Nutritionist  
**Maskot:** Doctor Panda  
**Amaç:** Kullanıcı hiçbir veri olmadığında, hata aldığında veya premium limite takıldığında çıkmaza düşmemeli; her boş durum net bir sonraki aksiyona yönlendirmelidir.

---

## 1. Empty State Tasarım Prensipleri

OhHike CoachOS, veriyle güçlenen bir SaaS ürünüdür. Kullanıcı ilk giriş yaptığında sistem doğal olarak boştur:

- Henüz organizasyon yoktur.
- Henüz takım yoktur.
- Henüz sporcu eklenmemiştir.
- Henüz session oluşturulmamıştır.
- Sporcular check-in girmemiştir.
- Wearable bağlantısı yapılmamıştır.
- AI rapor üretilmemiştir.
- Team Memory henüz öğrenmemiştir.

Bu yüzden empty state’ler yalnızca “boş ekran” değil, ürünün öğretici parçası olmalıdır.

### 1.1 Her Empty State Şunları İçermeli

- Doctor Panda görseli veya küçük maskot kartı
- Kısa ve bağlamsal başlık
- Kullanıcıyı suçlamayan açıklama
- Birincil CTA
- Opsiyonel ikincil CTA
- Kısa yardım metni
- Gerekirse örnek veri veya demo başlatma seçeneği

### 1.2 Ton ve Üslup

Doctor Panda dili:

- Destekleyici
- Profesyonel
- Net
- Yargılamayan
- Kısa
- Antrenöre ve sporcuya güven veren

Kaçınılacak dil:

- “Hiçbir şey yok”
- “Veri bulunamadı”
- “Başarısız oldun”
- “Eksik”
- “Hata”
- “Yanlış yaptın”

Tercih edilen dil:

- “Başlamak için ilk takımını oluştur”
- “Bu alan ilk session’dan sonra dolacak”
- “Sporcular check-in yaptığında burada görünür”
- “İstersen demo verisiyle deneyebilirsin”

---

## 2. Global Onboarding Empty State

## 2.1 Yeni Kullanıcı İlk Giriş

### Durum

Kullanıcı kayıt olmuştur ancak henüz organizasyon, takım veya rol kurulumu yapılmamıştır.

### Görsel

Doctor Panda elinde küçük bir taktik tahtası tutar. Tahtada boş bir takım şeması vardır.

### Başlık

"""text
OhHike CoachOS’a hoş geldin.
"""

### Açıklama

"""text
Takım hafızanı oluşturmak için önce organizasyonunu ve ilk takımını kuralım. Birkaç adım sonra sporcularını ekleyip ilk session’ını planlayabileceksin.
"""

### Birincil CTA

"""text
Kuruluma Başla
"""

### İkincil CTA

"""text
Demo Takım ile Dene
"""

### Davranış

- “Kuruluma Başla” → `/onboarding`
- “Demo Takım ile Dene” → seed demo organization/team oluşturur veya demo mode açar.
- Kullanıcı self-host ortamdaysa önce setup kontrolüne yönlendirilir.

---

## 3. Organization Empty States

## 3.1 Organizasyon Yok

### Durum

Kullanıcının bağlı olduğu herhangi bir organizasyon yoktur.

### Görsel

Doctor Panda boş bir kulüp rozeti tutar.

### Başlık

"""text
Henüz bir organizasyonun yok.
"""

### Açıklama

"""text
OhHike’ta takımlar, sporcular ve raporlar bir organizasyon altında yönetilir. Kulübünü, akademini veya bireysel koç hesabını oluşturarak başlayabilirsin.
"""

### Birincil CTA

"""text
Organizasyon Oluştur
"""

### İkincil CTA

"""text
Davet Kodum Var
"""

### Davranış

- Organizasyon oluşturma formu açılır.
- Davet kodu varsa kullanıcı ilgili organizasyona katılabilir.

---

## 3.2 Organization Setup Eksik

### Durum

Organizasyon oluşturulmuş ama zorunlu bilgiler tamamlanmamıştır.

Eksik olabilecekler:

- Organizasyon adı
- Tür
- İlk takım
- Billing entitlement
- Owner üyeliği
- Self-host provider key ayarları

### Görsel

Doctor Panda checklist tutar.

### Başlık

"""text
Organizasyon kurulumu tamamlanmadı.
"""

### Açıklama

"""text
Takım ve sporcu yönetimine geçmeden önce birkaç temel ayarı tamamlamamız gerekiyor.
"""

### Birincil CTA

"""text
Kuruluma Devam Et
"""

### İkincil CTA

"""text
Setup Durumunu Gör
"""

---

## 4. Team Empty States

## 4.1 Takım Yok

### Durum

Organizasyon var ama henüz takım oluşturulmamış.

### Görsel

Doctor Panda boş bir saha çizimi veya taktik tahtası önünde durur.

### Başlık

"""text
İlk takımını oluşturalım.
"""

### Açıklama

"""text
OhHike CoachOS takım bazlı çalışır. Sporcular, session’lar, analizler ve takım hafızası seçtiğin takım üzerinden oluşur.
"""

### Birincil CTA

"""text
Takım Oluştur
"""

### İkincil CTA

"""text
Demo Takım Ekle
"""

### Davranış

- CTA `/teams/new` sayfasına götürür.
- Demo takım seçilirse örnek U17 futbol takımı oluşturulur.

---

## 4.2 Takım Var Ama Sporcu Yok

### Durum

Takım oluşturulmuş ama `athletes` listesi boş.

### Görsel

Doctor Panda boş forma kartları dizer.

### Başlık

"""text
Takımın hazır, şimdi sporcuları ekleyelim.
"""

### Açıklama

"""text
Sporcuları eklediğinde günlük check-in, antrenman takibi, kişisel yük, wearable bağlantısı ve AI oyuncu gözlemleri çalışmaya başlar.
"""

### Birincil CTA

"""text
Sporcu Ekle
"""

### İkincil CTA

"""text
CSV ile Toplu Ekle
"""

### Yardım Linki

"""text
Sporcuları davet etmeden de manuel takip başlatabilirsin.
"""

### Davranış

- “Sporcu Ekle” → `/athletes/new`
- “CSV ile Toplu Ekle” → `/athletes/import`

---

## 4.3 Team Dashboard’da Veri Yok

### Durum

Takımda sporcular vardır ama henüz session, check-in, AI rapor veya wearable verisi yoktur.

### Görsel

Doctor Panda boş dashboard kartlarını gösterir.

### Başlık

"""text
Takım dashboard’un ilk verilerini bekliyor.
"""

### Açıklama

"""text
İlk session’ını oluşturduğunda, sporcular check-in yaptığında veya AI rapor oluşturduğunda burada takım durumu görünmeye başlayacak.
"""

### Birincil CTA

"""text
İlk Session’ı Oluştur
"""

### İkincil CTA

"""text
Sporculara Check-in Gönder
"""

### Üçüncül Link

"""text
Demo Verisiyle Gör
"""

---

## 5. Athlete Management Empty States

## 5.1 Sporcu Listesi Boş

### Durum

`/athletes` sayfasında hiç sporcu yok.

### Görsel

Doctor Panda boş oyuncu kartlarıyla bir roster panosu tutar.

### Başlık

"""text
Sporcu listen henüz boş.
"""

### Açıklama

"""text
Sporcuları eklediğinde antrenman katılımını, günlük readiness durumunu, kişisel çalışmalarını ve gelişim notlarını tek yerden takip edebilirsin.
"""

### Birincil CTA

"""text
Sporcu Ekle
"""

### İkincil CTA

"""text
CSV ile İçe Aktar
"""

### Ek CTA

"""text
Örnek Sporcuları Yükle
"""

---

## 5.2 Arama Sonucu Yok

### Durum

Athlete listesinde search/filter sonucu boş dönmüştür.

### Görsel

Doctor Panda büyüteçle forma numarası arar.

### Başlık

"""text
Bu filtrelerle sporcu bulunamadı.
"""

### Açıklama

"""text
Arama kelimesini veya filtreleri değiştirerek tekrar deneyebilirsin.
"""

### Birincil CTA

"""text
Filtreleri Temizle
"""

### İkincil CTA

"""text
Yeni Sporcu Ekle
"""

---

## 5.3 Sporcu Profili Veri Boş

### Durum

Sporcu oluşturulmuş ama henüz check-in, antrenman, nutrition veya wearable verisi yoktur.

### Görsel

Doctor Panda sporcunun boş gelişim kartını gösterir.

### Başlık

"""text
Bu sporcunun gelişim geçmişi henüz oluşmadı.
"""

### Açıklama

"""text
Sporcu check-in girdiğinde, session’a katıldığında veya kişisel antrenman kaydettiğinde burada gelişim trendleri görünmeye başlayacak.
"""

### Birincil CTA

"""text
Sporcuyu Davet Et
"""

### İkincil CTA

"""text
Manuel Not Ekle
"""

### Üçüncül CTA

"""text
Session’a Ekle
"""

---

## 5.4 Sporcu Davet Edilmemiş

### Durum

Sporcu kaydı manuel oluşturulmuş ama kullanıcı hesabına bağlanmamıştır.

### Görsel

Doctor Panda kapalı bir zarf tutar.

### Başlık

"""text
Bu sporcu henüz hesabını bağlamadı.
"""

### Açıklama

"""text
Davet gönderdiğinde sporcu kendi dashboard’una erişebilir, günlük check-in girebilir ve wearable bağlantısı yapabilir.
"""

### Birincil CTA

"""text
Davet Gönder
"""

### İkincil CTA

"""text
Davet Linkini Kopyala
"""

### Bilgi Notu

"""text
Davet göndermeden de antrenör olarak bu sporcuyu manuel takip edebilirsin.
"""

---

## 6. Coach Dashboard Empty States

## 6.1 Readiness Verisi Yok

### Durum

Takımda sporcular var ama bugün hiç check-in girmemiştir.

### Görsel

Doctor Panda boş bir nabız/readiness kartına bakar.

### Başlık

"""text
Bugünkü readiness verisi henüz gelmedi.
"""

### Açıklama

"""text
Sporcular günlük check-in yaptığında takımın enerji, uyku, ağrı ve motivasyon durumu burada görünecek.
"""

### Birincil CTA

"""text
Check-in Hatırlatması Gönder
"""

### İkincil CTA

"""text
Check-in Formunu Önizle
"""

### Fallback

Eğer sporcuların hesabı bağlı değilse:

"""text
Önce sporcuları davet ederek kendi check-in’lerini girmelerini sağlayabilirsin.
"""

---

## 6.2 Risk Alert Yok

### Durum

Riskli sporcu tespit edilmemiştir.

### Görsel

Doctor Panda yeşil onay işaretli küçük bir sağlık panosu gösterir.

### Başlık

"""text
Şu anda belirgin bir risk sinyali yok.
"""

### Açıklama

"""text
Yeni check-in, RPE, wearable veya ağrı verisi geldikçe sistem risk durumunu izlemeye devam eder.
"""

### Birincil CTA

"""text
Readiness Detayına Git
"""

### İkincil CTA

"""text
Load Grafiğini Gör
"""

---

## 6.3 Upcoming Session Yok

### Durum

Takımın yaklaşan session’ı yok.

### Görsel

Doctor Panda boş takvim sayfası tutar.

### Başlık

"""text
Yaklaşan session planlanmadı.
"""

### Açıklama

"""text
Yeni bir antrenman, maç veya recovery session oluşturarak takım takibini başlatabilirsin.
"""

### Birincil CTA

"""text
Session Oluştur
"""

### İkincil CTA

"""text
AI ile Antrenman Planla
"""

---

## 6.4 Nutrition Compliance Verisi Yok

### Durum

Sporcular henüz beslenme veya su kaydı girmemiştir.

### Görsel

Doctor Panda boş su şişesi ve öğün kartları tutar.

### Başlık

"""text
Beslenme uyum verisi henüz oluşmadı.
"""

### Açıklama

"""text
Sporcular su ve öğün kayıtlarını girdikçe antrenman günleriyle ilişkili alışkanlıklar burada görünür.
"""

### Birincil CTA

"""text
Sporculara Hatırlatma Gönder
"""

### İkincil CTA

"""text
Nutrition Takibini Aç
"""

---

## 7. Athlete Dashboard Empty States

## 7.1 Athlete Dashboard İlk Giriş

### Durum

Sporcu davetle sisteme girmiştir ama henüz check-in yapmamıştır.

### Görsel

Doctor Panda küçük bir sporcu kartı ve check-in formu tutar.

### Başlık

"""text
Takımına hoş geldin.
"""

### Açıklama

"""text
Günlük durumunu paylaşarak koçunun antrenman yükünü daha doğru planlamasına yardımcı olabilirsin.
"""

### Birincil CTA

"""text
İlk Check-in’imi Yap
"""

### İkincil CTA

"""text
Cihazımı Bağla
"""

### Üçüncül CTA

"""text
Daha Sonra
"""

---

## 7.2 Bugünkü Görev Yok

### Durum

Sporcu için bugün session, kişisel görev veya check-in görevi yoktur.

### Görsel

Doctor Panda dinlenen bir spor ayakkabının yanında oturur.

### Başlık

"""text
Bugün için atanmış görev yok.
"""

### Açıklama

"""text
Koçun yeni bir session veya kişisel görev eklediğinde burada görünecek. Yine de kişisel antrenman veya beslenme kaydı ekleyebilirsin.
"""

### Birincil CTA

"""text
Kişisel Antrenman Ekle
"""

### İkincil CTA

"""text
Beslenme Kaydı Gir
"""

---

## 7.3 Check-in Tamamlandı

### Durum

Sporcu bugünkü check-in’i yapmıştır.

### Görsel

Doctor Panda onay işareti verir.

### Başlık

"""text
Bugünkü durumun kaydedildi.
"""

### Açıklama

"""text
Bu bilgi takım dashboard’una yansıyacak ve antrenman planlamasında kullanılabilecek.
"""

### Birincil CTA

"""text
Bugünkü Antrenmanı Gör
"""

### İkincil CTA

"""text
Beslenme Kaydı Gir
"""

---

## 7.4 Kişisel Antrenman Yok

### Durum

Sporcu henüz kişisel antrenman kaydetmemiştir.

### Görsel

Doctor Panda boş bir antrenman günlüğü gösterir.

### Başlık

"""text
Henüz kişisel antrenman kaydı yok.
"""

### Açıklama

"""text
Takım dışı çalışmalarını eklediğinde koçun toplam yükünü daha doğru görebilir.
"""

### Birincil CTA

"""text
Kişisel Antrenman Ekle
"""

### İkincil CTA

"""text
Cihazımı Bağla
"""

---

## 7.5 Beslenme Kaydı Yok

### Durum

Sporcu bugün nutrition log girmemiştir.

### Görsel

Doctor Panda boş öğün kartları tutar.

### Başlık

"""text
Bugünkü beslenme kaydın boş.
"""

### Açıklama

"""text
Su ve öğün takibini girerek antrenman günlerindeki toparlanma alışkanlıklarını görünür hale getirebilirsin.
"""

### Birincil CTA

"""text
Beslenme Kaydı Gir
"""

### İkincil CTA

"""text
Sadece Su Ekle
"""

---

## 8. Session Empty States

## 8.1 Session Listesi Boş

### Durum

Takımda henüz session oluşturulmamış.

### Görsel

Doctor Panda boş takvim ve düdük tutar.

### Başlık

"""text
Henüz session oluşturulmadı.
"""

### Açıklama

"""text
Antrenman, maç, recovery veya test günü oluşturarak takım verisini toplamaya başlayabilirsin.
"""

### Birincil CTA

"""text
İlk Session’ı Oluştur
"""

### İkincil CTA

"""text
AI ile Plan Oluştur
"""

---

## 8.2 Session Katılımcısı Yok

### Durum

Session oluşturulmuş ama sporcu seçilmemiştir.

### Görsel

Doctor Panda boş katılım listesi tutar.

### Başlık

"""text
Bu session’a henüz sporcu eklenmedi.
"""

### Açıklama

"""text
Katılacak sporcuları seçtiğinde katılım, RPE ve yük takibi bu session üzerinden yapılır.
"""

### Birincil CTA

"""text
Sporcu Ekle
"""

### İkincil CTA

"""text
Tüm Takımı Ekle
"""

---

## 8.3 Session Tamamlandı Ama RPE Yok

### Durum

Session completed olmuş ama sporcular RPE girmemiştir.

### Görsel

Doctor Panda boş RPE ölçeğine bakar.

### Başlık

"""text
Antrenman tamamlandı, RPE verileri bekleniyor.
"""

### Açıklama

"""text
Sporcular antrenman zorluğunu girdikçe load ve recovery değerlendirmeleri daha doğru hesaplanır.
"""

### Birincil CTA

"""text
RPE Hatırlatması Gönder
"""

### İkincil CTA

"""text
Manuel RPE Gir
"""

---

## 8.4 Training Blocks Yok

### Durum

Session var ama antrenman blokları tanımlanmamış.

### Görsel

Doctor Panda boş plan kartları tutar.

### Başlık

"""text
Bu session için antrenman blokları eklenmedi.
"""

### Açıklama

"""text
Isınma, ana çalışma ve soğuma bloklarını ekleyerek session planını daha takip edilebilir hale getirebilirsin.
"""

### Birincil CTA

"""text
Blok Ekle
"""

### İkincil CTA

"""text
AI ile Plan Oluştur
"""

---

## 9. Data, Notes & File Empty States

## 9.1 Session'da Ek Veri Yok

### Durum

Session'a henüz koç notu, rapor, CSV veya destekleyici doküman eklenmemiştir.

### Görsel

Doctor Panda boş not panosu ve küçük veri kartları gösterir.

### Başlık

"""text
Bu session için ek veri yok.
"""

### Açıklama

"""text
Koç notu, geçmiş rapor veya CSV veri eklediğinde OhHike bunları session analizi için bağlama dönüştürebilir.
"""

### Birincil CTA

"""text
Koç Notu Ekle
"""

### İkincil CTA

"""text
Rapor İçe Aktar
"""

### Alternatif CTA

"""text
Mevcut Verilerle Analiz Yap
"""

---

## 9.2 Dosya İşleniyor

### Durum

Koç notu, CSV, PDF veya geçmiş rapor yüklenmiş ve bağlam hazırlama işlemi devam etmektedir.

### Görsel

Doctor Panda veri kartlarını düzenler.

### Başlık

"""text
Ek veri işleniyor.
"""

### Açıklama

"""text
OhHike eklediğin veriyi analiz bağlamına dönüştürüyor. Büyük dosyalarda bu işlem biraz sürebilir.
"""

### CTA

"""text
Durumu Yenile
"""

---

## 9.3 Dosya İşlenemedi

### Durum

Dosya parse etme veya rapor özetleme başarısız olmuştur.

### Görsel

Doctor Panda uyarı işaretli bir doküman gösterir.

### Başlık

"""text
Ek veri işlenemedi.
"""

### Açıklama

"""text
Dosya formatı, boyut veya içerik nedeniyle işlem tamamlanamadı. Farklı bir CSV/PDF deneyebilir veya koç notlarıyla analiz oluşturabilirsin.
"""

### Birincil CTA

"""text
Tekrar Dene
"""

### İkincil CTA

"""text
Farklı Dosya Yükle
"""

---

## 9.4 AI Analiz İçin Yeterli Veri Yok

### Durum

AI analysis başlatılmak istenmiş ama session context çok zayıftır.

Eksik olabilir:

- Koç notu
- Sporcu listesi
- Session amacı
- Koç notu veya geçmiş rapor
- Katılım verisi

### Görsel

Doctor Panda boş analiz panosunu inceler.

### Başlık

"""text
Analiz için biraz daha bağlama ihtiyacım var.
"""

### Açıklama

"""text
Daha doğru rapor üretebilmem için session amacı, koç notu veya medya ekleyebilirsin.
"""

### Birincil CTA

"""text
Koç Notu Ekle
"""

### İkincil CTA

"""text
Koç Notu Ekle
"""

### Üçüncül CTA

"""text
Yine de Temel Analiz Yap
"""

---

## 10. AI Reports Empty States

## 10.1 AI Rapor Yok

### Durum

Henüz hiç AI raporu oluşturulmamış.

### Görsel

Doctor Panda boş rapor kartını doldurmaya hazırlanır.

### Başlık

"""text
Henüz AI rapor oluşturulmadı.
"""

### Açıklama

"""text
Bir session tamamlandığında veya koç notu/geçmiş rapor eklendiğinde AI rapor oluşturabilirsin. Raporlar takım hafızasına da eklenir.
"""

### Birincil CTA

"""text
Session Seç ve Analiz Oluştur
"""

### İkincil CTA

"""text
Demo Raporu Gör
"""

---

## 10.2 AI Rapor Oluşturuluyor

### Durum

AI rapor generation devam ediyor.

### Görsel

Doctor Panda taktik tahtasına not alır.

### Başlık

"""text
Doctor Panda raporu hazırlıyor.
"""

### Açıklama

"""text
Session verileri, koç notları, sporcu durumu, akıllı saat özetleri ve geçmiş raporlar birlikte analiz ediliyor.
"""

### Davranış

- Skeleton UI
- Progress status
- “Sayfadan ayrılsan da işlem devam eder” notu
- Tamamlanınca rapor kartları görünür

---

## 10.3 AI Rapor Hatası

### Durum

AI provider timeout, schema validation fail veya quota hatası.

### Görsel

Doctor Panda derin düşünürken kalemi düşürmüş görünür.

### Başlık

"""text
Rapor şu anda tamamlanamadı.
"""

### Açıklama

"""text
Verilerin kaybolmadı. Birkaç dakika sonra tekrar deneyebilir veya sadece koç notlarını kaydedebilirsin.
"""

### Birincil CTA

"""text
Tekrar Dene
"""

### İkincil CTA

"""text
Koç Notunu Kaydet
"""

### Self-host CTA

"""text
API Key Ayarlarını Kontrol Et
"""

---

## 10.4 AI Rapor Premium Kilitli

### Durum

Free plan kullanıcısı gelişmiş AI rapor açmaya çalışır.

### Görsel

Doctor Panda premium kilitli rapor kartı tutar.

### Başlık

"""text
Gelişmiş AI analizi Coach Pro'da açılır.
"""

### Açıklama

"""text
Coach Pro ile gelişmiş AI analizi, Team Memory, training planner ve PDF export özelliklerini kullanabilirsin.
"""

### Birincil CTA

"""text
Planı Yükselt
"""

### İkincil CTA

"""text
Paketleri Karşılaştır
"""

### Self-host CTA

"""text
Self-host Seçeneklerini Gör
"""

---

## 11. Team Memory Empty States

## 11.1 Team Memory Boş

### Durum

Henüz documents veya embeddings oluşmamıştır.

### Görsel

Doctor Panda boş bir hafıza kutusu veya arşiv dolabı gösterir.

### Başlık

"""text
Takım hafızası henüz oluşmadı.
"""

### Açıklama

"""text
AI raporlar, koç notları, sporcu gözlemleri ve session özetleri eklendikçe OhHike takımını daha iyi tanımaya başlar.
"""

### Birincil CTA

"""text
İlk AI Raporunu Oluştur
"""

### İkincil CTA

"""text
Koç Notu Ekle
"""

### Üçüncül CTA

"""text
Demo Hafızayı Gör
"""

---

## 11.2 Assistant Soruyu Cevaplayamadı

### Durum

RAG retrieval sonucunda yeterli context bulunamamıştır.

### Görsel

Doctor Panda boş bir arşiv klasörü açar.

### Başlık

"""text
Bu soruya cevap verecek yeterli geçmiş veri bulamadım.
"""

### Açıklama

"""text
Daha fazla session raporu, koç notu veya sporcu gözlemi eklendikçe bu tür sorulara daha güçlü cevaplar verebilirim.
"""

### Birincil CTA

"""text
Koç Notu Ekle
"""

### İkincil CTA

"""text
Başka Soru Sor
"""

### Önerilen Sorular

- Bugünkü takım durumu ne?
- Son session raporunu özetle
- Hangi sporcular check-in girmedi?

---

## 11.3 Memory Documents Yok

### Durum

`/memory/documents` sayfasında hafıza dokümanı yok.

### Görsel

Doctor Panda boş doküman rafı gösterir.

### Başlık

"""text
Henüz hafıza dokümanı yok.
"""

### Açıklama

"""text
AI raporlar, koç notları ve sporcu gözlemleri otomatik olarak buraya eklenir.
"""

### Birincil CTA

"""text
Session Analizi Oluştur
"""

### İkincil CTA

"""text
Manuel Not Ekle
"""

---

## 12. Wearable Empty States

## 12.1 Wearable Bağlantısı Yok

### Durum

Takımdaki hiçbir sporcu wearable bağlamamıştır.

### Görsel

Doctor Panda boş saat ekranı gösterir.

### Başlık

"""text
Henüz akıllı saat bağlantısı yok.
"""

### Açıklama

"""text
Akıllı saat bağlantısı opsiyoneldir. Bağlayan sporcularda aktivite, uyku ve yük verileri otomatik zenginleşir. Bağlamayan sporcular manuel check-in ile tam takip edilebilir.
"""

### Birincil CTA

"""text
Sporculara Cihaz Bağlantısı Gönder
"""

### İkincil CTA

"""text
CSV ile Veri İçe Aktar
"""

### Üçüncül CTA

"""text
Manuel Takiple Devam Et
"""

---

## 12.2 Sporcu Wearable Bağlamamış

### Durum

Athlete dashboard’da wearable bağlı değildir.

### Görsel

Doctor Panda bileğinde saat gösterir.

### Başlık

"""text
Cihaz bağlantısı opsiyonel.
"""

### Açıklama

"""text
Akıllı saatini bağlarsan aktivite ve uyku verilerin otomatik gelebilir. Bağlamak istemezsen check-in ve manuel antrenman kaydıyla devam edebilirsin.
"""

### Birincil CTA

"""text
Cihazımı Bağla
"""

### İkincil CTA

"""text
Manuel Devam Et
"""

---

## 12.3 Wearable Sync Hatası

### Durum

Token expired, API error veya provider erişim sorunu.

### Görsel

Doctor Panda bağlantısı kopmuş saat gösterir.

### Başlık

"""text
Cihaz verileri senkronize edilemedi.
"""

### Açıklama

"""text
Bağlantı izni süresi dolmuş veya sağlayıcıya ulaşılamıyor olabilir. Manuel check-in kullanmaya devam edebilirsin.
"""

### Birincil CTA

"""text
Yeniden Bağla
"""

### İkincil CTA

"""text
Tekrar Senkronize Et
"""

### Alternatif CTA

"""text
Manuel Veri Gir
"""

---

## 12.4 Provider Henüz Desteklenmiyor

### Durum

Kullanıcı Apple Health / Health Connect gibi native bridge gerektiren provider’ı seçer.

### Görsel

Doctor Panda “coming soon” kartı gösterir.

### Başlık

"""text
Bu bağlantı için mobil köprü gerekiyor.
"""

### Açıklama

"""text
Apple Health ve Health Connect verilerine güvenli erişim için native mobil uygulama veya bridge gerekir. Şimdilik CSV import veya manuel giriş kullanabilirsin.
"""

### Birincil CTA

"""text
CSV İçe Aktar
"""

### İkincil CTA

"""text
Manuel Giriş Yap
"""

---

## 13. Training Planner Empty States

## 13.1 Training Plan Yok

### Durum

Henüz antrenman planı oluşturulmamış.

### Görsel

Doctor Panda boş bir antrenman planı panosu tutar.

### Başlık

"""text
Henüz antrenman planı yok.
"""

### Açıklama

"""text
Manuel plan oluşturabilir veya takımın readiness ve son pattern’lerine göre AI’dan plan önermesini isteyebilirsin.
"""

### Birincil CTA

"""text
AI ile Plan Oluştur
"""

### İkincil CTA

"""text
Manuel Plan Ekle
"""

---

## 13.2 Drill Library Boş

### Durum

Organizasyonun özel drill kütüphanesi boş.

### Görsel

Doctor Panda boş drill kartları tutar.

### Başlık

"""text
Kendi drill kütüphanen henüz boş.
"""

### Açıklama

"""text
Kullandığın antrenman egzersizlerini ekleyerek AI planlayıcının daha isabetli öneriler üretmesini sağlayabilirsin.
"""

### Birincil CTA

"""text
İlk Drill’i Ekle
"""

### İkincil CTA

"""text
Sistem Drill’lerini Gör
"""

---

## 13.3 AI Plan İçin Veri Yetersiz

### Durum

AI training planner çalıştırılmak istenmiş ama context eksiktir.

Eksik olabilir:

- Takım hedefi
- Session süresi
- Oyuncu readiness
- Focus area
- Drill library

### Görsel

Doctor Panda boş taktik tahtasına soru işareti çizer.

### Başlık

"""text
Plan oluşturmak için birkaç bilgiye ihtiyacım var.
"""

### Açıklama

"""text
Antrenman süresi, takım hedefi ve focus area girildiğinde daha uygulanabilir bir plan oluşturabilirim.
"""

### Birincil CTA

"""text
Eksik Bilgileri Tamamla
"""

### İkincil CTA

"""text
Temel Plan Oluştur
"""

---

## 14. Nutrition Empty States

## 14.1 Takım Nutrition Verisi Yok

### Durum

Hiç sporcu nutrition log girmemiştir.

### Görsel

Doctor Panda boş öğün tablosu gösterir.

### Başlık

"""text
Takım beslenme verisi henüz oluşmadı.
"""

### Açıklama

"""text
Sporcular su ve öğün kayıtlarını girdikçe antrenman günleriyle ilişkili alışkanlıklar burada görünür.
"""

### Birincil CTA

"""text
Sporculara Hatırlatma Gönder
"""

### İkincil CTA

"""text
Nutrition Formunu Önizle
"""

---

## 14.2 Nutritionist Notu Yok

### Durum

Sporcu detayında nutritionist notu yok.

### Görsel

Doctor Panda boş not kartı gösterir.

### Başlık

"""text
Henüz beslenme uzmanı notu yok.
"""

### Açıklama

"""text
Nutritionist veya yetkili staff, sporcunun alışkanlık takibi için kısa notlar bırakabilir.
"""

### Birincil CTA

"""text
Not Ekle
"""

---

## 15. Reports Empty States

## 15.1 Export Edilmiş Rapor Yok

### Durum

`/reports` sayfasında rapor yok.

### Görsel

Doctor Panda boş PDF klasörü tutar.

### Başlık

"""text
Henüz dışa aktarılmış rapor yok.
"""

### Açıklama

"""text
AI analizlerden, session’lardan veya sporcu gelişim ekranlarından PDF raporlar oluşturabilirsin.
"""

### Birincil CTA

"""text
Rapor Oluştur
"""

### İkincil CTA

"""text
AI Raporlarına Git
"""

---

## 15.2 PDF Export Premium Kilitli

### Durum

Free kullanıcı PDF export yapmak ister.

### Görsel

Doctor Panda kilitli PDF kartı gösterir.

### Başlık

"""text
PDF export Coach Pro’da açılır.
"""

### Açıklama

"""text
Coach Pro ile session raporlarını ve oyuncu gelişim özetlerini PDF olarak dışa aktarabilirsin.
"""

### Birincil CTA

"""text
Planı Yükselt
"""

### İkincil CTA

"""text
Paketleri Karşılaştır
"""

---

## 16. Billing & Plan Empty States

## 16.1 Free Plan Limitine Ulaşıldı

### Durum

Kullanıcı takım, sporcu, session veya AI analiz limitine ulaşır.

### Görsel

Doctor Panda plan limit kartı gösterir.

### Başlık

"""text
Plan limitine ulaştın.
"""

### Açıklama

Dinamik olmalıdır.

Örnekler:

"""text
Free plan 10 sporcuya kadar destekler. Daha fazla sporcu eklemek için Coach Pro’ya geçebilirsin.
"""

"""text
Bu ayki AI analiz limitin doldu. Yeni raporlar için planını yükseltebilirsin.
"""

### Birincil CTA

"""text
Planı Yükselt
"""

### İkincil CTA

"""text
Kullanımı Gör
"""

### Self-host CTA

"""text
Self-host Seçeneklerini İncele
"""

---

## 16.2 Billing Bilgisi Yok

### Durum

Webhook gecikmiş veya billing entitlement oluşturulmamış.

### Görsel

Doctor Panda fatura kartını kontrol eder.

### Başlık

"""text
Plan bilgisi hazırlanıyor.
"""

### Açıklama

"""text
Abonelik durumun birkaç saniye içinde güncellenir. Devam etmezse billing sayfasını yenileyebilirsin.
"""

### Birincil CTA

"""text
Yenile
"""

### İkincil CTA

"""text
Billing Ayarlarına Git
"""

---

## 17. Self-host Empty States

## 17.1 API Key Eksik

### Durum

Self-host sistemde AI provider key yoktur.

### Görsel

Doctor Panda boş anahtar kartı tutar.

### Başlık

"""text
AI provider key eksik.
"""

### Açıklama

"""text
Self-host kurulumda AI raporları çalıştırmak için kendi OpenAI, Gemini veya OpenRouter API anahtarını eklemelisin.
"""

### Birincil CTA

"""text
API Key Ekle
"""

### İkincil CTA

"""text
Kurulum Rehberini Aç
"""

---

## 17.2 Storage Ayarı Eksik

### Durum

Self-host ortamda rapor, CSV veya doküman yüklemek için storage yapılandırılmamış.

### Görsel

Doctor Panda boş dosya kutusu gösterir.

### Başlık

"""text
Storage yapılandırması eksik.
"""

### Açıklama

"""text
Rapor, CSV, import ve PDF dosyalarının saklanabilmesi için local storage, S3 veya MinIO ayarı yapılmalıdır.
"""

### Birincil CTA

"""text
Storage Ayarlarına Git
"""

### İkincil CTA

"""text
Dokümantasyonu Aç
"""

---

## 17.3 Migration Eksik

### Durum

Database migration tamamlanmamış.

### Görsel

Doctor Panda veritabanı bloklarını dizer.

### Başlık

"""text
Veritabanı kurulumu tamamlanmadı.
"""

### Açıklama

"""text
OhHike tabloları ve RLS politikaları oluşturulmadan uygulama tam çalışmaz.
"""

### Birincil CTA

"""text
Migration Çalıştır
"""

### İkincil CTA

"""text
SQL Kurulum Rehberini Aç
"""

---

## 18. Error States

## 18.1 Genel Hata

### Görsel

Doctor Panda küçük bir uyarı panosu tutar.

### Başlık

"""text
Beklenmeyen bir şey oldu.
"""

### Açıklama

"""text
Verilerin kaybolmadı. Sayfayı yenileyebilir veya işlemi tekrar deneyebilirsin.
"""

### Birincil CTA

"""text
Tekrar Dene
"""

### İkincil CTA

"""text
Dashboard’a Dön
"""

---

## 18.2 Yetki Hatası

### Durum

Kullanıcı yetkisi olmayan sayfaya erişmeye çalışır.

### Görsel

Doctor Panda kapalı kapının yanında durur.

### Başlık

"""text
Bu alana erişim yetkin yok.
"""

### Açıklama

"""text
Bu sayfa için farklı bir rol veya takım erişimi gerekebilir. Gerekli olduğunu düşünüyorsan organizasyon yöneticinle iletişime geç.
"""

### Birincil CTA

"""text
Dashboard’a Dön
"""

---

## 18.3 Sayfa Bulunamadı

### Görsel

Doctor Panda boş bir taktik tahtasına bakar.

### Başlık

"""text
Bu sayfayı bulamadım.
"""

### Açıklama

"""text
Aradığın sayfa taşınmış veya artık mevcut olmayabilir.
"""

### Birincil CTA

"""text
Dashboard’a Dön
"""

---

## 18.4 Network Hatası

### Görsel

Doctor Panda kopmuş bağlantı kablosu gösterir.

### Başlık

"""text
Bağlantı kurulamadı.
"""

### Açıklama

"""text
İnternet bağlantını veya sunucu durumunu kontrol edip tekrar deneyebilirsin.
"""

### Birincil CTA

"""text
Tekrar Dene
"""

---

## 18.5 Database / RLS Hatası

### Görsel

Doctor Panda kilitli veritabanı simgesi gösterir.

### Başlık

"""text
Veriye erişilemedi.
"""

### Açıklama

"""text
Bu işlem için yetkin olmayabilir veya sistem yapılandırması eksik olabilir.
"""

### Birincil CTA

"""text
Tekrar Dene
"""

### Self-host CTA

"""text
RLS Ayarlarını Kontrol Et
"""

---

## 19. Loading States

## 19.1 Dashboard Loading

Skeleton kartları:

- Team Readiness Score
- Risk Alerts
- Upcoming Sessions
- Recent AI Reports
- Nutrition Compliance
- Wearable Status

Doctor Panda küçük mesajı:

"""text
Takım verilerini topluyorum...
"""

---

## 19.2 AI Loading

Doctor Panda mesajı:

"""text
Session verilerini analiz ediyorum. Koç notları, sporcu durumu ve medya karelerini birlikte değerlendiriyorum.
"""

---

## 19.3 Wearable Sync Loading

Doctor Panda mesajı:

"""text
Cihaz verilerini senkronize ediyorum. Bu işlem sağlayıcıya göre biraz sürebilir.
"""

---

## 19.4 File Processing Loading

Doctor Panda mesajı:

"""text
Eklediğin veriyi analiz bağlamına hazırlıyorum.
"""

---

## 20. Success States

## 20.1 Takım Oluşturuldu

"""text
Takımın hazır! Şimdi sporcuları ekleyerek ilk takip döngüsünü başlatabilirsin.
"""

CTA:

- Sporcu Ekle
- İlk Session’ı Oluştur

---

## 20.2 Sporcu Eklendi

"""text
Sporcu eklendi. İstersen davet göndererek kendi dashboard’una erişmesini sağlayabilirsin.
"""

CTA:

- Davet Gönder
- Yeni Sporcu Ekle

---

## 20.3 Check-in Kaydedildi

"""text
Bugünkü durum kaydedildi. Bu veri takım readiness hesabına dahil edilecek.
"""

CTA:

- Dashboard’a Dön
- Beslenme Kaydı Gir

---

## 20.4 AI Rapor Hazır

"""text
AI rapor hazır. Bulguları inceleyebilir, gerekirse düzeltme ekleyebilir ve raporu takım hafızasına dahil edebilirsin.
"""

CTA:

- Raporu Gör
- Team Memory’ye Sor

---

## 20.5 Wearable Bağlandı

"""text
Cihaz bağlantısı tamamlandı. Yeni aktiviteler ve günlük özetler senkronize edildikçe dashboard’da görünmeye başlayacak.
"""

CTA:

- İlk Senkronizasyonu Başlat
- Dashboard’a Dön

---

## 21. Doctor Panda Görsel Kullanımı

Doctor Panda empty state görselleri bağlama göre değişmelidir.

| Durum | Doctor Panda Görseli |
|---|---|
| Organizasyon yok | Boş kulüp rozeti |
| Takım yok | Taktik tahtası |
| Sporcu yok | Boş forma kartları |
| Session yok | Boş takvim ve düdük |
| Readiness yok | Boş nabız kartı |
| Wearable yok | Akıllı saat |
| Ek veri yok | Not panosu |
| AI rapor yok | Boş rapor kartı |
| Team Memory boş | Hafıza kutusu |
| Premium kilitli | Kilitli rapor kartı |
| Hata | Uyarı panosu |
| Başarı | Onay işareti |

---

## 22. Eski Empty State’lerden Çıkarılanlar

v3.0 ile aşağıdaki eski empty state’ler çekirdekten çıkarılmıştır:

"""text
Yakında topluluk rotası yok
Benim rotalarım boş
Scavenger hunt yok
Harita yüklenemedi
Rozet kazanılmadı
Görev tamamlanmadı
Rota çizilmedi
Konum izni yok
Mapbox API hatası
"""

Bu empty state’ler eski OhHike keşif uygulamasına aitti. CoachOS çekirdeğinde artık ana deneyim takım, sporcu, session, AI rapor ve Team Memory üzerine kuruludur.

---

## 23. Nihai Empty State Özeti

OhHike CoachOS empty state sistemi şu soruya cevap vermelidir:

"""text
Kullanıcı şu an ne yapmak istedi?
Neden veri yok?
Bu boşluk normal mi, hata mı, premium kısıtı mı?
Kullanıcının atması gereken en net sonraki adım ne?
"""

Her boş durum kullanıcıyı şu döngüye geri taşımalıdır:

"""text
Takım oluştur
→ Sporcu ekle
→ Sporcuları davet et
→ Check-in topla
→ Session oluştur
→ Koç notu / rapor ekle
→ AI rapor üret
→ Team Memory oluştur
→ Bir sonraki aksiyonu planla
"""

Bu yapı, OhHike CoachOS’u boş ekranlara düşmeyen, kullanıcıyı sürekli doğru adıma yönlendiren profesyonel bir SaaS deneyimine dönüştürür.