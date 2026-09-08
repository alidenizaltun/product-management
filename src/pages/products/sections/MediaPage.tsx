import React from "react";
import ProductSectionPage from "@/pages/products/components/ProductSectionPage";
import MediaUploadManager from "@/pages/products/components/editor/MediaUploadManager";

/** Ürün Bilgileri > Medya */
const MediaPage: React.FC = () => (
    <ProductSectionPage sectionKey="media">
        {(context) => (
            <section className="card card-bordered">
                <div className="card-inner border-bottom">
                    <h5 className="title mb-1">Medya Galerisi</h5>
                    <p className="text-soft mb-0">
                        Birden fazla görsel yükleyin; dosyalar sunucuda saklanır. Kapak görseli, galeri sırası ve alternatif metinleri buradan düzenleyin.
                    </p>
                </div>
                <div className="card-inner">
                    <MediaUploadManager productId={context.productId} />
                </div>
            </section>
        )}
    </ProductSectionPage>
);

export default MediaPage;
