import React from "react";
import ModuleListPage from "@/modules/shared/pages/ModuleListPage";
import ModuleFormPage from "@/modules/shared/pages/ModuleFormPage";
import ModuleDetailPage from "@/modules/shared/pages/ModuleDetailPage";

export const CategoryListPage: React.FC = () => (
  <ModuleListPage
    title="Kategoriler"
    description="Kategori listesi ve yönetimi"
    createPath="/catalog/categories/new"
    detailPathSample="/catalog/categories/sample"
  />
);

export const CategoryFormPage: React.FC = () => (
  <ModuleFormPage
    title="Kategori Ekle / Düzenle"
    fields={[
      { name: "code", label: "Kod", type: "text" },
      { name: "name", label: "Ad", type: "text" },
      { name: "description", label: "Açıklama", type: "textarea" },
    ]}
  />
);

export const CategoryDetailPage: React.FC = () => <ModuleDetailPage title="Kategori Detayı" />;
