import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import StatusBadge from "@/modules/shared/components/StatusBadge";
import { useWarehouse } from "@/modules/catalog/hooks/useCatalog";

const InfoRow: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <div className="profile-ud-list">
    <div className="profile-ud-item">
      <div className="profile-ud wider">
        <span className="profile-ud-label">{label}</span>
        <span className="profile-ud-value">{value ?? "—"}</span>
      </div>
    </div>
  </div>
);

const WarehouseDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: warehouse, isLoading } = useWarehouse(id);

  return (
    <>
      <Head title={warehouse?.name ?? "Depo Detayı"} />
      <Content>
        <PageHeader
          title={warehouse?.name ?? "Depo Detayı"}
          description={warehouse ? `Kod: ${warehouse.code}` : undefined}
          actions={
            <div className="d-flex gap-2">
              <Button color="light" onClick={() => navigate("/definitions/warehouses")}>
                <Icon name="arrow-left" className="me-1" />
                Geri
              </Button>
              {id ? (
                <Link to={`/definitions/warehouses/${id}/edit`} className="btn btn-primary">
                  <Icon name="edit" className="me-1" />
                  Düzenle
                </Link>
              ) : null}
            </div>
          }
        />
        <Block>
          {isLoading ? (
            <div className="card card-bordered">
              <div className="card-inner d-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm text-primary" />
                <span>Yükleniyor...</span>
              </div>
            </div>
          ) : (
            <div className="card card-bordered">
              <div className="card-inner">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="overline-title text-primary mb-0">Genel Bilgiler</h6>
                  <StatusBadge active={warehouse?.isActive} />
                </div>
                <InfoRow label="Kod" value={warehouse?.code} />
                <InfoRow label="Ad" value={warehouse?.name} />
                <InfoRow label="Şehir" value={warehouse?.city} />
                <InfoRow label="Ülke" value={warehouse?.country} />
                <InfoRow label="Adres" value={warehouse?.address} />
                <InfoRow label="Açıklama" value={warehouse?.description} />
                <InfoRow
                  label="Oluşturulma"
                  value={warehouse?.createdAt ? new Date(warehouse.createdAt).toLocaleString("tr-TR") : undefined}
                />
              </div>
            </div>
          )}
        </Block>
      </Content>
    </>
  );
};

export default WarehouseDetailPage;
