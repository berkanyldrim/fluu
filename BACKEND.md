# Nomi — Backend Dokümanı

## Stack

- Node.js + TypeScript (Fastify — Express'e göre daha performanslı)
- PostgreSQL (çok alanlı filtreleme — ülke/cinsiyet/yaş/tarih — için ideal)
- Prisma veya Drizzle (ORM — ham SQL string concat asla)
- Socket.io + Redis adapter (realtime sohbet, yatay ölçeklenebilir)
- Redis (cache + Socket.io adapter + rate limiting)
- Cloudflare R2 (medya depolama — egress $0)
- BullMQ (background job — hikaye TTL temizliği, medya işleme kuyruğu)

Supabase/Firebase **kullanılmıyor** — tam kontrol, vendor lock-in olmaması ve KVKK açısından
"veri Türkiye/AB'de kalıyor" pozisyonunu savunabilmek için kendi backend'imizi yazıyoruz.

Tek servis hem REST (sosyal özellikler: profil, hikaye, keşfet, engelleme) hem WebSocket
(realtime mesajlaşma) trafiğini karşılar. Aynı Node.js süreci, aynı PostgreSQL, aynı Redis,
aynı R2 bucket — ayrı bir sistem kurmuyoruz, sadece kod içinde katman ayrımı (REST route'ları
vs Socket.io handler'ları).

## Veritabanı şeması (taslak)

```
users
  id, email, password_hash, created_at, status (active/frozen/deleted)

profiles
  user_id, display_name, bio, avatar_url, age, gender, country, city,
  interests[], is_verified

stories
  id, user_id, media_url, media_type, created_at, expires_at (created_at + 24h),
  view_count (denormalized sayaç — hızlı okuma için)

story_views
  story_id, viewer_id, viewed_at
  # Sadece iç kayıt/moderasyon amaçlı. API hiçbir zaman viewer_id listesini döndürmez,
  # sadece story.view_count okunur — uygulama anonim olduğu için izleyici kimliği ifşa edilmez.

follows
  follower_id, following_id, created_at

chats
  id, created_at

chat_participants
  chat_id, user_id, pinned (bool), muted (bool), pinned_at, anon_handle (ör. "anonim123")
  # anon_handle karşı tarafa gösterilen isim — gerçek profile_id ile ayrı tutulur.
  # Engelleme/şikayet her zaman user_id'ye uygulanır, anon_handle sadece görünüm katmanı.

messages
  id, chat_id, sender_id, type (text/image/video/audio), content, media_url,
  created_at, seen_at (nullable)

blocks
  blocker_id, blocked_id, created_at

reports
  id, reporter_id, target_type (user/message/story), target_id, reason, status,
  created_at

subscriptions
  user_id, plan (nomi_plus), status (active/canceled/expired/grace_period),
  provider (app_store/play_store), provider_transaction_id, current_period_end,
  created_at, updated_at
```

`pinned` alanına uygulama katmanında (Faz 2'de) kullanıcı başına max 5 kontrolü eklenir —
DB constraint yerine API katmanında iş kuralı olarak.

## API uç noktaları (özet)

**REST**
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
- `GET/PATCH /users/me`, `DELETE /users/me` (dondurma/silme)
- `GET /discover` — query: country, gender, ageMin, ageMax, sort=newest
- `POST /stories`, `GET /stories/:id`, `GET /stories/:id/view-count` (sadece sayı döner,
  izleyici listesi hiçbir endpoint'te yok)
- `GET /chats`, `POST /chats/:id/pin`, `POST /chats/:id/mute`
- `POST /blocks`, `POST /reports`
- `POST /subscriptions/verify` (App Store/Play Store receipt doğrulama), webhook endpoint'leri
  (renewal/cancel/expire bildirimleri için — bkz. Abonelik bölümü)

**WebSocket (Socket.io)**
- `message:send` / `message:receive`
- `typing:start` / `typing:stop`
- `presence:online` / `presence:offline`

Her istekte iki ayrı kontrol katmanı çalışır: kimlik doğrulama (bu kullanıcı giriş yapmış mı) ve
yetkilendirme (bu kaynak gerçekten onun mu / karşı taraf engellenmiş mi). İkincisi hem REST hem
WebSocket katmanında ayrı ayrı uygulanır.

## Medya pipeline

### Limitler

| Medya | Bağlam | Süre/çözünürlük sınırı | Hedef boyut (client sıkıştırma sonrası) | Sunucu hard-cap |
|---|---|---|---|---|
| Fotoğraf | Hikaye + Sohbet | Uzun kenar max 1920px, JPEG/WebP %75-80 | ~300KB–1MB | 5MB |
| Video | Hikaye | 15sn, 720p, H.264 ~2.5Mbps | ~4–5MB | 15MB |
| Video | Sohbet | 60sn, 720p, H.264 ~2Mbps | ~10–15MB | 20MB |
| Ses | Sohbet | 2dk, Opus/AAC | ~500KB–1MB | 3MB |

### Enforcement — iki katmanlı

- **Client (soft):** upload öncesi resize/compress, UX'i iyileştirir
- **Sunucu (hard):** yüklenen dosyanın gerçek süre/çözünürlüğü `ffprobe` (video) ve `sharp`
  (foto) ile kontrol edilir — client'ın metadata'da ne dediğine güvenilmez. Limit aşımında
  reddedilir.

### Depolama — Cloudflare R2

- Standart storage: $0.015/GB-ay
- Class A (yazma) işlemler: $4.50/milyon
- Class B (okuma) işlemler: $0.36/milyon
- **Egress: $0** — bu, S3'e göre asıl fark yaratan kalem (chat medyası her açıldığında
  indirilir, egress ücretli olsaydı bu kalem patlardı)
- Ücretsiz katman: 10GB + 1M Class A + 10M Class B / ay

Video, hacim olarak en büyük maliyet kalemi (mesaj sayısının küçük bir kısmı olsa bile toplam
depolamanın büyük kısmını oluşturur). Süre/çözünürlük limitleri bu yüzden zorunlu.

30-60 günden eski, az erişilen medya için **Infrequent Access tier**'a (storage $0.01/GB, okuma
maliyeti daha yüksek) otomatik geçiş yapan bir lifecycle kuralı kurulabilir — kullanıcı deneyimini
etkilemeden arka planda çalışır.

### İşleme

Foto resize (`sharp`) ve video thumbnail (`ffmpeg`) CPU işi — ana API sürecini bloklamaması için
ayrı bir BullMQ worker kuyruğunda çalıştırılır.

## Abonelik (Nomi Plus — aylık)

Tek seferlik satın almadan farklı olarak abonelik, sürekli durum takibi gerektirir:

- `subscriptions` tablosunda kullanıcı başına aktif durum (`status`) ve dönem sonu
  (`current_period_end`) tutulur
- App Store/Play Store'dan gelen **server-to-server webhook**'lar dinlenir (yenileme, iptal,
  ödeme hatası, grace period) — sadece client'ın "satın aldım" demesine güvenilmez, sunucu
  taraflı doğrulama zorunlu
- Grace period (ödeme başarısız olduğunda kısa bir süre erişimin kesilmemesi) desteklenir,
  kullanıcı deneyimini korur
- Erişim kontrolü her istekte `subscriptions.status = active` kontrolüyle yapılır, cache'lenir
  (her istekte App Store'a sormaya gerek yok)

## Spam önleme

- **Rate limiting:** kullanıcı başına dakikada gönderilebilecek mesaj sayısı sınırlı (Redis
  üzerinden sayaç)
- **Flood/tekrar tespiti:** aynı mesajın kısa sürede art arda gönderilmesi otomatik engellenir
- **Yeni hesap kısıtlaması:** kayıt sonrası ilk birkaç saat/gün daha düşük mesaj limiti — spam
  botlarının hesap açar açmaz toplu mesaj atmasını zorlaştırır
- **İçerik bazlı filtre:** aşırı sayıda link içeren mesajlar, bilinen spam kalıpları basit bir
  kural/regex katmanıyla yakalanır; ileride gerekirse ML tabanlı sınıflandırıcıya geçilebilir
- **Şikayet eşiği:** belirli bir sürede çok sayıda şikayet alan hesap otomatik olarak
  kısıtlanır (mesaj limiti düşürülür veya inceleme kuyruğuna alınır) — moderasyon ekibi
  yetişemeden de sistem kendini korur
- Kayıt akışında CAPTCHA/bot koruması (özellikle şüpheli davranış tetiklendiğinde)

## Güvenlik — "sıfır açık" hedefi

### Auth & oturum
- Şifreler argon2/bcrypt ile hash'lenir, düz metin veya tersine çevrilebilir şifreleme asla yok
- JWT access token kısa ömürlü (15–30dk) + refresh token rotasyonu, refresh token DB'de
  hash'lenmiş saklanır
- Login/register endpoint'lerinde rate limiting (IP + hesap bazlı)

### Girdi doğrulama & injection
- Her endpoint'te şema doğrulama (zod/joi) — client'tan gelen hiçbir veriye güvenilmez
- PostgreSQL'e her zaman parametreli sorgu (ORM üzerinden)
- Dosya yükleme: MIME + magic byte kontrolü, boyut limiti, dosya adı sanitize, çalıştırılabilir
  dizine asla yazma

### Yetkilendirme
- Her istekte ayrı bir katmanda "bu kullanıcı bu kaynağa erişebilir mi" kontrolü
- Engelleme hem REST hem WebSocket katmanında zorunlu — engellenen biri mesaj/hikaye
  gönderemez

### Altyapı
- Her yerde HTTPS/WSS zorunlu, HSTS header
- Secret'lar asla repoya girmez, env değişkeni/secret manager üzerinden
- CORS whitelist — sadece kendi app domain/scheme'i
- `npm audit` / Dependabot ile düzenli bağımlılık taraması

### İçerik güvenliği
- Yüklenen görsellerde otomatik NSFW/CSAM taraması (Sightengine, AWS Rekognition, Google
  SafeSearch gibi) — hem güvenlik hem yasal zorunluluk
- Loglara asla mesaj içeriği veya şifre yazılmaz, sadece anormal aktivite (başarısız login,
  anormal mesaj hacmi) loglanır
- 18+ yaş onboarding gate

## Performans — kullanıcı sayısı artsa da hız düşmemeli

- **Realtime:** Socket.io tek sunucuda sorun değil, yatay ölçeklenince (birden fazla sunucu)
  **Redis adapter zorunlu** — yoksa farklı sunuculara bağlanan iki kullanıcı birbirini göremez
- **DB:** filtrelenen alanlarda (ülke, cinsiyet, yaş, tarih) composite index; okuma ağırlıklı
  yerler (Keşfet, hikaye akışı) için Redis cache katmanı
- **Hikaye temizliği:** 24 saatlik TTL BullMQ/cron ile arka planda çalışır, tablo şişmez
- **Medya:** R2 + CDN üzerinden servis edilir, sunucudan direkt stream edilmez
- **Genel:** rate limiting hem güvenlik hem performans için; Docker + yatay ölçekleme; MVP
  sonrası k6/Artillery ile load test yapılır — "kaç kullanıcıda nerede kırılıyor" gerçek
  sayılarla görülmeli

## Kodlama kuralları

Detaylı kurallar `PROJE_KURALLARI.md`'de.
