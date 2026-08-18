# Fluu — Çalıştırma Rehberi

Backend ve frontend ayrı süreçler, ikisini de sen kendi terminalinde başlatıyorsun (Docker
dahil) — bu doküman sırayla ne yapman gerektiğini anlatır.

## 1. Backend

```bash
cd backend
cp .env.example .env
```

`.env` içindeki `JWT_SECRET=` satırını doldur (en az 32 karakter olmalı):

```bash
openssl rand -hex 32
```

çıktısını oraya yapıştır. `DATABASE_URL`/`REDIS_URL`'e dokunmana gerek yok, `docker-compose.yml`
ile zaten eşleşiyor.

```bash
docker compose up -d      # Postgres (5432) + Redis (6379)
npm install
npm run db:migrate         # şema tablolarını oluşturur
npm run dev                 # http://localhost:3000
```

Doğrulama: `curl http://localhost:3000/health` → `{"status":"ok"}` dönmeli.

Şema değiştiğinde (`src/db/schema.ts`): önce `npm run db:generate` (migration dosyası üretir),
sonra `npm run db:migrate` (uygular).

**Durdurma:** `npm run dev`'i `Ctrl+C`, container'lar için `docker compose down` (`-v`
eklersen veriler de silinir, normalde eklemene gerek yok).

## 2. Frontend

Ayrı bir terminalde:

```bash
cd frontend
npm install
npm run web                 # http://localhost:8081
```

`EXPO_PUBLIC_API_URL` kodda varsayılan olarak `http://localhost:3000` — web ve iOS simulator
için `.env` oluşturmana gerek yok. Sadece **Android emulator** veya **fiziksel cihaz**da test
edeceksen `frontend/.env` oluşturup gerçek adresi yaz (üç senaryo `frontend/.env.example`'da
açıklanmış: web, Android emulator, fiziksel cihaz).

Not: `http://localhost:8081` açılınca önce Expo'nun demo Home ekranını görebilirsin, bir
anlığına — oturum yoksa otomatik `/login`'e yönlendiriyor. İstersen direkt
`http://localhost:8081/login`'e de gidebilirsin.

## 3. Tipik akış

1. Backend'i başlat (1. adım).
2. Frontend'i başlat (2. adım).
3. `/register`'dan kayıt ol. OTP kodu gerçek bir e-postaya gitmiyor (sağlayıcı henüz
   bağlanmadı, bilinçli dev-mode) — backend'in çalıştığı terminalde şöyle bir satır göreceksin:
   ```
   [dev-mailer] register OTP for sen@example.com: 123456
   ```

## Sorun giderme

| Belirti | Sebep / çözüm |
|---|---|
| Backend "JWT_SECRET en az 32 karakter olmalı" hatasıyla açılmıyor | `.env`'i doldurmadın |
| Frontend'den istekler backend'e ulaşmıyor | Backend gerçekten ayakta mı, `curl localhost:3000/health` dene |
| "Too Many Requests" | Aynı endpoint'i (özellikle `/auth/register`) kısa sürede çok denedin — rate limit Redis'te tutuluyor, `docker compose exec redis redis-cli FLUSHALL` ile sıfırlayabilirsin (sadece dev'de) |
| `docker compose up` port çakışması veriyor | `docker ps` ile 5432/6379'u başka bir container mi kullanıyor kontrol et |

## İlgili dokümanlar

- `BACKEND.md` — API, veritabanı şeması, güvenlik, medya pipeline
- `FRONTEND.md` — ekran yapısı, tasarım sistemi, bileşenler
- `PROJE.md` — genel bakış, özellikler, yol haritası
- `PROJE_KURALLARI.md` — kodlama ve commit kuralları
