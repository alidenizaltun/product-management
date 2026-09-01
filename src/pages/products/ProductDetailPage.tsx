import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "reactstrap";
import Content from "@/layout/content/Content";
import Head from "@/layout/head/Head";
import { Block } from "@/components/Component";
import PageHeader from "@/components/shared/PageHeader";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import AppTabs from "@/components/shared/AppTabs";
import { useProductDetail } from "@/application/hooks/useProductDetail";
import { useProductMutations } from "@/application/hooks/useProductMutations";
import ProductDetailHero from "@/pages/products/components/detail/ProductDetailHero";
import { buildProductDetailTabs } from "@/pages/products/components/detail/ProductDetailTabs";
import { KIND_LABELS, STATUS_LABELS } from "@/pages/products/components/detail/constants";
import ProductSectionShortcuts from "@/pages/products/components/detail/ProductSectionShortcuts";
import { buildProductSectionLink } from "@/pages/products/config/productSections";

const ProductDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: product, isLoading } = useProductDetail(id);
  const { deleteMutation } = useProductMutations();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const productKind = product?.kind;
  const isPhysical = productKind === 1;
  const isSoftware = productKind === 2;
  const isLicensable = productKind === 2 || productKind === 3 || productKind === 4;

  useEffect(() => {
    const physicalOnlyTabs = ["variants", "suppliers", "inventory"];
    const softwareOnlyTabs = ["modules"];
    const licensableTabs = ["pricing-tiers", "license-offerings"];
    const softwareHiddenTabs = ["prices"];

    if (physicalOnlyTabs.includes(activeTab) && !isPhysical) {
      setActiveTab("general");
    }
    if (softwareOnlyTabs.includes(activeTab) && !isSoftware) {
      setActiveTab("general");
    }
    if (licensableTabs.includes(activeTab) && !isLicensable) {
      setActiveTab("general");
    }
    if (softwareHiddenTabs.includes(activeTab) && isSoftware) {
      setActiveTab("general");
    }
  }, [productKind, activeTab, isPhysical, isSoftware, isLicensable]);

  const handleDelete = async () => {
    if (!id) return;
    await deleteMutation.mutateAsync(id);
    navigate("/products");
  };

  const kind = product ? KIND_LABELS[product.kind] : undefined;
  const status = product ? STATUS_LABELS[product.status] : undefined;

  return (
    <>
      <Head title={product ? `${product.productCode} – ${product.name}` : "Ürün Detay"} />
      <Content>
        <PageHeader
          title={product ? product.name : "Yükleniyor…"}
          description={
            product
              ? `${product.productCode}${product.brand ? ` · ${product.brand}` : ""}`
              : undefined
          }
          actions={
            product ? (
              <div className="d-flex gap-2 align-items-center flex-wrap">
                <Button color="light" size="sm" onClick={() => navigate("/products")}>
                  <em className="icon ni ni-arrow-left me-1" />
                  Listeye Dön
                </Button>
                {kind && (
                  <span className={`badge bg-${kind.color} d-none d-md-inline-flex`}>
                    <em className={`icon ni ni-${kind.icon} me-1`} />
                    {kind.label}
                  </span>
                )}
                {status && (
                  <span className={`badge badge-dim bg-${status.color} d-none d-md-inline-flex`}>
                    {status.label}
                  </span>
                )}
                <Button
                  color="primary"
                  size="sm"
                  onClick={() => navigate(buildProductSectionLink("general", id))}
                >
                  <em className="icon ni ni-edit me-1" />
                  Genel Bilgileri Düzenle
                </Button>
                <Button color="danger" outline size="sm" onClick={() => setConfirmOpen(true)}>
                  <em className="icon ni ni-trash me-1" />
                  Sil
                </Button>
              </div>
            ) : undefined
          }
        />

        <Block className="" size="">
          {isLoading ? (
            <div className="card card-bordered">
              <div className="card-inner d-flex align-items-center gap-3 py-5">
                <span className="spinner-border spinner-border-sm text-primary" />
                <span>Ürün yükleniyor…</span>
              </div>
            </div>
          ) : !product ? (
            <div className="card card-bordered">
              <div className="card-inner text-center py-5">
                <em className="icon ni ni-cross-circle fs-1 text-danger d-block mb-3" />
                <p className="text-soft mb-3">Ürün bulunamadı veya yüklenirken hata oluştu.</p>
                <Button color="light" size="sm" onClick={() => navigate("/products")}>
                  <em className="icon ni ni-arrow-left me-1" />
                  Listeye Dön
                </Button>
              </div>
            </div>
          ) : (
            <>
              <ProductDetailHero product={product} />
              <ProductSectionShortcuts product={product} />
              <AppTabs
                tabs={buildProductDetailTabs(product)}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </>
          )}
        </Block>
      </Content>

      <ConfirmDialog
        open={confirmOpen}
        title="Ürün Silinsin mi?"
        message={`"${product?.name}" ürünü kalıcı olarak silinecek. Bu işlem geri alınamaz.`}
        variant="danger"
        loading={deleteMutation.isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default ProductDetailPage;
