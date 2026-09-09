import React from "react";
import ProductSectionPage from "@/pages/products/components/ProductSectionPage";
import ProfileEditor from "@/pages/products/components/editor/ProfileEditor";

/**
 * Ürün Bilgileri > Gelişmiş Ayarlar
 * Sayfa içeriği seçilen ürünün tipine göre farklı teknik alanlar gösterir.
 */
const AdvancedSettingsPage: React.FC = () => (
    <ProductSectionPage sectionKey="advanced">
        {() => (
            <section className="card card-bordered">
                <div className="card-inner border-bottom">
                    <h5 className="title mb-1">Profil ve Teknik Detaylar</h5>
                    <p className="text-soft mb-0">
                        Seçili ürün tipine göre kargo, yazılım, hizmet veya abonelik alanlarını düzenleyin.
                        Bu alanlar ana bilgi akışını bozmamak için burada tutulur.
                    </p>
                </div>
                <div className="card-inner">
                    <ProfileEditor />
                </div>
            </section>
        )}
    </ProductSectionPage>
);

export default AdvancedSettingsPage;
