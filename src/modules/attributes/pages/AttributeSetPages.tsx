import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import EmptyState from "@/modules/shared/components/EmptyState";

/**
 * Özellik Setleri için backend henüz hazır değil — kullanıcıya net bir
 * "yakında" durumu göster, "hazır" placeholder yerine.
 */
const ComingSoon: React.FC<{ title: string; description?: string; backTo: string }> = ({
  title,
  description,
  backTo,
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
              icon="clock"
              title="Bu modül yakında"
              description="Bu sayfa henüz hazırlanma aşamasında. Çok yakında erişilebilir olacak."
              action={
                <Button color="light" onClick={() => navigate(backTo)}>
                  <Icon name="arrow-left" className="me-1" />
                  Geri Dön
                </Button>
              }
            />
          </div>
        </Block>
      </Content>
    </>
  );
};

export const AttributeSetListPage: React.FC = () => (
  <ComingSoon
    title="Özellik Setleri"
    description="Ürün tipine göre özellik setleri."
    backTo="/dashboard"
  />
);

export const AttributeSetFormPage: React.FC = () => (
  <ComingSoon title="Özellik Seti Düzenle" backTo="/attributes/sets" />
);

export const AttributeSetDetailPage: React.FC = () => (
  <ComingSoon title="Özellik Seti Detayı" backTo="/attributes/sets" />
);
