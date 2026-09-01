import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "reactstrap";
import StatusBadge from "@/components/shared/StatusBadge";
import type { ProductDto } from "@/domain/types/productOperations.types";
import { getProductListImageUrl } from "@/domain/types/productOperations.types";
import { buildProductSectionLink } from "@/pages/products/config/productSections";

const KIND_META: Record<number, { label: string; color: string; icon: string }> = {
  1: { label: "Fiziksel", color: "primary", icon: "box" },
  2: { label: "Yazılım", color: "info", icon: "laptop" },
  3: { label: "Hizmet", color: "success", icon: "briefcase" },
  4: { label: "Abonelik", color: "warning", icon: "repeat" },
};

const STATUS_META: Record<number, { label: string; color: string }> = {
  0: { label: "Taslak", color: "secondary" },
  1: { label: "Aktif", color: "success" },
  2: { label: "Pasif", color: "warning" },
  3: { label: "Arşiv", color: "danger" },
};

interface ProductCardProps {
  product: ProductDto;
  onDelete: () => void;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onDelete, selected = false, onSelectChange }) => {
  const kind = product.kind != null ? KIND_META[product.kind] : undefined;
  const status = product.status != null ? STATUS_META[product.status] : undefined;
  const detailUrl = `/products/${product.id}`;
  // Ürüne bağlı sayfalar sabittir; ürün `?productId=` ile önceden seçilir.
  const editUrl = buildProductSectionLink("general", product.id);
  const classificationUrl = buildProductSectionLink("classification", product.id);
  const imageUrl = getProductListImageUrl(product);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;

  return (
    <Card className={`card-bordered product-card h-100 ${selected ? "border-primary shadow-sm h-100" : ""}`}>
      <div className="product-thumb">
        {onSelectChange && (
          <div className="position-absolute top-0 start-0 p-2" style={{ zIndex: 3 }}>
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id={`select-product-${product.id}`}
                checked={selected}
                onChange={(event) => onSelectChange(event.target.checked)}
                aria-label={`${product.name} seç`}
              />
              <label className="custom-control-label" htmlFor={`select-product-${product.id}`} />
            </div>
          </div>
        )}
        <Link to={detailUrl} className="d-block">
          <div
            className="card-img-top bg-lighter d-flex align-items-center justify-content-center overflow-hidden"
            style={{ height: 200 }}
          >
            {showImage ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-100 h-100"
                style={{ objectFit: "contain", padding: "1rem" }}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <em
                className={`icon ni ni-${kind?.icon ?? "package"} fs-1 text-${kind?.color ?? "soft"}`}
                style={{ opacity: 0.45 }}
              />
            )}
          </div>
        </Link>

        <ul className="product-badges ms-4">
          {kind && (
            <li>
              <span className={`badge bg-${kind.color}`}>{kind.label}</span>
            </li>
          )}
          {status && (
            <li>
              <span className={`badge badge-dim bg-${status.color}`}>{status.label}</span>
            </li>
          )}
        </ul>

        <ul className="product-actions">
          <li>
            <Link to={detailUrl} title="Detay">
              <em className="icon ni ni-eye" />
            </Link>
          </li>
          <li>
            <Link to={editUrl} title="Genel bilgileri düzenle">
              <em className="icon ni ni-edit" />
            </Link>
          </li>
          <li>
            <Link to={classificationUrl} title="Sınıflandırmayı düzenle">
              <em className="icon ni ni-folder-list" />
            </Link>
          </li>
          <li>
            <a
              href="#sil"
              title="Sil"
              onClick={(e) => {
                e.preventDefault();
                onDelete();
              }}
            >
              <em className="icon ni ni-trash" />
            </a>
          </li>
        </ul>
      </div>

      <div className="card-inner">
        <ul className="product-tags justify-content-start mb-0">
          <li>
            <code className="fs-12 text-primary">{product.productCode}</code>
          </li>
          {product.brand && (
            <li>
              <span className="text-soft fs-12">{product.brand}</span>
            </li>
          )}
        </ul>

        <h6 className="product-title mt-2 mb-1">
          <Link to={detailUrl}>{product.name}</Link>
        </h6>

        {product.shortDescription && (
          <p
            className="text-soft fs-13px mb-2"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.5,
            }}
          >
            {product.shortDescription}
          </p>
        )}

        {(product.isActive != null || product.defaultCurrencyCode) && (
          <div className="d-flex align-items-center justify-content-between border-top pt-2 mt-auto">
            {product.isActive != null ? <StatusBadge active={product.isActive} /> : <span />}
            {product.defaultCurrencyCode ? (
              <span className="text-soft fs-12">{product.defaultCurrencyCode}</span>
            ) : null}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
