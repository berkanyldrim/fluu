# Fluu — Frontend Dokümanı

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

Gradyan **UI'de hiçbir yerde** kullanılmaz — tüm yüzeyler düz/solid renk. Tek istisna logonun
kendisi (bkz. "Logo & marka varlıkları"), o zaten sabit bir görsel dosya, kod içinde yeniden
üretilmiyor.

### Tipografi

Tek font, tüm uygulamada: **Nunito** (variable, 200–1000 ağırlık). Auth ekranlarında
denendikten sonra (JetBrains Mono logonun yuvarlak/sıcak karakteriyle uyuşmuyordu) karar
verildi: **tüm uygulama Nunito'ya taşındı** — chat, Keşfet, Sohbetlerim, Profil dahil, artık
iki fontlu bir sistem yok. Logo hazır bir görsel dosya olduğu için ayrı bir "wordmark fontu"
da yok — marka yazısı hiçbir yerde canlı metin olarak set edilmiyor, her zaman
`fluu-logo-*.png` kullanılıyor.

Önerilen hiyerarşi:

| Kullanım | Ağırlık | Boyut (öneri) |
|---|---|---|
| Ekran başlıkları | ExtraBold (800) | 22–26px |
| Section başlıkları | Bold (700) | 16–18px |
| Body / chat metni | SemiBold (600) | 14–15px |
| İkincil metin (timestamp, muted) | Regular (400) | 12–13px |
| Buton metni | ExtraBold (800) | 14–15px |

Türkçe karakterler (ş, ğ, ı, İ, ö, ü, ç) doğrulandı, sorun yok.

Font Expo'ya `expo-font` ile yüklenir, Google Fonts üzerinden statik dosya olarak bundle edilir
(runtime'da internet bağımlılığı olmamalı).

### Şekil dili

- Kart/panel: `border-radius: 12px`
- Uygulama ikonu (squircle): logo dosyalarındaki köşe yuvarlaklığıyla uyumlu, ~%22 oranında
- Buton: `border-radius: 10–12px`

Keskin köşe (radius 0) veya tam yuvarlak (pill) genel arayüzde kullanılmaz — squircle karakteri
korunur.

### Logo & marka varlıkları

Logo artık tasarlanmıyor, hazır ve nihai:

- `fluu-logo-dark.png` — koyu (lacivert `#021744`) rozet zemini, üzerinde özel çizilmiş "flw"
  logotype. Koyu tema ve app icon için kullanılır.
- `fluu-logo-light.png` — açık (`#FAFAFA`) zemin, aynı logotype lacivert/mavi tonlarında. Açık
  tema için kullanılır.
- Logotype'ın "w" harfinde lacivertten (`#021744`) maviye (`#0297FE`) geçen bir gradyan var —
  bu, uygulamanın geri kalanındaki "gradyan yok" kuralının **bilinçli tek istisnası**, çünkü
  sabit bir görsel dosya, kod içinde CSS gradyanı olarak yeniden üretilmiyor.
- Bu iki PNG'den app icon boyut seti (1024/180/167/152/120px iOS, 48–512px Android adaptive
  icon) ve favicon üretilir — kaynak dosyalar yüksek çözünürlüklü tutulmalı, küçük boyutlar
  bunlardan export edilir.
- Marka yazısı hiçbir yerde canlı/render edilen metin olarak kullanılmaz (ör. splash ekranında
  "Fluu" yazmak için font'a "Fluu" yazdırılmaz) — her zaman bu PNG dosyaları kullanılır, ikisi
  arasında geçiş tema class'ına (`.dark`) göre yapılır.

## Sayfa yapısı

```
app/
  (auth)/
    login.tsx
    register.tsx
    forgot-password.tsx
    verify-otp.tsx          # kayıt sonrası e-posta doğrulama VE şifre sıfırlama, ikisinde de kullanılır
    onboarding/
      photo.tsx              # profil fotoğrafı, atlanabilir
      personal-info.tsx      # görünen ad, doğum tarihi, cinsiyet, ülke/şehir — 18+ gate burada
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

**Kayıt akışı sırası:** `register` → `verify-otp` (e-posta doğrulama, `BACKEND.md`'deki
"e-posta doğrulanmadan ana uygulamaya erişim yok" kuralı burada uygulanır) → `onboarding/photo`
(atlanabilir) → `onboarding/personal-info` (zorunlu, 18+ gate + Keşfet filtrelerinin dayandığı
alanlar burada toplanır) → `(tabs)`. Adım göstergesi (üstte 3 nokta) her ekranda ilerlemeyi
gösterir. Görsel referans: `fluu-auth-concept.html`.

## Bileşen gereksinimleri

### Onboarding (kayıt sonrası)

- **Adım göstergesi:** her ekranda üstte küçük nokta dizisi, kaç adım kaldığını gösterir
- **Profil fotoğrafı:** dairesel yükleme alanı + kamera rozeti, `expo-image-picker` ile
  galeriden seçim, aynı sıkıştırma kuralları (`FRONTEND.md` medya bölümü) geçerli. **Atlanabilir**
  — anonimlik odaklı bir uygulamada fotoğrafı zorunlu tutmak pozisyonlamamızla çelişir
- **Kişisel bilgiler:** görünen ad, **kullanıcı adı** (benzersiz — yazarken `/users/check-username`
  ile anlık kontrol, uygunsa yeşil tik gösterilir, alınmışsa kayıt tamamlanamaz), doğum tarihi,
  cinsiyet (chip/segmented seçim — dropdown değil, tek dokunuşla seçilebilir), ülke/şehir. Yaş/
  cinsiyet/ülke zorunlu çünkü Keşfet filtreleri doğrudan buna bağlı. Doğum tarihinden hesaplanan
  yaş 18'in altındaysa kayıt tamamlanamaz (18+ gate burada uygulanır, backend'de de ayrıca
  doğrulanır). **Görünen ad ile kullanıcı adı farklı şeyler** — görünen ad tekrar edebilir ve
  istenildiği zaman değiştirilebilir, kullanıcı adı benzersiz kalır ve profil bağlantısı/kimlik
  amaçlı kullanılır

### Filtre paneli (Keşfet + yeni sohbet başlatma akışı)

Aynı bileşen iki yerde kullanılır: ülke, cinsiyet, yaş aralığı (slider), sıralama (en yeni/en
eski). Sıralama artık ayrı bir üst bar değil, filtre panelinin içinde.

### Hikaye kartı (Keşfet grid)

- Kart tamamen görsel — **hiç metin yok**, ne isim ne yaş/şehir ne görüntülenme sayısı kartın
  üzerinde gösterilmez
- Sol üstte paylaşan kişinin profil fotoğrafı (küçük halka), sağ üstte 3 nokta menüsü
  (şikayet paneli — bkz. "Şikayet" bileşeni)

### Hikaye viewer

- 24 saatlik TTL'i gösteren ince ilerleme çubuğu
- Üst header: profil fotoğrafı + **kullanıcı adı** + paylaşım zamanı ("2sa") — bu alan
  tıklanınca o kullanıcının profiline gidilir (`/users/:username`). Bu, izleyicinin kimliğini
  gizleme kuralıyla çelişmez — burada gösterilen story'i **paylaşanın** kendi seçtiği kullanıcı
  adı, "kim izledi" bilgisi hâlâ hiçbir yerde yok
- Sağ üstte 3 nokta (şikayet) ve kapat butonu
- Alt kısımda iki yanıt yolu aynı anda görünür: emoji ile hızlı tepki satırı VE serbest metin
  yazabileceği bir mesaj input'u — ikisi de sohbete düşer

### Sohbet listesi

- Sabitlenmiş sohbetler üstte, **maksimum 5** — 6.'yı eklerken kullanıcıya seçim yaptır
- Her satırda **son mesaj önizlemesi** ve **okunmamış mesaj sayısı** (rozet) gösterilir —
  ikisi de backend'de denormalize tutulur (`chats.last_message_preview`,
  `chat_participants.unread_count`), sohbeti açtığında rozet sıfırlanır
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
- Mesaj silme iki seçenekli: **benden sil** (sadece kendi görünümünden kalkar) / **herkesten
  sil** (karşı tarafta da "Bu mesaj silindi" olarak görünür) — uzun basınca çıkan menüden
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
