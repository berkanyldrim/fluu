# POST /auth/logout

Verilen refresh token'ı backend'de iptal eder (`revokedAt` set edilir). İdempotent — token zaten
iptal edilmişse veya bulunamazsa da `ok: true` döner, hata fırlatmaz.

Rate limit: 20 istek / 15 dakika (IP başına).

## Body

| Alan           | Tip    |
| -------------- | ------ |
| `refreshToken` | string |

## Başarılı yanıt — 200

```json
{ "ok": true }
```
