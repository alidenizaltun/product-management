import React from "react";
import ModuleListPage from "@/modules/shared/pages/ModuleListPage";
import ModuleFormPage from "@/modules/shared/pages/ModuleFormPage";
import ModuleDetailPage from "@/modules/shared/pages/ModuleDetailPage";

export const PriceListListPage: React.FC = () => (
  <ModuleListPage
    title="Fiyat Listeleri"
    description="Satış kanalı ve müşteri grubuna göre fiyat listeleri"
    createPath="/pricing/pricelists/new"
    detailPathSample="/pricing/pricelists/sample"
  />
);

export const PriceListFormPage: React.FC = () => (
  <ModuleFormPage
    title="Fiyat Listesi Ekle / Düzenle"
    fields={[
      { name: "code", label: "Kod", type: "text" },
      { name: "name", label: "Ad", type: "text" },
      { name: "currencyCode", label: "Para Birimi", type: "text" },
      { name: "isActive", label: "Aktif", type: "checkbox" },
    ]}
  />
);

export const PriceListDetailPage: React.FC = () => <ModuleDetailPage title="Fiyat Listesi Detayı" />;

export const ProductPriceListPage: React.FC = () => <ModuleDetailPage title="Ürün Fiyatları" />;
export const VariantPriceListPage: React.FC = () => <ModuleDetailPage title="Varyant Fiyatları" />;
export const CampaignRulesPage: React.FC = () => <ModuleDetailPage title="Kampanya / İndirim Kuralları" />;
