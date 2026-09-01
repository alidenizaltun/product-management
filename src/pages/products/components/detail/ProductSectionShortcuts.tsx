import React from "react";
import { Link } from "react-router-dom";
import {
    buildProductSectionLink,
    getSectionsForKind,
    type ProductSectionKey,
} from "@/pages/products/config/productSections";
import type { ProductDetailDto } from "@/domain/types/productOperations.types";

interface ProductSectionShortcutsProps {
    product: ProductDetailDto;
}

/** Bölümün seçili ürün için doldurulmuş sayılıp sayılmayacağı. */
const isSectionCompleted = (key: ProductSectionKey, product: ProductDetailDto): boolean => {
    switch (key) {
        case "general":
            return Boolean(product.name?.trim() && product.productCode?.trim());
        case "classification":
            return (product.categoryMaps ?? []).length > 0;
        case "media":
            return (product.mediaItems ?? []).length > 0;
        case "advanced":
            return Boolean(
                product.physicalProfile || product.softwareProfile || product.serviceProfile || product.subscriptionProfile
            );
        case "variants":
            return (product.variants ?? []).length > 0;
        case "inventory-supply":
            return (product.inventories ?? []).length > 0 || (product.supplierMaps ?? []).length > 0;
        case "pricing":
            // Fiyatlandırma tüm tiplerde ortak; fiziksel üründe tarifeler/liste
            // kayıtları, lisanslı ürünlerde satış planları doldurulmuş sayılır.
            return product.kind === 1
                ? (product.prices ?? []).length > 0 || (product.priceListItems ?? []).length > 0
                : (product.licenseOfferings ?? []).length > 0;
        case "modules":
            return (product.modules ?? []).length > 0;
        default:
            return false;
    }
};

/**
 * Ürün Özeti sayfasındaki kısayollar: kullanıcıyı ilgili sabit sayfaya, bu ürün
 * Ürün Seçici'de önceden seçili şekilde götürür.
 */
const ProductSectionShortcuts: React.FC<ProductSectionShortcutsProps> = ({ product }) => {
    const sections = getSectionsForKind(product.kind);
    const completedCount = sections.filter((section) => isSectionCompleted(section.key, product)).length;
    const progress = sections.length ? Math.round((completedCount / sections.length) * 100) : 0;

    return (
        <section className="card card-bordered mb-4">
            <div className="card-inner border-bottom d-flex justify-content-between align-items-center gap-3 flex-wrap">
                <div>
                    <h5 className="title mb-1">Bölümler</h5>
                    <p className="text-soft mb-0">
                        Her bölüm kendi sabit sayfasında yönetilir; kısayollar bu ürünü önceden seçili açar.
                    </p>
                </div>
                <div style={{ minWidth: 160 }}>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fs-12px text-soft">Tamamlanma</span>
                        <span className="fs-12px">{progress}%</span>
                    </div>
                    <div className="progress progress-md">
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>
            <div className="card-inner">
                <div className="row g-3">
                    {sections.map((section) => {
                        const done = isSectionCompleted(section.key, product);

                        return (
                            <div className="col-sm-6 col-xl-3" key={section.key}>
                                <Link
                                    to={buildProductSectionLink(section.key, product.id)}
                                    className="card card-bordered h-100 text-decoration-none"
                                >
                                    <div className="card-inner">
                                        <div className="d-flex align-items-center justify-content-between gap-2 mb-1">
                                            <span className="d-flex align-items-center gap-2">
                                                <em className={`icon ni ni-${section.icon} text-primary`} />
                                                <span className="fw-medium">{section.label}</span>
                                            </span>
                                            <em
                                                className={`icon ni ni-${done ? "check-circle-fill text-success" : "alert-circle text-warning"}`}
                                            />
                                        </div>
                                        <span className="text-soft fs-12px">{section.description}</span>
                                        {section.key === "pricing" && product.kind !== 1 && (
                                            <div className="d-flex gap-2 mt-2 fs-11px">
                                                <span className={`badge ${(product.productUnits ?? []).length ? "bg-success" : "bg-outline-secondary"}`}>
                                                    Birim {(product.productUnits ?? []).length}
                                                </span>
                                                <span className={`badge ${(product.licenseOfferings ?? []).length ? "bg-success" : "bg-outline-secondary"}`}>
                                                    Plan {(product.licenseOfferings ?? []).length}
                                                </span>
                                                <span className={`badge ${(product.pricingRules ?? []).length ? "bg-success" : "bg-outline-secondary"}`}>
                                                    Kural {(product.pricingRules ?? []).length}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default ProductSectionShortcuts;
