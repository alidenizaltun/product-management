import React from "react";
import ModuleListPage from "@/modules/shared/pages/ModuleListPage";
import ModuleFormPage from "@/modules/shared/pages/ModuleFormPage";
import ModuleDetailPage from "@/modules/shared/pages/ModuleDetailPage";

export const SupplierListPage: React.FC = () => (
  <ModuleListPage
    title="Tedarikçiler"
    description="Tedarikçi kayıtlarının yönetimi"
    createPath="/catalog/suppliers/new"
    detailPathSample="/catalog/suppliers/sample"
  />
);

export const SupplierFormPage: React.FC = () => (
  <ModuleFormPage
    title="Tedarikçi Ekle / Düzenle"
    fields={[
      { name: "supplierCode", label: "Kod", type: "text" },
      { name: "name", label: "Ad", type: "text" },
      { name: "email", label: "E-posta", type: "text" },
      { name: "isActive", label: "Aktif", type: "checkbox" },
    ]}
  />
);

export const SupplierDetailPage: React.FC = () => <ModuleDetailPage title="Tedarikçi Detayı" />;
