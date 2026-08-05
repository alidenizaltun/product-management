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

export const LoginAuditPage: React.FC = () => (
  <IdentityPlaceholder
    title="Oturum / Kimlik Logları"
    description="Giriş, çıkış ve kimlik doğrulama olayları."
    emptyTitle="Audit logları yakında"
    emptyIcon="activity"
  />
);
