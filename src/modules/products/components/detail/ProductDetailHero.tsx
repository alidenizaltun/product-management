import React from "react";
import type { ProductDetailDto } from "@/shared/types/productOperations.types";
import { KIND_LABELS, STATUS_LABELS } from "./constants";
import { fmt } from "./utils";
import { FlagPill } from "./shared";

interface ProductDetailHeroProps {
  product: ProductDetailDto;
}

const ProductDetailHero: React.FC<ProductDetailHeroProps> = ({ product }) => {
  const kind = KIND_LABELS[product.kind];
  const status = STATUS_LABELS[product.status];
  const primaryImage = product.mediaItems?.find((m) => m.isPrimary) ?? product.mediaItems?.[0];
  const primaryCategory = product.categoryMaps?.find((c) => c.isPrimary) ?? product.categoryMaps?.[0];
  const activeLicense = product.licenseOfferings?.filter((l) => l.isActive) ?? [];
  const minBasePrice =
    activeLicense.length > 0
      ? Math.min(...activeLicense.map((l) => l.basePrice))
      : product.prices?.[0]?.amount;

  return (
    <div className="card card-bordered overflow-hidden mb-4">
      <div
        className="card-inner border-bottom"
        style={{
          background: "linear-gradient(135deg, rgba(101,118,255,0.06) 0%, rgba(30,224,172,0.04) 100%)",
        }}
      >
        <div className="row g-4 align-items-center">
          <div className="col-md-4 col-lg-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 bg-white border p-4 mx-auto"
              style={{ minHeight: 200, maxWidth: 280 }}
            >
              {primaryImage?.url ? (
                <img
                  src={primaryImage.thumbnailUrl ?? primaryImage.url}
                  alt={primaryImage.altText ?? product.name}
                  className="img-fluid"
                  style={{ maxHeight: 160, objectFit: "contain" }}
                />
              ) : (
                <div className="text-center text-soft py-4">
                  <em className={`icon ni ni-${kind?.icon ?? "package"} fs-1 d-block mb-2`} />
                  <span className="fs-12">Görsel yok</span>
                </div>
              )}
            </div>
          </div>

          <div className="col-md-8 col-lg-9">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              {kind && (
                <span className={`badge bg-${kind.color}`}>
                  <em className={`icon ni ni-${kind.icon} me-1`} />
                  {kind.label}
                </span>
              )}
              {status && <span className={`badge badge-dim bg-${status.color}`}>{status.label}</span>}
              {product.isActive ? (
                <span className="badge badge-dim bg-success">Yayında</span>
              ) : (
                <span className="badge badge-dim bg-secondary">Pasif</span>
              )}
              {primaryCategory?.categoryName && (
                <span className="badge bg-outline-primary">
                  <em className="icon ni ni-folder me-1" />
                  {primaryCategory.categoryName}
                </span>
              )}
            </div>

            <h3 className="fw-bold mb-1" style={{ wordBreak: "break-word" }}>
              {product.name}
            </h3>
            <p className="text-primary mb-2">
              <em className="icon ni ni-tag me-1" />
              {product.productCode}
              {product.brand ? (
                <>
                  <span className="text-soft mx-2">·</span>
                  {product.brand}
                </>
              ) : null}
            </p>
            {product.shortDescription && (
              <p className="text-soft mb-3" style={{ maxWidth: 720, lineHeight: 1.6 }}>
                {product.shortDescription}
              </p>
            )}

            <div className="d-flex flex-wrap gap-2 mb-3">
              <FlagPill label="Satılabilir" active={product.isSellable} />
              <FlagPill label="Satın Alınabilir" active={product.isPurchasable} />
              <FlagPill label="Stok Takibi" active={product.trackInventory} />
            </div>

            {product.kind === 2 && product.softwareProfile?.version && (
              <p className="mb-0 fs-13px">
                <span className="badge bg-outline-info me-2">v{product.softwareProfile.version}</span>
                {product.softwareProfile.downloadUrl && (
                  <a
                    href={product.softwareProfile.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="link link-primary"
                  >
                    <em className="icon ni ni-download me-1" />
                    İndirme bağlantısı
                  </a>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="card-inner py-3">
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <div className="text-center">
              <span className="fs-5 fw-bold text-primary d-block">{product.categoryMaps?.length ?? 0}</span>
              <span className="text-soft fs-12">Kategori</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center">
              <span className="fs-5 fw-bold text-info d-block">{product.attributeValues?.length ?? 0}</span>
              <span className="text-soft fs-12">Özellik</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center">
              <span className="fs-5 fw-bold text-success d-block">
                {product.kind === 2
                  ? activeLicense.length
                  : product.prices?.length ?? 0}
              </span>
              <span className="text-soft fs-12">
                {product.kind === 2 ? "Fiyatlandırma" : "Fiyat"}
              </span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="text-center">
              <span className="fs-5 fw-bold text-dark d-block">
                {minBasePrice != null ? fmt(minBasePrice, product.defaultCurrencyCode) : "—"}
              </span>
              <span className="text-soft fs-12">
                {product.kind === 2 ? "Başlangıç Fiyatı" : "İlk Fiyat"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailHero;
