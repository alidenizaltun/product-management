import React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import ProductPricingRulesPanel from "@/modules/products/components/pricing-rules/ProductPricingRulesPanel";
import { usePermission } from "@/modules/shared/hooks/usePermission";
import { mapFormProductUnitsToDto } from "@/modules/products/utils/productUnitSync";
import type { ProductFormValues } from "@/modules/products/types/productEditor.types";
import type { ProductLicenseOfferingDto } from "@/shared/types/productOperations.types";

interface PricingRulesModalProps {
    index: number | null;
    productId: string;
    onClose: () => void;
}

/**
 * Kaydedilmiş bir satış planının fiyatlandırma kurallarını yönettiği, plan
 * oluşturma/düzenleme penceresinden ayrı, kendi başına bir modal. Kurallar
 * karmaşık bir form barındırdığı için plan oluşturma akışıyla aynı ekranda
 * yığılmaması amacıyla bilinçli olarak ayrıldı.
 */
const PricingRulesModal: React.FC<PricingRulesModalProps> = ({ index, productId, onClose }) => {
    const canEdit = usePermission("product.pricing.edit");
    const { control } = useFormContext<ProductFormValues>();
    const productUnits = useWatch({ control, name: "productUnits" }) ?? [];
    const offering = useWatch({ control, name: index != null ? `licenseOfferings.${index}` : "licenseOfferings.0" });

    const isOpen = index != null && Boolean(offering?.id);

    if (!isOpen || !offering?.id) return null;

    return (
        <Modal isOpen={isOpen} toggle={onClose} size="xl" centered scrollable>
            <ModalHeader toggle={onClose}>{offering.name ? `${offering.name} — Kurallar` : "Fiyatlandırma Kuralları"}</ModalHeader>
            <ModalBody>
                <ProductPricingRulesPanel
                    productId={productId}
                    licenseOfferings={[
                        {
                            id: offering.id as string,
                            productId,
                            productUnitId: offering.productUnitId,
                            productUnitTempId: offering.productUnitTempId,
                            productUnitIds: offering.productUnitIds,
                            productUnitTempIds: offering.productUnitTempIds,
                            licenseModel: offering.licenseModel,
                            name: offering.name,
                            basePrice: offering.basePrice,
                            currencyCode: offering.currencyCode,
                            autoRenew: Boolean(offering.autoRenew),
                            isActive: Boolean(offering.isActive),
                            sortOrder: offering.sortOrder ?? 0,
                            createdAt: new Date().toISOString(),
                        } satisfies ProductLicenseOfferingDto,
                    ]}
                    productUnits={mapFormProductUnitsToDto(productUnits, productId)}
                    editable={canEdit}
                    lockedLicenseOfferingId={offering.id}
                />
            </ModalBody>
        </Modal>
    );
};

export default PricingRulesModal;
