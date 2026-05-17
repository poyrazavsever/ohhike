# RevenueCat Test Billing

Bu entegrasyon, Stripe baglanana kadar RevenueCat Test Store ile plan akislarini test etmek icin eklendi.

## Mimari karar

- RevenueCat, satin alma ve entitlement kaynagi olarak kullanilir.
- Uygulamanin feature gate kaynagi `team_billing_entitlements` tablosu olarak kalir.
- RevenueCat `app_user_id` degeri takim bazlidir: `team:<team_id>`.
- Satin alma sonrasi `/settings/billing` uzerindeki sync aksiyonu RevenueCat durumunu okuyup Supabase planini gunceller.

## RevenueCat dashboard kurulumu

1. RevenueCat projesinde `Apps & providers` altinda mevcut `Test Store` kaydini kullan veya olustur.
2. `Project settings -> API keys` altindan **Test Store public SDK key** degerini al.
3. `Product catalog -> Entitlements` altinda su entitlement'lari olustur:
   - `pro_team`
   - `pro_plus_team`
4. `Product catalog -> Products` altinda Test Store urunlerini olustur:
   - `pro_team_monthly`
   - `pro_plus_team_monthly`
5. Urunleri entitlement'lara bagla:
   - `pro_team_monthly` -> `pro_team`
   - `pro_plus_team_monthly` -> `pro_plus_team`
6. `Offerings` altinda bir offering olustur:
   - identifier: `default`
   - `pro_team_monthly` icin monthly package
   - `pro_plus_team_monthly` icin monthly package
7. Bu offering'i `Current / Default offering` olarak isaretle.
8. Production ortaminda test key kullanacaksan `Sandbox Testing Access` ile sadece izin verdigin app user id'lere entitlement verilmesini sinirla.

## Uygulama env degerleri

```env
NEXT_PUBLIC_REVENUECAT_ENABLED=true
NEXT_PUBLIC_REVENUECAT_API_KEY=<test_store_public_sdk_key>
REVENUECAT_SECRET_API_KEY=<server_only_secret_key>
```

Docker/Dokploy build alirken iki `NEXT_PUBLIC_*` degerini hem runtime env hem de build-time arguments olarak gir. `REVENUECAT_SECRET_API_KEY` yalnizca runtime env'de kalmali; build-time argument olarak verme.

## Test akisi

1. Uygulamada owner/admin/head coach ile giris yap.
2. `/settings/billing` sayfasina git.
3. RevenueCat test checkout kartinda bir paketi satin al.
4. Test Store modalinda success sec.
5. Satinalma sonrasi server sync calisir ve Supabase planini `pro_team` veya `pro_plus_team` olarak gunceller.
6. RevenueCat dashboard `Customers` ekraninda `team:<team_id>` kaydini kontrol et.

## Sinirlar

- Test Store gercek para almaz.
- Gercek web odemesi icin RevenueCat Web Billing tarafinda Stripe veya Paddle baglantisi gerekir.
- Test Store anahtari kalici production monetization cozum degildir; demo/test modu olarak dusunulmelidir.
