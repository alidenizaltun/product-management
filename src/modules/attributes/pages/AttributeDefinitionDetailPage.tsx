import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import { useAttributeDefinition } from "@/modules/attributes/hooks/useAttributes";

const DATA_TYPE_LABELS: Record<number, string> = {
  1: "Metin",
  2: "Sayı",
  3: "Boolean",
  4: "Tarih",
  5: "Liste",
};

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

const AttributeDefinitionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: def, isLoading } = useAttributeDefinition(id);

  return (
    <>
      <Head title={def?.displayName ?? "Özellik Tanımı"} />
      <Content>
        <PageHeader
          title={def?.displayName ?? "Özellik Tanımı"}
          description={def ? `Anahtar: ${def.key}` : undefined}
          actions={
            <div className="d-flex gap-2">
              <Button color="light" onClick={() => navigate("/definitions/attributes")}>
                <Icon name="arrow-left" className="me-1" />
                Geri
              </Button>
              {id ? (
                <Link to={`/definitions/attributes/${id}/edit`} className="btn btn-primary">
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
                <h6 className="overline-title text-primary mb-3">Genel Bilgiler</h6>
                <InfoRow label="Anahtar" value={def?.key} />
                <InfoRow label="Görünen Ad" value={def?.displayName} />
                <InfoRow label="Veri Tipi" value={def && (DATA_TYPE_LABELS[def.dataType] ?? def.dataType)} />
                <InfoRow label="Zorunlu" value={def?.isRequired ? "Evet" : "Hayır"} />
                <InfoRow label="Filtrelenebilir" value={def?.isFilterable ? "Evet" : "Hayır"} />
                <InfoRow label="Varyant Eksen" value={def?.isVariantAxis ? "Evet" : "Hayır"} />
                <InfoRow label="İzinli Değerler" value={def?.allowedValuesJson} />
                <InfoRow label="Doğrulama Kuralı" value={def?.validationRuleJson} />
              </div>
            </div>
          )}
        </Block>
      </Content>
    </>
  );
};

export default AttributeDefinitionDetailPage;
