import React from "react";
import ProductPricingRulesPanel from "@/modules/products/components/pricing-rules/ProductPricingRulesPanel";
import type {
    ProductLicenseOfferingDto,
    ProductPricingRuleDto,
    ProductUnitDto,
    ProductVariantDto,
} from "@/shared/types/productOperations.types";

interface SoftwarePricingTiersTabProps {
    productId?: string;
    licenseOfferings?: Array<ProductLicenseOfferingDto & { _tempId?: string }>;
    productUnits?: Array<ProductUnitDto & { _tempId?: string }>;
    variants?: ProductVariantDto[];
    draftRules?: ProductPricingRuleDto[];
    onDraftRulesChange?: (rules: ProductPricingRuleDto[]) => void;
}

const SoftwarePricingTiersTab: React.FC<SoftwarePricingTiersTabProps> = ({
    productId,
    licenseOfferings = [],
    productUnits = [],
    variants = [],
    draftRules,
    onDraftRulesChange,
}) => (
    <ProductPricingRulesPanel
        productId={productId}
        licenseOfferings={licenseOfferings}
        productUnits={productUnits}
        variants={variants}
        draftRules={draftRules}
        onDraftRulesChange={onDraftRulesChange}
        editable
    />
);

export default SoftwarePricingTiersTab;
