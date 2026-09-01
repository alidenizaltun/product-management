import React from "react";
import ProductSectionPage from "@/pages/products/components/ProductSectionPage";
import ProductModulesTab from "@/pages/products/components/editor/ProductModulesTab";

/**
 * Yazılım ve Lisanslı Ürün İşlemleri > Modüller
 * Bu sayfa sistem genelindeki bir modül sözlüğü değil, seçili yazılım ürününün
 * kendi modüllerini yönetir. Ürün Seçici yalnızca yazılım ürünlerini listeler.
 */
const ModulesPage: React.FC = () => (
    <ProductSectionPage sectionKey="modules">
        {() => (
            <section className="card card-bordered">
                <div className="card-inner border-bottom">
                    <h5 className="title mb-1">Ürün Modülleri</h5>
                    <p className="text-soft mb-0">
                        Modül adı/kodu, zorunlu-opsiyonel durumu, sıralama ve satış planına göre modül fiyatları.
                    </p>
                </div>
                <div className="card-inner">
                    <ProductModulesTab />
                </div>
            </section>
        )}
    </ProductSectionPage>
);

export default ModulesPage;
