import React from "react";
import { Link } from "react-router-dom";
import ProductSectionPage from "@/modules/products/components/ProductSectionPage";
import ProductUnitsTab from "@/modules/products/components/editor/ProductUnitsTab";

/**
 * Yazılım ve Lisanslı Ürün İşlemleri > Fiyatlandırma Birimleri
 * Ürün Seçici yalnızca yazılım ürünlerini listeler; fiziksel ürünler hiç görünmez.
 * Birim satırları kendi kaydet akışına sahip olduğu için sayfa seviyesinde
 * ayrı bir kaydet düğmesi gösterilmez.
 */
const PricingUnitsPage: React.FC = () => (
    <ProductSectionPage sectionKey="pricing-units" showSave={false}>
        {({ productId }) => (
            <section className="card card-bordered">
                <div className="card-inner border-bottom d-flex justify-content-between align-items-start gap-3 flex-wrap">
                    <div>
                        <h5 className="title mb-1">Fiyatlandırma Birimleri</h5>
                        <p className="text-soft mb-0">
                            Yazılım Birim Sözlüğü kayıtlarını bu ürüne bağlayın; ürün içi ad, kod ve varsayılan birim
                            bilgilerini verin.
                        </p>
                    </div>
                    <Link to="/definitions/software-units" className="btn btn-outline-light btn-sm">
                        <em className="icon ni ni-external me-1" />
                        Yazılım Birim Sözlüğü
                    </Link>
                </div>
                <div className="card-inner">
                    <ProductUnitsTab productId={productId} />
                </div>
            </section>
        )}
    </ProductSectionPage>
);

export default PricingUnitsPage;
