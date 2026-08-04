import React from "react";
import ProductSectionPage from "@/modules/products/components/ProductSectionPage";
import SalesPlanManager from "@/modules/products/components/pricing/SalesPlanManager";

/**
 * Yazılım ve Lisanslı Ürün İşlemleri > Fiyatlandırma
 * Satış planları, fiyat birimleri ve dinamik fiyat kuralları tek akışta yönetilir.
 * Kullanıcı satış planı oluşturmaya başlar; birim seçimi ve fiyatlandırma
 * kuralları aynı akışın (drawer) doğal bir parçasıdır.
 */
const PricingPage: React.FC = () => (
    <ProductSectionPage sectionKey="software-pricing" showSave={false}>
        {({ productId }) => <SalesPlanManager productId={productId} />}
    </ProductSectionPage>
);

export default PricingPage;
