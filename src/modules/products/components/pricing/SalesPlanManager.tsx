import React, { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/modules/products/api/products.api";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";
import { invalidateAllPricingQueries } from "@/modules/products/utils/productUnitSync";
import type { ProductFormValues } from "@/modules/products/types/productEditor.types";
import { EMPTY_OFFERING, generateOfferingTempId } from "./LicenseOfferingFormFields";
import SalesPlanListPanel from "./SalesPlanListPanel";
import SalesPlanModal from "./SalesPlanModal";
import PricingRulesModal from "./PricingRulesModal";

interface SalesPlanManagerProps {
    productId: string;
}

const SalesPlanManager: React.FC<SalesPlanManagerProps> = ({ productId }) => {
    const queryClient = useQueryClient();
    const { control, getValues, reset } = useFormContext<ProductFormValues>();
    const { append, remove } = useFieldArray({ control, name: "licenseOfferings" });
    const offerings = useWatch({ control, name: "licenseOfferings" }) ?? [];
    const productUnits = useWatch({ control, name: "productUnits" }) ?? [];

    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [rulesIndex, setRulesIndex] = useState<number | null>(null);
    const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    const handleCreateNew = () => {
        const nextIndex = getValues("licenseOfferings")?.length ?? 0;
        append({ ...EMPTY_OFFERING, _tempId: generateOfferingTempId(), sortOrder: nextIndex + 1 });
        setRulesIndex(null);
        setOpenIndex(nextIndex);
    };

    const handleEdit = (index: number) => {
        setRulesIndex(null);
        setOpenIndex(index);
    };

    const handleCloseDrawer = () => {
        if (openIndex != null) {
            const offering = getValues(`licenseOfferings.${openIndex}`);
            if (!offering?.id) remove(openIndex);
        }
        setOpenIndex(null);
    };

    const handleOpenRules = (index: number) => {
        handleCloseDrawer();
        setRulesIndex(index);
    };

    const handleRequestDelete = (index: number) => {
        const offering = getValues(`licenseOfferings.${index}`);
        if (!offering?.id) {
            remove(index);
            if (openIndex === index) setOpenIndex(null);
            return;
        }
        setPendingDeleteIndex(index);
    };

    const handleConfirmDelete = async () => {
        if (pendingDeleteIndex == null) return;
        const offering = getValues(`licenseOfferings.${pendingDeleteIndex}`);
        if (!offering?.id) {
            remove(pendingDeleteIndex);
            setPendingDeleteIndex(null);
            return;
        }

        try {
            setDeleting(true);
            await productsApi.deleteLicenseOffering(productId, offering.id);
            remove(pendingDeleteIndex);
            await invalidateAllPricingQueries(queryClient, productId);
            reset(getValues());
            showSuccess("Satış planı silindi.");
            if (openIndex === pendingDeleteIndex) setOpenIndex(null);
            if (rulesIndex === pendingDeleteIndex) setRulesIndex(null);
            setPendingDeleteIndex(null);
        } catch (error) {
            showApiError(error);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <SalesPlanListPanel
                offerings={offerings}
                productUnits={productUnits}
                onCreateNew={handleCreateNew}
                onEdit={handleEdit}
                onDelete={handleRequestDelete}
                onOpenRules={handleOpenRules}
            />

            <SalesPlanModal
                key={openIndex ?? "sales-plan-closed"}
                index={openIndex}
                productId={productId}
                onClose={handleCloseDrawer}
                onRequestDelete={handleRequestDelete}
                onOpenRules={handleOpenRules}
            />

            <PricingRulesModal
                key={rulesIndex ?? "pricing-rules-closed"}
                index={rulesIndex}
                productId={productId}
                onClose={() => setRulesIndex(null)}
            />

            <ConfirmDialog
                open={pendingDeleteIndex != null}
                title="Satış Planını Sil"
                message="Bu satış planı kalıcı olarak silinecek. Devam etmek istiyor musunuz?"
                variant="danger"
                confirmLabel="Sil"
                loading={deleting}
                onConfirm={() => void handleConfirmDelete()}
                onCancel={() => setPendingDeleteIndex(null)}
            />
        </>
    );
};

export default SalesPlanManager;
