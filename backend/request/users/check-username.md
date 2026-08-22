# GET /users/check-username

Bir kullanıcı adının uygun olup olmadığını kontrol eder (onboarding sırasında canlı doğrulama
için).

Auth gerekmez.

## Query

| Parametre | Tip    | Kural                                    |
| --------- | ------ | ----------------------------------------- |
| `u`       | string | 3–20 karakter, sadece `a-z`, `0-9`, `_`   |

## Başarılı yanıt — 200

```json
{ "available": true }
```

## Hata durumları

- `400` — format kurallarına uymuyor (`Geçersiz kullanıcı adı formatı`)
