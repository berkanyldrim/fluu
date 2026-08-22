# PATCH /users/me

Profil oluşturur (ilk çağrı) veya günceller (`upsert` — `onConflictDoUpdate`). Onboarding
akışının son adımı.

Auth: `Authorization: Bearer {{accessToken}}` zorunlu.

## Body

| Alan        | Tip                             | Kural                                                        |
| ----------- | -------------------------------- | ------------------------------------------------------------- |
| `firstName` | string                            | 1–100 karakter                                                 |
| `lastName`  | string                            | 1–100 karakter                                                 |
| `username`  | string                            | 3–20 karakter, sadece `a-z`, `0-9`, `_`                        |
| `birthDate` | string (`YYYY-MM-DD`)             | 18 yaşından büyük olunmalı                                     |
| `gender`    | `"female" \| "male" \| "other"`   |                                                                 |
| `country`   | string                            | 1–100 karakter                                                 |
| `city`      | string \| null                   | `country === "Türkiye"` ise dolu, aksi halde `null` olmalı     |

## Başarılı yanıt — 200

```json
{ "profile": { "userId": "...", "username": "testuser", "...": "..." } }
```

## Hata durumları

- `400` — şema doğrulama hatası (yaş, ülke/şehir tutarlılığı, format)
- `401` — access token yok/geçersiz
- `409` — kullanıcı adı başka biri tarafından alınmış (hem uygulama seviyesinde hem DB unique
  constraint seviyesinde kontrol edilir — bkz. `src/routes/users.ts`)
