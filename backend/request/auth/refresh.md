# POST /auth/refresh

Geçerli bir refresh token karşılığında yeni bir access/refresh token çifti üretir. Kullanılan
refresh token tek kullanımlıktır — bu istek eskisini `revokedAt` ile iptal edip yenisini basar
(rotation).

Rate limit: 20 istek / 15 dakika (IP başına).

## Body

| Alan           | Tip    |
| -------------- | ------ |
| `refreshToken` | string |

## Başarılı yanıt — 200

```json
{ "accessToken": "...", "refreshToken": "..." }
```

## Hata durumları

- `400` — şema doğrulama hatası
- `401` — token bulunamadı, iptal edilmiş veya süresi dolmuş
