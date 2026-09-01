import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";

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
        <Block className="" size="">
          <div className="card card-bordered">
            <EmptyState
              icon={emptyIcon}
              title={emptyTitle}
              description={emptyDescription}
              action={
                <Button color="light" onClick={() => navigate("/products")}>
                  <Icon name="arrow-left" id="" className="me-1" style={{}} />
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
