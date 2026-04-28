import React from "react";
import ModuleListPage from "@/modules/shared/pages/ModuleListPage";
import ModuleFormPage from "@/modules/shared/pages/ModuleFormPage";
import ModuleDetailPage from "@/modules/shared/pages/ModuleDetailPage";

export const WarehouseListPage: React.FC = () => (
  <ModuleListPage
    title="Depolar"
    description="Depo ve stok lokasyon yönetimi"
    createPath="/catalog/warehouses/new"
    detailPathSample="/catalog/warehouses/sample"
  />
);

export const WarehouseFormPage: React.FC = () => (
  <ModuleFormPage
    title="Depo Ekle / Düzenle"
    fields={[
      { name: "code", label: "Kod", type: "text" },
      { name: "name", label: "Ad", type: "text" },
      { name: "city", label: "Şehir", type: "text" },
      { name: "isActive", label: "Aktif", type: "checkbox" },
    ]}
  />
);

export const WarehouseDetailPage: React.FC = () => <ModuleDetailPage title="Depo Detayı" />;
