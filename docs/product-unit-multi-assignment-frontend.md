# Frontend change guide: sales plans and pricing rules with multiple product units

This document is for applying the latest `ProductManager` backend change to the React frontend at:

```txt
D:\Projects\React\product-management
```

The frontend already has the first ProductUnits migration in place: `ProductUnitsTab`, product-unit endpoints, `productUnitId` fields on sales plans and pricing rules, and product-unit selectors in `LicenseOfferingsTab` / `ProductPricingRulesPanel`. This change is not a fresh ProductUnits implementation. It upgrades the existing single product-unit binding to multi-select binding.

## Backend contract

`ProductLicenseOffering` and `ProductPricingRule` can now be assigned to more than one `ProductUnit`.

New database tables:

```txt
Product.ProductLicenseOfferingUnits
Product.ProductPricingRuleUnits
```

Legacy single fields remain for backward compatibility:

```ts
productUnitId?: string | null;
productUnitCode?: string | null;
productUnitName?: string | null;
unitDefinitionId?: string | null;
unitDefinitionCode?: string | null;
unitDefinitionName?: string | null;
```

New preferred read fields:

```ts
productUnitIds: string[];
productUnits: ProductUnitDto[];
```

New preferred create/full-save fields:

```ts
productUnitIds?: string[];
productUnitTempIds?: string[];
```

Standalone update uses saved IDs:

```ts
productUnitIds?: string[];
```

Keep sending `productUnitId` as the first selected saved unit for compatibility if doing so is cheap, but new UI state should be driven by `productUnitIds` / `productUnits`.

## Target files in the frontend

Update these files first:

```txt
src/shared/types/productOperations.types.ts
src/modules/products/types/productEditor.types.ts
src/modules/products/pages/ProductFormPage.tsx
src/modules/products/components/editor/LicenseOfferingsTab.tsx
src/modules/products/components/pricing-rules/ProductPricingRulesPanel.tsx
src/modules/products/components/detail/ProductDetailTabs.tsx
src/tests/mocks/fixtures.ts
src/modules/products/__tests__/productFormMapping.test.ts
```

The following files should already exist and should only need small adjustments if type errors surface:

```txt
src/modules/products/api/products.api.ts
src/modules/products/hooks/useProductUnits.ts
src/modules/products/hooks/useProductPricingRules.ts
src/services/query/queryKeys.ts
src/shared/config/apiEndpoints.ts
```

## Type changes

In `src/shared/types/productOperations.types.ts`, extend `ProductPricingRuleDto`:

```ts
productUnitIds?: Uuid[];
productUnits?: ProductUnitDto[];
```

Extend `UpsertProductPricingRuleRequestDto`:

```ts
productUnitIds?: Uuid[];
productUnitTempIds?: string[];
```

Extend `ProductLicenseOfferingDto`:

```ts
productUnitIds?: Uuid[];
productUnits?: ProductUnitDto[];
productUnitTempIds?: string[];
```

In `CreateFullProductRequestDto.licenseOfferings[]`, add:

```ts
productUnitIds?: Uuid[];
productUnitTempIds?: string[];
```

In `CreateFullProductRequestDto.pricingRules[]`, add:

```ts
productUnitIds?: Uuid[];
productUnitTempIds?: string[];
```

In `src/modules/products/types/productEditor.types.ts`, keep the existing singular fields for compatibility, but add arrays:

```ts
export interface LicenseOfferingForm {
  productUnitId?: string;
  productUnitTempId?: string;
  productUnitIds?: string[];
  productUnitTempIds?: string[];
  // existing fields...
}

export interface ProductPricingRuleForm {
  productUnitId?: string;
  productUnitTempId?: string;
  productUnitIds?: string[];
  productUnitTempIds?: string[];
  // existing fields...
}
```

## Shared helper shape

Both sales plans and pricing rules currently use option values like:

```ts
id:{guid}
temp:{_tempId}
```

Use the same convention for multi-select values.

Suggested helpers:

```ts
const toUnitScopeValues = (
  ids?: Array<string | null | undefined>,
  tempIds?: Array<string | null | undefined>
) => [
  ...(ids ?? []).filter(Boolean).map((id) => `id:${id}`),
  ...(tempIds ?? []).filter(Boolean).map((id) => `temp:${id}`),
];

const splitUnitScopeValues = (values: string[]) => {
  const productUnitIds = values
    .filter((value) => value.startsWith("id:"))
    .map((value) => value.replace("id:", ""))
    .filter(Boolean);

  const productUnitTempIds = values
    .filter((value) => value.startsWith("temp:"))
    .map((value) => value.replace("temp:", ""))
    .filter(Boolean);

  return {
    productUnitIds,
    productUnitTempIds,
    productUnitId: productUnitIds[0],
    productUnitTempId: productUnitIds.length === 0 ? productUnitTempIds[0] : undefined,
  };
};
```

Use a checkbox list or a native `<select multiple>`. A checkbox list is usually clearer for this app because product units are short operational records.

## ProductFormPage mapping

When mapping backend detail to form values, derive arrays with fallback to the legacy single field:

```ts
const mapProductUnitIds = (item: {
  productUnitIds?: string[];
  productUnitId?: string | null;
}) => item.productUnitIds?.length ? item.productUnitIds : item.productUnitId ? [item.productUnitId] : [];
```

For license offerings:

```ts
productUnitIds: mapProductUnitIds(lo),
productUnitId: lo.productUnitId ?? lo.productUnitIds?.[0] ?? "",
```

For pricing rules:

```ts
productUnitIds: mapProductUnitIds(rule),
productUnitId: rule.productUnitId ?? rule.productUnitIds?.[0] ?? "",
```

When building the full product payload, send arrays and keep the first selected item in the legacy fields:

```ts
const productUnitIds = offering.productUnitIds?.filter(Boolean) ?? [];
const productUnitTempIds = offering.productUnitTempIds?.filter(Boolean) ?? [];

return {
  // existing offering fields...
  productUnitId: productUnitIds[0] || undefined,
  productUnitTempId: productUnitIds.length === 0 ? productUnitTempIds[0] || undefined : undefined,
  productUnitIds: productUnitIds.length ? productUnitIds : undefined,
  productUnitTempIds: productUnitTempIds.length ? productUnitTempIds : undefined,
};
```

Apply the same payload rule for `pricingRules`.

## LicenseOfferingsTab

Current state:

```txt
src/modules/products/components/editor/LicenseOfferingsTab.tsx
```

It currently watches `productUnits`, stores one `productUnitId` / `productUnitTempId`, and disables standalone save when the selected unit is unsaved.

Change it to multi selection:

1. Build selected option values from `productUnitIds` and `productUnitTempIds`.
2. Render active product units as checkboxes or a multi-select.
3. On change, write both arrays and the first selected legacy field.
4. Disable standalone `Plan Ekle` / `Planı Güncelle` if any selected value starts with `temp:`. Standalone APIs can only link saved product units.
5. In `buildOfferingPayload`, send `productUnitIds` and legacy `productUnitId`.

Payload rule:

```ts
const productUnitIds = offering.productUnitIds?.filter(Boolean) ?? [];

const payload = {
  productUnitId: productUnitIds[0] || undefined,
  productUnitIds: productUnitIds.length ? productUnitIds : undefined,
  // existing fields...
};
```

Do not send `productUnitTempIds` to standalone create/update. Unsaved unit references belong to the full product save flow.

## ProductPricingRulesPanel

Current state:

```txt
src/modules/products/components/pricing-rules/ProductPricingRulesPanel.tsx
```

It already accepts `productUnits`, has one `productUnitId` / `productUnitTempId`, and shows the unit scope select. Upgrade that scope to multi.

Important distinction:

```txt
productUnitIds       = which product units this rule applies to
priceAdjustment.unit = which quantity/feature field is used for the formula
```

Do not merge these concepts.

Required changes:

1. Extend `RuleFormState` with `productUnitIds: string[]` and `productUnitTempIds: string[]`.
2. `emptyForm` should default both arrays to `[]`.
3. `ruleToForm` should prefer `rule.productUnitIds`, falling back to `rule.productUnitId`.
4. `buildPayload` should send `productUnitIds`, `productUnitTempIds`, and legacy first selected fields.
5. Draft rules for new products must preserve `productUnitTempIds`.
6. Rule list display should show all selected unit names, not only one.

For standalone create/update:

```ts
const savedUnitIds = form.productUnitIds.filter(Boolean);

return {
  // existing rule payload...
  productUnitId: savedUnitIds[0] || null,
  productUnitIds: savedUnitIds.length ? savedUnitIds : undefined,
};
```

If selected units include temp values and `productId` exists, block standalone save with a Turkish warning such as:

```txt
Önce ürün birimini kaydedin, sonra kuralı kaydedebilirsiniz.
```

For new unsaved products, draft rules may carry `productUnitTempIds` and the full save payload will resolve them.

## Detail screens

In `src/modules/products/components/detail/ProductDetailTabs.tsx`:

For sales plans, replace single unit display with a joined list:

```ts
const unitNames = lo.productUnits?.length
  ? lo.productUnits.map((unit) => unit.name).join(", ")
  : lo.productUnitName ?? lo.productUnitCode ?? lo.unitDefinitionName;
```

For pricing rules, do the same:

```ts
const unitNames = rule.productUnits?.length
  ? rule.productUnits.map((unit) => unit.name).join(", ")
  : rule.productUnitName ?? rule.productUnitCode ?? rule.unitDefinitionName;
```

Keep the existing ProductUnits tab.

## Mock and tests

Update fixtures so at least one offering and one pricing rule include both legacy and new fields:

```ts
productUnitId: "product-unit-user",
productUnitIds: ["product-unit-user", "product-unit-branch"],
productUnits: [
  { id: "product-unit-user", name: "Kullanıcı", code: "USER", /* existing fields */ },
  { id: "product-unit-branch", name: "Şube", code: "BRANCH", /* existing fields */ },
],
```

Update mapping tests to assert:

```ts
expect(form.licenseOfferings[0].productUnitIds).toEqual(["product-unit-user", "product-unit-branch"]);
expect(payload.licenseOfferings[0].productUnitIds).toEqual(["product-unit-user", "product-unit-branch"]);
expect(payload.licenseOfferings[0].productUnitId).toBe("product-unit-user");
expect(payload.pricingRules[0].productUnitIds).toEqual(["product-unit-user", "product-unit-branch"]);
```

Also add a draft/new product case:

```ts
productUnitTempIds: ["product-unit-temp-user", "product-unit-temp-branch"]
```

and assert the full save payload keeps those temp IDs.

## Acceptance criteria

- A sales plan can be assigned to more than one product unit.
- A pricing rule can be assigned to more than one product unit.
- Existing single-unit data still renders through the fallback fields.
- Full product create can link new product units to new sales plans/rules through `productUnitTempIds`.
- Standalone create/update only sends saved `productUnitIds`.
- Product detail refresh keeps all selected units visible.
- Pricing rule formula unit fields remain independent from rule scope product units.
- `npm.cmd run build` succeeds. If ESLint is blocked by the repo's TypeScript ESLint setup, use `npm.cmd run build` as the validation fallback.

