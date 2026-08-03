import React from "react";
import { Link } from "react-router-dom";
import ProductSectionPage from "@/modules/products/components/ProductSectionPage";
import LicenseOfferingsTab from "@/modules/products/components/editor/LicenseOfferingsTab";
import { buildProductSectionLink } from "@/modules/products/config/productSections";

/**
 * Yazılım ve Lisanslı Ürün İşlemleri > Satış Planları
 * Kullanıcı dilinde "Satış Planı"; teknik model adı (lisans teklifi) değişmez.
 * Planlar kendi kaydet akışına sahiptir.
 */
const SalesPlansPage: React.FC = () => (
    <ProductSectionPage sectionKey="sales-plans" showSave={false}>
        {({ productId, product }) => {
            const activeUnits = (product.productUnits ?? []).filter((unit) => unit.isActive);

            return (
                <section className="card card-bordered">
                    <div className="card-inner border-bottom d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div>
                            <h5 className="title mb-1">Satış Planları</h5>
                            <p className="text-soft mb-0">
                                Satış planı müşterinin satın alacağı pakettir. Plan/paket adı, satış modeli, taban fiyat ve
                                faturalama dönemini burada yönetin.
                            </p>
                        </div>
                        {product.kind === 2 && (
                            <Link
                                to={buildProductSectionLink("pricing-units", productId)}
                                className="btn btn-outline-light btn-sm"
                            >
                                <em className="icon ni ni-external me-1" />
                                Fiyatlandırma Birimleri
                            </Link>
                        )}
                    </div>
                    <div className="card-inner">
                        {product.kind === 2 && activeUnits.length === 0 && (
                            <div className="alert alert-light d-flex align-items-center gap-2 mb-3">
                                <em className="icon ni ni-info" />
                                <span className="fs-13px">
                                    Bu ürün için henüz aktif fiyatlandırma birimi yok. Planları birimsiz (sabit fiyatlı)
                                    kurabilir veya önce Fiyatlandırma Birimleri sayfasından birim ekleyebilirsiniz.
                                </span>
                            </div>
                        )}
                        <LicenseOfferingsTab productId={productId} productUnits={product.productUnits ?? []} />
                    </div>
                </section>
            );
        }}
    </ProductSectionPage>
);

export default SalesPlansPage;
