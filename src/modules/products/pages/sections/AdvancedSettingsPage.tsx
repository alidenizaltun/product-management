import React from "react";
import ProductSectionPage from "@/modules/products/components/ProductSectionPage";
import ProfileEditor from "@/modules/products/components/editor/ProfileEditor";

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
                        Ürün tipine özgü nadir veya teknik alanları ana akışı bozmadan düzenleyin.
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
