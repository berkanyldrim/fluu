# GET /users/me

Giriş yapmış kullanıcının hesap bilgisini ve (varsa) profilini döner.

Auth: `Authorization: Bearer {{accessToken}}` zorunlu.

## Başarılı yanıt — 200

```json
{
  "user": { "id": "...", "email": "...", "isEmailVerified": true },
  "profile": null
}
```

Profil henüz oluşturulmadıysa (`onboarding/personal-info` tamamlanmadıysa) `profile: null`
döner — frontend bunu görünce onboarding akışına yönlendirir.

## Hata durumları

- `401` — access token yok/geçersiz/süresi dolmuş
