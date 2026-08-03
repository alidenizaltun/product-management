import React from "react";
import ProductSectionPage from "@/modules/products/components/ProductSectionPage";
import VariantBuilder from "@/modules/products/components/editor/VariantBuilder";

/**
 * Fiziksel Ürün İşlemleri > Varyantlar
 * Ürün Seçici yalnızca fiziksel ürünleri listeler.
 */
const VariantsPage: React.FC = () => (
    <ProductSectionPage sectionKey="variants">
        {() => (
            <section className="card card-bordered">
                <div className="card-inner border-bottom">
                    <h5 className="title mb-1">Varyantlar</h5>
                    <p className="text-soft mb-0">
                        Seçenekleri ürünün doğal diliyle girin, SKU ve fiyat farklarını topluca yönetin.
                    </p>
                </div>
                <div className="card-inner">
                    <VariantBuilder />
                </div>
            </section>
        )}
    </ProductSectionPage>
);

export default VariantsPage;
