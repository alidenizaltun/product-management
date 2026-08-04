/**
 * Sol menü — sabit ve tek katmanlıdır.
 *
 * Menü, kullanıcının hangi sayfada olduğuna veya hangi ürünü seçtiğine göre
 * değişmez; ürüne özel dinamik bir grup içermez. Ürüne bağlı sayfalarda hangi
 * ürünle çalışılacağı sayfa içindeki Ürün Seçici ile belirlenir.
 *
 * Ürüne bağlı sayfaların rota ve etiketleri
 * `@/modules/products/config/productSections` içindeki merkezi konfigürasyondan
 * üretilir; böylece menü, rota ve Ürün Seçici filtreleri birbirinden kopmaz.
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
      sectionItem("media"),
      sectionItem("advanced"),
    ],
  },
  {
    icon: "package",
    text: "Fiziksel Ürün İşlemleri",
    subMenu: [sectionItem("variants"), sectionItem("inventory-supply"), sectionItem("pricing")],
  },
  {
    icon: "laptop",
    text: "Yazılım ve Lisanslı Ürün İşlemleri",
    subMenu: [
      sectionItem("pricing-units"),
      sectionItem("sales-plans"),
      sectionItem("pricing-rules"),
      sectionItem("modules"),
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
    icon: "tag",
    text: "Fiyat Yönetimi",
    subMenu: [
      { text: "Fiyat Listeleri", link: "/pricing/price-lists" },
      { text: "Kampanya Kuralları", link: "/pricing/campaign-rules" },
    ],
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
