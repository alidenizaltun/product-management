import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import Icon from "@/components/icon/Icon";
import { Block } from "@/components/Component";
import PageHeader from "@/modules/shared/components/PageHeader";
import StatusBadge from "@/modules/shared/components/StatusBadge";
import EmptyState from "@/modules/shared/components/EmptyState";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
import { useProductDetail } from "@/modules/products/hooks/useProductDetail";
import { useProductMutations } from "@/modules/products/hooks/useProductMutations";

const KIND_LABELS: Record<number, string> = {
  1: "Fiziksel Ürün",
  2: "Yazılım",
  3: "Hizmet",
  4: "Abonelik",
};

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: "Taslak", color: "secondary" },
  1: { label: "Aktif", color: "success" },
  2: { label: "Pasif", color: "warning" },
  3: { label: "Arşivlendi", color: "danger" },
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

const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: product, isLoading } = useProductDetail(id);
  const { deleteMutation } = useProductMutations();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const status = product ? STATUS_LABELS[product.status] : undefined;

  const handleDelete = async () => {
    if (!id) return;
    await deleteMutation.mutateAsync(id);
    setConfirmOpen(false);
    navigate("/products");
  };

  return (
    <>
      <Head title={product?.name ?? "Ürün Detayı"} />
      <Content>
        <PageHeader
          title={product?.name ?? "Ürün Detayı"}
          description={product ? `Kod: ${product.productCode}` : undefined}
          actions={
            <div className="d-flex gap-2">
              <Button color="light" onClick={() => navigate("/products")}>
                <Icon name="arrow-left" className="me-1" />
                Geri
              </Button>
              {id ? (
                <>
                  <Link to={`/products/${id}/edit`} className="btn btn-primary">
                    <Icon name="edit" className="me-1" />
                    Düzenle
                  </Link>
                  <Button color="danger" outline onClick={() => setConfirmOpen(true)}>
                    <Icon name="trash" className="me-1" />
                    Sil
                  </Button>
                </>
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
          ) : !product ? (
            <div className="card card-bordered">
              <EmptyState icon="alert-circle" title="Ürün bulunamadı" />
            </div>
          ) : (
            <div className="row g-3">
              <div className="col-lg-8">
                <div className="card card-bordered h-100">
                  <div className="card-inner">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h6 className="overline-title text-primary mb-0">Genel Bilgiler</h6>
                      <div className="d-flex gap-2">
                        {status && (
                          <span className={`badge badge-dim bg-${status.color}`}>{status.label}</span>
                        )}
                        <StatusBadge active={product.isActive} />
                      </div>
                    </div>
                    <InfoRow label="Ürün Kodu" value={product.productCode} />
                    <InfoRow label="Ad" value={product.name} />
                    <InfoRow label="Tür" value={KIND_LABELS[product.kind]} />
                    <InfoRow label="Marka" value={product.brand} />
                    <InfoRow label="Üretici" value={product.manufacturer} />
                    <InfoRow label="Barkod" value={product.barcode} />
                    <InfoRow label="Kısa Açıklama" value={product.shortDescription} />
                    <InfoRow label="Açıklama" value={product.description} />
                  </div>
                </div>
              </div>

              <div className="col-lg-4">
                <div className="card card-bordered h-100">
                  <div className="card-inner">
                    <h6 className="overline-title text-primary mb-3">Ticari Bilgiler</h6>
                    <InfoRow label="Para Birimi" value={product.defaultCurrencyCode} />
                    <InfoRow label="Birim" value={product.unitOfMeasure} />
                    <InfoRow
                      label="Vergi"
                      value={
                        product.taxRate !== undefined
                          ? `%${product.taxRate}${product.taxCode ? ` (${product.taxCode})` : ""}`
                          : undefined
                      }
                    />
                    <InfoRow label="Etiketler" value={product.tags} />
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card card-bordered">
                  <div className="card-inner">
                    <h6 className="overline-title text-primary mb-3">Satış Ayarları</h6>
                    <div className="row g-3">
                      <div className="col-md-3">
                        <div className="d-flex align-items-center gap-2">
                          <Icon
                            name={product.isActive ? "check-circle-fill" : "cross-circle-fill"}
                            className={product.isActive ? "text-success" : "text-secondary"}
                          />
                          <span>Aktif</span>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="d-flex align-items-center gap-2">
                          <Icon
                            name={product.isSellable ? "check-circle-fill" : "cross-circle-fill"}
                            className={product.isSellable ? "text-success" : "text-secondary"}
                          />
                          <span>Satılabilir</span>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="d-flex align-items-center gap-2">
                          <Icon
                            name={product.isPurchasable ? "check-circle-fill" : "cross-circle-fill"}
                            className={product.isPurchasable ? "text-success" : "text-secondary"}
                          />
                          <span>Satın Alınabilir</span>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="d-flex align-items-center gap-2">
                          <Icon
                            name={product.trackInventory ? "check-circle-fill" : "cross-circle-fill"}
                            className={product.trackInventory ? "text-success" : "text-secondary"}
                          />
                          <span>Stok Takibi</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="card card-bordered">
                  <div className="card-inner">
                    <h6 className="overline-title text-primary mb-3">Sistem Bilgileri</h6>
                    <InfoRow
                      label="Oluşturulma"
                      value={new Date(product.createdAt).toLocaleString("tr-TR")}
                    />
                    <InfoRow
                      label="Güncellenme"
                      value={
                        product.updatedAt ? new Date(product.updatedAt).toLocaleString("tr-TR") : undefined
                      }
                    />
                    <InfoRow label="ID" value={<code className="fs-13px">{product.id}</code>} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </Block>
      </Content>

      <ConfirmDialog
        open={confirmOpen}
        title="Ürün Silinsin mi?"
        message={`"${product?.name ?? "Bu ürün"}" kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        variant="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default ProductDetailPage;
