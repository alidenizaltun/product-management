import React from "react";
import ModuleListPage from "@/modules/shared/pages/ModuleListPage";
import ModuleFormPage from "@/modules/shared/pages/ModuleFormPage";
import ModuleDetailPage from "@/modules/shared/pages/ModuleDetailPage";

export const AttributeDefinitionListPage: React.FC = () => (
  <ModuleListPage
    title="Özellik Tanımları"
    description="Ürün özellik alanlarının tanımı"
    createPath="/attributes/definitions/new"
    detailPathSample="/attributes/definitions/sample"
  />
);

export const AttributeDefinitionFormPage: React.FC = () => (
  <ModuleFormPage
    title="Özellik Tanımı Ekle / Düzenle"
    fields={[
      { name: "key", label: "Anahtar", type: "text" },
      { name: "displayName", label: "Görünen Ad", type: "text" },
      { name: "isRequired", label: "Zorunlu", type: "checkbox" },
    ]}
  />
);

export const AttributeDefinitionDetailPage: React.FC = () => <ModuleDetailPage title="Özellik Tanımı Detayı" />;

export const AttributeSetListPage: React.FC = () => (
  <ModuleListPage
    title="Özellik Setleri"
    description="Ürün tipine göre özellik setleri"
    createPath="/attributes/sets/new"
    detailPathSample="/attributes/sets/sample"
  />
);

export const AttributeSetFormPage: React.FC = () => (
  <ModuleFormPage
    title="Özellik Seti Ekle / Düzenle"
    fields={[
      { name: "name", label: "Set Adı", type: "text" },
      { name: "description", label: "Açıklama", type: "textarea" },
    ]}
  />
);

export const AttributeSetDetailPage: React.FC = () => <ModuleDetailPage title="Özellik Seti Detayı" />;

export const ProductAttributeAssignmentPage: React.FC = () => (
  <ModuleDetailPage title="Ürüne Özellik Atamaları" />
);
