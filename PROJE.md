# Nomi — Proje Dokümanı

## Nedir

Nomi, anonim sohbet ve hikaye paylaşımı üzerine kurulu bir sosyal platform. connected2.me'nin
"yabancılarla anonim sohbet" konseptini alıp, güven ve şeffaflık odaklı bir alternatif olarak
konumlandırıyoruz. Türkiye pazarı için Türkçe-öncelikli geliştiriliyor.

## Neden farklı olacağız

connected2.me kullanıcı yorumlarında öne çıkan iki zayıf nokta üzerinden konumlanıyoruz:

1. **Şeffaf moderasyon** — ban sebebi kullanıcıya açık gösterilir, itiraz ücretsizdir.
   connected2'de en sık şikayet konusu haksız banlama + itiraz için ücret talep edilmesiydi.
2. **Adil monetization** — aylık abonelik + kozmetik IAP. "Öne çıkmak için öde" (boost/plus
   üyelik) sistemi yok.
3. **Sade, klişe olmayan tasarım** — gradyan yok, düz/solid renkler, kendine özgü tipografi.

Sohbet konsepti connected2 gibi genel/açık kalıyor — belirli bir temaya (itiraf, ilgi alanı vb.)
kilitlenmiyoruz.

## Marka kimliği

| Öğe | Değer |
|---|---|
| İsim | **Nomi** |
| UI fontu | JetBrains Mono (variable, 100–800 ağırlık) — başlık, body, buton, form, chat metni |
| Wordmark fontu | Archivo Black — sadece logo/marka yazısında. JetBrains Mono logotype'ta sıkışık/mekanik durdu, Space Grotesk ise çok ince kaldı; Archivo Black tek ağırlıklı, kalın/dolgun bir headline fontu olduğu için bu belirsizlik ortadan kalkıyor |
| Logo | Geometrik "N" monogramı — iki dikey kol + çapraz kol, çaprazın orta noktasında (y=12) baklava aksan. Kulis konseptinden taşınan imza şekil. `skewX(-8)` ile hafif dinamik eğim. |
| Renk mantığı | Düz/solid renkler, **gradyan yok** |

### Renk paleti — Açık tema

| Token | Değer |
|---|---|
| `primary` | `#1768E3` |
| `primary-dark` | `#0E4A9E` |
| `ink` | `#0E171F` |
| `muted` | `#616D70` |
| `background` | `#F6F8F7` |
| `surface` | `#FFFFFF` |
| `border` | `#DBE0DE` |
| `soft-blue` | `#E6F0FB` |
| `error` | `#BF292E` |

### Renk paleti — Koyu tema (zorunlu, class tabanlı `.dark`)

| Token | Değer |
|---|---|
| `background` | `#0E171F` |
| `surface` | `#142129` |
| `surface-elevated` | `#192A33` |
| `primary` | `#1768E3` |
| `primary-hover` | `#3C87F5` |
| `text` | `#F4F7F6` |
| `muted` | `#9AA7A8` |
| `border` | `#29383E` |

Koyu tema renkleri açık temanın basit tersine çevrilmesiyle üretilmez, yukarıdaki kısıtlı token
seti kullanılır.

## Hedef kitle

Türkiye. Dil olarak şimdilik **Türkçe ve İngilizce**, i18n mimarisi ileride başka dillere
açılabilecek şekilde kurulur.

## Temel özellikler

### Keşfet
- Tüm kullanıcıların hikayeleri tek akışta
- Filtre: ülke, cinsiyet, yaş aralığı, tarih (yeniden eskiye)
- Kullanıcı keşfi (sadece hikaye değil, profil kartları da)
- Shuffle / rastgele eşleştirme
- Online durumu göstergesi
- Hikaye etkileşimi: görüntülenme sayısı, emoji reaksiyon
- Kullanıcı adı arama

### Hikaye
- 24 saatte otomatik silinir (TTL)
- Foto (max 15sn video, bkz. medya limitleri)
- **Görüntülenme sayısı** gösterilir, kim baktığı gösterilmez — uygulama anonim olduğu için
  izleyici kimliği hiçbir yerde ifşa edilmez, sadece toplam sayı (örn. "119 görüntülenme")
- Hikayeye yanıt — otomatik sohbete düşer
- Takip edilenlerin hikayesi Sohbetlerim'de en üstte çıkar (Instagram mantığı)

### Sohbetlerim
- Sohbet geçmişi
- Sohbet sabitleme — **maksimum 5**
- Sessize alma (mute)
- Sohbet silme/arşivleme
- Karşı taraf varsayılan olarak anonim bir handle ile görünür (örn. "anonim123") — profil bilgisi
  paylaşılmadığı sürece gerçek kullanıcı adı/fotoğrafı gösterilmez
- Engelleme ve şikayet etme — her sohbette zorunlu, **karşı tarafın profiline gitmeye gerek
  kalmadan doğrudan sohbet ekranından çalışır**. Engelleme her zaman gerçek hesaba (user_id)
  uygulanır, o an ekranda görünen anonim handle'a değil
- "Yazıyor..." göstergesi
- "Görüldü" bilgisini açıp kapatabilme (gizlilik kontrolü kullanıcıda)
- Medya paylaşımı: foto, video, sesli mesaj (bkz. medya limitleri)
- Yeni sohbet başlatmak için Keşfet ile aynı filtreleme mantığı

### Profil
- Profil fotoğrafı yükleme
- Biyografi
- Yaş, cinsiyet, ülke/şehir (Keşfet filtreleri buna bağlı)
- İlgi alanı/etiket sistemi
- Takipçi/takip sayısı
- Şifre değiştirme
- Çıkış yapma
- Hesap silme / dondurma
- Engellenen kullanıcılar listesi
- Bildirim tercihleri
- Fotoğraf doğrulama rozeti

## Güvenlik & moderasyon ilkeleri

Detaylı liste `BACKEND.md`'de. Öne çıkan zorunluluklar:

- 18+ yaş onboarding gate
- Görsel/video moderasyonu (otomatik NSFW/CSAM tarama)
- Her sohbette engelleme + şikayet mekanizması
- Mesajlarda spam önleme (rate limiting, flood/tekrar tespiti — detay `BACKEND.md`'de)
- KVKK uyumu — hassas veri (yaş, cinsiyet, konum) Türkiye/AB'de barındırılır
- Kullanım Koşulları + Topluluk Kuralları

## Medya limitleri (özet)

| Medya | Bağlam | Süre/çözünürlük | Hard cap |
|---|---|---|---|
| Fotoğraf | Hikaye + Sohbet | Uzun kenar max 1920px | 5MB |
| Video | Hikaye | 15sn, 720p | 15MB |
| Video | Sohbet | 60sn, 720p | 20MB |
| Ses | Sohbet | 2dk, Opus/AAC | 3MB |

Detaylı gerekçe ve enforcement mantığı `BACKEND.md`'de.

## Teknoloji özeti

- **Frontend:** React Native + Expo + TypeScript — bkz. `FRONTEND.md`
- **Backend:** Kendi yazdığımız Node.js backend + PostgreSQL + Socket.io + Redis + Cloudflare R2
  (Supabase/Firebase kullanılmıyor — tam kontrol ve KVKK pozisyonu için) — bkz. `BACKEND.md`
- Tek backend hem sosyal özellikleri (REST) hem realtime mesajlaşmayı (WebSocket) karşılar

## Yol haritası

**Faz 1 — MVP**
Kayıt/profil, hikaye paylaş+görüntüle (filtresiz), temel 1-1 sohbet, engelleme/şikayet

**Faz 2**
Filtreler (ülke/cinsiyet/yaş/tarih), sabitleme, takip sistemi, hikayede takip edilenlerin öne
çıkması

**Faz 3**
Shuffle/rastgele eşleştirme, reaksiyonlar, Nomi Plus (aylık abonelik), otomatik moderasyon

## İlgili dokümanlar

- `FRONTEND.md` — React Native/Expo mimarisi, tasarım sistemi, bileşenler
- `BACKEND.md` — API, veritabanı, güvenlik, performans, medya pipeline
- `PROJE_KURALLARI.md` — kodlama ve commit kuralları
