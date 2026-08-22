# Bruno API Koleksiyonu

Bu klasör, backend'deki tüm endpoint'ler için [Bruno](https://www.usebruno.com/) request
dosyalarını (`.bru`) ve her endpoint'in davranışını açıklayan `.md` dokümanlarını içerir. Hem
API dokümantasyonu hem de arayüzden manuel backend testi için tek kaynak olarak kullanılır.

## Kullanım

1. Bruno uygulamasında "Open Collection" ile bu klasörü (`backend/request`) aç.
2. Sağ üstten **Local** ortamını (environment) seç.
3. `email`/`password` gibi ortam değişkenlerini kendi test değerlerinle doldur.
4. `auth` klasöründeki istekleri sırayla çalıştır (`Register` → `Send OTP` → `Verify OTP` →
   ...) — token'lar (`accessToken`, `refreshToken`, `resetToken`) `post-response` scriptleri
   sayesinde otomatik olarak bir sonraki isteğe taşınır, elle kopyala-yapıştır gerekmez.

## Klasör yapısı

- `auth/` — kayıt, giriş, OTP gönder/doğrula, şifre sıfırlama, token yenileme/çıkış
- `users/` — profil okuma/güncelleme, kullanıcı adı uygunluk kontrolü
- `health.bru` — sağlık kontrolü

## Kural

Backend'e yeni bir endpoint eklendiğinde, o endpoint için buraya da bir `.bru` isteği ve
davranışını açıklayan bir `.md` dosyası eklenir — bu koleksiyon her zaman gerçek backend ile
senkron tutulur.
