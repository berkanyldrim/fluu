# POST /auth/verify-email (purpose: register)

`register`/`send-otp-register` ile gönderilen kodu doğrular ve hesabı `isEmailVerified: true`
yapar. `code` alanını dev ortamında **backend console log'undan** al (gerçek e-posta gönderimi
henüz bağlanmadı, bkz. `src/lib/mailer.ts`).

Kod, DB'de gerçek bir `expires_at` zaman damgası karşılaştırmasıyla doğrulanır (`gt(expiresAt,
now())`) — süresi dolmuş bir kod, backend'in ayakta kalma süresine/saat farkına bakılmaksızın
her zaman reddedilir.

Auth: `Authorization: Bearer {{accessToken}}` zorunlu.

Rate limit: 10 istek / 15 dakika (IP başına).

## Body

```json
{ "purpose": "register", "code": "123456" }
```

## Başarılı yanıt — 200

```json
{ "ok": true }
```

## Hata durumları

- `400` — jenerik `Kod geçersiz veya süresi dolmuş` (yanlış kod, zaten kullanılmış kod veya
  süresi dolmuş kod — hepsi aynı mesaj, kod enumeration'ı engellemek için)
- `401` — access token yok/geçersiz
