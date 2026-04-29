import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import EmptyState from "@/modules/shared/components/EmptyState";

const SystemPlaceholder: React.FC<{
  title: string;
  description?: string;
  emptyTitle: string;
  emptyDescription?: string;
  emptyIcon?: string;
}> = ({ title, description, emptyTitle, emptyDescription, emptyIcon = "setting-alt" }) => {
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

export const SystemSettingsPage: React.FC = () => (
  <SystemPlaceholder
    title="Sistem Ayarları"
    description="Genel sistem yapılandırması."
    emptyTitle="Ayarlar yakında"
    emptyDescription="Bu modül henüz hazırlanma aşamasında."
    emptyIcon="setting"
  />
);

export const SystemIntegrationsPage: React.FC = () => (
  <SystemPlaceholder
    title="Entegrasyonlar"
    description="Üçüncü parti entegrasyonlar."
    emptyTitle="Entegrasyonlar yakında"
    emptyIcon="puzzle"
  />
);

export const SystemLogsPage: React.FC = () => (
  <SystemPlaceholder
    title="Sistem Logları"
    description="Uygulama logları ve hata kayıtları."
    emptyTitle="Loglar yakında"
    emptyIcon="file-text"
  />
);

export const SystemAuditPage: React.FC = () => (
  <SystemPlaceholder
    title="Audit Trail"
    description="Sistem aktivite ve değişiklik kayıtları."
    emptyTitle="Audit trail yakında"
    emptyIcon="history"
  />
);
