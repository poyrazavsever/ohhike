# OhHike - Marka Kimliği ve Proje İskeleti (v1.0)

## 1. Temel Marka Bilgileri
* **Uygulama Adı:** OhHike
* **Hikaye / Çıkış Noktası:** Spor takımlarının dağınık antrenman verilerini, sporcu check-inlerini ve akıllı saat özetlerini tek takım hafızasında toplama fikri.
* **Slogan:** "Every session becomes team intelligence."
* **Maskot:** Doktor Panda. Antrenörü ve sporcuyu yargılamayan; check-in, yük, recovery ve geçmiş rapor verilerini sade şekilde yorumlayan profesyonel AI koç asistanı.

## 2. Domain ve Altyapı
* **Tanıtım ve Satış (Landing Page):** ohhike.com (Stripe entegreli, SaaS abonelik akışının olduğu vitrin)
* **Ana Uygulama (Web App):** app.ohhike.com (Kullanıcının login olup dashboard'una ulaştığı ana platform)
* **Mimari:** Monorepo (Next.js)
* **İş Modeli:** Managed SaaS (Aylık abonelik) + Self-Hosted (Kullanıcı kendi sunucusunda kurduğunda `.env` ile uğraşmaz, kayıt sonrası uygulama içi Ayarlar modalından kendi AI/akıllı saat/storage API keylerinigirer).

## 3. GitHub Yapılandırması
* **Repo Adı:** ohhike
* **Repo Açıklaması (Description):** An open-source, AI-powered coaching intelligence platform for sports teams. OhHike CoachOS analyzes training notes, athlete check-ins, smartwatch data, and historical reports to turn every session into team memory.
* **Etiketler (Tags):** `nextjs`, `open-source`, `self-hosted`, `health-tech`, `strava-api`, `monorepo`, `saas`, `sports-tech`, `coach-dashboard`

## 4. Tasarım Sistemi (Design System) Önizlemesi
* **Temel Felsefe:** Samimi, modern, yuvarlatılmış (rounded) hatlar ve göz yormayan bir arayüz.
* **Ana Renk (Primary):** Soft Turkuaz (Sağlık, temizlik, ferahlık ve hareket hissini yansıtacak).
* **Destekleyici Renkler (Secondary/Accent):** Doktor Panda'nın bildirimlerinde veya başarı kutlamalarında kullanılacak soft pastel tonlar (İsteğine bağlı olarak küçük vaporwave/soft pembe dokunuşlar başarı animasyonlarında kullanılabilir).
* **Tipografi:** Okunabilirliği yüksek, köşeleri yumuşak sans-serif fontlar (Örn: Nunito, Quicksand veya Rounded Mplus).
* **Oyunlaştırma Dili:** Liderlik tablosu veya başkalarıyla yarış yok. Takım readiness trendleri, kişisel gelişim grafikleri, check-in sürekliliği ve uygulanabilir koç aksiyonları var.