import React, { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "reactstrap";
import { productsApi } from "@/modules/products/api/products.api";
import ConfirmDialog from "@/modules/shared/components/ConfirmDialog";
import { showApiError, showSuccess } from "@/modules/shared/components/NotificationAlert";
import {
    addOrReuseProductUnit,
    assignProductUnitToOffering,
    invalidateAllPricingQueries,
    mapFormProductUnitsToDto,
    removeProductUnit,
    unassignProductUnitFromOffering,
} from "@/modules/products/utils/productUnitSync";
import { usePermission } from "@/modules/shared/hooks/usePermission";
import type { ProductFormValues } from "@/modules/products/types/productEditor.types";
import type { ProductLicenseOfferingDto } from "@/shared/types/productOperations.types";
import { EMPTY_OFFERING, generateOfferingTempId } from "./LicenseOfferingFormFields";
import SalesPlanListPanel from "./SalesPlanListPanel";
import SalesPlanModal from "./SalesPlanModal";
import ProductPricingRulesPanel from "@/modules/products/components/pricing-rules/ProductPricingRulesPanel";

interface SalesPlanManagerProps {
    productId: string;
}

const SalesPlanManager: React.FC<SalesPlanManagerProps> = ({ productId }) => {
    const queryClient = useQueryClient();
    const canEdit = usePermission("product.pricing.edit");
    const { control, getValues, setValue, reset } = useFormContext<ProductFormValues>();
    const { append, remove } = useFieldArray({ control, name: "licenseOfferings" });
    const offerings = useWatch({ control, name: "licenseOfferings" }) ?? [];
    const productUnits = useWatch({ control, name: "productUnits" }) ?? [];

    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [rulesIndex, setRulesIndex] = useState<number | null>(null);
    const rulesOffering = rulesIndex != null ? offerings[rulesIndex] : undefined;
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

    const showRulesView = rulesIndex != null && Boolean(rulesOffering?.id);

    return (
        <>
            {showRulesView && rulesOffering?.id ? (
                <div className="row g-3">
                    <div className="col-12">
                        <Button color="light" size="sm" type="button" onClick={() => setRulesIndex(null)}>
                            <em className="icon ni ni-arrow-left me-1" />
                            Planlara dön
                        </Button>
                    </div>
                    <div className="col-12">
                        <ProductPricingRulesPanel
                            productId={productId}
                            licenseOfferings={[
                                {
                                    id: rulesOffering.id as string,
                                    productId,
                                    licenseModel: rulesOffering.licenseModel,
                                    name: rulesOffering.name,
                                    basePrice: rulesOffering.basePrice,
                                    currencyCode: rulesOffering.currencyCode,
                                    autoRenew: Boolean(rulesOffering.autoRenew),
                                    isActive: Boolean(rulesOffering.isActive),
                                    sortOrder: rulesOffering.sortOrder ?? 0,
                                    productUnitIds: rulesOffering.productUnitIds ?? [],
                                    productUnitTempIds: rulesOffering.productUnitTempIds ?? [],
                                    createdAt: new Date().toISOString(),
                                } satisfies ProductLicenseOfferingDto,
                            ]}
                            productUnits={mapFormProductUnitsToDto(productUnits, productId)}
                            editable={canEdit}
                            lockedLicenseOfferingId={rulesOffering.id}
                            onCreateProductUnit={(definition) =>
                                addOrReuseProductUnit({
                                    productId,
                                    unitDefinitionId: definition.id,
                                    unitDefinitionCode: definition.code,
                                    unitDefinitionName: definition.name,
                                    getValues,
                                    setValue,
                                    queryClient,
                                })
                            }
                            onRemoveProductUnit={(unit) =>
                                removeProductUnit({
                                    productId,
                                    unit,
                                    getValues,
                                    setValue,
                                    queryClient,
                                })
                            }
                            onAssignProductUnitToPlan={(unit) => {
                                if (rulesIndex == null) return Promise.resolve();
                                return assignProductUnitToOffering({ productId, offeringIndex: rulesIndex, unit, getValues, setValue, queryClient });
                            }}
                            onRemoveProductUnitFromPlan={(unit) => {
                                if (rulesIndex == null) return Promise.resolve();
                                return unassignProductUnitFromOffering({ productId, offeringIndex: rulesIndex, unit, getValues, setValue, queryClient });
                            }}
                        />
                    </div>
                </div>
            ) : (
                <SalesPlanListPanel
                    offerings={offerings}
                    onCreateNew={handleCreateNew}
                    onEdit={handleEdit}
                    onDelete={handleRequestDelete}
                    onOpenRules={handleOpenRules}
                />
            )}

            <SalesPlanModal
                key={openIndex ?? "sales-plan-closed"}
                index={openIndex}
                productId={productId}
                onClose={handleCloseDrawer}
                onRequestDelete={handleRequestDelete}
                onOpenRules={handleOpenRules}
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
