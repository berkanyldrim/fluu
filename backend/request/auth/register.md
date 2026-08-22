# POST /auth/register

Yeni hesap oluşturur, bir `register` amaçlı OTP kodu üretip e-postaya (dev ortamında console'a)
gönderir ve access/refresh token çiftini döner. Hesap `isEmailVerified: false` olarak başlar —
`Kodu Doğrula` akışı (`send-otp-register` + `verify-otp-register`) tamamlanana kadar sınırlı
kalır.

Rate limit: 5 istek / 15 dakika (IP başına).

## Body

| Alan       | Tip    | Not                                              |
| ---------- | ------ | ------------------------------------------------ |
| `email`    | string | Geçerli e-posta formatı                          |
| `password` | string | Min 8 karakter, en az 1 küçük/1 büyük harf/1 rakam |

## Başarılı yanıt — 201

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { "id": "...", "email": "...", "isEmailVerified": false },
  "otpExpiresAt": "2026-08-22T10:50:05.401Z"
}
```

`otpExpiresAt`, gönderilen OTP'nin backend'de geçerliliğini yitireceği an (`OTP_TTL_MS`,
şu an 3 dakika — bkz. `src/lib/otp.ts`). Frontend'deki geri sayım bu değerden türetilir, ayrıca
hardcode edilmez.

## Hata durumları

- `400` — şema doğrulama hatası (geçersiz e-posta/şifre formatı)
- `409` — bu e-posta zaten kayıtlı

## Sırada ne var

Bu isteğin `post-response` scripti `accessToken`/`refreshToken`'ı ortam değişkenlerine yazar —
ardından **send-otp-register** veya doğrudan **verify-otp-register**'ı çalıştırabilirsin (konsola
düşen kodu kullanarak).
