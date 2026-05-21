const menu = [
  { heading: "GENEL" },
  {
    icon: "dashboard",
    text: "Gösterge Paneli",
    link: "/dashboard",
  },
  { heading: "ÜRÜN YÖNETİMİ" },
  {
    icon: "box",
    text: "Ürünler",
    link: "/products",
  },
  {
    icon: "list-index",
    text: "Katalog",
    subMenu: [
      { text: "Kategoriler", link: "/catalog/categories" },
      { text: "Tedarikçiler", link: "/catalog/suppliers" },
      { text: "Depolar", link: "/catalog/warehouses" },
      { text: "Birim Tanımları", link: "/catalog/unit-definitions" },
      { text: "Özellik Tanımları", link: "/attributes/definitions" },
    ],
  },
  {
    icon: "coins",
    text: "Fiyat Yönetimi",
    subMenu: [{ text: "Fiyat Listeleri", link: "/pricing/pricelists" }],
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
];

export default menu;
