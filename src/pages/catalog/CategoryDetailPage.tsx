import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/components/shared/PageHeader";
import { useCategories, useCategory } from "@/application/hooks/useCatalog";

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

const CategoryDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: category, isLoading } = useCategory(id);
  const { data: categories = [] } = useCategories();

  const parent = categories.find((c) => c.id === category?.parentCategoryId);

  return (
    <>
      <Head title={category?.name ?? "Kategori Detayı"} />
      <Content>
        <PageHeader
          title={category?.name ?? "Kategori Detayı"}
          description={category ? `Kod: ${category.code}` : undefined}
          actions={
            <div className="d-flex gap-2">
              <Button color="light" onClick={() => navigate("/definitions/categories")}>
                <Icon name="arrow-left" className="me-1" />
                Geri
              </Button>
              {id ? (
                <Link to={`/definitions/categories/${id}/edit`} className="btn btn-primary">
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
                <InfoRow label="Kod" value={category?.code} />
                <InfoRow label="Ad" value={category?.name} />
                <InfoRow label="Üst Kategori" value={parent?.name} />
                <InfoRow label="Açıklama" value={category?.description} />
                <InfoRow
                  label="Oluşturulma"
                  value={category?.createdAt ? new Date(category.createdAt).toLocaleString("tr-TR") : undefined}
                />
              </div>
            </div>
          )}
        </Block>
      </Content>
    </>
  );
};

export default CategoryDetailPage;
