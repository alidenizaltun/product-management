import React from "react";
import ProductPricingRulesPanel from "@/modules/products/components/pricing-rules/ProductPricingRulesPanel";
import type {
    ProductLicenseOfferingDto,
    ProductVariantDto,
} from "@/shared/types/productOperations.types";

interface SoftwarePricingTiersTabProps {
    productId?: string;
    licenseOfferings?: ProductLicenseOfferingDto[];
    variants?: ProductVariantDto[];
}

const SoftwarePricingTiersTab: React.FC<SoftwarePricingTiersTabProps> = ({
    productId,
    licenseOfferings = [],
    variants = [],
}) => (
    <ProductPricingRulesPanel
        productId={productId}
        licenseOfferings={licenseOfferings}
        variants={variants}
        editable
    />
);

export default SoftwarePricingTiersTab;
