# Fluu — Backend Dokümanı

## Stack

- Node.js + TypeScript (Fastify — Express'e göre daha performanslı)
- PostgreSQL (çok alanlı filtreleme — ülke/cinsiyet/yaş/tarih — için ideal)
- Drizzle (ORM — ham SQL string concat asla; şema `backend/src/db/schema.ts`, migration'lar
  `backend/drizzle/`)
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

## Yerel geliştirme

Backend'in kendisi (Fastify süreci) Docker'da **çalışmaz** — `npm run dev` ile doğrudan native
çalışır, hızlı reload için. Sadece durum tutan bağımlılıklar (Postgres, Redis) Docker Compose
ile ayağa kalkar:

```bash
cd backend
cp .env.example .env        # JWT_SECRET'i doldur (en az 32 karakter, örn. `openssl rand -hex 32`)
docker compose up -d        # Postgres (5432) + Redis (6379)
npm install
npm run db:migrate          # şemayı uygula (yeni migration için: npm run db:generate)
npm run dev                 # http://localhost:3000/health
```

`docker-compose.yml`'deki Postgres kullanıcı/şifre/db adı (`fluu`/`fluu`/`fluu`)
`.env.example`'daki `DATABASE_URL` ile eşleşecek şekilde ayarlı. Prod/staging'de backend de
container'a alınır (bkz. `PROJE_KURALLARI.md` "Docker container'lar root olmayan bir
kullanıcıyla çalışır") — o Dockerfile bu doküman ilerledikçe eklenecek, şu an için yalnızca
yerel geliştirme akışı burada.

## Veritabanı şeması (taslak)

Aşağıdaki `users`, `profiles`, `refresh_tokens`, `email_otps` artık taslak değil — gerçek
Drizzle şeması olarak `backend/src/db/schema.ts`'te tanımlı ve migration'ları uygulanmış
durumda. Geri kalan tablolar (stories, chats, messages, ...) henüz sadece taslak.

```
users
  id, email, password_hash, created_at, status (active/frozen/deleted),
  is_email_verified (bool)
  # status=deleted ANLAMI: hard delete değil, anonymize. E-posta/şifre/profil alanları
  # temizlenir ama satır silinmez — çünkü mesajlar sender_id'ye referans veriyor, satırı
  # gerçekten silmek karşı taraftaki sohbet geçmişini de kırar. Detay: "Hesap silme" bölümü.

profiles
  user_id, username (unique, indexed), first_name, last_name, bio, avatar_url, birth_date,
  gender, country, city (nullable), interests[], is_verified
  # username: kayıt sırasında girilir, benzersiz (unique constraint + case-insensitive index).
  # Keşfet'te hikaye kartlarında gösterilmez ama hikaye görüntüleyicide ve profilde görünür,
  # tıklanınca o kullanıcının profiline gider. first_name/last_name'den farklı — bunlar
  # değiştirilebilir, username kimlik/URL amaçlı benzersiz kalır.
  # birth_date: statik bir "age" alanı değil — yaş her okumada birth_date'ten hesaplanır, aksi
  # halde her kullanıcı için yılda bir elle güncelleme gerekirdi.
  # city: sadece country="Türkiye" ise dolu olabilir (frontend'de 81 illik sabit bir listeden
  # seçilir), başka ülke seçilince null kaydedilir — client'tan gelen değere güvenmeden bu kural
  # sunucu tarafında da doğrulanır (bkz. PROJE_KURALLARI.md, "client'tan gelen hiçbir veri
  # doğrulanmadan kullanılmaz").

refresh_tokens
  id, user_id, token_hash (unique), expires_at, revoked_at (nullable), created_at
  # Refresh token'ın kendisi asla düz metin saklanmaz, sadece hash'i (bkz. "Auth & oturum").
  # revoked_at doluysa token artık geçersiz — rotasyonda eskisi revoke edilip yenisi yazılır.

email_otps
  id, user_id, code_hash, purpose (register/reset), expires_at, consumed_at (nullable),
  created_at
  # Kod da hash'lenerek saklanır. purpose=register kayıt sonrası e-posta doğrulama,
  # purpose=reset şifremi unuttum akışı — aynı verify-otp ekranı ikisinde de kullanılıyor
  # (bkz. FRONTEND.md), backend'de hangi akış olduğunu bu alan ayırt eder.

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
  id, created_at, last_message_preview, last_message_at
  # last_message_preview/last_message_at denormalize edilmiş — sohbet listesini her açtığında
  # messages tablosuna JOIN/subquery atmamak için. Her yeni mesajda güncellenir.

chat_participants
  chat_id, user_id, pinned (bool), muted (bool), pinned_at, anon_handle (ör. "anonim123"),
  unread_count (int, default 0)
  # anon_handle karşı tarafa gösterilen isim — gerçek profile_id ile ayrı tutulur.
  # Engelleme/şikayet her zaman user_id'ye uygulanır, anon_handle sadece görünüm katmanı.
  # unread_count: yeni mesajda karşı tarafın satırında +1, kullanıcı sohbeti açıp room'a
  # join olunca (bkz. Presence bölümü) 0'a resetlenir.

messages
  id, chat_id, sender_id, type (text/image/video/audio), content, media_url,
  created_at, seen_at (nullable), deleted_for_everyone (bool, default false),
  hidden_from (user_id[], default [])
  # "Benden sil": hidden_from'a kendi user_id'n eklenir, sadece senin görünümünden kalkar.
  # "Herkesten sil": deleted_for_everyone=true, içerik "Bu mesaj silindi" olarak gösterilir,
  # media_url siliniyorsa R2'den de kaldırılır.

blocks
  blocker_id, blocked_id, created_at

reports
  id, reporter_id, target_type (user/message/story), target_id, reason, status,
  created_at

subscriptions
  user_id, plan (fluu_plus), status (active/canceled/expired/grace_period),
  provider (app_store/play_store), provider_transaction_id, current_period_end,
  created_at, updated_at
```

`pinned` alanına uygulama katmanında (Faz 2'de) kullanıcı başına max 5 kontrolü eklenir —
DB constraint yerine API katmanında iş kuralı olarak.

## API uç noktaları (özet)

**REST**
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`
- `POST /auth/send-verification-otp`, `POST /auth/verify-email` — kayıt sonrası e-posta
  doğrulanmadan ana uygulamaya erişim yok, her istekte `is_email_verified` kontrolü yapılır.
  `verify-email` iki amaçla (`purpose`) çalışır: `register`'da doğrudan `is_email_verified`'ı
  true yapar; `reset`'te kısa ömürlü (10dk) bir `resetToken` döner
- `POST /auth/reset-password` — `verify-email`'den (`purpose=reset`) dönen `resetToken` +
  yeni şifre alır, şifreyi günceller ve o kullanıcının tüm mevcut refresh token'larını iptal
  eder. FRONTEND.md'deki `reset-password.tsx` ekranını karşılar, ilk API listesinde yoktu,
  akışı tamamlamak için eklendi
- `GET/PATCH /users/me`
- `DELETE /users/me` — **hard delete değil, anonymize** (bkz. "Hesap silme" notu aşağıda)
- `GET /users/check-username?u=xxx` — anlık benzersizlik kontrolü, onboarding'de yazarken
  çağrılır (debounce'lu)
- `GET /users/:username` — herkese açık profil görüntüleme (hikaye görüntüleyiciden tıklanınca
  buraya gidilir)
- `GET /discover` — query: country, gender, ageMin, ageMax, sort=newest
- `POST /stories`, `GET /stories/:id`, `GET /stories/:id/view-count` (sadece sayı döner,
  izleyici listesi hiçbir endpoint'te yok)
- `GET /chats`, `POST /chats/:id/pin`, `POST /chats/:id/mute`
- `POST /media/upload-url`, `POST /media/confirm` — presigned upload akışı (bkz. Medya pipeline)
- `POST /blocks`, `DELETE /blocks/:id`, `GET /blocks/:id/status` (karşılıklı engelleme durumu)
- `POST /reports`
- `POST /subscriptions/verify` (App Store/Play Store receipt doğrulama), webhook endpoint'leri
  (renewal/cancel/expire bildirimleri için — bkz. Abonelik bölümü)

**Hesap silme:** satır silinmez, çünkü `messages.sender_id` başka kullanıcıların sohbet
geçmişine referans veriyor — gerçekten silmek karşı tarafın da o konuşmayı kaybetmesine yol
açar. Bunun yerine: email/password/profil alanları temizlenir, `status=deleted` set edilir,
kullanıcı artık giriş yapamaz ama var olan mesajları "silinmiş kullanıcı" olarak sohbet
geçmişinde kalmaya devam eder. "Dondurma" (`status=frozen`) bu temizliği yapmaz, sadece girişi
geçici kapatır — geri dönülebilir.

**WebSocket (Socket.io)**
- `message:send` / `message:receive`
- `typing:start` / `typing:stop`
- `presence:online` / `presence:offline`

Her istekte iki ayrı kontrol katmanı çalışır: kimlik doğrulama (bu kullanıcı giriş yapmış mı) ve
yetkilendirme (bu kaynak gerçekten onun mu / karşı taraf engellenmiş mi). İkincisi hem REST hem
WebSocket katmanında ayrı ayrı uygulanır.

## Presence & realtime detayları

- **Çoklu cihaz/sekme takibi:** Kullanıcı başına açık socket'ler Redis'te tutulur
  (`user_sockets:{userId}` — socket id seti). Kullanıcı sadece **son** socket'i de kapanınca
  offline sayılır — iki cihazdan bağlıysa biri kapanınca online kalmaya devam eder. (Bunu
  Node process'i içinde bir in-memory Map ile tutmak yatay ölçeklenince kırılır — Redis'te
  tutmak zorunlu, çünkü aynı kullanıcının iki socket'i iki farklı sunucu instance'ına
  düşebilir.)
- **Stale-online temizliği:** sunucu çökme gibi durumlarda `disconnect` event'i hiç
  tetiklenmeyebilir. Saatlik bir BullMQ job, socket seti boş olduğu halde hâlâ "online"
  görünen kullanıcıları offline'a çeker.
- **Socket auth:** her bağlantı handshake'te JWT sunar, middleware doğrular ve `socket.userId`
  olarak bağlar — hiçbir handler client'ın gönderdiği user id'ye güvenmez, hep doğrulanmış
  `socket.userId` kullanılır.
- **Engelleme — socket seviyesinde:** `message:send` işlenmeden önce blocker/blocked kontrolü
  yapılır; engellenmişse mesaj kaydedilmez, gönderene `message:blocked` event'i döner (sessizce
  yutulmaz, kullanıcıya "bu mesaj gönderilemedi" gösterilebilir — ama karşı tarafa engellendiği
  bilgisi asla sızmaz).
- **Engellenince profil sansürü:** taraflardan biri diğerini engellediğinde, engellenen kişi
  karşı tarafın profilinde/sohbetinde sadece jenerik bilgi görür (anon_handle, offline durumu)
  — gerçek profil verisi (foto, bio, online durumu) engellenen tarafa hiç sızmaz.
- **Bildirim gürültüsü:** yeni mesaj bildirimi (`push:new-message`) sadece alıcı o sohbeti o an
  açık tutmuyorsa gönderilir — zaten baktığı sohbet için bildirim basmak gereksiz.

## Medya pipeline

### Limitler

| Medya | Bağlam | Süre/çözünürlük sınırı | Hedef boyut (client sıkıştırma sonrası) | Sunucu hard-cap |
|---|---|---|---|---|
| Fotoğraf | Hikaye + Sohbet | Uzun kenar max 1920px, JPEG/WebP %75-80 | ~300KB–1MB | 5MB |
| Video | Hikaye | 15sn, 720p, H.264 ~2.5Mbps | ~4–5MB | 15MB |
| Video | Sohbet | 60sn, 720p, H.264 ~2Mbps | ~10–15MB | 20MB |
| Ses | Sohbet | 2dk, Opus/AAC | ~500KB–1MB | 3MB |

### Yükleme yolu — presigned URL

Dosya bytes'ları **backend'den geçmez**. Akış: client `POST /media/upload-url` ile API'den
kısa ömürlü bir presigned PUT URL ister — client dosyayı doğrudan R2'ye bu URL ile yükler —
upload bitince client `POST /media/confirm` ile API'ye "yüklendi" der, API o zaman `ffprobe`/
`sharp` ile gerçek boyut/süre kontrolünü yapar (limit aşımında obje R2'den silinir, mesaj
reddedilir). Bu sayede kendi sunucumuz dosya trafiğini taşımıyor — hem bant genişliği hem CPU
tasarrufu, hem de yükleme sırasında API sürecini bloklamıyor.

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

## Abonelik (Fluu Plus — aylık)

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
- Username benzersizliği DB seviyesinde `UNIQUE` constraint ile garanti edilir — `/check-username`
  sadece UX için anlık geri bildirim verir, gerçek kayıt anında yine de race condition'a karşı
  DB constraint'e güvenilir (iki kişi aynı anda aynı username'i alamaz)

### Yetkilendirme
- Her istekte ayrı bir katmanda "bu kullanıcı bu kaynağa erişebilir mi" kontrolü
- Engelleme hem REST hem WebSocket katmanında zorunlu — engellenen biri mesaj/hikaye
  gönderemez. Socket seviyesindeki tam davranış (event, profil sansürü) için "Presence &
  realtime detayları" bölümüne bakın.

### Altyapı
- Her yerde HTTPS/WSS zorunlu, HSTS header
- Secret'lar asla repoya girmez, env değişkeni/secret manager üzerinden
- CORS whitelist — sadece kendi app domain/scheme'i
- `npm audit` / Dependabot ile düzenli bağımlılık taraması
- Docker container'lar root olmayan bir kullanıcıyla çalışır (`USER appuser` — container
  içinden bir açık bulunsa bile ayrıcalık yükseltmeyi zorlaştırır)

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
