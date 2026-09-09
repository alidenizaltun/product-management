import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import ProductSectionPage from "@/pages/products/components/ProductSectionPage";
import CategoryTreeSelector from "@/pages/products/components/editor/CategoryTreeSelector";
import AttributeSelector from "@/pages/products/components/editor/AttributeSelector";
import CategoryQuickAddModal from "@/pages/products/components/editor/CategoryQuickAddModal";
import AttributeQuickAddModal from "@/pages/products/components/editor/AttributeQuickAddModal";
import {
    placeAttributeAssignment,
    placeCategoryAssignment,
} from "@/pages/products/utils/quickAddAssignment";
import type { ProductFormValues } from "@/pages/products/types/productEditor.types";
import type { ProductAttributeDefinitionDto, ProductCategoryDto } from "@/domain/types/productOperations.types";

/**
 * Product Info > Classification
 * Assigns existing category/attribute definitions to the product. Missing
 * definitions can be created in a modal on this page and bound immediately.
 */
const ClassificationPage: React.FC = () => (
    <ProductSectionPage sectionKey="classification">
        {() => (
            <>
                <CategorySection />
                <AttributeSection />
            </>
        )}
    </ProductSectionPage>
);

const CategorySection: React.FC = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { getValues, setValue } = useFormContext<ProductFormValues>();

    const handleCreated = (category: ProductCategoryDto) => {
        const result = placeCategoryAssignment(getValues("categoryMaps") ?? [], category.id);
        if (result.placement === "already-present") return;
        setValue("categoryMaps", result.next, { shouldDirty: true, shouldTouch: true });
    };

    return (
        <section className="card card-bordered mb-4">
            <div className="card-inner border-bottom d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div>
                    <h5 className="title mb-1">Kategoriler</h5>
                    <p className="text-soft mb-0">
                        Ürünün vitrindeki yerini belirleyin. İlk kategori ana kategori kabul edilir.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setIsCreateOpen(true)}
                >
                    <em className="icon ni ni-plus me-1" />
                    Yeni Kategori Tanımı
                </button>
            </div>
            <div className="card-inner">
                <CategoryTreeSelector />
            </div>
            <CategoryQuickAddModal
                open={isCreateOpen}
                toggle={() => setIsCreateOpen(false)}
                onCreated={handleCreated}
            />
        </section>
    );
};

const AttributeSection: React.FC = () => {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const { getValues, setValue } = useFormContext<ProductFormValues>();

    const handleCreated = (definition: ProductAttributeDefinitionDto) => {
        const result = placeAttributeAssignment(getValues("attributeValues") ?? [], definition.id);
        if (result.placement === "already-present") return;
        setValue("attributeValues", result.next, { shouldDirty: true, shouldTouch: true });
    };

    return (
        <section className="card card-bordered">
            <div className="card-inner border-bottom d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div>
                    <h5 className="title mb-1">Özellikler</h5>
                    <p className="text-soft mb-0">
                        Kategoriye bağlı beklenen özellik değerlerini ve ek ürün özelliklerini tamamlayın.
                    </p>
                </div>
                <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={() => setIsCreateOpen(true)}
                >
                    <em className="icon ni ni-plus me-1" />
                    Yeni Özellik Tanımı
                </button>
            </div>
            <div className="card-inner">
                <AttributeSelector />
            </div>
            <AttributeQuickAddModal
                open={isCreateOpen}
                toggle={() => setIsCreateOpen(false)}
                onCreated={handleCreated}
            />
        </section>
    );
};

export default ClassificationPage;
