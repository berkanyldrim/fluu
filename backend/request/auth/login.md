# POST /auth/login

E-posta/şifre ile giriş yapar, yeni bir access/refresh token çifti döner.

Rate limit: 10 istek / 15 dakika (IP başına).

## Body

| Alan       | Tip    | Not              |
| ---------- | ------ | ---------------- |
| `email`    | string | Geçerli e-posta  |
| `password` | string | Min 1 karakter   |

## Başarılı yanıt — 200

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": { "id": "...", "email": "...", "isEmailVerified": true }
}
```

`accessToken` 20 dakika, `refreshToken` 30 gün geçerli (bkz. `src/lib/tokens.ts`). `refresh`
tek kullanımlık rotation uygular — kullanılan refresh token bir daha geçerli olmaz.

## Hata durumları

- `400` — şema doğrulama hatası
- `401` — e-posta veya şifre hatalı (hesap yok/şifre yanlış/hesap silinmiş — hepsi aynı jenerik
  mesajla döner, enumeration'ı engellemek için)
- `403` — hesap dondurulmuş (`status: frozen`)

## Sırada ne var

`post-response` scripti `accessToken`/`refreshToken`'ı ortam değişkenlerine yazar — ardından
`/users/me` (**me-get**) veya profil güncelleme (**me-patch**) çalıştırılabilir.
