import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";

const CampaignRulesPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <Head title="Kampanya / İndirim Kuralları" />
      <Content>
        <PageHeader
          title="Kampanya / İndirim Kuralları"
          description="Promosyon, indirim ve kampanya kurallarını yönetin."
        />
        <Block>
          <div className="card card-bordered">
            <EmptyState
              icon="gift"
              title="Bu modül yakında"
              description="Kampanya kuralları motoru henüz hazırlanma aşamasında."
              action={
                <Button color="light" onClick={() => navigate("/pricing/price-lists")}>
                  <Icon name="arrow-left" className="me-1" />
                  Fiyat Listelerine Dön
                </Button>
              }
            />
          </div>
        </Block>
      </Content>
    </>
  );
};

export default CampaignRulesPage;
