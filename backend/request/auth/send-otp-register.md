# POST /auth/send-verification-otp (purpose: register)

Giriş yapmış (access token'lı) kullanıcı için yeni bir e-posta doğrulama OTP'si üretir ve
gönderir — "kodu tekrar gönder" akışı. `Register` isteği zaten bir OTP gönderdiği için bu endpoint
genelde sadece kod süresi dolduğunda/kaybolduğunda tekrar çağrılır.

Auth: `Authorization: Bearer {{accessToken}}` zorunlu.

Rate limit: 3 istek / 10 dakika (IP başına) — sık tekrar denemeyi engeller.

## Body

```json
{ "purpose": "register" }
```

## Başarılı yanıt — 200

```json
{ "ok": true, "otpExpiresAt": "2026-08-22T10:50:05.401Z" }
```

`otpExpiresAt`, bu yeni kodun ne zaman geçersiz olacağını söyler (`OTP_TTL_MS`, şu an 3 dakika).
Frontend geri sayımını bu değerden yeniden hesaplar.

## Hata durumları

- `400` — şema doğrulama hatası
- `401` — access token yok/geçersiz
