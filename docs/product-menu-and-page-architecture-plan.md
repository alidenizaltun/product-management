# Product Management Menü ve Sayfa Mimarisi Planı

## 1. Amaç

Bu planın amacı, ürün oluşturma ve güncelleme ekranındaki yoğun iş akışı sekmelerini bağımsız sayfalara ayırmak, bu sayfaları anlaşılır ve **sabit** bir sol menü yapısına taşımak, sayfa içeriğinin "hangi ürün açık olduğuna" göre değil kullanıcının o sayfanın formunda seçtiği ürüne göre çalışmasını sağlamak ve uygulamanın açılış sayfasını **Ürünler** yapmak için önerilen bilgi mimarisini tanımlamaktır.

Bu belge yalnızca ürün deneyimi, menü düzeni, sayfa isimleri, rota önerileri ve geçiş sırasını kapsar. Uygulama kodu değişikliği içermez.

## 2. Mevcut Yapının Özeti

Mevcut sol menü şu gruplarla çalışmaktadır:

- Genel
- Ürün Yönetimi
- Katalog
- Fiyat Yönetimi
- Stok Yönetimi

Mevcut ürün oluşturma/güncelleme ekranı ise dört ana iş akışına ayrılmıştır:

- Başla
- Satışa Hazırla
- Zenginleştir
- Gelişmiş

Bu iş akışlarında aşağıdaki alanlar aynı form ve kayıt süreci içinde yönetilmektedir:

- Genel ürün bilgileri
- Kategori atamaları
- Özellik değerleri
- Medya
- Varyantlar
- Ürün fiyatları ve fiyat listesi kayıtları
- Yazılım fiyatlandırma birimleri
- Satış/lisans planları
- Dinamik fiyatlandırma kuralları
- Yazılım modülleri
- Stok, stok hareketleri ve rezervasyonlar
- Tedarikçi eşleştirmeleri
- Ürün tipine özgü teknik profil bilgileri

Temel sorun, sistem genelinde kullanılan **tanım kayıtları** ile belirli bir ürüne yapılan **atama ve işlemlerin** menü dilinde yeterince ayrışmamasıdır. Örneğin kategori tanımlamak ile ürüne kategori atamak; birim sözlüğü oluşturmak ile yazılım ürününde fiyatlandırma birimi seçmek aynı iş değildir.

## 3. Temel Bilgi Mimarisi Kararı

Sol menü **tek katmandan** oluşur ve kullanıcının o an hangi ürünle çalıştığından bağımsız olarak her zaman aynı öğeleri gösterir. Menüde yalnızca bir ürün açıldığında beliren, ürüne özel dinamik bir grup **bulunmaz**.

Bunun yerine, ürüne bağlı her iş akışı (genel bilgiler, sınıflandırma, medya, fiyatlandırma, fiyatlandırma birimleri, satış planları, dinamik fiyat kuralları, modüller, stok ve tedarik...) kendi sabit menü öğesine sahip, bağımsız bir sayfadır. Kullanıcı bu sayfaya menüden doğrudan girer; sayfanın en üstünde yer alan bir **Ürün Seçici** alanından hangi ürün üzerinde çalışacağını kendisi seçer. Ürün seçilmeden sayfanın geri kalan içeriği (form alanları, listeler) görüntülenmez.

Bu kararın nedenleri:

- Menü, kullanıcının navigasyonu sırasında beklenmedik şekilde büyüyüp küçülmemeli; her zaman aynı yapıda kalmalıdır.
- Bir sayfa yalnızca belirli ürün tiplerinde anlamlıysa (örn. Modüller yalnızca yazılım ürününde anlamlıdır), o sayfanın Ürün Seçici alanı **yalnızca ilgili tipteki ürünleri** listeler. Kullanıcı örneğin Fiyatlandırma Birimleri veya Modüller sayfasında fiziksel ürünleri hiçbir zaman göremez veya seçemez.
- Aynı ürün üzerinde farklı sayfalar arasında geçiş yapmak artık bir "seçili ürün bağlamından çıkma" işlemi değildir; kullanıcı doğrudan menüden başka bir sabit sayfaya gider ve orada ürününü tekrar seçer (gerekirse son işlem gördüğü ürün kısayoldan önerilebilir, bkz. Bölüm 9).

Ürün Seçici, bu sayfaların tamamında tekrar kullanılan **ortak bir bileşendir**. Bileşen, hangi ürün tiplerini listeleyeceğini sayfa bazlı bir konfigürasyondan alır; böylece her sayfa kendi izin verdiği ürün tipleriyle sınırlı kalır.

## 4. Önerilen Ana Menü Düzeni

Menü sıralaması aşağıdaki üç ana başlıkla kurulmalıdır. Menüdeki hiçbir öğe, açık olan bir ürüne göre görünür/gizli hâle gelmez.

```text
ÜRÜN İŞLEMLERİ
├─ Ürünler
│  ├─ Tüm Ürünler
│  └─ Yeni Ürün
├─ Ürün Bilgileri
│  ├─ Genel Bilgiler                    [ürün seçici: tüm tipler]
│  ├─ Sınıflandırma                     [ürün seçici: tüm tipler]
│  ├─ Medya                             [ürün seçici: tüm tipler]
│  └─ Gelişmiş Ayarlar                  [ürün seçici: tüm tipler]
├─ Fiziksel Ürün İşlemleri
│  ├─ Varyantlar                        [ürün seçici: yalnızca fiziksel]
│  └─ Stok ve Tedarik                   [ürün seçici: yalnızca fiziksel]
├─ Yazılım ve Lisanslı Ürün İşlemleri
│  ├─ Fiyatlandırma Birimleri           [ürün seçici: yazılım; ihtiyaca göre hizmet/abonelik]
│  ├─ Satış Planları                    [ürün seçici: yazılım, hizmet, abonelik]
│  ├─ Dinamik Fiyat Kuralları           [ürün seçici: yazılım, hizmet, abonelik; ihtiyaca göre fiziksel]
│  └─ Modüller                          [ürün seçici: yalnızca yazılım]
├─ Fiyatlandırma                        [ürün seçici: tüm tipler]
└─ Stok İşlemleri
   ├─ Stok Durumu
   ├─ Stok Hareketleri
   ├─ Rezervasyonlar
   └─ Depo Bazlı Stok

YÖNETİM VE TANIMLAR
├─ Katalog Tanımları
│  ├─ Kategori Tanımları
│  ├─ Özellik Tanımları
│  └─ Özellik Setleri
├─ Yazılım Ürünü Tanımları
│  └─ Yazılım Birim Sözlüğü
├─ Fiyat Yönetimi
│  ├─ Fiyat Listeleri
│  └─ Kampanya Kuralları
├─ Tedarik ve Depo Tanımları
│  ├─ Tedarikçi Tanımları
│  └─ Depo Tanımları
└─ Sistem Yönetimi
   ├─ Kullanıcılar
   ├─ Roller ve Yetkiler
   ├─ Sistem Ayarları
   └─ Entegrasyonlar

ANALİZ VE RAPORLAMA
├─ Genel Bakış
├─ Ürün Analizi                            [yeni]
├─ Fiyatlandırma Analizi                   [yeni]
├─ Stok Analizi                            [yeni]
└─ Denetim ve Sistem Kayıtları
   ├─ İşlem Geçmişi
   ├─ Oturum Kayıtları
   └─ Sistem Logları
```

### Menü davranışı

- `Ürünler` grubu uygulamanın en üstünde ve varsayılan olarak açık olmalıdır.
- `Tüm Ürünler`, uygulamanın açılış ve giriş sonrası varsayılan sayfası olmalıdır.
- `Yeni Ürün` menüde bulunabilir; ayrıca ürün listesinde birincil aksiyon olarak kalmalıdır.
- Menü **her zaman aynı öğeleri** gösterir; açık/seçili bir ürüne göre görünürlüğü değişen, gösterilip gizlenen bir menü grubu yoktur.
- Ürüne bağlı her sayfa, kendi Ürün Seçici alanına sahiptir; seçici yalnızca o sayfa için tanımlı ürün tiplerini listeler.
- Ürün Seçici içinde uygun olmayan tipteki ürünler listede hiç görünmez; pasif/devre dışı gösterilmez, tamamen yoktur. Örneğin Fiyatlandırma Birimleri sayfasının seçicisinde fiziksel ürünler hiç listelenmez.
- Ürün listesindeki bir satırdan "Sınıflandırmayı düzenle" gibi bir kısayolla gelindiğinde, ilgili sabit sayfa açılır ve Ürün Seçici o ürünle önceden doldurulmuş olarak gelir; kullanıcı yine de seçimi değiştirebilir.
- Bir sayfada ürün seçilmeden form alanları görüntülenmez veya düzenlenemez.
- Sayfa içinde seçili ürün değiştirildiğinde kaydedilmemiş değişiklik varsa kullanıcı uyarılmalıdır.
- Menüde aynı anda yalnızca kullanıcının bulunduğu ana grup açık tutulmalıdır.

## 5. İsimlendirme Standardı

### "Tanım" ne zaman kullanılmalı?

"Tanım" sözcüğü yalnızca birden fazla üründe tekrar kullanılabilen, sistem genelindeki sözlük ve ana veriler için kullanılmalıdır.

Doğru örnekler:

- Kategori Tanımları
- Özellik Tanımları
- Depo Tanımları
- Tedarikçi Tanımları
- Yazılım Birim Sözlüğü

Ürüne bağlı sayfalarda (yani formunda Ürün Seçici bulunan sayfalarda) "tanım" yerine doğrudan iş nesnesinin adı kullanılmalıdır:

- Kategori Tanımları yerine **Sınıflandırma**
- Modül Tanımları yerine **Modüller** veya **Ürün Modülleri**
- Birim Tanımları yerine **Fiyatlandırma Birimleri**
- Fiyat Tanımları yerine **Fiyatlandırma**

### "Katalog" adının kullanımı

`Katalog` mevcut menüde kategori, tedarikçi, depo, birim ve özellikleri aynı grupta toplamaktadır. Bunların tamamı katalog kavramına ait değildir. Yeni yapıda:

- Kategori ve özellikler **Katalog Tanımları** altında kalır.
- Birimler **Yazılım Ürünü Tanımları** altına taşınır.
- Tedarikçi ve depolar **Tedarik ve Depo Tanımları** altında gruplanır.
- Sol menüde tek başına geniş kapsamlı `Katalog` grubu kullanılmaz.

### Birim alanlarının yeni adları

Mevcut "Birim Tanımları" alanı kullanıcı, cihaz, API çağrısı gibi özellikle yazılım ürünlerinin fiyatlandırılmasında kullanılan değerleri ifade etmektedir. Bu nedenle iki ayrı ad önerilir:

| Kapsam | Önerilen ad | Açıklama |
|---|---|---|
| Sistem geneli | Yazılım Birim Sözlüğü | Kullanıcı, cihaz, API çağrısı gibi tekrar kullanılabilir birimler |
| Ürüne bağlı (sayfa içi ürün seçici ile) | Fiyatlandırma Birimleri | Sözlükteki birimlerin ürüne bağlanması ve ürün içi ad/kod verilmesi |

"Ölçü Birimi" ifadesi fiziksel ürünlerde kilogram, metre ve adet gibi farklı bir anlam taşıyabileceği için yazılım fiyatlandırma birimleriyle aynı başlık altında kullanılmamalıdır.

### Modül alanlarının yeni adları

Mevcut modüller ürün kimliğine bağlıdır. Bu nedenle önerilen ilk sürüm adı **Ürün Modülleri** veya menü içinde kısa biçimiyle **Modüller** olmalıdır.

Eğer ileride aynı modülün birçok yazılım ürününde tekrar kullanılacağı bir ana veri modeli kurulursa, o zaman `Yönetim ve Tanımlar > Yazılım Ürünü Tanımları` altına **Modül Şablonları** isimli ayrı bir sistem-geneli sayfa eklenebilir. Mevcut veri modeli değişmeden "Modül Tanımları" isimli global menü oluşturulmamalıdır.

### Fiyat alanlarının yeni adları

| Kapsam | Önerilen ad | İçerik |
|---|---|---|
| Ürüne bağlı (sayfa içi ürün seçici ile) | Fiyatlandırma | Ürünün temel ve alternatif fiyatları |
| Lisanslanabilir ürün (sayfa içi ürün seçici ile) | Satış Planları | Lisans/paket/abonelik teklifleri |
| Ürüne bağlı (sayfa içi ürün seçici ile) | Dinamik Fiyat Kuralları | Miktar, birim, müşteri grubu veya koşula bağlı kurallar |
| Sistem geneli | Fiyat Listeleri | Birden fazla ürünü içerebilen fiyat listeleri |
| Sistem geneli | Kampanya Kuralları | Ürünler arası veya genel kampanya tanımları |

## 6. Ürün Sekmelerinin Sayfalara Dağılımı

Aşağıdaki sayfaların tamamı sabit menüden açılır. Her sayfanın en üstünde bir **Ürün Seçici** bulunur; kullanıcı önce ürünü seçer, sonra o ürüne ait ilgili bölümü görüntüler/düzenler. Ürün Seçici'nin listelediği ürün tipleri sayfadan sayfaya değişir ve bu bölümde her sayfa için ayrıca belirtilir.

### 6.1 Ürün Özeti

Bu sayfa bir menü öğesi **değildir**; `Tüm Ürünler` listesinden bir ürüne tıklandığında açılan salt-özet/detay sayfasıdır. Amacı, ürünün tek bakışta durumunu göstermek ve kullanıcıyı ilgili sabit sayfalara yönlendirmektir.

İçerik:

- Ürün adı, kodu, türü ve durumu
- Ana görsel
- Ana kategori
- Temel/başlangıç fiyatı
- Ürün tipine göre stok veya lisans özeti
- Tamamlanma kontrol listesi
- Son güncelleme bilgisi
- İlgili sabit sayfalara, bu ürün önceden seçili şekilde açılan kısayol bağlantıları (örn. "Sınıflandırmayı düzenle", "Fiyatlandırma Birimlerini düzenle")

### 6.2 Genel Bilgiler

`Ürün Bilgileri > Genel Bilgiler` sabit menü öğesinden açılır. Ürün Seçici tüm ürün tiplerini listeler. Mevcut `GeneralInfoTab` ve ürün tipine ait temel profil alanlarının sade bölümü bu sayfaya taşınır.

İçerik:

- Ürün adı ve ürün kodu
- Ürün türü
- Kısa ve uzun açıklama
- Marka, üretici ve barkod
- Aktiflik, satılabilirlik ve satın alınabilirlik
- Temel vergi ve para birimi bilgisi

Ürün türü, hangi sayfaların Ürün Seçici'sinde bu ürünün görüneceğini belirlediği için oluşturma sırasında zorunlu olmalıdır. Ürün türü sonradan değiştirilecekse kaybolabilecek tipe özel veriler için açık uyarı gösterilmelidir.

### 6.3 Sınıflandırma

`Ürün Bilgileri > Sınıflandırma` sabit menü öğesinden açılır. Ürün Seçici tüm ürün tiplerini listeler.

İçerik:

- Ana kategori
- Ek kategoriler
- Kategori yolu/breadcrumb
- Kategoriye bağlı özellikler
- Ek ürün özellikleri
- Etiketler

Buradaki işlem kategori oluşturmak değil, mevcut kategori ve özellik tanımlarını seçili ürüne atamaktır. Yeni kategori veya özellik gerekiyorsa kullanıcı "Yeni tanım oluştur" kısa yoluyla ilgili yönetim sayfasına gidebilmelidir.

### 6.4 Medya

`Ürün Bilgileri > Medya` sabit menü öğesinden açılır. Ürün Seçici tüm ürün tiplerini listeler.

İçerik:

- Kapak görseli
- Ürün galerisi
- Sürükleyerek sıralama
- Alternatif metin
- Bağlantıdan medya ekleme

Teknik URL, MIME türü ve sıra numarası alanları ana deneyimde gösterilmemeli; gerektiğinde gelişmiş ayrıntıda bulunmalıdır.

### 6.5 Varyantlar

`Fiziksel Ürün İşlemleri > Varyantlar` sabit menü öğesinden açılır. Ürün Seçici **yalnızca fiziksel ürün** tipindeki ürünleri listeler; diğer tipler seçenek olarak hiç görünmez.

İçerik:

- Renk, beden gibi varyant eksenleri
- Otomatik kombinasyon üretimi
- SKU/barkod
- Fiyat farkı
- Stok ve aktiflik

### 6.6 Fiyatlandırma

`Ürün İşlemleri > Fiyatlandırma` sabit menü öğesinden açılır. Ürün Seçici tüm satılabilir ürün tiplerini listeler.

İçerik:

- Temel fiyat
- Para birimi ve vergi durumu
- Tarih aralığı
- Kanal veya müşteri grubu fiyatı
- Ürünün dahil olduğu fiyat listeleri
- Fiyat önizlemesi

Yazılım ürünlerinde bu sayfa fiyatlandırma akışının özet merkezi olmalı; seçili ürün yazılım tipindeyse `Fiyatlandırma Birimleri`, `Satış Planları` ve `Dinamik Fiyat Kuralları` sayfalarına (o ürün önceden seçili şekilde) giden durum kartları ve bağlantılar göstermelidir.

### 6.7 Fiyatlandırma Birimleri

`Yazılım ve Lisanslı Ürün İşlemleri > Fiyatlandırma Birimleri` sabit menü öğesinden açılır. Ürün Seçici **öncelikle yazılım ürünlerini** listeler; hizmet veya abonelik ürünlerinde bu alan gerçekten kullanılıyorsa bu tipler de seçici filtresine eklenebilir. **Fiziksel ürünler bu seçicide hiçbir zaman görünmez.**

İçerik:

- Yazılım Birim Sözlüğü kaydı seçimi
- Ürün içi birim adı ve kodu
- Varsayılan birim
- Aktiflik ve sıralama
- Birimsiz/sabit fiyatlandırma seçeneği

### 6.8 Satış Planları

`Yazılım ve Lisanslı Ürün İşlemleri > Satış Planları` sabit menü öğesinden açılır. Ürün Seçici yazılım, hizmet ve abonelik gibi lisanslanabilir ürün tiplerini listeler; fiziksel ürünler listelenmez.

İçerik:

- Plan/paket adı
- Tek seferlik veya dönemsel satış modeli
- Taban fiyat
- Faturalama dönemi
- Deneme süresi ve yenileme ayarları
- Planın fiyatlandırma birimleriyle ilişkisi
- Geçerlilik tarihleri

Kullanıcı arayüzünde "Lisans Teklifi" yerine daha anlaşılır olan **Satış Planı** kullanılabilir. Teknik API ve veri modeli adı değiştirilmeden kullanıcı dili sadeleştirilebilir.

### 6.9 Dinamik Fiyat Kuralları

`Yazılım ve Lisanslı Ürün İşlemleri > Dinamik Fiyat Kuralları` sabit menü öğesinden açılır. Ürün Seçici varsayılan olarak yazılım, hizmet ve abonelik tiplerini listeler; fiziksel üründe gerçek bir ihtiyaç varsa filtre kapsamı genişletilebilir.

İçerik:

- Miktar kademeleri
- Birim bazlı fiyat etkisi
- Plan/paket bazlı koşullar
- Müşteri grubu ve kanal koşulları
- Minimum/maksimum fiyat sınırları
- Kural önceliği ve geçerlilik dönemi
- Hesaplama sonucu önizlemesi

### 6.10 Modüller

`Yazılım ve Lisanslı Ürün İşlemleri > Modüller` sabit menü öğesinden açılır. Ürün Seçici **yalnızca yazılım ürünlerini** listeler; diğer ürün tipleri seçicide hiç görünmez.

İçerik:

- Ürün modülü adı ve kodu
- Açıklama
- Zorunlu/opsiyonel durumu
- Aktiflik ve sıralama
- Satış planına göre modül fiyatları

Bu sayfa sistem genelindeki modül sözlüğü değil, seçili yazılım ürününün modüllerini yönetir.

### 6.11 Stok ve Tedarik

`Fiziksel Ürün İşlemleri > Stok ve Tedarik` sabit menü öğesinden açılır. Ürün Seçici **yalnızca fiziksel ürün** tipindeki ürünleri listeler.

İçerik:

- Depo bazlı stok özeti
- Hızlı stok girişi/çıkışı/transferi
- Rezervasyon özeti
- Tedarikçi eşleştirmeleri
- Tedarikçi ürün kodu, maliyet ve teslim süresi

Sistem genelindeki tüm stok hareketleri yine `Ürün İşlemleri > Stok İşlemleri` altında bulunmalıdır. Ürüne bağlı sayfa ise seçili ürüne otomatik filtrelenmiş çalışmalıdır.

### 6.12 Gelişmiş Ayarlar

`Ürün Bilgileri > Gelişmiş Ayarlar` sabit menü öğesinden açılır. Ürün Seçici tüm ürün tiplerini listeler; sayfa içeriği seçilen ürünün tipine göre farklı teknik alanlar gösterir.

İçerik:

- Ürün tipine özgü teknik profil
- Vergi ve finans ayrıntıları
- Lojistik ayrıntıları
- Entegrasyon alanları
- Metadata ve özel alanlar
- Nadiren kullanılan teknik bayraklar

Bu sayfa ana ürün oluşturma akışını yavaşlatmamalıdır.

## 7. Ürün Tipine Göre Ürün Seçici Filtreleri

Aşağıdaki tablo, her sayfanın Ürün Seçici alanında hangi ürün tiplerinin listeleneceğini gösterir. `✓` işareti, o ürün tipinin ilgili sayfanın seçicisinde göründüğünü; boş hücre ise o tipin seçicide **hiç görünmediğini** ifade eder.

| Sayfa | Fiziksel | Yazılım | Hizmet | Abonelik |
|---|:---:|:---:|:---:|:---:|
| Genel Bilgiler | ✓ | ✓ | ✓ | ✓ |
| Sınıflandırma | ✓ | ✓ | ✓ | ✓ |
| Medya | ✓ | ✓ | ✓ | ✓ |
| Varyantlar | ✓ |  |  |  |
| Fiyatlandırma | ✓ | ✓ | ✓ | ✓ |
| Fiyatlandırma Birimleri |  | ✓ | ihtiyaca göre | ihtiyaca göre |
| Satış Planları |  | ✓ | ✓ | ✓ |
| Dinamik Fiyat Kuralları | ihtiyaca göre | ✓ | ✓ | ✓ |
| Modüller |  | ✓ |  |  |
| Stok ve Tedarik | ✓ |  |  |  |
| Gelişmiş Ayarlar | ✓ | ✓ | ✓ | ✓ |

Bu filtre kararı, menü görünürlüğünden bağımsız olarak yalnızca her sayfanın Ürün Seçici bileşenine uygulanır; menünün kendisi Bölüm 4'te açıklandığı gibi her zaman sabittir.

## 8. Önerilen Rota Yapısı

Ürüne bağlı sayfalar artık `/products/:id/...` biçiminde ürün kimliğine gömülü değildir; her biri sabit bir yol taşır ve ürün, sayfa içindeki Ürün Seçici ile belirlenir. Bir üründen kısayolla gelindiğinde `productId` sorgu parametresi Ürün Seçici'yi önceden doldurmak için kullanılır; parametre verilmezse sayfa boş seçici ile açılır.

```text
/products                              Tüm Ürünler
/products/new                          Yeni Ürün
/products/:id                          Ürün Özeti (yalnızca detay/kısayol sayfası)

/product-info/general                  Genel Bilgiler          (?productId=)
/product-info/classification           Sınıflandırma           (?productId=)
/product-info/media                    Medya                   (?productId=)
/product-info/advanced                 Gelişmiş Ayarlar        (?productId=)

/physical-products/variants            Varyantlar              (?productId=)
/physical-products/inventory-supply    Stok ve Tedarik         (?productId=)

/software-products/pricing-units       Fiyatlandırma Birimleri (?productId=)
/software-products/sales-plans         Satış Planları          (?productId=)
/software-products/pricing-rules       Dinamik Fiyat Kuralları (?productId=)
/software-products/modules             Modüller                (?productId=)

/pricing/product-pricing               Fiyatlandırma           (?productId=)
/pricing/price-lists                   Fiyat Listeleri
/pricing/campaign-rules                Kampanya Kuralları

/definitions/categories                Kategori Tanımları
/definitions/attributes                Özellik Tanımları
/definitions/attribute-sets            Özellik Setleri
/definitions/software-units            Yazılım Birim Sözlüğü
/definitions/suppliers                 Tedarikçi Tanımları
/definitions/warehouses                Depo Tanımları

/inventory/stock                       Stok Durumu
/inventory/transactions                Stok Hareketleri
/inventory/reservations                Rezervasyonlar
/inventory/warehouse-stock             Depo Bazlı Stok

/analytics                             Genel Bakış
/analytics/products                    Ürün Analizi
/analytics/pricing                     Fiyatlandırma Analizi
/analytics/inventory                   Stok Analizi
```

### Geriye dönük uyumluluk

Mevcut `/catalog/...`, `/attributes/...`, `/pricing/pricelists`, `/dashboard` ve eski `/products/:id/general` gibi adresler bir süre yeni sabit adreslere (gerekliyse `productId` sorgu parametresiyle) yönlendirilmelidir. Kullanıcının yer imleri ve uygulama içindeki eski bağlantılar doğrudan 404 sayfasına düşmemelidir.

## 9. Ürün Oluşturma ve Güncelleme Akışı

### Yeni ürün oluşturma

1. Kullanıcı `Yeni Ürün` sayfasında yalnızca ürünün kimliğini oluşturan minimum alanları doldurur:
   - Ürün adı
   - Ürün türü
   - Ürün kodu veya otomatik kod
   - Temel durum
2. İlk kayıt tamamlanınca ürün kimliği oluşur.
3. Kullanıcı `/products/:id` (Ürün Özeti) sayfasına yönlendirilir.
4. Ürün Özeti sayfasındaki kısayol bağlantıları, ilgili sabit sayfaları bu ürün `productId` ile önceden seçili şekilde açar (örn. Genel Bilgiler, Sınıflandırma).
5. Kullanıcı diğer bölümleri, ilgili sabit menü sayfalarına giderek istediği sırayla tamamlar; her sayfada Ürün Seçici zaten bu ürünle dolu gelir.

Bu model, henüz ürün kimliği yokken modül, medya, fiyatlandırma kuralı ve stok gibi alt kayıtların geçici kimliklerle aynı büyük formda tutulması ihtiyacını azaltır.

### Ürün güncelleme

- Kullanıcı doğrudan sabit menüden ilgili sayfaya girer (örn. `Yazılım ve Lisanslı Ürün İşlemleri > Modüller`) ve Ürün Seçici üzerinden ürünü arayıp seçer.
- Her sayfa yalnızca kendi bölümünü yükleyip kaydetmelidir.
- Ürün Seçici'de seçim değiştiğinde kaydedilmemiş değişiklik varsa kullanıcı uyarılmalıdır.
- Sayfalarda ortak bir ürün başlığı bulunmalıdır: seçili ürünün adı, kodu, türü, durum rozeti ve "Ürün Listesine Dön".
- Başarı mesajı sayfa bağlamını belirtmelidir: "Fiyatlandırma güncellendi", "Modüller güncellendi" gibi.
- Ürün Özeti, diğer sayfaların tamamlanma durumlarını kartlar üzerinden göstermelidir.
- İsteğe bağlı iyileştirme: Ürün Seçici, kullanıcının o sayfada en son seçtiği ürünleri "Son kullanılanlar" olarak önerebilir; bu, sayfalar arası geçişte ürünü tekrar aratma ihtiyacını azaltır ama zorunlu bir bağlam taşıma mekanizması değildir.

## 10. Açılış Sayfası Kararı

Uygulamanın varsayılan sayfası **Tüm Ürünler** olmalıdır.

Değişmesi planlanan davranışlar:

- `/` adresi `/products` adresine yönlenir.
- Başarılı giriş sonrası özel bir `returnUrl` yoksa `/products` açılır.
- Uygulama logosu `/products` adresine gider.
- Sol dar uygulama çubuğunda ilk kısayol `Ürünler` olur.
- Bilinmeyen bir uygulama rotasında kullanıcı `/products` sayfasına yönlendirilir veya anlamlı bir 404 sayfası gösterilir.
- Mevcut gösterge paneli kaldırılmaz; `Analiz ve Raporlama > Genel Bakış` altına taşınır.

## 11. Mevcut Menüden Yeni Menüye Eşleme

| Mevcut ad | Yeni konum/ad |
|---|---|
| Gösterge Paneli | Analiz ve Raporlama > Genel Bakış |
| Ürünler | Ürün İşlemleri > Ürünler > Tüm Ürünler |
| Katalog > Kategoriler | Yönetim ve Tanımlar > Katalog Tanımları > Kategori Tanımları |
| Katalog > Özellik Tanımları | Yönetim ve Tanımlar > Katalog Tanımları > Özellik Tanımları |
| Katalog > Birim Tanımları | Yönetim ve Tanımlar > Yazılım Ürünü Tanımları > Yazılım Birim Sözlüğü |
| Katalog > Tedarikçiler | Yönetim ve Tanımlar > Tedarik ve Depo Tanımları > Tedarikçi Tanımları |
| Katalog > Depolar | Yönetim ve Tanımlar > Tedarik ve Depo Tanımları > Depo Tanımları |
| Fiyat Yönetimi > Fiyat Listeleri | Yönetim ve Tanımlar > Fiyat Yönetimi > Fiyat Listeleri |
| Stok Yönetimi | Ürün İşlemleri > Stok İşlemleri |
| Ürün formu > Kategori | Ürün İşlemleri > Ürün Bilgileri > Sınıflandırma (sayfa içinde ürün seçilir) |
| Ürün formu > Ürün Birimleri | Ürün İşlemleri > Yazılım ve Lisanslı Ürün İşlemleri > Fiyatlandırma Birimleri (sayfa içinde ürün seçilir) |
| Ürün formu > Yazılım Modülleri | Ürün İşlemleri > Yazılım ve Lisanslı Ürün İşlemleri > Modüller (sayfa içinde ürün seçilir) |
| Ürün formu > Fiyat Tarifleri | Ürün İşlemleri > Fiyatlandırma (sayfa içinde ürün seçilir) |
| Ürün formu > Dinamik Kurallar | Ürün İşlemleri > Yazılım ve Lisanslı Ürün İşlemleri > Dinamik Fiyat Kuralları (sayfa içinde ürün seçilir) |
| Ürün formu > Profil ve Teknik Detaylar | Ürün İşlemleri > Ürün Bilgileri > Gelişmiş Ayarlar (sayfa içinde ürün seçilir) |

## 12. Yetkilendirme ve Menü Görünürlüğü

Sayfalara bölme işlemi yetkilendirmeyi daha anlaşılır hâle getirmek için kullanılmalıdır.

Önerilen yetki grupları:

- Ürün görüntüleme
- Ürün temel bilgisi düzenleme
- Ürün sınıflandırma düzenleme
- Ürün fiyatlandırma düzenleme
- Yazılım planı ve modül düzenleme
- Stok işlemi yapma
- Ana veri/tanım yönetme
- Rapor görüntüleme
- Sistem yönetimi

Menü öğesini gizlemek tek başına güvenlik değildir; rota ve API tarafında da aynı yetki kontrol edilmelidir. Aynı şekilde, bir sayfanın Ürün Seçici alanının yalnızca izin verilen ürün tiplerini listelemesi de tek başına yetkilendirme değildir; seçici hem ürün tipi filtresini hem de kullanıcının o ürünü görme/düzenleme yetkisini birlikte uygulamalı, sunucu tarafı da aynı kısıtları tekrar doğrulamalıdır.

## 13. Uygulama Aşamaları

### Aşama 1 — Menü ve açılış düzeni

- Ana menüyü üç başlık altında yeniden düzenle.
- `/`, giriş sonrası varsayılan rota, logo ve uygulama kısayollarını `/products` yap.
- Mevcut sayfaları yeni isimleriyle sabit menüye taşı.
- Henüz yapılmamış raporları menüde boş bağlantı olarak göstermeme.

### Aşama 2 — Ortak Ürün Seçici bileşeni

- Sayfa formlarının en üstünde kullanılacak, arama/otomatik tamamlama destekli tek bir Ürün Seçici bileşeni oluştur.
- Bileşenin ürün tipi filtresini sayfa bazlı bir konfigürasyondan alacak şekilde tasarla (bkz. Bölüm 7 tablosu).
- Ürün Seçici'den ürün seçilmeden sayfanın form alanlarını gizli/pasif tut.
- `?productId=` parametresiyle gelen sayfalarda seçiciyi otomatik doldur.
- Ürün Özeti sayfasındaki kısayol bağlantılarının ilgili sayfayı doğru `productId` ile açtığını doğrula.

### Aşama 3 — Temel ürün sayfaları

- Genel Bilgiler
- Sınıflandırma
- Medya
- Varyantlar
- Gelişmiş Ayarlar

Her sayfanın bağımsız veri yükleme, validasyon ve kaydetme sınırını belirle; Ürün Seçici filtresinin sayfaya uygun tiplerle sınırlı olduğunu doğrula.

### Aşama 4 — Fiyatlandırma ve yazılım ürün sayfaları

- Fiyatlandırma
- Fiyatlandırma Birimleri
- Satış Planları
- Dinamik Fiyat Kuralları
- Modüller

Mevcut yazılım fiyatlandırma stüdyosunun üç adımını bağımsız sayfalara dağıtırken, Fiyatlandırma sayfasında ortak ilerleme özeti bırak. Fiyatlandırma Birimleri ve Modüller sayfalarının Ürün Seçici'sinde fiziksel ürünlerin hiç listelenmediğini doğrula.

### Aşama 5 — Stok ve tedarik

- Ürüne bağlı Stok ve Tedarik sayfasını oluştur; Ürün Seçici'sini yalnızca fiziksel ürünlerle sınırla.
- Sistem genelindeki stok sayfalarıyla bağlantıları kur.
- Ürüne bağlı sayfadan açılan stok işleminde ürün filtresini otomatik doldur.

### Aşama 6 — Analiz ve raporlama

- Mevcut gösterge panelini Genel Bakış adıyla taşı.
- Ürün, fiyat ve stok raporlarını gerçek ihtiyaç ve metrikler belirlendikçe ekle.
- Denetim, giriş ve sistem kayıtlarını raporlama başlığı altında uygun yetkilerle grupla.

### Aşama 7 — Eski yapının kaldırılması

- Eski ürün formundaki dört iş akışı navigasyonunu kaldır.
- Eski rotaları (`/products/:id/general` vb.) yeni sabit rotalara `productId` parametresiyle yönlendirme olarak koru.
- Kullanılmayan form bileşenlerini ancak tüm yeni sayfalar doğrulandıktan sonra temizle.

## 14. Teknik Uygulama Notları

Uygulama sırasında özellikle aşağıdaki mevcut alanlar ele alınmalıdır:

- `src/layout/sidebar/MenuData.tsx`: sabit ve tek katmanlı menü grupları; ürün bağlamına göre değişen herhangi bir alt yapı içermemelidir
- `src/layout/menu/Menu.tsx`: ürün bağlamına göre dinamik/koşullu menü render'ı kaldırılır; menü her zaman aynı statik veriden üretilir
- `src/modules/products/components/ProductPicker.tsx` *(yeni)*: sayfa bazlı ürün tipi filtresi alan, arama destekli ortak Ürün Seçici bileşeni
- `src/app/router.tsx`: yeni sabit sayfa rotaları, `productId` sorgu parametresi desteği ve eski rota yönlendirmeleri
- `src/layout/appbar/Appbar.tsx`: logo ve kısa yollar
- `src/modules/auth`: giriş sonrası varsayılan rota
- `src/modules/products/pages/ProductFormPage.tsx`: büyük formun bağımsız sayfalara ayrılması
- `src/modules/products/components/detail/ProductDetailTabs.tsx`: detay sekmelerinin sayfalara dönüştürülmesi
- `src/modules/products/components/editor/*`: mevcut editörlerin, en üstte Ürün Seçici bulunan sayfa içerikleri olarak yeniden kullanılması

Menü, ürün detay ve ürün düzenleme sayfaları için ayrı ayrı sekme listeleri tanımlanmamalıdır. Tek bir `productSectionConfig` benzeri yapı; sayfa adı, rota, ikon, izin verilen ürün tipleri (Ürün Seçici filtresi) ve yetki bilgisini merkezi olarak üretmelidir. Böylece sol menü, rota ve Ürün Seçici filtreleri zamanla birbirinden kopmaz.

## 15. Kabul Kriterleri

- Uygulama ilk açıldığında ürün listesi görünür.
- Ürün listesine en fazla bir tıklamayla ulaşılır.
- Menü sırası `Ürün İşlemleri`, `Yönetim ve Tanımlar`, `Analiz ve Raporlama` şeklindedir.
- Sol menü, kullanıcı hangi sayfada olursa olsun veya hangi ürünü seçmiş olursa olsun **aynı yapıda** kalır; ürüne özel dinamik bir menü grubu yoktur.
- Sistem geneli tanımlar ile ürüne bağlı işlemler farklı başlık ve adlarla gösterilir.
- Yazılım Birim Sözlüğü katalog/tüm ürünler alanından ayrılmıştır.
- Fiyatlandırma Birimleri, Satış Planları ve Modüller sayfalarının Ürün Seçici alanında yalnızca uygun ürün tipleri listelenir; örneğin Modüller ve Fiyatlandırma Birimleri sayfalarında fiziksel ürünler hiç görünmez.
- Varyantlar ve Stok ve Tedarik sayfalarının Ürün Seçici alanında yalnızca fiziksel ürünler listelenir.
- Bir sayfada ürün seçilmeden form alanları görüntülenmez veya düzenlenemez.
- Ürün oluşturulduktan sonra her bölüm, ilgili sabit sayfaya gidip Ürün Seçici'den ürün seçilerek bağımsız şekilde açılabilir ve kaydedilebilir.
- Eski bağlantılar kullanıcıyı geçerli yeni sabit sayfaya (gerekliyse `productId` ile) yönlendirir.
- Her sayfanın Ürün Seçici filtresi, kullanıcının yetkisiyle ve o sayfanın geçerli olduğu ürün tipleriyle tutarlıdır.
- Henüz geliştirilmemiş analiz sayfaları yanıltıcı aktif menü öğeleri olarak gösterilmez.

## 16. Son Karar Özeti

Önerilen yapı, ürünle ilgili her şeyi tek bir büyük forma sığdırmak yerine, sabit ve öngörülebilir bir sol menüdeki bağımsız sayfaları kullanır. Ürüne bağlı bölümler, açık bir ürüne göre beliren dinamik bir menü grubunda değil; her biri kendi sabit menü konumunda yaşar ve sayfanın en üstündeki **Ürün Seçici** ile hangi ürün üzerinde çalışılacağı belirlenir. Sol menünün üstünde günlük ürün işlemleri, altında sistem genelindeki tanımlar, en altta analiz ve raporlama yer alır.

En kritik isimlendirme ve mimari kararları şunlardır:

- Açılış sayfası: **Tüm Ürünler**
- Ana üst bölüm: **Ürün İşlemleri**
- İkinci bölüm: **Yönetim ve Tanımlar**
- Üçüncü bölüm: **Analiz ve Raporlama**
- Menü: **sabit**, ürün bağlamına göre değişmez
- Ürüne bağlı sayfalarda ürün seçimi: sayfa içi **Ürün Seçici**, ürün tipine göre filtrelenir
- `Birim Tanımları`: **Yazılım Birim Sözlüğü**
- Ürüne bağlı birimler: **Fiyatlandırma Birimleri** (Ürün Seçici yalnızca yazılım/uygun tipler)
- Ürüne bağlı modüller: **Modüller** veya **Ürün Modülleri** (Ürün Seçici yalnızca yazılım)
- Ürüne kategori/özellik atama sayfası: **Sınıflandırma**
- Teknik "lisans teklifi" kullanıcı dili: **Satış Planı**

Bu adlandırma ve mimari, kullanıcının "sisteme yeni bir sözlük kaydı mı ekliyorum, yoksa bir ürünü mü düzenliyorum?" sorusunu menüye bakarak; "bu sayfada hangi ürünleri görebilirim?" sorusunu ise Ürün Seçici'ye bakarak cevaplayabilmesini sağlar.
