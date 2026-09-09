import React, { useEffect, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "reactstrap";
import { FormModal } from "@/components/shared/FormModal";
import { productRepository } from "@/infrastructure/api/repositories";
import { showApiError, showSuccess } from "@/components/shared/NotificationAlert";
import { usePermission } from "@/application/hooks/usePermission";
import { invalidateAllPricingQueries } from "@/pages/products/utils/productUnitSync";
import type { ProductFormValues } from "@/pages/products/types/productEditor.types";
import LicenseOfferingFormFields, { buildOfferingPayload } from "./LicenseOfferingFormFields";

interface SalesPlanModalProps {
    index: number | null;
    productId: string;
    onClose: () => void;
    onRequestDelete: (index: number) => void;
    onOpenRules?: (index: number) => void;
}

const SalesPlanModal: React.FC<SalesPlanModalProps> = ({ index, productId, onClose, onRequestDelete }) => {
    const queryClient = useQueryClient();
    const canEdit = usePermission("product.pricing.edit");
    const { control, getValues, setValue, trigger, reset, setFocus, formState } = useFormContext<ProductFormValues>();
    const offering = useWatch({ control, name: index != null ? `licenseOfferings.${index}` : "licenseOfferings.0" });
    const [saving, setSaving] = useState(false);

    const isOpen = index != null;

    useEffect(() => {
        if (isOpen && index != null) {
            const timer = window.setTimeout(() => setFocus(`licenseOfferings.${index}.name`), 80);
            return () => window.clearTimeout(timer);
        }
    }, [isOpen, index, setFocus]);

    if (!isOpen || index == null) return null;

    const isSaved = Boolean(offering?.id);

    const handleSave = async () => {
        if (saving) return;

        const valid = await trigger([
            `licenseOfferings.${index}.name`,
            `licenseOfferings.${index}.validTo`,
        ]);
        if (!valid) {
            const fieldErrors = formState.errors.licenseOfferings?.[index];
            if (fieldErrors?.name) setFocus(`licenseOfferings.${index}.name`);
            else if (fieldErrors?.validTo) setFocus(`licenseOfferings.${index}.validTo`);
            return;
        }

        const currentOffering = getValues(`licenseOfferings.${index}`);
        const payload = buildOfferingPayload(currentOffering);

        try {
            setSaving(true);
            if (currentOffering.id) {
                await productRepository.updateLicenseOffering(productId, currentOffering.id, payload);
                showSuccess("Satış planı güncellendi.");
            } else {
                const created = await productRepository.createLicenseOffering(productId, payload);
                setValue(`licenseOfferings.${index}.id`, created.id, { shouldDirty: false });
                setValue(`licenseOfferings.${index}._tempId`, undefined, { shouldDirty: false });
                showSuccess("Satış planı eklendi.");
            }
            await invalidateAllPricingQueries(queryClient, productId);
            reset(getValues());
            onClose();
        } catch (error) {
            showApiError(error);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (saving) return;
        onClose();
    };

    return (
        <FormModal
            open={isOpen}
            toggle={handleCancel}
            title={isSaved ? "Satış Planı Ayarları" : "Yeni Satış Planı"}
            size="lg"
            centered
            scrollable
            loading={saving}
            loadingText="Kaydediliyor..."
            disabled={!canEdit}
            submitLabel={isSaved ? "Kaydet" : "Planı Kaydet"}
            onSubmit={handleSave}
            footerContent={
                <div className="d-flex justify-content-between w-100">
                    <div>
                        {isSaved && canEdit && (
                            <Button color="outline-danger" type="button" onClick={() => onRequestDelete(index)} disabled={saving}>
                                <em className="icon ni ni-trash me-1" />
                                Planı Sil
                            </Button>
                        )}
                    </div>
                    <div className="d-flex gap-2">
                        <Button color="light" type="button" onClick={handleCancel} disabled={saving}>
                            İptal
                        </Button>
                        <Button color="primary" type="submit" disabled={saving || !canEdit}>
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Kaydediliyor...
                                </>
                            ) : (
                                <>
                                    <em className={`icon ni ni-${isSaved ? "save" : "plus"} me-1`} />
                                    {isSaved ? "Kaydet" : "Planı Kaydet"}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            }
        >
            <LicenseOfferingFormFields
                index={index}
                fieldId={String(offering?.id ?? offering?._tempId ?? index)}
            />
        </FormModal>
    );
};

export default SalesPlanModal;
