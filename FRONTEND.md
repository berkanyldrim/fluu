# Nomi — Frontend Dokümanı

## Stack

- React Native + Expo + TypeScript
- Expo Router (dosya tabanlı navigasyon)
- Zustand (state yönetimi — hafif, Redux'a göre boilerplate'i az)
- Socket.io-client (realtime sohbet)
- expo-image-manipulator (foto sıkıştırma/resize)
- expo-av (ses/video kayıt ve sıkıştırma)
- expo-notifications (push)

## Tasarım sistemi

### Renkler

`PROJE.md`'deki token tablosunu birebir kullan. Açık/koyu tema class tabanlı (`.dark`) çalışır,
koyu temayı açık temanın tersine çevirerek üretme — ayrı, kısıtlı bir token seti var.

Gradyan **hiçbir yerde** kullanılmaz. Tüm yüzeyler düz/solid renk.

### Tipografi

İki font, iki ayrı görev:

- **JetBrains Mono** (variable, 100–800 ağırlık) — arayüzün tamamı: başlık, body, buton, form,
  chat balonu. Sadece ağırlık ve boyut değişir.
- **Archivo Black** — **sadece** logo/wordmark ("nomi" yazısı). JetBrains Mono logotype'ta
  sıkışık/mekanik durdu, ardından denenen Space Grotesk çok ince kaldı. Archivo Black tek
  ağırlıklı, kalın/dolgun bir headline fontu (varyantı yok, her zaman en kalın kesim) — bu
  belirsizliği ortadan kaldırıyor. Uygulama arayüzünde metin olarak **kullanılmaz**, sadece
  marka lockup'ında/splash ekranında geçer.

Önerilen hiyerarşi:

| Kullanım | Ağırlık | Boyut (öneri) |
|---|---|---|
| Ekran başlıkları | ExtraBold (800) | 24–28px |
| Section başlıkları | Bold (700) | 16–18px |
| Body / chat metni | Regular (400) | 14–15px |
| İkincil metin (timestamp, muted) | Light (300) | 12–13px |
| Buton metni | SemiBold (600) | 14–15px |

Türkçe karakterler (ş, ğ, ı, İ, ö, ü, ç) doğrulandı, sorun yok.

Font Expo'ya `expo-font` ile yüklenir, Google Fonts üzerinden statik dosya olarak bundle edilir
(runtime'da internet bağımlılığı olmamalı).

### Şekil dili

Marka varlıklarından (logo konsepti) türetilen radius kullanımı:

- Kart/panel: `border-radius: 12px`
- Uygulama ikonu / badge (squircle): `border-radius: ~22%` (24px viewBox'ta rx=5.4 oranı)
- Buton: `border-radius: 10–12px`

Keskin köşe (radius 0) veya tam yuvarlak (pill) genel arayüzde kullanılmaz — squircle karakteri
korunur.

### Logo & marka varlıkları

- `nomi-mark-light.svg` / `nomi-mark-dark.svg` — tekil N monogramı, tema yüzeyine göre iki
  renk varyantı:
  - **light:** `primary` (#1768E3) — açık tema yüzeylerinde (`background`/`surface`) kullanılır
  - **dark:** `primary-hover` (#3C87F5) — koyu tema yüzeylerinde (`background`/`surface`)
    kullanılır, koyu lacivertte daha iyi kontrast için daha parlak ton seçildi
  - İkisi de arka planı transparan tek bir glyph — badge/app icon üretmek için üzerine renkli
    zemin eklenmesi gerekir, kendileri zemin içermez
- Boyut serisi: 96 / 48 / 24 / 16px favicon/app icon üretimi için referans
- Wordmark: `nomi`, Archivo Black, sadece ilk harf (`n`) primary renkte, geri kalanı
  ink/text rengi
- İkon + wordmark lockup ve sade wordmark (ikonsuz) olmak üzere iki kullanım varyantı mevcut

## Sayfa yapısı

```
app/
  (auth)/
    login.tsx
    register.tsx
    onboarding.tsx        # yaş/cinsiyet/ülke, 18+ gate
  (tabs)/
    discover/              # Keşfet
      index.tsx
      filters.tsx
    chats/                 # Sohbetlerim
      index.tsx
      [chatId].tsx
    profile/                # Profil
      index.tsx
      edit.tsx
      settings.tsx
      blocked-users.tsx
  story/
    create.tsx
    [storyId].tsx           # viewer
```

## Bileşen gereksinimleri

### Filtre paneli (Keşfet + yeni sohbet başlatma akışı)

Aynı bileşen iki yerde kullanılır: ülke, cinsiyet, yaş aralığı (slider), tarih sıralaması
(yeniden eskiye varsayılan).

### Hikaye viewer

- 24 saatlik TTL'i gösteren ince ilerleme çubuğu
- Sadece **görüntülenme sayısı** gösterilir (ör. "119 görüntülenme") — izleyici listesi/kimliği
  hiçbir yerde gösterilmez, anonimlik ilkesi gereği
- Yanıt verme — sohbete düşer

### Sohbet listesi

- Sabitlenmiş sohbetler üstte, **maksimum 5** — 6.'yı eklerken kullanıcıya seçim yaptır
- Takip edilen kullanıcıların aktif hikayesi varsa listenin en üstünde ayrı bir şerit (Instagram
  mantığı)
- Sessize alınmış sohbetler görsel olarak ayırt edilir (badge/bildirim yok ama liste görünür)
- Swipe ile hızlı erişim: sabitle, sessize al, engelle/şikayet et

### Sohbet ekranı

- Karşı taraf başlıkta anonim bir handle ile görünür (ör. "anonim123"), gerçek profil bilgisi
  paylaşılmadığı sürece isim/foto gösterilmez
- Engelle/şikayet et aksiyonu ekranın her yerinden (header menüsü) erişilebilir — **profile
  gitmeye gerek yok**, çünkü karşı tarafın görünür bir profili olmayabilir. Aksiyon her zaman
  gerçek user_id'ye uygulanır, ekrandaki anonim handle sadece görünüm katmanıdır
- "Yazıyor..." göstergesi (Socket.io `typing` event)
- "Görüldü" bilgisi kullanıcı ayarına bağlı (varsayılan: açık, profil ayarından kapatılabilir)
- Medya gönderme:
  - Foto/video seçildiğinde **upload öncesi client-side sıkıştırma zorunlu**
    (`expo-image-manipulator`, max 1920px uzun kenar, JPEG/WebP %75-80)
  - Video: max 60sn, 720p — kayıt sırasında `expo-av` ile sınırla, seçim ekranında da uyar
  - Ses mesajı: max 2dk, AAC/Opus formatında kaydet (WAV asla)
  - Sunucu tarafı hard-cap'ler her durumda ayrıca kontrol edilir (bkz. `BACKEND.md`) — client
    limiti sadece UX, güvenlik sınırı değil

### Profil

- Foto yükleme (aynı sıkıştırma kuralları)
- Şifre değiştirme, çıkış, hesap silme/dondurma net ayrı aksiyonlar (yanlışlıkla silmeyi
  önlemek için hesap silme/dondurma onay adımı + şifre tekrar sorulur)

## i18n

Şimdilik iki dil: **Türkçe ve İngilizce**. Tüm UI metinleri baştan i18n dosyalarında tutulur —
ileride başka dil eklemek dosya çevirisinden ibaret olmalı, kod değişikliği gerektirmemeli.

## Kodlama kuralları

Detaylı kurallar `PROJE_KURALLARI.md`'de. Özet: kod/dosya/commit İngilizce, marka ismi ve
kullanıcıya gösterilen metinler Türkçe kalır.
