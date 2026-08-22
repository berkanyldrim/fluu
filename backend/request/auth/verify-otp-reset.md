# POST /auth/verify-email (purpose: reset)

Şifre sıfırlama kodunu doğrular, kısa ömürlü (10 dakika) bir `resetToken` döner — bu token
**reset-password** isteğinde yeni şifreyi kaydetmek için kullanılır. `code` alanını dev
ortamında backend console log'undan al.

Kod doğrulama, `register` amacıyla aynı mantığı kullanır: DB'de `expires_at > now()` kontrolü,
kullanılmış kodlar (`consumedAt`) tekrar kabul edilmez.

Auth gerekmez.

Rate limit: 10 istek / 15 dakika (IP başına).

## Body

```json
{ "purpose": "reset", "email": "user@example.com", "code": "123456" }
```

## Başarılı yanıt — 200

```json
{ "ok": true, "resetToken": "..." }
```

## Hata durumları

- `400` — jenerik `Kod geçersiz veya süresi dolmuş` (hesap yok, yanlış kod, süresi dolmuş kod —
  hepsi aynı mesaj)

## Sırada ne var

`post-response` scripti `resetToken`'ı ortam değişkenine yazar — ardından **reset-password**
çalıştırılabilir.
