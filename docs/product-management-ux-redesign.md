# Product Management UX Redesign

Bu dokuman mevcut urun yonetimi ekranini yeni ozellik eklemeden daha anlasilir, hizli ve hataya kapali hale getirmek icin hazirlandi. Inceleme `ProductFormPage` sekme mimarisi, `GeneralInfoTab`, `PriceMatrix`, `ProductPricingRulesPanel`, `VariantBuilder`, `InventoryTab`, `MediaUploadManager`, `CategoryTreeSelector` ve `AttributeSelector` uzerinden yapildi.

## Ana Teshis

Mevcut ekran kullanici niyetinden cok veri modelini gosteriyor. Kullanici "urunumu yayina hazirla" demek isterken sekmeler arasinda `Genel Bilgi`, `Profil`, `Kategoriler`, `Ozellikler`, `Medya`, `Fiyatlar`, `Fiyat Parametreleri`, `Stok`, `Stok Islemleri` gibi parcalara bolunuyor. Bu guclu ama agir bir deneyim.

Ideal mimari:

- Sol: urun calisma alani.
- Sag: canli onizleme ve yayina hazirlik kontrol listesi.
- Ust: otomatik kayit, durum, hizli komutlar.
- Icerik: "Basla", "Satisa hazirla", "Detaylari zenginlestir", "Gelismis" seklinde progressive disclosure.

```
+--------------------------------------------------------------------+
| Ust bar: Urun adi        Taslak kaydedildi       Yayina al         |
+----------------------------------------------+---------------------+
| Basla                                        | Onizleme            |
| [Ad] [Tip] [Marka] [Kategori ara]            | Kart / satis hali   |
|                                              | Eksikler            |
| Satisa hazirla                               | - fiyat yok         |
| [Temel fiyat] [Stok] [Medya surukle-birak]   | - kapak yok         |
|                                              |                     |
| Detaylari zenginlestir                       | Hizli islemler      |
| [Varyantlar] [Ozellikler] [Dinamik kurallar] | Kopyala, Arsivle    |
|                                              |                     |
| Gelismis ayarlar                             |                     |
| [Vergi] [Kargo] [API/XML] [Metadata]         |                     |
+----------------------------------------------+---------------------+
```

## Urun Bilgileri

### Mevcut Sorun

Zorunlu ve nadir alanlar ayni seviyede. `productCode`, `name`, `currency`, `kind`, `status`, `brand`, `manufacturer`, `barcode`, vergi, etiket, metadata ve satis ayarlari tek formda gorunuyor. Bu, yeni kullanicinin ilk karari "hangi alandan baslayayim?" sorusuna ceviriyor.

### Daha Iyi Cozum

Ilk ekranda sadece karar verdiren alanlar gorunsun: urun adi, urun tipi, marka, kategori, durum. SKU ve barkod otomatik onerilsin; kullanici isterse duzenlesin. Vergi, metadata, etiket, satin alinabilir/satilabilir gibi ayarlar "Gelismis" altinda kalsin. Aciklama alanlari Notion tarzi inline editor olsun: baslik altinda direkt yaz, autosave calissin.

### Neden Daha Iyi?

Kullanici once urunu zihninde tanimlar, teknik kimlik sonra gelir. Akilli varsayilanlar ve otomatik SKU hata riskini azaltir. Progressive disclosure ilk temas maliyetini dusurur.

### Wireframe

```
+------------------------------+
| Urun adi *                   |
| [__________________________] |
| Tip       Durum              |
| [Fiziksel v] [Taslak v]      |
| Marka     Kategori           |
| [Ara/sec] [Kategori ara]     |
| SKU PRD-1042  [duzenle]      |
| Aciklama yaz...              |
| Gelismis ayarlar             |
+------------------------------+
```

### Kullanici Akisi

1. Urun adini yazar.
2. Tip ve kategoriyi secer.
3. Sistem SKU, para birimi ve durum varsayilanlarini doldurur.
4. Kullanici gerekli ise aciklama ekler.
5. Autosave taslagi olusturur.

### Alternatifler

- Shopify: urun detayini tek merkezde tutar, kategori ve varyantlari urun baglaminda yonetir; bu urun ekraninda da ayni model daha dogal.
- Stripe: urun ve fiyat ayrimini net yapar; kimlik alanlari minimum, ticari model ayridir.
- Notion: inline yazma ve blok ekleme yaklasimi aciklama/ozellik icin en hizli yoldur.
- Linear: komut paletiyle durum, etiket, atama gibi alanlari hizli degistirme fikri kullanilabilir.
- Apple: sadece gerekli alanlari one alir; teknik detaylari sakin, ikincil yuzeye koyar.

## Fiyatlandirma

### Mevcut Sorun

Fiyatlar `PriceMatrix`, fiyat listeleri, lisans fiyatlandirma ve dinamik fiyat kurallari olarak ayriliyor. Kullanici "satis fiyati koy" ile "kanala gore fiyat", "kampanya", "kural" arasindaki siniri anlamak zorunda kaliyor. Mevcut fiyat kartlari cok fazla tarih, kanal, grup ve miktar alaniyla basliyor.

### Daha Iyi Cozum

Tek bir "Fiyatlandirma Merkezi" kullanilmali. En ustte temel fiyat karti, altinda istege bagli fiyat katmanlari olmali: indirim, kampanya, bolgesel/para birimi, miktar kademesi, dinamik kural. Klasik form yerine "fiyat tarifi" dili kullanilmali.

En kullanici dostu alternatif: Visual Pricing Builder + IF/THEN bloklari. Node editor guclu ama baslangic icin agir. Timeline kampanya tarihleri icin iyi, ana fiyat modeli icin tek basina yeterli degil. Kart sistemi fiyat ozetinde iyi, kural uretiminde blok editor daha iyi.

```
+--------------------------------------------+
| Fiyatlandirma                              |
| Temel fiyat                                |
| [1.250,00] [TRY v]  Vergi dahil [ ]        |
|                                            |
| Ek kurallar                                |
| IF [Musteri grubu = Bayi] THEN [-%10]      |
| IF [Tarih: Hafta sonu] THEN [-%20]         |
| IF [Stok < 10] THEN [+%5]                  |
| [+ Kural ekle]                             |
|                                            |
| Canli sonuc: 1.125,00 TRY                  |
+--------------------------------------------+
```

### Neden Daha Iyi?

Fiyatlandirma insanlar icin hiyerarsiktir: once taban fiyat, sonra istisnalar. IF/THEN dili kosullu mantigi teknik JSON yerine gunluk dile cevirir. Canli sonuc kullaniciya guven verir.

### Kullanici Akisi

1. Temel fiyati girer.
2. Para birimi otomatik gelir.
3. "Kural ekle" der.
4. Hazir sablon secer: kampanya, stok, musteri grubu, miktar.
5. Degeri girer ve sonuc onizlemede gorur.

### Alternatifler

- Shopify: temel fiyat, compare-at fiyat ve varyant fiyatlarini urun baglaminda tutar; basit fiyat icin dogru.
- Stripe: urun/fiyat ayrimi, flat rate, per-seat, usage-based ve tiered modelleri netlestirir; lisans ve abonelik icin dogru referans.
- Notion: blok ekleme modeli fiyat kurallarini sirali ve okunur yapar.
- Linear: hizli komutlarla "kampanya ekle", "pasif yap" gibi islemler hizlanir.
- Apple: fiyat ekraninda metrik ve sonuc onizleme one cikar, ayarlar saklanir.

## Dinamik Fiyatlandirma

### Mevcut Sorun

`ProductPricingRulesPanel` teknik terimlerle calisiyor: kod, oncelik, adjustment, applyOn, unit field, tiers, limits, operator. Bu dogru veri modeli olabilir ama kullanici icin "fiyat ne zaman ne olacak?" sorusuna gec cevap veriyor.

### Daha Iyi Cozum

Rule Blocks kullanilmali. Her kural bir cumle gibi okunmali: "Eger [kosul] ise [fiyat etkisi] uygula, [gecerlilik] boyunca." Form alanlari bloklarin icine gomulmeli. Kod ve oncelik otomatik uretilmeli, gelismis duzenlemede gorunmeli.

```
+------------------------------------------+
| Dinamik fiyat kurallari                  |
| [Hafta sonu indirimi]     Aktif [on]     |
| EGER [Gun] [Cumartesi/Pazar]             |
| O HALDE [Fiyati] [%20] [dusur]           |
| GECERLI [Bu hafta sonu v]                |
| Sonuc: 1.000 TRY -> 800 TRY              |
|                                          |
| [+ Sablondan kural ekle] [+ Bos kural]   |
+------------------------------------------+
```

### Neden Daha Iyi?

Kural bloklari mental modeli korur: kosul, sonuc, zaman. Node editor ancak cok karmasik coklu dallanma varsa gerekir; bu urun yonetimi icin ilk tercih olmamali.

### Kullanici Akisi

1. Sablon secer: stok az, hafta sonu, bayi indirimi, miktar kademesi.
2. Bosluklari doldurur.
3. Sistem kural adini ve onceligi onerir.
4. Canli testte ornek fiyat sonucunu gorur.
5. Aktif eder.

### Alternatifler

- Drag and drop: kural sirasini degistirmek icin iyi, kural yazmak icin sart degil.
- Rule blocks: en iyi varsayilan.
- Visual builder: fiyat sonucunu anlatmak icin iyi.
- Node editor: guclu ama teknik; sadece "gelismis mod".
- Trello kartlari: kurallari durum veya oncelige gore gruplamak icin iyi.
- Notion bloklari: kural yazma deneyimi icin iyi.
- Airtable: kosul satirlari ve filtre mantigi icin iyi.
- Shopify: ticaret kullanicisi diline yakin sablonlar.

## Varyantlar

### Mevcut Sorun

Mevcut varyant ekleme tek tek kart aciyor ve `optionValuesJson` istiyor. Kullanici "Renk: Kirmizi, Siyah; Beden: S, M, L" dediginde sistem otomatik kombinasyon uretmiyor gibi gorunuyor.

### Daha Iyi Cozum

Option-first builder kullanilmali. Kullanici once secenek adlarini ve degerlerini chip olarak girer; sistem varyant matrisini otomatik uretir. Sonra toplu duzenleme ile SKU, fiyat farki, stok, aktiflik ayarlanir.

```
+--------------------------------------------+
| Varyantlar                                 |
| Renk   [Kirmizi x] [Siyah x] [+ Deger]     |
| Beden  [S x] [M x] [L x] [+ Deger]         |
|                                            |
| 6 varyant olusacak                         |
| [Otomatik SKU uret] [Matris olustur]       |
|                                            |
| Kirmizi / S   PRD-RED-S   +0 TRY  Aktif    |
| Kirmizi / M   PRD-RED-M   +0 TRY  Aktif    |
+--------------------------------------------+
```

### Neden Daha Iyi?

Kullanici kombinasyon dusunmez; sistem kombinasyon uretir. Bu hem hiz hem hata azaltir. JSON tamamen kaybolmali.

### Kullanici Akisi

1. "Varyant ekle" der.
2. Secenek adini secer veya yazar.
3. Degerleri chip olarak ekler.
4. Sistem varyantlari olusturur.
5. Kullanici toplu SKU/fiyat/stok duzenler.

### Alternatifler

- Shopify: option values ile varyant kombinasyonu uretme yaklasimi burada en dogru model.
- Stripe: varyant yerine fiyat modeli dusunur; fiziksel varyant icin zayif.
- Notion: chip/tag girisi deger eklemeyi kolaylastirir.
- Linear: toplu secim ve hizli duzenleme desenleri alinabilir.
- Apple: tabloyu sade tutar, detaylari satir acilinca gosterir.

## Stok Yonetimi

### Mevcut Sorun

Stok bilgisi ve stok islemleri ayri sekmelerde. Kullanici "+100 gir", "-20 dus", "transfer et" gibi niyetlerle gelirken form depo, politika, rezerve miktar, referans tipi gibi alanlari ayni anda gosteriyor.

### Daha Iyi Cozum

Stok ekrani "stok paneli + hizli islem cekmecesi" olmali. Depolar ozet kart veya satir olarak gorunmeli; islemler tek tik aksiyonlarla baslamali: Girdi, Cikti, Transfer, Duzeltme. Referans ve not ikincil alan olmali.

```
+--------------------------------------------+
| Stok                                       |
| Toplam 240   Rezerve 18   Satilabilir 222 |
|                                            |
| Depo        Eldeki  Rezerve  Kritik        |
| Istanbul    120     8        20            |
| Ankara      120     10       15            |
|                                            |
| [+ Giris] [- Cikis] [Transfer] [Duzelt]    |
|                                            |
| Giris: [Istanbul v] [+100] [Kaydet]        |
+--------------------------------------------+
```

### Neden Daha Iyi?

Stok islem odaklidir. Kullanici once hareket tipini secerse alanlar azalir. Bu hata onleme icin form validasyonundan daha etkilidir.

### Kullanici Akisi

1. Depo satirini gorur.
2. Islemi secer.
3. Miktari girer.
4. Sistem tarih ve referansi varsayilan doldurur.
5. Kayit sonrasi hareket zaman cizelgesine eklenir.

### Alternatifler

- Shopify: envanteri urun/varyant baglaminda pratik tutar.
- Stripe: stok alaninda referans degil.
- Notion: hareket gecmisi timeline gibi okunabilir.
- Linear: hizli aksiyon butonlari ve komut paleti stok hareketlerini hizlandirir.
- Apple: sayisal durumlari sade, buyuk ve okunur gosterir.

## Medya Yonetimi

### Mevcut Sorun

Medya ekleme URL, thumbnail URL, MIME, sortOrder gibi teknik alanlarla basliyor. Kullanici kapak gorseli ve urun galerisi olusturmak ister; URL formu ikinci planda kalmali.

### Daha Iyi Cozum

Drag and drop galeri ana deneyim olmali. Ilk gorsel otomatik kapak olabilir; kullanici surukleyerek siralar, kapak secimini rozetle yapar. Alt metin medya kartinda inline duzenlenir. URL ile ekleme "Baglantidan ekle" ikincil aksiyonudur.

```
+--------------------------------------------+
| Medya                                      |
| +-------------- drop zone ---------------+ |
| | Dosyalari buraya surukle veya sec      | |
| +----------------------------------------+ |
| [Kapak] img1   img2   video1   belge1      |
| Alt metin: [________________________]      |
| [Baglantidan ekle] [Toplu alt metin oner]  |
+--------------------------------------------+
```

### Neden Daha Iyi?

Medya gorsel bir problemdir; form alanlariyla baslamak kullanici amacini tersine cevirir. Kapak ve sira dogrudan manipule edilmelidir.

### Kullanici Akisi

1. Dosyalari surukler.
2. Sistem onizleme olusturur.
3. Kapak otomatik secilir.
4. Kullanici gerekirse siralar.
5. Alt metin onerilir veya inline yazilir.

### Alternatifler

- Shopify: medya urun sayfasinda galeri mantigiyla dusunulur.
- Stripe: medya ana kavram degil.
- Notion: dosya bloklari hizli eklenir.
- Linear: ek dosya deneyimi hizli ve dusuk surtunmelidir.
- Apple: gorsel netlik ve dogrudan manipule etme oncelikli.

## Kategori Secimi

### Mevcut Sorun

Mevcut `CategoryTreeSelector` tekrarli kartlarla kategori ekletiyor. `CategoryTreeSelect` lookup select kullaniyor; derin kategoride kullanici yolunu goremez ve birincil kategori/siralama gibi kararlar erken geliyor.

### Daha Iyi Cozum

Search-first kategori secimi olmali. Kullanici yazar, sistem en olasi kategorileri onerir. Secildikten sonra breadcrumb gosterilir. Agac gorunum "Tum kategorilere goz at" icinde kalmali. Birincil kategori ilk secimden otomatik atanir.

```
+--------------------------------------------+
| Kategori                                  |
| [telefon kilifi ara____________________]  |
| Oneriler                                  |
| Telefon > Aksesuar > Kilif                |
| Elektronik > Mobil > Koruyucu             |
|                                            |
| Secilen: Telefon > Aksesuar > Kilif       |
| [+ Ikincil kategori] [Agacta goz at]      |
+--------------------------------------------+
```

### Neden Daha Iyi?

Derin agaclarda en hizli yol aramadir. Breadcrumb secimin dogru oldugunu kanitlar. Smart suggestion karar yorgunlugunu azaltir.

### Kullanici Akisi

1. Urun adina gore oneriler gorunur.
2. Kullanici kategori arar veya oneriyi secer.
3. Sistem breadcrumb gosterir.
4. Ilk secim birincil olur.
5. Gerekirse ikincil kategori eklenir.

### Alternatifler

- Shopify: kategori onerisi ve metafield baglantisi guclu referans.
- Stripe: kategori yok.
- Notion: select/multi-select hizli ama derin agac icin breadcrumb gerekir.
- Linear: command palette ile "kategori degistir" hizli olur.
- Apple: kullaniciya en olasi secimi onerir, listeyi sade tutar.

## Ozellikler

### Mevcut Sorun

`AttributeSelector` her ozelligi kart olarak ekletiyor: once tanim sec, sonra deger yaz. Uzun attribute listelerinde bu tekrarli ve yavas. Alan tipleri deger girisini yonlendirmiyor.

### Daha Iyi Cozum

Kategori secildikten sonra ilgili attribute set otomatik gelsin. Ozellikler inline satir veya chip alanlari olarak gorunsun. Siklikla kullanilanlar acik, nadir olanlar "Daha fazla ozellik" altinda kalsin.

```
+--------------------------------------------+
| Ozellikler                                 |
| Kategoriye gore onerilenler               |
| Renk      [Siyah v]                        |
| Malzeme   [Pamuk v]                        |
| Boyut     [10 x 20 cm]                     |
|                                            |
| [+ Ozellik ekle] [Daha fazla]              |
+--------------------------------------------+
```

### Neden Daha Iyi?

Ozellik girisi kategoriye baglidir. Bos form yerine onerilen set kullanmak hem hiz hem standartlasma saglar.

### Kullanici Akisi

1. Kategori secilir.
2. Sistem attribute set getirir.
3. Kullanici sadece degerleri doldurur.
4. Ek ozellik gerekiyorsa arayip ekler.
5. Eksik zorunlu ozellikler kontrol listesinde gorunur.

### Alternatifler

- Shopify: category metafields ile yeniden kullanilabilir veri modeli iyi referans.
- Stripe: metadata vardir ama urun ozellikleri icin zayiftir.
- Notion: property mantigi attribute deneyimine cok uygundur.
- Linear: etiket/alan hizli secim deneyimi alinabilir.
- Apple: sadece ilgili alanlari gosterir.

## SEO

### Mevcut Sorun

SEO dogrudan ayrica gorunmuyor; medya alt metni ve metadata gibi alanlara dagiliyor. Eger her zaman gorunurse yeni kullaniciyi yorar; hic gorunmezse kaliteli katalog eksik kalir.

### Daha Iyi Cozum

SEO "Yayin kalitesi" panelinde ozet olarak gorunsun, detaylari "SEO ve paylasim" accordionunda acilsin. Sistem baslik ve aciklamayi urun adindan/shortDescriptiondan onersin. Eksikse kontrol listesinde uyarsin.

```
+--------------------------------------------+
| SEO ve paylasim                            |
| Arama onizlemesi                           |
| Urun adi | Marka                           |
| Kisa aciklama metni...                     |
|                                            |
| [Basligi duzenle] [Aciklamayi duzenle]     |
| [Gorsel alt metinleri tamamla]             |
+--------------------------------------------+
```

### Neden Daha Iyi?

SEO destekleyici bir is akisi. Surekli acik kalirsa odagi boler; kalite sinyali olarak gorunurse dogru zamanda aksiyon aldirir.

### Kullanici Akisi

1. Urun bilgileri girilir.
2. Sistem SEO onerisini uretir.
3. Kullanici onizlemeyi kontrol eder.
4. Gerekirse accordionu acar.
5. Yayina almadan once eksikler kapanir.

### Alternatifler

- Shopify: SEO genelde detay/preview olarak sunulur; dogru model.
- Stripe: SEO urun katalog icin ana konu degil.
- Notion: sayfa metadata mantigi gibi otomatik baslik iyi calisir.
- Linear: gerektiginde acilan detay paneli uygundur.
- Apple: onizleme ve sade metin alanlari oncelikli.

## Gelismis Ayarlar

### Mevcut Sorun

Vergi, metadata, satis ayarlari, profil detaylari, API/XML benzeri teknik alanlar ayni seviyeye cikinca ana is akisi agirlasiyor.

### Daha Iyi Cozum

Gelismis ayarlar bir sag cekmece veya accordion grubu olmali. Basliklar is dilinde olmali: Vergi ve finans, Kargo ve lojistik, Entegrasyon, Ozel alanlar. Tehlikeli veya nadir alanlarda degisiklik ozeti ve geri alma olmali.

```
+--------------------------------------------+
| Gelismis ayarlar                           |
| > Vergi ve finans                          |
| > Kargo ve lojistik                        |
| > Entegrasyon / API / XML                  |
| > Ozel alanlar ve metadata                 |
|                                            |
| Son degisiklikler: Vergi KDV18 yapildi     |
+--------------------------------------------+
```

### Neden Daha Iyi?

Nadir kullanilan alanlar gorunurluk degil bulunabilirlik ister. Cekmece, ana formu kirletmeden guc kullanicilari destekler.

### Kullanici Akisi

1. Kullanici ana bilgileri tamamlar.
2. Ihtiyac duyarsa gelismis ayarlari acar.
3. Ilgili grubu secer.
4. Degisiklik autosave olur.
5. Ozet panelinde kayit gorunur.

### Alternatifler

- Shopify: urun detayinda ikincil bolumler halinde saklar.
- Stripe: gelismis fiyat/checkout alanlarini ilgili baglamda acar.
- Notion: propertyler gizlenebilir/gosterilebilir.
- Linear: detay paneli ve komut paleti dengesi iyi.
- Apple: nadir kontrolu sade isimle saklar.

## Toplu Islemler

### Mevcut Sorun

Liste kart gorunumunde guzel ama toplu secim ve hizli operasyon gorunmuyor. Cok urun yoneten kullanici her karti tek tek acmak zorunda kalabilir.

### Daha Iyi Cozum

Liste/kart gorunumunde secim modu olmali. Birden fazla urun secilince ustte contextual action bar acilmali.

```
+--------------------------------------------+
| 12 urun secildi                            |
| [Aktif yap] [Kategori ata] [Fiyat guncelle]|
| [Etiket ekle] [Disari aktar] [Arsivle]     |
+--------------------------------------------+
```

Tek tik islemler: aktif/pasif, kategori ata, etiket ekle/cikar, fiyat yuzde artir/azalt, vergi kodu degistir, stok takibi ac/kapat, medya kapagi ata, arsivle, disari aktar.

### Neden Daha Iyi?

Toplu islem guc kullaniciyi hizlandirir ve tekrarli hatalari azaltir. Contextual bar sadece secim varken gorunerek yeni kullaniciyi yormaz.

### Kullanici Akisi

1. Secim moduna girer veya checkbox ile urun secer.
2. Action bar acilir.
3. Islemi secer.
4. Sistem degisecek alanlari onizler.
5. Onayla ve geri al secenegi sunulur.

### Alternatifler

- Shopify: bulk edit ve toplu aksiyon bu alanda en guclu referans.
- Stripe: toplu fiyat degisimi sinirli, guvenli onay mantigi alinabilir.
- Notion: tablo secimi ve toplu property duzenleme iyi model.
- Linear: toplu durum/etiket degistirme cok hizli.
- Apple: destruktif islemlerde net onay ve geri alma.

## Mobil ve Tablet

### Mevcut Sorun

Mevcut sekmeli, kartli ve genis form yapisi mobilde cok uzun hale gelir. Tablo benzeri fiyat/kural alanlari ve cok kolonlu formlar dar ekranda karar yorgunlugu yaratir.

### Daha Iyi Cozum

Mobilde tek kolon, bottom action bar ve adim adim bolumler kullanilmali. Sag onizleme mobilde ustte ozet kart olur. Fiyat ve stok islemleri bottom sheet ile yapilir. Tablo yerine kart satirlari kullanilir.

```
+----------------------+
| Urun Duzenle         |
| Taslak kaydedildi    |
| [Onizleme karti]     |
| Basla                |
| Satisa hazirla       |
| Medya                |
| Gelismis             |
+----------------------+
| [Kapat]      [Yayin] |
+----------------------+
```

### Neden Daha Iyi?

Mobilde kullanici genelde hizli duzeltme yapar. En uygun deneyim tam form degil, niyet bazli kisa islemlerdir.

### Kullanici Akisi

1. Urun ozetini gorur.
2. Bolumu acar.
3. Tek islem yapar.
4. Autosave geri bildirimini gorur.
5. Gerekirse yayina alir.

### Alternatifler

- Shopify: mobilde urun duzenleme islem odaklidir.
- Stripe: dashboard mobilde daha cok izleme/az duzenleme icin uygundur.
- Notion: bloklar mobilde dogal akar.
- Linear: bottom sheet ve hizli aksiyon desenleri uygundur.
- Apple: buyuk dokunma hedefi, az alan, net hiyerarsi.

## Puanlama

Mevcut sistem:

| Kriter | Puan | Not |
| --- | ---: | --- |
| Kullanim Kolayligi | 5/10 | Guclu ama veri modeli cok gorunur |
| Ogrenme Suresi | 4/10 | Sekme sayisi ve teknik alanlar fazla |
| Profesyonellik | 7/10 | Admin duzeni var, ancak karmasik |
| Yeni Kullanici Deneyimi | 4/10 | Ilk urun girisi uzun ve belirsiz |
| Guclu Kullanici Deneyimi | 6/10 | Cok alan var ama toplu/hizli islem eksik |
| Mobil Kullanim | 4/10 | Uzun formlar ve tablolar dar ekranda zor |
| Hiz | 5/10 | Tek tek kart ekleme tekrarli |
| Hata Yapma Riski | 5/10 | Validasyon var, ama hatayi olusmadan engelleme zayif |

Hedeflenen redesign:

| Kriter | Puan | Not |
| --- | ---: | --- |
| Kullanim Kolayligi | 9/10 | Niyet odakli, az alanli baslangic |
| Ogrenme Suresi | 8/10 | Kullanici is dilini takip eder |
| Profesyonellik | 9/10 | SaaS dashboard seviyesinde odak ve hiyerarsi |
| Yeni Kullanici Deneyimi | 9/10 | Wizard + smart defaults |
| Guclu Kullanici Deneyimi | 8/10 | Command palette, bulk edit, inline edit |
| Mobil Kullanim | 8/10 | Bottom sheet ve tek kolon |
| Hiz | 9/10 | Autosave, inline edit, sablonlar |
| Hata Yapma Riski | 8/10 | Onizleme, sablon, akilli varsayilan |

## Bugun Sifirdan Tasarlasaydim

Sistemi "urun kaydi formu" olarak degil, "urun yayina hazirlama studyosu" olarak tasarlardim.

1. Urun listesi: kart ve tablo gorunumu, secim modu, toplu islemler, kaydedilmis filtreler.
2. Urun editoru: tek calisma yuzeyi, sagda canli onizleme ve eksik kontrol listesi.
3. Baslangic: ad, tip, kategori, marka, durum. SKU ve barkod otomatik.
4. Satis: temel fiyat, stok, kapak medya; yayina almak icin minimum set.
5. Zenginlestirme: varyant option builder, attribute set, medya galerisi, SEO onizleme.
6. Fiyat motoru: IF/THEN blok editoru, sablonlar, canli fiyat simulatoru.
7. Gelismis: vergi, kargo, API/XML, metadata, ozel alanlar.
8. Hiz: Ctrl+K komut paleti, inline edit, autosave, undo, sablonla olustur.

## Uygulama Sirasi

1. `ProductFormPage` sekmelerini "Basla / Satisa hazirla / Zenginlestir / Gelismis" gruplarina indir.
2. Sag tarafta canli onizleme ve eksik kontrol listesi ekle.
3. `GeneralInfoTab` alanlarini kritik ve gelismis olarak ayir; SKU varsayilani ve otomatik durum ozetini ekle.
4. `MediaUploadManager`i URL formundan galeri/dropzone deneyimine cevir.
5. `VariantBuilder`i option-first kombinasyon ureticisine cevir.
6. `PriceMatrix` ve `ProductPricingRulesPanel`i tek fiyat merkezi icinde blok tabanli hale getir.
7. Stokta hizli islem cekmecesi ekle.
8. Liste ekranina secim modu ve contextual bulk action bar ekle.

## Kaynak Notlari

- Shopify variant modeli, option values ile varyant kombinasyonlarini uretmeye dayaniyor; bu nedenle varyant tarafinda option-first builder en dogru yaklasim: https://help.shopify.com/en/manual/products/variants/add-variants
- Stripe products/prices dokumani urun ile fiyat modelini ayirmayi, flat-rate, per-seat, usage-based ve tiered fiyatlandirmayi net kategorilerle anlatir; lisans/abonelik fiyatlandirmada bu ayrim kullanilmali: https://docs.stripe.com/products-prices/overview
- Stripe pricing table dokumani fiyat bilgisini kullaniciya kart/secim modeliyle sunmanin subscription islerinde guclu oldugunu gosterir: https://docs.stripe.com/payments/checkout/pricing-table
