import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import ProductSectionPage from "@/pages/products/components/ProductSectionPage";
import ProductRegionsTab from "@/pages/products/components/editor/ProductRegionsTab";
import RegionQuickAddModal from "@/pages/products/components/editor/RegionQuickAddModal";
import { placeRegionAssignment } from "@/pages/products/utils/quickAddAssignment";
import type { ProductFormValues } from "@/pages/products/types/productEditor.types";
import type { RegionDto } from "@/domain/types/productOperations.types";

/**
 * Product Info > Regions
 * Selects the regions a product is sold in, with per-region currency and VAT.
 * Missing region definitions can be created in a modal on this page and bound
 * immediately.
 */
const RegionsPage: React.FC = () => (
    <ProductSectionPage sectionKey="regions">
        {() => <RegionsSection />}
    </ProductSectionPage>
);

const RegionsSection: React.FC = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { getValues, setValue } = useFormContext<ProductFormValues>();

    const handleCreated = (region: RegionDto) => {
        const result = placeRegionAssignment(getValues("regions") ?? [], region.id);
        if (result.placement === "already-present") return;
        setValue("regions", result.next, { shouldDirty: true, shouldTouch: true });
    };

    return (
        <section className="card card-bordered">
            <div className="card-inner border-bottom d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div>
                    <h5 className="title mb-1">Bölgeler</h5>
                    <p className="text-soft mb-0">
                        Ürünün satıldığı bölgeleri seçin; her bölgeye ayrı fiyat birimi ve KDV oranı verebilirsiniz.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setIsCreateOpen(true)}
                >
                    <em className="icon ni ni-plus me-1" />
                    Yeni Bölge Tanımı
                </button>
            </div>
            <div className="card-inner">
                <ProductRegionsTab />
            </div>
            <RegionQuickAddModal
                open={isCreateOpen}
                toggle={() => setIsCreateOpen(false)}
                onCreated={handleCreated}
            />
        </section>
    );
};

export default RegionsPage;
