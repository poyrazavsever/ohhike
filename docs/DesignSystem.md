# OhHike - Design System (v4.0 — MVP)
## "Friendly, Fresh, and Focused"

Bu tasarım sistemi, OhHike'ın samimi, kullanıcıyı motive eden ve karmaşadan uzak yapısını yansıtmak üzere Next.js & Tailwind CSS altyapısına kolayca entegre edilebilecek şekilde (Design Tokens) kurgulanmıştır.

### 1. Renk Paleti (Color Tokens)

Ana rengimiz olan soft turkuazı merkeze alarak, göz yormayan, okunaklı ve modern bir palet oluşturuyoruz.

*   **Primary (Ana Renk - Aksiyonlar ve Vurgular)**
    *   `primary-500`: `#16E68C` (Ana Turkuaz - Butonlar, aktif durumlar, progress barlar)
    *   `primary-600`: `#11C87A` (Hover durumları)
    *   `primary-100`: `#E8FCF3` (Çok hafif turkuaz arka planlar, seçili menü item'ları)

*   **Secondary / Accent (Oyunlaştırma ve Zıtlık)**
    *   `accent-500`: `#FFB067` (Soft Turuncu/Mercan - readiness uyarıları, başarı durumları, Doktor Panda'nın uyarıları. Turkuaz ile çok tatlı bir uyum yakalar.)
    *   `accent-100`: `#FFF7F0` (Hafif turuncu vurgular)

*   **Neutral / Background (Zemin ve Kartlar)**
    *   `bg-app`: `#F8FAFC` (Çok açık buz grisi - Uygulamanın ana arka planı. Saf beyaz göz yorar, bu renk derinlik sağlar.)
    *   `bg-card`: `#FFFFFF` (Saf beyaz - İçerik kartları, modallar)

*   **Typography (Metin Renkleri)**
    *   `text-main`: `#1E293B` (Koyu arduvaz grisi - Başlıklar ve ana metinler için. Siyah (#000000) kullanılmamalıdır, fazla serttir.)
    *   `text-muted`: `#64748B` (Orta gri - Alt başlıklar, pasif metinler, placeholder'lar)

### 2. Tipografi (Typography)

Dost canlısı ve "rounded" yapıya en uygun font ailelerinden biri seçilmelidir. 

*   **Ana Font:** `Nunito` veya `Quicksand` (İkisi de köşeleri yuvarlatılmış, çok samimi ve okunaklı sans-serif fontlardır.)
*   **Hiyerarşi:**
    *   **H1 (Geniş Başlıklar - Örn: "Hoş geldin!"):** 32px, ExtraBold, `text-main`
    *   **H2 (Kart Başlıkları - Örn: "Takım Durumu"):** 24px, Bold, `text-main`
    *   **Body (Genel Metinler):** 16px, Medium, `text-muted`
    *   **Caption (Küçük Uyarılar/Tarihler):** 12px, SemiBold, `text-muted`

### 3. Şekil ve Arayüz Geometrisi (Border Radius & Spacing)

Uygulamanın keskin hiçbir köşesi olmayacak. "Sıvı" ve yumuşak bir arayüz deneyimi tasarlıyoruz.

*   **Border Radius (Köşe Yuvarlama):**
    *   `rounded-xl` (16px): Input alanları, küçük bilgi etiketleri.
    *   `rounded-2xl` (24px): Ana içerik kartları (Session kartları, istatistik kartları).
    *   `rounded-full` (9999px): Ana "Başla" veya "Session Oluştur" (Pill-shape) butonları, profil fotoğrafları.

*   **Spacing (Boşluklar):**
    *   Geniş ve ferah boşluklar kullanılacak. Elementler birbirine girmeyecek. Margin ve Padding değerlerinde 8'in katları (8px, 16px, 24px, 32px) standart olarak benimsenecek.

### 4. Gölgeler (Elevation & Shadows)

İçerikleri arka plandan ayırmak için sert siyah gölgeler yerine, geniş yayılımlı ve rengi kırılmış gölgeler kullanılacak.

*   **Card Shadow:** `0 10px 25px -5px rgba(22, 230, 140, 0.1)` (Ana turkuaz renginin çok hafif transparan bir versiyonu ile karta "glow" efekti vererek havada süzülüyormuş hissi yaratılır.)
*   **Button Shadow:** Ana butonlar tıklanabilir olduğunu belli etmek için alt kısmında hafif bir gölge barındırır. Tıklandığında (Active state) gölge kaybolur ve buton aşağı iner (Fiziksel basma hissi).

### 5. UI Komponentleri (UI Components)

*   **Butonlar:** 
    *   *Primary:* Arka plan `#16E68C`, metin `#FFFFFF` (veya daha yüksek kontrast için `#0F5132`), `rounded-full`, ExtraBold font.
    *   *Secondary:* Arka plan `primary-100`, metin `primary-500`, hover anında arka plan biraz daha koyulaşır.
*   **Badge / Pill Etiketler:**
    *   Hero, kategori ve durum etiketleri `rounded-full` olmalıdır.
    *   Badge komponentlerinde shadow kullanılmayacak. Ayrım için ince border, soft arka plan ve font ağırlığı kullanılacak.
    *   Primary badge: `primary-100` arka plan, `primary-700` metin, `primary-500 / 35%` border.
*   **Bottom Navigation (Mobil Web Görünümü):**
    *   Uygulama web tabanlı olsa da, mobil ekranda açıldığında native app hissiyatı vermek için ekranın altında ikonlu bir navigasyon barı yer alacak. Aktif sayfanın ikonu `#16E68C` ile belirginleşecek ve ikonun üstünde küçük bir nokta belirecek.
*   **Progress Barlar (İlerleme Çubukları):**
    *   Kalın, uçları tamamen yuvarlatılmış, arka planı açık gri, dolan kısmı turkuaz olan çubuklar. Örneğin; "Haftalık Check-in Oranı" veya "Readiness Tamamlanma Yüzdesi".

### 6. Maskot Entegrasyonu (Doktor Panda)

Doktor Panda arayüzün statik bir görseli değil, dinamik bir parçasıdır.
*   **Empty States (Boş Durumlar):** Kullanıcının henüz bir verisi yoksa (ilk giriş), Doktor Panda elinde taktik tahtasıyla ekranda belirir: *"İlk takımını kurduğunda analiz hafızan oluşmaya başlayacak."*"Henüz hiç rotaya çıkmadık, haritayı ben tutuyorum, hadi başlayalım!"*
*   **Başarı Anları (Success States):** Kullanıcı ilk session raporunu oluşturduğunda tüm ekranı kaplayan (Confetti efektiyle) bir modal açılır ve Doktor Panda baş parmağını havaya kaldırmış şekilde belirir.
*   **Onboarding:** Ayarlar kısmında API key'leri girilirken, input'un yanında Doktor Panda'nın küçük kafası görünür, kullanıcı key'i doğru girdiğinde Panda gülümser (mikro-etkileşimler).
