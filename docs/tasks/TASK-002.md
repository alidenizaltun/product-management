# TASK-002

## Title

Cover inline category, attribute, and region definition plus assignment

## Goal

From a software product, a user can create a category, an attribute, and a
region without leaving the product pages, assign each to the product, save,
and still see the assignments after reload.

## Context

Sınıflandırma (`ClassificationPage`) and Bölgeler (`RegionsPage`) already open
inline definition modals (`CategoryQuickAddModal`, `AttributeQuickAddModal`,
`RegionQuickAddModal`). Existing E2E:

- `inline-definition-modals.spec.ts` — modal opens in place; writable path
  creates a category and asserts the name is visible, then deletes the
  category. It does not save the product, does not cover attributes, and does
  not cover region *definition* create.
- `product-regions.spec.ts` — assigns an *existing* region to a hard-coded
  product id and cleans the assignment up.

The user journey is: new definition → assign to this product → persist.

Origin: User request for a software-product end-to-end verification backlog.

## Dependencies

```
Depends On: TASK-001
Blocks:     -
```

## Required Skills

- testing

## Recommended Skills

- debug (only if save returns 400/validation errors like the old Regions.ProductId bug)

## Validation / Review Skills

- review-code if a product-save payload bug is fixed

## Relevant Areas

- `src/pages/products/sections/ClassificationPage.tsx`
- `src/pages/products/sections/RegionsPage.tsx`
- `src/pages/products/components/editor/CategoryQuickAddModal.tsx`
- `src/pages/products/components/editor/AttributeQuickAddModal.tsx`
- `src/pages/products/components/editor/RegionQuickAddModal.tsx`
- `src/pages/products/utils/quickAddAssignment.ts`
- `src/pages/products/components/editor/CategoryTreeSelector.tsx`
- `src/pages/products/components/editor/AttributeSelector.tsx`
- `src/pages/products/components/editor/ProductRegionsTab.tsx`
- `e2e/authenticated/inline-definition-modals.spec.ts`
- `e2e/authenticated/product-regions.spec.ts`

## Implementation Notes

- Use the TASK-001 helper. Do not hard-code a shared product id.
- Stay on `/product-info/classification` and `/product-info/regions`. Creating
  a definition must not navigate to `/definitions/...`.
- Category: create in the modal, assignment appears on the product, save the
  product, reload, assignment still present. First assigned category is primary
  if that is existing product behavior — assert the actual rule, do not invent
  a second primary.
- Attribute: create a definition in the modal, set a value appropriate to its
  data type, save, reload, value still present.
- Region: create a *new region definition* from the product page (not only pick
  an existing one), assign, save, reload. Then remove the assignment and delete
  the definition if the API allows it.
- Cleanup created category / attribute definition / region definition in
  `afterEach`, matching the existing category-delete pattern.
- Extend the existing specs rather than adding a third overlapping file unless
  the file would become unreadable.
- Do not also rewrite the catalog definition list pages. Those are out of scope
  unless the modal cannot create without a catalog-page bug.

## Acceptance Criteria

- [x] New category definition is created from Sınıflandırma, assigned, saved, and survives reload
- [x] New attribute definition is created from Sınıflandırma, given a value, saved, and survives reload
- [x] New region definition is created from Bölgeler, assigned, saved, and survives reload
- [x] None of the three create flows leave the product page
- [x] Created definitions are cleaned up after the test
- [x] No 4xx/5xx on the product save used to persist the assignments

## Testing Requirements

E2E writable:

- category create + assign + persist
- attribute create + assign + value + persist
- region definition create + assign + persist
- modal cancel does not write (already partly covered; keep it)

Unit: `quickAddAssignment` already has tests. Add a case only if a new
placement bug is found.

## Potential Risks

- Deleting a category that is still mapped to the product may 409; unassign
  first, then delete.
- Attribute data-type mismatch (text vs list vs number) will fail save; pick
  one type and stick to it.
- Shared-DB pollution if cleanup is skipped.

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped (assignment UX, not money/auth)
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE

## Implementation notes (actual)

- Writable E2E lives in `e2e/authenticated/inline-definition-modals.spec.ts` and uses the TASK-001 helper (`createSoftwareProduct`).
- Helper additions: `openClassification`, `openRegions`, `saveProductSection`, `captureCreatedIds`, `cleanupInlineDefinitions`.
- Cleanup unassigns product mappings, deletes the product, then deletes the created category / attribute / region definitions.
- Attribute type used is Metin (`dataType=1`). First assigned category is asserted as primary because that is existing `placeCategoryAssignment` behavior on an empty list.
- Modal-open/cancel tests still use the shared-data product id and skip without shared fixtures; they do not write.
- No product-save payload bug was found; Grok review skipped as specified.
