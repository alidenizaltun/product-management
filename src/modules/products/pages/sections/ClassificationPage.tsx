import React from "react";
import { Link } from "react-router-dom";
import ProductSectionPage from "@/modules/products/components/ProductSectionPage";
import CategoryTreeSelector from "@/modules/products/components/editor/CategoryTreeSelector";
import AttributeSelector from "@/modules/products/components/editor/AttributeSelector";

/**
 * Ürün Bilgileri > Sınıflandırma
 * Burada yapılan iş kategori/özellik tanımlamak değil, mevcut tanımları
 * seçili ürüne atamaktır.
 */
const ClassificationPage: React.FC = () => (
    <ProductSectionPage sectionKey="classification">
        {() => (
            <>
                <section className="card card-bordered mb-4">
                    <div className="card-inner border-bottom d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div>
                            <h5 className="title mb-1">Kategoriler</h5>
                            <p className="text-soft mb-0">
                                Ürünün vitrindeki yerini belirleyin. İlk kategori ana kategori kabul edilir.
                            </p>
                        </div>
                        <Link to="/definitions/categories/new" className="btn btn-outline-light btn-sm">
                            <em className="icon ni ni-plus me-1" />
                            Yeni Kategori Tanımı
                        </Link>
                    </div>
                    <div className="card-inner">
                        <CategoryTreeSelector />
                    </div>
                </section>

                <section className="card card-bordered">
                    <div className="card-inner border-bottom d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div>
                            <h5 className="title mb-1">Özellikler</h5>
                            <p className="text-soft mb-0">
                                Kategoriye bağlı beklenen özellik değerlerini ve ek ürün özelliklerini tamamlayın.
                            </p>
                        </div>
                        <Link to="/definitions/attributes/new" className="btn btn-outline-light btn-sm">
                            <em className="icon ni ni-plus me-1" />
                            Yeni Özellik Tanımı
                        </Link>
                    </div>
                    <div className="card-inner">
                        <AttributeSelector />
                    </div>
                </section>
            </>
        )}
    </ProductSectionPage>
);

export default ClassificationPage;
