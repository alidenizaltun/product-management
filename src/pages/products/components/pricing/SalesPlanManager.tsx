import React, { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "reactstrap";
import { productRepository } from "@/infrastructure/api/repositories";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";
import {
    addOrReuseProductUnit,
    assignProductUnitToOffering,
    invalidateAllPricingQueries,
    mapFormProductUnitsToDto,
    removeProductUnit,
    unassignProductUnitFromOffering,
} from "@/pages/products/utils/productUnitSync";
import { usePermission } from "@/application/hooks/usePermission";
import type { ProductFormValues } from "@/pages/products/types/productEditor.types";
import type { ProductLicenseOfferingDto } from "@/domain/types/productOperations.types";
import { EMPTY_OFFERING, generateOfferingTempId, getModelMeta } from "./LicenseOfferingFormFields";
import { BILLING_UNITS } from "@/pages/products/utils/billingPeriod";
import SalesPlanListPanel from "./SalesPlanListPanel";
import SalesPlanModal from "./SalesPlanModal";
import ProductPricingRulesPanel from "@/pages/products/components/pricing-rules/ProductPricingRulesPanel";

/** Kural ekranındaki plan başlığında gösterilecek faturalama periyodu metni. */
const formatBillingPeriod = (unit?: number, value?: number) => {
    const unitLabel = BILLING_UNITS.find((item) => item.value === Number(unit))?.label;
    if (!unitLabel) return null;
    return value && value > 0 ? `${value} ${unitLabel.toLocaleLowerCase("tr-TR")} periyot` : `${unitLabel}lık periyot`;
};

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
            await productRepository.deleteLicenseOffering(productId, offering.id);
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
                    {/* Kurallar tek bir satış planına kilitli çalışır; hangi planda olunduğu
                        başlıkta açıkça yazmazsa kullanıcı yanlış plana kural ekleyebilir. */}
                    <div className="col-12">
                        <div className="card card-bordered">
                            <div className="card-inner py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                                <div className="d-flex align-items-center gap-3">
                                    <em className={`icon ni ni-${getModelMeta(Number(rulesOffering.licenseModel ?? 2)).icon} fs-3 text-${getModelMeta(Number(rulesOffering.licenseModel ?? 2)).color}`} />
                                    <div>
                                        <span className="overline-title text-soft d-block">Fiyatlandırma kuralları</span>
                                        <h5 className="title mb-0">{rulesOffering.name?.trim() || "Adsız plan"}</h5>
                                    </div>
                                </div>
                                <div className="d-flex flex-wrap align-items-center gap-1">
                                    <span className={`badge badge-dim bg-${getModelMeta(Number(rulesOffering.licenseModel ?? 2)).color}`}>
                                        {getModelMeta(Number(rulesOffering.licenseModel ?? 2)).label}
                                    </span>
                                    {formatBillingPeriod(rulesOffering.billingPeriodUnit, rulesOffering.billingPeriodValue) && (
                                        <span className="badge bg-outline-light text-soft">
                                            {formatBillingPeriod(rulesOffering.billingPeriodUnit, rulesOffering.billingPeriodValue)}
                                        </span>
                                    )}
                                    <span className={`badge bg-${rulesOffering.isActive ? "success" : "secondary"}`}>
                                        {rulesOffering.isActive ? "Aktif" : "Pasif"}
                                    </span>
                                    <Button color="light" size="sm" type="button" className="ms-1" onClick={() => rulesIndex != null && handleEdit(rulesIndex)}>
                                        <em className="icon ni ni-setting me-1" />
                                        Plan ayarları
                                    </Button>
                                </div>
                            </div>
                        </div>
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
