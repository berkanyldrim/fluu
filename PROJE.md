# Fluu — Proje Dokümanı

## Nedir

Fluu, anonim sohbet ve hikaye paylaşımı üzerine kurulu bir sosyal platform. connected2.me'nin
"yabancılarla anonim sohbet" konseptini alıp, güven ve şeffaflık odaklı bir alternatif olarak
konumlandırıyoruz. Türkiye pazarı için Türkçe-öncelikli geliştiriliyor.

## Neden farklı olacağız

connected2.me kullanıcı yorumlarında öne çıkan iki zayıf nokta üzerinden konumlanıyoruz:

1. **Şeffaf moderasyon** — ban sebebi kullanıcıya açık gösterilir, itiraz ücretsizdir.
   connected2'de en sık şikayet konusu haksız banlama + itiraz için ücret talep edilmesiydi.
2. **Adil monetization** — aylık abonelik + kozmetik IAP. "Öne çıkmak için öde" (boost/plus
   üyelik) sistemi yok.
3. **Sade, klişe olmayan tasarım** — gradyan yok, düz/solid renkler, kendine özgü tipografi.
   (Tek istisna: logonun kendisindeki "w" harfi — bkz. Marka kimliği.)

Sohbet konsepti connected2 gibi genel/açık kalıyor — belirli bir temaya (itiraf, ilgi alanı vb.)
kilitlenmiyoruz.

## Marka kimliği

| Öğe | Değer |
|---|---|
| İsim | **Fluu** |
| UI fontu | Nunito (variable, 200–1000 ağırlık) — başlık, body, buton, form, chat metni. Logonun yuvarlak/sıcak karakteriyle uyumlu olduğu için auth ekranlarından tüm uygulamaya taşındı, Türkçe destekli |
| Logo | Hazır marka varlığı — `fluu-logo-light.png` / `fluu-logo-dark.png`. Özel çizilmiş "flw" bitişik logotype, küçük bir nokta aksanı ile. Artık font/monogram tasarımı yapılmıyor, bu dosyalar nihai. |
| Renk mantığı | Logodan çıkarılan iki ana renk: lacivert ve mavi. Arayüzün geneli düz/solid renk, **logonun kendisi hariç** — "w" harfinde lacivertten maviye geçen bir gradyan var, bu bilinçli bir marka istisnası, UI'nin geri kalanına yayılmaz. |

### Renk paleti — Açık tema

| Token | Değer | Not |
|---|---|---|
| `primary` | `#0297FE` | logodaki mavi, piksel örneklemeyle doğrulandı |
| `primary-dark` | `#021744` | logodaki lacivert — pressed/hover durumları |
| `ink` | `#021744` | açık zeminde metin — logoda "f"/"l" harflerinin rengiyle aynı |
| `muted` | `#5C6B84` | lacivertin açık/desatüre versiyonu |
| `background` | `#FAFAFA` | logonun açık varyantındaki gerçek zemin rengi |
| `surface` | `#FFFFFF` | |
| `border` | `#E3E7ED` | |
| `soft-blue` | `#E8F4FE` | |
| `error` | `#BF292E` | marka renginden bağımsız, değişmedi |

### Renk paleti — Koyu tema (zorunlu, class tabanlı `.dark`)

| Token | Değer | Not |
|---|---|---|
| `background` | `#000000` | tamamen siyah — logonun kendi lacivert rozet zemininden bağımsız, bu ekran arka planı |
| `surface` | `#0D1117` | siyahtan hafif ayrışan kart zemini |
| `surface-elevated` | `#161B22` | |
| `primary` | `#0297FE` | |
| `primary-hover` | `#4FC3FF` | koyu zeminde daha iyi kontrast için |
| `text` | `#FFFFFF` | |
| `muted` | `#8CA0C4` | |
| `border` | `#22272E` | |

Koyu tema renkleri açık temanın basit tersine çevrilmesiyle üretilmez, yukarıdaki kısıtlı token
seti kullanılır. `primary` değeri doğrudan `fluu-logo-dark.png`'den piksel örneklemesiyle
alındı, tahmini değil. `background` ise logonun kendi rozet zemininden (`#021744`, sadece app
icon içinde geçerli) bilerek ayrıştırıldı — uygulama arayüzünün koyu teması tamamen siyah.

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
- Sohbet geçmişi, her satırda son mesaj önizlemesi ve okunmamış mesaj rozeti
- Sohbet sabitleme — **maksimum 5**
- Sessize alma (mute)
- Mesaj silme: benden sil / herkesten sil (iki ayrı seçenek)
- Sohbet silme/arşivleme
- Karşı taraf varsayılan olarak anonim bir handle ile görünür (örn. "anonim123") — profil bilgisi
  paylaşılmadığı sürece gerçek kullanıcı adı/fotoğrafı gösterilmez
- Engelleme ve şikayet etme — her sohbette zorunlu, **karşı tarafın profiline gitmeye gerek
  kalmadan doğrudan sohbet ekranından çalışır**. Engelleme her zaman gerçek hesaba (user_id)
  uygulanır, o an ekranda görünen anonim handle'a değil. Engellenen taraf karşı tarafın gerçek
  profilini bir daha göremez, sadece jenerik bilgi görür
- "Yazıyor..." göstergesi
- "Görüldü" bilgisini açıp kapatabilme (gizlilik kontrolü kullanıcıda)
- Medya paylaşımı: foto, video, sesli mesaj (bkz. medya limitleri)
- Yeni sohbet başlatmak için Keşfet ile aynı filtreleme mantığı

### Profil
- **Kullanıcı adı** (benzersiz, kayıtta belirlenir) ve **görünen ad** (değiştirilebilir, tekrar
  edebilir) — ikisi ayrı alanlar. Kullanıcı adı profil bağlantısı/kimlik için, hikaye
  görüntüleyicide ve profilde görünür ve tıklanabilir
- Profil fotoğrafı yükleme
- Biyografi
- Yaş, cinsiyet, ülke/şehir (Keşfet filtreleri buna bağlı)
- İlgi alanı/etiket sistemi
- Takipçi/takip sayısı
- Şifre değiştirme
- Çıkış yapma
- Hesap silme / dondurma — silme aslında **anonymize**'dır (veriler temizlenir, satır kalır),
  çünkü mesajların karşı taraftaki sohbet geçmişi buna bağlı; dondurma geri dönülebilir bir
  askıya alma
- Engellenen kullanıcılar listesi
- Bildirim tercihleri
- Fotoğraf doğrulama rozeti

## Güvenlik & moderasyon ilkeleri

Detaylı liste `BACKEND.md`'de. Öne çıkan zorunluluklar:

- 18+ yaş onboarding gate
- E-posta doğrulama zorunlu — OTP ile doğrulanmadan ana uygulamaya erişim yok
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
Shuffle/rastgele eşleştirme, reaksiyonlar, Fluu Plus (aylık abonelik), otomatik moderasyon

## İlgili dokümanlar

- `FRONTEND.md` — React Native/Expo mimarisi, tasarım sistemi, bileşenler
- `BACKEND.md` — API, veritabanı, güvenlik, performans, medya pipeline
- `PROJE_KURALLARI.md` — kodlama ve commit kuralları
