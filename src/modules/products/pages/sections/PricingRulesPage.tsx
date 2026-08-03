import React from "react";
import { Link } from "react-router-dom";
import ProductSectionPage from "@/modules/products/components/ProductSectionPage";
import SoftwarePricingTiersTab from "@/modules/products/components/editor/SoftwarePricingTiersTab";
import { buildProductSectionLink } from "@/modules/products/config/productSections";

/**
 * Yazılım ve Lisanslı Ürün İşlemleri > Dinamik Fiyat Kuralları
 * Kurallar kendi kaydet akışına sahiptir (satır bazlı API çağrıları).
 */
const PricingRulesPage: React.FC = () => (
    <ProductSectionPage sectionKey="pricing-rules" showSave={false}>
        {({ productId, product }) => {
            const offerings = product.licenseOfferings ?? [];

            return (
                <section className="card card-bordered">
                    <div className="card-inner border-bottom d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div>
                            <h5 className="title mb-1">Dinamik Fiyat Kuralları</h5>
                            <p className="text-soft mb-0">
                                Miktar kademeleri, birim bazlı etkiler, müşteri grubu koşulları ve kural önceliklerini yönetin.
                            </p>
                        </div>
                        <Link to={buildProductSectionLink("sales-plans", productId)} className="btn btn-outline-light btn-sm">
                            <em className="icon ni ni-external me-1" />
                            Satış Planları
                        </Link>
                    </div>
                    <div className="card-inner">
                        {offerings.length === 0 && (
                            <div className="alert alert-warning d-flex align-items-center gap-2 mb-3">
                                <em className="icon ni ni-alert-circle" />
                                <span className="fs-13px">
                                    Bu üründe henüz satış planı yok. Dinamik fiyat kuralları planlara bağlandığı için önce
                                    Satış Planları sayfasından en az bir plan eklemelisiniz.
                                </span>
                            </div>
                        )}
                        <SoftwarePricingTiersTab
                            productId={productId}
                            licenseOfferings={offerings}
                            productUnits={product.productUnits ?? []}
                            variants={product.variants ?? []}
                        />
                    </div>
                </section>
            );
        }}
    </ProductSectionPage>
);

export default PricingRulesPage;
