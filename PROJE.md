# Fluu — Proje Dokümanı

## Nedir

Fluu, anonim sohbet ve hikaye paylaşımı üzerine kurulu bir sosyal platform. connected2.me'nin
"yabancılarla anonim sohbet" konseptini alıp, güven ve şeffaflık odaklı bir alternatif olarak
konumlandırıyoruz. Türkiye pazarı için Türkçe-öncelikli geliştiriliyor.

## Neden farklı olacağız

connected2.me kullanıcı yorumlarında öne çıkan zayıf noktalar üzerinden konumlanıyoruz:

1. **Şeffaf moderasyon** — ban sebebi kullanıcıya açık gösterilir, itiraz ücretsizdir.
   connected2'de en sık şikayet konusu haksız banlama + itiraz için ücret talep edilmesiydi.
2. **Gerçek profil, kontrollü anonimlik** — connected2'de tam anonimlik güven sıfırlıyor
   (sahte hesap/bot şüphesi yüksek). Fluu'da herkesin gerçek, fotoğraflı bir profili var;
   sohbette görünen isim yine de her zaman anonim bir handle'dır (ör. "anonim123"). Kullanıcı
   isterse kendi profil linkini mesaj olarak paylaşır, sistem bunun gerçekten o kişiye ait
   olduğunu doğrular ve "✓ Doğrulanmış Profil" rozeti gösterir — zorla kimlik açma yok, ama
   paylaşmak isteyen için sahtecilik riski olmadan bir yol var (bkz. "Profil linki doğrulama").
3. **Öne çıkma isteğe bağlı, temel kullanımı kısıtlamıyor** — Boost (Shuffle'da geçici öne
   çıkma) satın alınabilir bir özellik, ama hiçbir temel işlev (sohbet başlatma, mesajlaşma,
   hikaye paylaşma) buna bağlı değil. connected2'deki gibi "öne çıkmadan kimse seni görmüyor"
   modeli değil — Shuffle'da herkes zaten görünür, boost sadece sırayı öne alır.
4. **Sade, klişe olmayan tasarım** — gradyan yok, düz/solid renkler, kendine özgü tipografi.
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

Alt navigasyon 5 sekme: **Hikayeler**, **Shuffle**, **Sohbet Bul** (ortada, öne çıkan/parlak
buton — uygulamanın çekirdek eylemi), **Ana Sayfa** (Sohbetlerim), **Profil**.

### Hikayeler
- Grid/liste görünümü, tüm kullanıcıların aktif hikayeleri tek akışta
- **Sıralama tamamen karışık/rastgele** — tarih sırası yok, "yeniden eskiye" gibi bir kronoloji
  uygulanmaz, kadın-erkek de karışık listelenir
- 24 saatte otomatik silinir (TTL) — bir hikaye son saatine kadar (ör. 23. saat) hâlâ akışta
  çıkabilir, süre dolunca API listelemede filtrelenir (`expires_at > now()`), gerçek silme
  arka planda periyodik job ile yapılır (bkz. `BACKEND.md`)
- Foto (max 15sn video, bkz. medya limitleri)
- **Görüntülenme sayısı** gösterilir, kim baktığı gösterilmez — uygulama anonim olduğu için
  izleyici kimliği hiçbir yerde ifşa edilmez, sadece toplam sayı (örn. "119 görüntülenme")
- Hikayeye yanıt — otomatik sohbete düşer
- Filtre: ülke, cinsiyet, yaş aralığı — **mesafe filtresi yok**, tarih/sıralama filtresi yok
  (zaten karışık). Filtre paneli premium duvarının arkasında (bkz. "Fluu Plus")

### Shuffle
- Grid/liste görünümü, aynı anda 30 kişilik bir profil havuzu gösterilir, **kadın-erkek karışık**
- Sıralama: önce **çevrimiçi olanlar**, ardından geri kalanlar **son görülme zamanına göre**
  (en son görülen en üstte) — havuzun kendisi rastgele seçilir, gösterim sırası bu mantıkla
- Kart içeriği: profil fotoğrafı, isim + yaş, 2-3 etiket, kısa bio; hikayesi varsa fotoğraf
  etrafında story ring (tıklanınca tam ekran hikaye açılır)
- Karta tıklayınca profil detay sayfası: **Takip Et** (tek taraflı, Instagram mantığı — sadece
  Ana Sayfa'daki hikaye şeridi için kullanılır, başka bir işlevi yok) ve **Sohbet Başlat**
  butonları
- Shuffle'dan başlatılan sohbetlerde **mesaj sayısı sınırı yok** (Sohbet Bul'un aksine)
- Filtre: ülke, cinsiyet, yaş aralığı — premium duvarının arkasında
- **Boost:** Premium kullanıcı ya da tek seferlik boost satın alan kullanıcı, belirli bir süre
  boyunca (ör. 1 saat) Shuffle havuzunda daha sık/öncelikli gösterilir (görsel olarak da ince
  bir ışıltılı çerçeve ile ayrılır). Boost olmayan kullanıcılar da havuzda normal şekilde
  görünmeye devam eder — boost bir "öncelik" satın alma, "görünürlük" satın alma değil

### Sohbet Bul
- Otomatik/algoritmik eşleştirme — kullanıcı butona basar, sistem uygun birini bulur ve sohbet
  ekranına düşürür
- **Cinsiyet mantığı:** varsayılan olarak kullanıcıya **karşı cinsiyetten** biri eşleştirilir
  (Erkek→Kadın, Kadın→Erkek); kullanıcı kayıtta cinsiyetini "Diğer" seçtiyse karışık (her iki
  cinsiyetten) eşleştirme yapılır
- **Limit:** Free kullanıcı **haftada 5 eşleştirme hakkı**, Premium kullanıcı sınırsız. Limit
  dolunca "Premium'a geç, sınırsız eşleş" ekranı çıkar
- Shuffle'dan farklı olarak burada kullanıcı kimle eşleşeceğini seçmiyor, sistem seçiyor

### Ana Sayfa (Sohbetlerim)
- En üstte yatay bir şerit: **takip edilen kullanıcıların avatarları**, aktif hikayesi olan
  varsa story ring ile ayırt edilir, tıklanınca hikaye izlenir (Instagram mantığı)
- Altında sohbet listesi — **kaynak fark etmeksizin** (Shuffle'dan başlatılan + Sohbet Bul'dan
  gelen) tüm sohbetler tek listede birleşir
- Her satırda son mesaj önizlemesi ve okunmamış mesaj rozeti
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
- Medya paylaşımı: foto, video, sesli mesaj (bkz. medya limitleri ve "Tek gösterimlik medya")

### Profil linki doğrulama
- Kullanıcı sohbette kendi profil linkini (ör. `fluu.app/u/beko123`) mesaj olarak paylaşabilir
- Sistem linki algılar, önizleme kartı olarak render eder (tıklanabilir)
- Linkteki kullanıcı adı, **mesajı gönderenin kendi kullanıcı adıyla** eşleşiyorsa kart üzerinde
  **"✓ Doğrulanmış Profil"** rozeti çıkar — bu, "bu gerçekten benim profilim" garantisi verir
- Eşleşmiyorsa (biri başkasının linkini paylaşırsa) rozet çıkmaz, küçük bir uyarı notu gösterilir
  ("Bu link gönderen kişiye ait değil") — catfishing/başkasının profilini kendininmiş gibi
  paylaşmayı caydırır
- Fluu dışı bir link (WhatsApp, Instagram, dış site vb.) paylaşımı engellenir/rapor bayrağı
  yükseltir — dış platforma yönlendirme anonim sohbet uygulamalarında yaygın bir suistimal
  yöntemi, MVP'den itibaren engellenmeli

### Tek gösterimlik medya
- Sohbette fotoğraf/video gönderirken kullanıcı **normal** ya da **tek gösterimlik** seçebilir
- Tek gösterimlikte karşı taraf bir kez açar, kapatınca kaybolur, "görüntülendi" durumu görünür
- Sesli mesaj her zaman kalıcı, tek dinlemelik seçeneği yok
- Foto/video mesaj balonunda kaynağı belirten küçük bir ikon var (📷 kamera / 🖼️ galeri) — sadece
  bilgi amaçlı, işlevsel bir sonucu yok

### Ekran görüntüsü bildirimi
- Hiçbir platformda ekran görüntüsü **engellenmiyor** — bu teknik olarak iOS'ta zaten mümkün
  değil (Apple üçüncü parti uygulamalara bu yetkiyi vermiyor), Android'de mümkün olsa da
  platformlar arası tutarlılık için ikisinde de aynı davranış tercih edildi
- Bunun yerine: biri sohbette (özellikle tek gösterimlik medyada) ekran görüntüsü aldığında
  karşı tarafa anlık bildirim gider ("anonim123 ekran görüntüsü aldı") — caydırıcı, davranışsal
  bir çözüm

### Profil
- **Kullanıcı adı** (benzersiz, kayıtta belirlenir) ve **isim, soyisim** (değiştirilebilir) —
  ayrı alanlar. Kullanıcı adı profil bağlantısı/kimlik için, hikaye görüntüleyicide ve profilde
  görünür ve tıklanabilir
- Profil fotoğrafı yükleme
- Biyografi
- Yaş, cinsiyet, ülke/şehir (Hikayeler/Shuffle filtreleri ve Sohbet Bul eşleştirme mantığı
  buna bağlı) — ülke Türkiye dışındaysa şehir alanı boş bırakılır (yalnızca Türkiye için il
  listesi sunuluyor)
- İlgi alanı/etiket sistemi
- Takipçi/takip sayısı
- Şifre değiştirme
- Çıkış yapma
- Hesap silme / dondurma — silme aslında **anonymize**'dır (veriler temizlenir, satır kalır),
  çünkü mesajların karşı taraftaki sohbet geçmişi buna bağlı; dondurma geri dönülebilir bir
  askıya alma
- Engellenen kullanıcılar listesi
- Bildirim tercihleri
- Fotoğraf doğrulama rozeti — bu, "Profil linki doğrulama" bölümündeki sohbet-içi
  "✓ Doğrulanmış Profil" rozetinden **farklı bir mekanizma**: kullanıcı burada bir selfie
  doğrulaması yapar (`is_verified`, profilde kalıcı görünür), diğeri ise link paylaşıldığı anda
  otomatik kontrol edilen, sohbete özel bir rozettir. İkisi birbirinden bağımsız çalışır

## Güvenlik & moderasyon ilkeleri

Detaylı liste `BACKEND.md`'de. Öne çıkan zorunluluklar:

- 18+ yaş onboarding gate
- E-posta doğrulama zorunlu — OTP ile doğrulanmadan ana uygulamaya erişim yok
- Görsel/video moderasyonu (otomatik NSFW/CSAM tarama)
- Her sohbette engelleme + şikayet mekanizması
- Mesajlarda spam önleme (rate limiting, flood/tekrar tespiti — detay `BACKEND.md`'de)
- Dış platforma yönlendiren link paylaşımı engellenir/rapor bayrağı yükseltir (bkz. "Profil
  linki doğrulama")
- Ekran görüntüsü alındığında karşı tarafa bildirim (engelleme değil, tespit — teknik gerekçe
  `FRONTEND.md`'de)
- KVKK uyumu — hassas veri (yaş, cinsiyet, konum) Türkiye/AB'de barındırılır
- Kullanım Koşulları + Topluluk Kuralları

## Medya limitleri (özet)

| Medya | Bağlam | Süre/çözünürlük | Hard cap | Tek gösterimlik |
|---|---|---|---|---|
| Fotoğraf | Hikaye + Sohbet | Uzun kenar max 1920px | 5MB | Sohbette opsiyonel |
| Video | Hikaye | 15sn, 720p | 15MB | — |
| Video | Sohbet | 60sn, 720p | 20MB | Opsiyonel |
| Ses | Sohbet | 2dk, Opus/AAC | 3MB | Yok, her zaman kalıcı |

Detaylı gerekçe ve enforcement mantığı `BACKEND.md`'de.

## Fluu Plus (Premium)

**Paketler:** Haftalık ve aylık abonelik (aylık, haftalığa göre indirimli fiyatlanır — dönüşüm
oranını artırır). Bunlardan bağımsız, tek seferlik **süreli Boost** mikro ödemesi de var
(premium olmayan kullanıcı da satın alabilir).

| Özellik | Free | Premium |
|---|---|---|
| Shuffle gezinme | Sınırsız | Sınırsız |
| Sohbet Bul eşleştirme | Haftada 5 | Sınırsız |
| Hikayeler/Shuffle filtreleri (ülke, cinsiyet, yaş) | Kilitli (paywall) | Açık |
| Shuffle'da öne çıkma | Yok (Boost ile tek seferlik satın alınabilir) | Dahil |

Free kullanıcı filtre ikonuna dokununca premium teklif ekranı çıkar. Shuffle ve Sohbet Bul'un
farklı kısıtlanma mantığı bilinçli: Shuffle bir keşif/gezinme özelliği olduğu için sınırsız
kalıyor, Sohbet Bul ise sistemin otomatik eşleştirdiği, dolayısıyla değerli bir kaynak olan bir
özellik olduğu için haftalık limitli. (Not: bu tasarımda free kullanıcı teorik olarak hep
Shuffle üzerinden gezip Sohbet Bul'u hiç kullanmayabilir — bu bilinçli bir trade-off, MVP
sonrası kullanım verisiyle gözden geçirilebilir.)

## Teknoloji özeti

- **Frontend:** React Native + Expo + TypeScript — bkz. `FRONTEND.md`
- **Backend:** Kendi yazdığımız Node.js backend + PostgreSQL + Socket.io + Redis + Cloudflare R2
  (Supabase/Firebase kullanılmıyor — tam kontrol ve KVKK pozisyonu için) — bkz. `BACKEND.md`
- Tek backend hem sosyal özellikleri (REST) hem realtime mesajlaşmayı (WebSocket) karşılar

## Yol haritası

**Faz 1 — MVP**
Kayıt/profil, hikaye paylaş+görüntüle (filtresiz, karışık sıralama), Shuffle (filtresiz,
sınırsız), temel 1-1 sohbet, engelleme/şikayet, ekran görüntüsü bildirimi

**Faz 2**
Sohbet Bul (otomatik eşleştirme + haftalık limit), takip sistemi, hikayede takip edilenlerin öne
çıkması, sabitleme, profil linki doğrulama

**Faz 3**
Hikayeler/Shuffle filtreleri (ülke/cinsiyet/yaş), tek gösterimlik medya, Fluu Plus (haftalık +
aylık abonelik), Boost mikro ödemesi, otomatik moderasyon

## İlgili dokümanlar

- `RUNNING.md` — projeyi yerelde çalıştırma (backend + frontend, adım adım)
- `FRONTEND.md` — React Native/Expo mimarisi, tasarım sistemi, bileşenler
- `BACKEND.md` — API, veritabanı, güvenlik, performans, medya pipeline
- `PROJE_KURALLARI.md` — kodlama ve commit kuralları
