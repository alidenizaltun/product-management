import React from "react";
import { Link } from "react-router-dom";
import ProductSectionPage from "@/pages/products/components/ProductSectionPage";
import PriceMatrix from "@/pages/products/components/editor/PriceMatrix";
import PriceListItemTab from "@/pages/products/components/editor/PriceListItemTab";
import SalesPlanManager from "@/pages/products/components/pricing/SalesPlanManager";
import { buildProductSectionLink, getProductSection } from "@/pages/products/config/productSections";
import type { ProductDetailDto } from "@/domain/types/productOperations.types";

/** 1=Fiziksel, 2=Yazılım, 3=Hizmet, 4=Abonelik */
const isPhysicalProduct = (product: ProductDetailDto) => product.kind === 1;

/**
 * Fiziksel ürün fiyatlandırması: ürünün kendi fiyat tarifeleri ve dahil olduğu
 * fiyat listesi kayıtları. Kaydetme sayfa seviyesindeki formdan yürür.
 */
const PhysicalPricing: React.FC = () => (
    <>
        <section className="card card-bordered mb-4">
            <div className="card-inner border-bottom">
                <h5 className="title mb-1">Fiyat Tarifeleri</h5>
                <p className="text-soft mb-0">
                    Temel fiyatı bir kartla başlatın; kampanya, bayi veya kanal fiyatlarını ayrı tarifeler olarak
                    ekleyin.
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
                    <p className="text-soft mb-0">Ürünün dahil olduğu fiyat listelerini ve liste fiyatlarını yönetin.</p>
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
);

interface LicensedPricingProps {
    product: ProductDetailDto;
    productId: string;
}

/**
 * Yazılım, hizmet ve abonelik ürünlerinde fiyat satış planlarından gelir; satış
 * planları, fiyat birimleri ve fiyatlandırma kuralları tek akışta yönetilir.
 * Kaydetme bu bileşenin kendi satır bazlı çağrılarıyla yapılır.
 */
const LicensedPricing: React.FC<LicensedPricingProps> = ({ product, productId }) => {
    const modules = getProductSection("modules");
    const showModulesLink = product.kind === 2;

    return (
        <>
            <SalesPlanManager productId={productId} />

            {showModulesLink && (
                <section className="card card-bordered mt-4">
                    <div className="card-inner d-flex justify-content-between align-items-center gap-3 flex-wrap">
                        <div>
                            <h6 className="title mb-1">{modules.label}</h6>
                            <p className="text-soft mb-0 fs-13px">
                                Modül fiyatları satış planlarına bağlıdır; {(product.modules ?? []).filter((m) => m.isActive).length} aktif
                                modül tanımlı.
                            </p>
                        </div>
                        <Link to={buildProductSectionLink("modules", product.id)} className="btn btn-outline-light btn-sm">
                            <em className={`icon ni ni-${modules.icon} me-1`} />
                            {modules.label} sayfasına git
                        </Link>
                    </div>
                </section>
            )}
        </>
    );
};

/**
 * Fiyatlandırma — tüm ürün tipleri için ortak sayfa.
 * Seçili ürünün tipine göre içerik değişir: fiziksel üründe fiyat tarifeleri ve
 * fiyat listesi kayıtları, yazılım/hizmet/abonelik ürünlerinde satış planları.
 */
const ProductPricingPage: React.FC = () => (
    <ProductSectionPage sectionKey="pricing" showSave={(product) => isPhysicalProduct(product)}>
        {({ product, productId }) =>
            isPhysicalProduct(product) ? (
                <PhysicalPricing />
            ) : (
                <LicensedPricing product={product} productId={productId} />
            )
        }
    </ProductSectionPage>
);

export default ProductPricingPage;
