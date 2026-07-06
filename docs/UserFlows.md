# OhHike CoachOS - Kullanıcı Akışları (v4.0 — MVP)

**Güncelleme:** 2026-07-06

---

## 1. Coach Onboarding Akışı

```text
Kullanıcı ohhike.com'a gelir
→ CTA butonuna tıklar
→ app.ohhike.com/register'a yönlenir
→ Clerk sign-up (Google OAuth veya e-posta)
→ /onboarding sayfasına yönlenir
→ Organizasyon bilgilerini girer
→ İlk takımını oluşturur
→ Spor dalı, yaş grubu, sezon hedefi seçer
→ İlk sporcularını ekler
→ Dashboard'a yönlenir
```

---

## 2. Sporcu Davet / Claim Akışı

```text
Antrenör sporcu kaydı oluşturur (isim, mevki, numara)
→ Davet linki oluşturur
→ Sporcu davet linkini açar
→ Clerk ile kayıt olur veya giriş yapar
→ Token doğrulanır
→ Sporcu profili kullanıcıya bağlanır (claim)
→ Sporcu dashboard açılır
```

---

## 3. Günlük Check-in Akışı (Sporcu)

```text
Sporcu uygulamaya girer
→ Günlük check-in formunu görür
→ Uyku, enerji, ağrı, stres, motivasyon verisi girer
→ Readiness Score hesaplanır
→ Koç dashboard'daki takım özeti güncellenir
```

---

## 4. Session (Antrenman) Akışı (Koç)

```text
Koç "Yeni Seans" oluşturur
→ Tür, başlık, tarih, planlanan süre, yoğunluk seçer
→ Katılacak sporcuları seçer
→ Antrenman blokları ekler
→ Seans tamamlanır
→ Katılım işaretlenir
→ Sporcular RPE girer
→ Koç not yazar
```

---

## 5. Beslenme Takibi Akışı (Sporcu)

```text
Sporcu günlük öğün / su takibi girer
→ Su miktarı, öğün durumu kaydedilir
→ Antrenman günüyle ilişkilendirilir
→ Koç/nutritionist dashboard'da uyum oranını görür
```

---

## 6. Kişisel Antrenman Akışı (Sporcu)

```text
Sporcu kişisel antrenman ekler
→ Tür, süre, RPE, not girer
→ Haftalık yük hesabına eklenir
→ Koç takım dışı yükü görür
```

---

## 7. Kaldırılan Akışlar

| Eski Akış | Durum |
|-----------|-------|
| Wearable Sync Flow | Kaldırıldı |
| AI Session Analysis Flow | Kaldırıldı |
| Team Memory / RAG Flow | Kaldırıldı |
| Billing / Checkout Flow | Coming Soon |
| Coach Network Application Flow | Kaldırıldı |
| Self-host Setup Flow | Kaldırıldı |