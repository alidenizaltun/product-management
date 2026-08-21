/**
 * Sol menü — sabit yapıdadır.
 *
 * Menü, kullanıcının hangi sayfada olduğuna veya hangi ürünü seçtiğine göre
 * değişmez; ürüne özel dinamik bir grup içermez. Ürüne bağlı sayfalarda hangi
 * ürünle çalışılacağı sayfa içindeki Ürün Seçici ile belirlenir.
 *
 * Ürüne bağlı sayfaların rota ve etiketleri
 * `@/modules/products/config/productSections` içindeki merkezi konfigürasyondan
 * üretilir; böylece menü, rota ve Ürün Seçici filtreleri birbirinden kopmaz.
 *
 * İki ana grup vardır:
 * - "Fiyatlandırma": ürün tipinden bağımsız tek bir Ürün Fiyatlandırma sayfası
 *   ile fiyat listeleri ve kampanya kuralları. Sayfanın içeriği seçili ürünün
 *   tipine göre değişir.
 * - "İşlemler": yalnızca belirli ürün tiplerinde anlamlı olan sayfalar, ürün
 *   tipi başlıkları altında toplanır.
 */
import { getProductSection } from "@/modules/products/config/productSections";

const sectionItem = (key: Parameters<typeof getProductSection>[0]) => {
  const section = getProductSection(key);
  return { text: section.label, link: section.path };
};

const menu = [
  { heading: "ÜRÜN İŞLEMLERİ" },
  {
    icon: "box",
    text: "Ürünler",
    subMenu: [
      { text: "Tüm Ürünler", link: "/products" },
      { text: "Yeni Ürün", link: "/products/new" },
    ],
  },
  {
    icon: "file-text",
    text: "Ürün Bilgileri",
    subMenu: [
      sectionItem("general"),
      sectionItem("classification"),
      sectionItem("regions"),
      sectionItem("media"),
      sectionItem("advanced"),
    ],
  },
  {
    icon: "coins",
    text: "Fiyatlandırma",
    subMenu: [
      sectionItem("pricing"),
      { text: "Fiyat Listeleri", link: "/pricing/price-lists" },
      { text: "Fiyat Şablonları", link: "/pricing/templates" },
      { text: "Zam Yönetimi", link: "/pricing/revisions" },
      { text: "Kampanya Kuralları", link: "/pricing/campaign-rules" },
    ],
  },
  {
    icon: "layers",
    text: "İşlemler",
    subMenu: [
      {
        text: "Fiziksel Ürün",
        subMenu: [sectionItem("variants"), sectionItem("inventory-supply")],
      },
      {
        text: "Yazılım Ürünü",
        subMenu: [sectionItem("modules")],
      },
    ],
  },
  {
    icon: "archive",
    text: "Stok İşlemleri",
    subMenu: [
      { text: "Stok Durumu", link: "/inventory/stock" },
      { text: "Stok Hareketleri", link: "/inventory/transactions" },
      { text: "Rezervasyonlar", link: "/inventory/reservations" },
      { text: "Depo Bazlı Stok", link: "/inventory/warehouse-stock" },
    ],
  },

  { heading: "YÖNETİM VE TANIMLAR" },
  {
    icon: "list-index",
    text: "Katalog Tanımları",
    subMenu: [
      { text: "Kategori Tanımları", link: "/definitions/categories" },
      { text: "Bölge Tanımları", link: "/definitions/regions" },
      { text: "Özellik Tanımları", link: "/definitions/attributes" },
      { text: "Özellik Setleri", link: "/definitions/attribute-sets" },
    ],
  },
  {
    icon: "cpu",
    text: "Yazılım Ürünü Tanımları",
    subMenu: [{ text: "Yazılım Birim Sözlüğü", link: "/definitions/software-units" }],
  },
  {
    icon: "truck",
    text: "Tedarik ve Depo Tanımları",
    subMenu: [
      { text: "Tedarikçi Tanımları", link: "/definitions/suppliers" },
      { text: "Depo Tanımları", link: "/definitions/warehouses" },
    ],
  },
  {
    icon: "setting",
    text: "Sistem Yönetimi",
    subMenu: [
      { text: "Kullanıcılar", link: "/identity/users" },
      { text: "Roller ve Yetkiler", link: "/identity/roles" },
      { text: "Sistem Ayarları", link: "/system/settings" },
      { text: "Entegrasyonlar", link: "/system/integrations" },
    ],
  },

  { heading: "ANALİZ VE RAPORLAMA" },
  {
    icon: "dashboard",
    text: "Genel Bakış",
    link: "/analytics",
  },
  {
    icon: "reports",
    text: "Denetim ve Sistem Kayıtları",
    subMenu: [
      { text: "İşlem Geçmişi", link: "/system/audit" },
      { text: "Oturum Kayıtları", link: "/identity/login-audit" },
      { text: "Sistem Logları", link: "/system/logs" },
    ],
  },
];

export default menu;
