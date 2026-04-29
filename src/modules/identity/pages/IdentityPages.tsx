import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import EmptyState from "@/modules/shared/components/EmptyState";

interface PlaceholderProps {
  title: string;
  description?: string;
  emptyTitle: string;
  emptyDescription?: string;
  emptyIcon?: string;
}

const IdentityPlaceholder: React.FC<PlaceholderProps> = ({
  title,
  description,
  emptyTitle,
  emptyDescription,
  emptyIcon = "users",
}) => {
  const navigate = useNavigate();
  return (
    <>
      <Head title={title} />
      <Content>
        <PageHeader title={title} description={description} />
        <Block>
          <div className="card card-bordered">
            <EmptyState
              icon={emptyIcon}
              title={emptyTitle}
              description={emptyDescription}
              action={
                <Button color="light" onClick={() => navigate("/dashboard")}>
                  <Icon name="arrow-left" className="me-1" />
                  Panele Dön
                </Button>
              }
            />
          </div>
        </Block>
      </Content>
    </>
  );
};

export const UserListPage: React.FC = () => (
  <IdentityPlaceholder
    title="Kullanıcılar"
    description="Sistem kullanıcı hesapları."
    emptyTitle="Kullanıcı yönetimi yakında"
    emptyDescription="Bu modül henüz hazırlanma aşamasında."
    emptyIcon="users"
  />
);

export const UserFormPage: React.FC = () => (
  <IdentityPlaceholder
    title="Kullanıcı Düzenle"
    emptyTitle="Kullanıcı yönetimi yakında"
    emptyIcon="user-add"
  />
);

export const UserDetailPage: React.FC = () => (
  <IdentityPlaceholder
    title="Kullanıcı Detayı"
    emptyTitle="Kullanıcı yönetimi yakında"
    emptyIcon="user"
  />
);

export const RoleListPage: React.FC = () => (
  <IdentityPlaceholder
    title="Roller"
    description="Rol ve yetki modeli."
    emptyTitle="Rol yönetimi yakında"
    emptyIcon="shield-star"
  />
);

export const RoleFormPage: React.FC = () => (
  <IdentityPlaceholder title="Rol Düzenle" emptyTitle="Rol yönetimi yakında" emptyIcon="shield-star" />
);

export const RoleDetailPage: React.FC = () => (
  <IdentityPlaceholder title="Rol Detayı" emptyTitle="Rol yönetimi yakında" emptyIcon="shield-star" />
);

export const PermissionMatrixPage: React.FC = () => (
  <IdentityPlaceholder
    title="Yetki Matrisi"
    description="Rol-yetki eşleştirmesi."
    emptyTitle="Yetki matrisi yakında"
    emptyIcon="shield-check"
  />
);

export const LoginAuditPage: React.FC = () => (
  <IdentityPlaceholder
    title="Oturum / Kimlik Logları"
    description="Giriş, çıkış ve kimlik doğrulama olayları."
    emptyTitle="Audit logları yakında"
    emptyIcon="activity"
  />
);
