# Nomi — Proje Kuralları

## Dil

- Tüm kod, dosya adları, değişken/fonksiyon isimleri, yorum satırları ve commit mesajları
  **İngilizce**.
- Marka ismi (**Nomi**) ve kullanıcıya gösterilen UI metinleri Türkçe kalır — bunlar i18n
  dosyalarında tutulur, kod içinde hardcode edilmez.
- Commit mesajları [Conventional Commits](https://www.conventionalcommits.org/) formatında:
  `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `security:` vb.

## Yorum satırları

- AI tarafından üretilmiş, açıklayıcı olmayan yorum satırları (`// TODO: implement this`,
  `// this function does X` gibi kodun zaten söylediğini tekrar eden satırlar) eklenmez.
- Yorum sadece kodun **neden** o şekilde yazıldığını açıklamak gerektiğinde kullanılır (ör. bir
  güvenlik kararının veya performans trade-off'unun gerekçesi).

## Güvenlik — pazarlık konusu olmayan kurallar

- `.env` dosyaları asla commit edilmez; `.env.example` şablonu tutulur, gerçek değerler boş
  bırakılır.
- Client'tan gelen hiçbir veri doğrulanmadan kullanılmaz (her endpoint'te şema doğrulama
  zorunlu).
- Ham SQL string concatenation yasak — ORM (Prisma/Drizzle) üzerinden parametreli sorgu.
- Yeni bir endpoint eklerken hem auth (giriş yapmış mı) hem authorization (bu kaynağa erişim
  yetkisi var mı) kontrolü ayrı ayrı yazılmadan PR açılmaz.
- Bağımlılık eklemeden önce `npm audit` kontrolü yapılır.

Detaylı güvenlik ve performans gereksinimleri için `BACKEND.md`.

## Commit / PR süreci

- Her PR tek bir amaca hizmet eder (bir özellik veya bir düzeltme), karışık PR'lardan kaçınılır.
- Medya/upload, auth veya izin (authorization) mantığına dokunan her PR açıklamasında hangi
  güvenlik kontrolünün eklendiği/değiştiği belirtilir.
- Breaking değişiklikler (DB şema, API sözleşmesi) PR başlığında `BREAKING:` ile işaretlenir.

## Dosya organizasyonu

- Frontend ve backend ayrı repo/paket olarak tutulur, ortak tipler (API sözleşmesi) paylaşılan
  bir `types` paketinde tanımlanır.
- Marka varlıkları (`nomi-mark.svg`, favicon boyut serisi, renk/tipografi tokenleri)
  `design/` klasöründe tek kaynak olarak tutulur, frontend bu değerleri import eder — renk/font
  değerleri koda elle kopyalanmaz.

## İlgili dokümanlar

- `PROJE.md` — genel bakış, özellikler, yol haritası
- `FRONTEND.md` — React Native/Expo mimarisi, tasarım sistemi
- `BACKEND.md` — API, veritabanı, güvenlik, performans
