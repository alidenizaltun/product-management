import React from "react";
import ModuleListPage from "@/modules/shared/pages/ModuleListPage";
import ModuleFormPage from "@/modules/shared/pages/ModuleFormPage";
import ModuleDetailPage from "@/modules/shared/pages/ModuleDetailPage";

export const UserListPage: React.FC = () => (
  <ModuleListPage
    title="Kullanıcılar"
    description="Sistem kullanıcı hesapları"
    createPath="/identity/users/new"
    detailPathSample="/identity/users/sample"
  />
);

export const UserFormPage: React.FC = () => (
  <ModuleFormPage
    title="Kullanıcı Ekle / Düzenle"
    fields={[
      { name: "fullName", label: "Ad Soyad", type: "text" },
      { name: "email", label: "E-posta", type: "text" },
      { name: "isActive", label: "Aktif", type: "checkbox" },
    ]}
  />
);

export const UserDetailPage: React.FC = () => <ModuleDetailPage title="Kullanıcı Detayı" />;

export const RoleListPage: React.FC = () => (
  <ModuleListPage
    title="Roller"
    description="Rol ve yetki modeli"
    createPath="/identity/roles/new"
    detailPathSample="/identity/roles/sample"
  />
);

export const RoleFormPage: React.FC = () => (
  <ModuleFormPage
    title="Rol Ekle / Düzenle"
    fields={[
      { name: "name", label: "Rol Adı", type: "text" },
      { name: "description", label: "Açıklama", type: "textarea" },
    ]}
  />
);

export const RoleDetailPage: React.FC = () => <ModuleDetailPage title="Rol Detayı" />;
export const PermissionMatrixPage: React.FC = () => <ModuleDetailPage title="Yetki Matrisi" />;
export const LoginAuditPage: React.FC = () => <ModuleDetailPage title="Oturum / Kimlik Logları" />;
