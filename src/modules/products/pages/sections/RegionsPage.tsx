import React from "react";
import { Link } from "react-router-dom";
import ProductSectionPage from "@/modules/products/components/ProductSectionPage";
import ProductRegionsTab from "@/modules/products/components/editor/ProductRegionsTab";

/**
 * Ürün Bilgileri > Bölgeler
 * Ürünün hangi bölgelerde satıldığını, her bölgenin para birimini ve KDV
 * oranını belirler. Bölge listesi Bölge Tanımları sayfasından yönetilir.
 */
const RegionsPage: React.FC = () => (
    <ProductSectionPage sectionKey="regions">
        {() => (
            <section className="card card-bordered">
                <div className="card-inner border-bottom d-flex justify-content-between align-items-start gap-3 flex-wrap">
                    <div>
                        <h5 className="title mb-1">Bölgeler</h5>
                        <p className="text-soft mb-0">
                            Ürünün satıldığı bölgeleri seçin; her bölgeye ayrı fiyat birimi ve KDV oranı verebilirsiniz.
                        </p>
                    </div>
                    <Link to="/definitions/regions/new" className="btn btn-outline-light btn-sm">
                        <em className="icon ni ni-plus me-1" />
                        Yeni Bölge Tanımı
                    </Link>
                </div>
                <div className="card-inner">
                    <ProductRegionsTab />
                </div>
            </section>
        )}
    </ProductSectionPage>
);

export default RegionsPage;
