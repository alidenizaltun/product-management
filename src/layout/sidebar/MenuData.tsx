const menu = [
  { heading: "GENEL" },
  {
    icon: "dashboard",
    text: "Gösterge Paneli",
    subMenu: [
      { text: "Genel Bakış", link: "/dashboard" },
      { text: "Son İşlemler", link: "/dashboard" },
      { text: "Uyarılar", link: "/dashboard" },
    ],
  },
  { heading: "ÜRÜN YÖNETİMİ" },
  {
    icon: "box",
    text: "Ürün Yönetimi",
    subMenu: [
      { text: "Ürünler", link: "/products" },
      { text: "Yeni Ürün", link: "/products/new" },
      { text: "Özellik Tanımları", link: "/attributes/definitions" },
      { text: "Özellik Setleri", link: "/attributes/sets" },
    ],
  },
  {
    icon: "list-index",
    text: "Katalog",
    subMenu: [
      { text: "Kategoriler", link: "/catalog/categories" },
      { text: "Tedarikçiler", link: "/catalog/suppliers" },
      { text: "Depolar", link: "/catalog/warehouses" },
    ],
  },
  {
    icon: "coins",
    text: "Fiyat Yönetimi",
    subMenu: [
      { text: "Fiyat Listeleri", link: "/pricing/pricelists" },
      { text: "Kampanya/İndirim Kuralları", link: "/pricing/campaign-rules" },
    ],
  },
  {
    icon: "package",
    text: "Stok Yönetimi",
    subMenu: [
      { text: "Stok Durumu", link: "/inventory/stock" },
      { text: "Stok Hareketleri", link: "/inventory/transactions" },
      { text: "Rezervasyonlar", link: "/inventory/reservations" },
      { text: "Depo Bazlı Stok", link: "/inventory/warehouse-stock" },
    ],
  },
  {
    icon: "shield-star",
    text: "Kimlik Yönetimi",
    subMenu: [
      { text: "Kullanıcılar", link: "/identity/users" },
      { text: "Roller", link: "/identity/roles" },
      { text: "Yetkiler", link: "/identity/permissions" },
      { text: "Oturum/Kimlik Kayıtları", link: "/identity/login-audit" },
    ],
  },
  {
    icon: "setting-alt",
    text: "Sistem",
    subMenu: [
      { text: "Ayarlar", link: "/system/settings" },
      { text: "Entegrasyonlar", link: "/system/integrations" },
      { text: "Loglar", link: "/system/logs" },
      { text: "Audit Trail", link: "/system/audit" },
    ],
  },
];
export default menu;
