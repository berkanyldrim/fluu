# POST /auth/reset-password

`verify-otp-reset`'ten alınan `resetToken` ile yeni şifreyi kaydeder. Şifre değişince kullanıcının
tüm aktif refresh token'ları iptal edilir — başka cihaz/oturumlarda açık kalmış eski bir oturum,
şifre sıfırlandıktan sonra geçerli kalmaz.

Auth gerekmez (kimlik doğrulama `resetToken` üzerinden yapılır).

Rate limit: 5 istek / 15 dakika (IP başına).

## Body

| Alan          | Tip    | Not                                                |
| ------------- | ------ | --------------------------------------------------- |
| `resetToken`  | string | `verify-otp-reset` yanıtından                       |
| `newPassword` | string | Min 8 karakter, en az 1 küçük/1 büyük harf/1 rakam  |

## Başarılı yanıt — 200

```json
{ "ok": true }
```

## Hata durumları

- `400` — şema doğrulama hatası (şifre kuralı)
- `401` — `resetToken` geçersiz veya süresi dolmuş
