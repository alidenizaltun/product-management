import React from "react";
import ProductSectionPage from "@/modules/products/components/ProductSectionPage";
import GeneralInfoTab from "@/modules/products/components/editor/GeneralInfoTab";

/**
 * Ürün Bilgileri > Genel Bilgiler
 * Ürün Seçici tüm ürün tiplerini listeler.
 */
const GeneralInfoPage: React.FC = () => (
    <ProductSectionPage sectionKey="general">
        {() => (
            <section className="card card-bordered">
                <div className="card-inner border-bottom">
                    <h5 className="title mb-1">Genel Bilgiler</h5>
                    <p className="text-soft mb-0">
                        Ürünün adı, kodu, türü, açıklamaları ile satılabilirlik ve vergi bilgileri.
                    </p>
                </div>
                <div className="card-inner">
                    <GeneralInfoTab isEdit />
                </div>
            </section>
        )}
    </ProductSectionPage>
);

export default GeneralInfoPage;
