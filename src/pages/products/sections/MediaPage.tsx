import React from "react";
import ProductSectionPage from "@/pages/products/components/ProductSectionPage";
import MediaUploadManager from "@/pages/products/components/editor/MediaUploadManager";

/** Ürün Bilgileri > Medya */
const MediaPage: React.FC = () => (
    <ProductSectionPage sectionKey="media">
        {() => (
            <section className="card card-bordered">
                <div className="card-inner border-bottom">
                    <h5 className="title mb-1">Medya Galerisi</h5>
                    <p className="text-soft mb-0">
                        Kapak görseli, galeri sırası ve alternatif metinleri seçili ürün bağlamında düzenleyin.
                    </p>
                </div>
                <div className="card-inner">
                    <MediaUploadManager />
                </div>
            </section>
        )}
    </ProductSectionPage>
);

export default MediaPage;
