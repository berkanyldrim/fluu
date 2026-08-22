# POST /auth/send-verification-otp (purpose: reset)

Şifremi unuttum akışı için OTP gönderir. Hesap var/yok bilgisini sızdırmamak için (account
enumeration koruması), hesap bulunamasa veya `frozen`/`deleted` olsa bile **her zaman aynı
şekilde** `{ ok: true, otpExpiresAt }` döner — hesap gerçekten aktifse OTP gerçekten üretilip
DB'ye yazılır, aksi halde `otpExpiresAt` sadece aynı formatta sahte (üretilmemiş) bir değerdir.
Bu davranışı bozacak bir değişiklik (ör. hataları farklılaştırmak) güvenlik incelemesi
gerektirir.

Auth gerekmez (henüz giriş yapılamıyor).

Rate limit: 3 istek / 10 dakika (IP başına).

## Body

```json
{ "purpose": "reset", "email": "user@example.com" }
```

## Başarılı yanıt — 200

```json
{ "ok": true, "otpExpiresAt": "2026-08-22T10:50:05.401Z" }
```

## Hata durumları

- `400` — şema doğrulama hatası (geçersiz e-posta formatı)
