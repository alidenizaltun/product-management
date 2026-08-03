import React from "react";
import { Link } from "react-router-dom";
import ProductSectionPage from "@/modules/products/components/ProductSectionPage";
import PriceMatrix from "@/modules/products/components/editor/PriceMatrix";
import PriceListItemTab from "@/modules/products/components/editor/PriceListItemTab";
import { buildProductSectionLink, getProductSection } from "@/modules/products/config/productSections";
import type { ProductDetailDto } from "@/shared/types/productOperations.types";

interface SoftwareSummaryProps {
    product: ProductDetailDto;
}

const isSoftwareProduct = (product: ProductDetailDto) => product.kind === 2;

/**
 * Yazılım/lisanslanabilir ürünlerde fiyatlandırma akışının diğer sayfalarına
 * (ürün önceden seçili şekilde) yönlendiren durum kartları.
 */
const SoftwarePricingSummary: React.FC<SoftwareSummaryProps> = ({ product }) => {
    const cards = [
        {
            section: getProductSection("pricing-units"),
            count: (product.productUnits ?? []).filter((unit) => unit.isActive).length,
            unit: "aktif birim",
            visible: product.kind === 2,
        },
        {
            section: getProductSection("sales-plans"),
            count: (product.licenseOfferings ?? []).filter((offering) => offering.isActive).length,
            unit: "aktif plan",
            visible: product.kind === 2 || product.kind === 3 || product.kind === 4,
        },
        {
            section: getProductSection("pricing-rules"),
            count: (product.pricingRules ?? []).filter((rule) => rule.isActive).length,
            unit: "aktif kural",
            visible: product.kind === 2 || product.kind === 3 || product.kind === 4,
        },
        {
            section: getProductSection("modules"),
            count: (product.modules ?? []).filter((module) => module.isActive).length,
            unit: "aktif modül",
            visible: product.kind === 2,
        },
    ].filter((card) => card.visible);

    if (!cards.length) return null;

    return (
        <section className="card card-bordered mb-4">
            <div className="card-inner border-bottom">
                <h5 className="title mb-1">Fiyatlandırma Akışı</h5>
                <p className="text-soft mb-0">
                    Bu ürünün fiyatlandırması birden fazla sayfada yönetilir. Kartlar sizi ilgili sayfaya bu ürün seçili
                    şekilde götürür.
                </p>
            </div>
            <div className="card-inner">
                <div className="row g-3">
                    {cards.map(({ section, count, unit }) => (
                        <div className="col-sm-6 col-xl-3" key={section.key}>
                            <Link
                                to={buildProductSectionLink(section.key, product.id)}
                                className="card card-bordered h-100 text-decoration-none"
                            >
                                <div className="card-inner">
                                    <div className="d-flex align-items-center gap-2 mb-2">
                                        <em className={`icon ni ni-${section.icon} text-primary`} />
                                        <span className="fw-medium">{section.label}</span>
                                    </div>
                                    <h6 className="title mb-0">
                                        {count} <span className="text-soft fs-13px fw-normal">{unit}</span>
                                    </h6>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

/**
 * Yazılım ürününde bu sayfada düzenlenecek bir alan yoktur: gerçek fiyat
 * Satış Planları'ndaki `basePrice`'tan gelir. Bu yüzden Fiyat Tarifeleri ve
 * Fiyat Listesi Kayıtları formları burada hiç render edilmez; yalnızca ilgili
 * sayfalara giden özet kartları gösterilir.
 */
const SoftwarePricingNotice: React.FC = () => (
    <div className="alert alert-light d-flex align-items-start gap-2 mb-4">
        <em className="icon ni ni-info fs-4" />
        <span className="fs-13px">
            Yazılım ürünlerinde fiyat, Satış Planları'ndaki taban fiyattan gelir. Bu yüzden bu sayfada Fiyat Tarifeleri
            veya Fiyat Listesi Kayıtları düzenlenmez — yukarıdaki kartlardan ilgili sayfaya gidebilirsiniz.
        </span>
    </div>
);

/** Fiyatlandırma (ürüne bağlı temel ve alternatif fiyatlar) */
const ProductPricingPage: React.FC = () => (
    <ProductSectionPage sectionKey="pricing" showSave={(product) => !isSoftwareProduct(product)}>
        {({ product }) => {
            const isSoftware = isSoftwareProduct(product);

            return (
                <>
                    <SoftwarePricingSummary product={product} />

                    {isSoftware ? (
                        <SoftwarePricingNotice />
                    ) : (
                        <>
                            <section className="card card-bordered mb-4">
                                <div className="card-inner border-bottom">
                                    <h5 className="title mb-1">Fiyat Tarifeleri</h5>
                                    <p className="text-soft mb-0">
                                        Temel fiyatı bir kartla başlatın; kampanya, bayi veya kanal fiyatlarını ayrı
                                        tarifeler olarak ekleyin.
                                    </p>
                                </div>
                                <div className="card-inner">
                                    <PriceMatrix />
                                </div>
                            </section>

                            <section className="card card-bordered">
                                <div className="card-inner border-bottom d-flex justify-content-between align-items-start gap-3 flex-wrap">
                                    <div>
                                        <h5 className="title mb-1">Fiyat Listesi Kayıtları</h5>
                                        <p className="text-soft mb-0">
                                            Ürünün dahil olduğu fiyat listelerini ve liste fiyatlarını yönetin.
                                        </p>
                                    </div>
                                    <Link to="/pricing/price-lists" className="btn btn-outline-light btn-sm">
                                        <em className="icon ni ni-external me-1" />
                                        Fiyat Listeleri
                                    </Link>
                                </div>
                                <div className="card-inner">
                                    <PriceListItemTab />
                                </div>
                            </section>
                        </>
                    )}
                </>
            );
        }}
    </ProductSectionPage>
);

export default ProductPricingPage;
