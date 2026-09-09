# TASK-001

## Title

Cover software product creation and general information

## Goal

A writable software product can be created from the UI, its general information
can be saved, and later tasks can reuse a single helper instead of depending on
shared-DB fixtures such as İKNET.

## Context

Product creation today is a minimum identity form (`src/pages/products/ProductCreatePage.tsx`):
name, kind, status, currency. Default kind is already `2` (software). After create,
the user lands on `/products/:id` and completes sections from fixed pages.

Existing E2E (`e2e/authenticated/product-create.spec.ts`) only asserts that a
named product is created and the detail heading appears. It does not set kind
explicitly, does not open Genel Bilgiler, and does not prove persistence after
reload. Writable tests already skip unless `E2E_API_BASE_URL` is set
(`SKIP_WITHOUT_WRITABLE_API` in `e2e/utils.ts`).

Later tasks must not hard-code a shared product id. This task owns the helper
that creates a uniquely named software product and returns `{ id, name }`.

Origin: User request for a software-product end-to-end verification backlog.

## Dependencies

```
Depends On: -
Blocks:     TASK-002, TASK-003, TASK-004
```

## Required Skills

- testing

## Recommended Skills

- NONE

## Validation / Review Skills

- review-code (only if the helper or general-info save path needs a product fix)

## Relevant Areas

- `src/pages/products/ProductCreatePage.tsx`
- `src/pages/products/sections/GeneralInfoPage.tsx`
- `src/pages/products/components/editor/GeneralInfoTab.tsx`
- `src/pages/products/utils/productFormMapper.ts`
- `e2e/authenticated/product-create.spec.ts`
- `e2e/utils.ts`
- New: `e2e/authenticated/helpers/softwareProduct.ts` (or equivalent next to existing specs)

## Implementation Notes

- Match existing Playwright style: Turkish labels, `getByRole` / `getByLabel`,
  skip with `SKIP_WITHOUT_WRITABLE_API`.
- Create through the UI, not a silent API seed. This task is covering the
  product-management UI.
- Kind must be Yazılım (`kind=2`). Do not rely on the default remaining 2.
- After create, open `/product-info/general?productId=...`, fill at least:
  short description, long description, sellable/purchasable, tax rate, default
  currency if editable. Save. Reload. Assert the same values.
- Unique names (`E2E Yazılım ${Date.now()}`) so parallel runs do not collide.
- Export a helper used by TASK-002..004 and TASK-006. The helper may create
  the product and optionally fill general info; it must not create categories,
  plans, or modules.
- Cleanup: if the API exposes product delete and it is safe, delete in
  `afterEach` / `afterAll`. If delete is not available, say so in the task
  report and keep names uniquely prefixed so leftovers are identifiable.
- Do not use the İKNET product id. Do not write to the shared DB unless
  `E2E_API_BASE_URL` is set.
- Do not expand into classification, media, pricing, or modules.

## Acceptance Criteria

- [x] A software product can be created from `/products/new` with kind Yazılım
- [x] After create, the browser is on `/products/:id` and the product name is visible
- [x] Genel Bilgiler save persists across reload with no toast/API error
- [x] A reusable helper exists and is the only create path later product E2E tasks import
- [x] The spec is skipped when `E2E_API_BASE_URL` is unset

## Testing Requirements

E2E (Playwright), isolated writable API:

- empty name is blocked (already covered by `form-validation.spec.ts`; do not duplicate unless that case regresses)
- create software product, land on detail
- general info: set description + tax rate, save, reload, values match
- failure: a 4xx/5xx on save fails the test (assert response status, not only a toast)

Unit tests are not required unless a mapper bug is found and fixed here.

## Potential Risks

- Writable tests against the shared dev API leave orphan products if delete is missing.
- `SKIP_WITHOUT_WRITABLE_API` also skips when `E2E_SKIP_VISUAL` is set; do not
  weaken that guard to force writes onto the shared visual-baseline DB.

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped (create/general-info path is not high-risk money/auth)
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE

## Implementation notes (actual)

- Helper: `e2e/authenticated/helpers/softwareProduct.ts`
- Spec: `e2e/authenticated/product-create.spec.ts`
- Genel Bilgiler previously had no tax-rate/tax-code inputs; those fields were added.
- Full-product UPDATE SQL in ProductManagement.Repository did not persist `TaxRate`/`TaxCode`. That is required for this task's save/reload criterion and was fixed there.
- Product delete (`DELETE /api/products/:id`) is available and used for cleanup.
- Default currency is not editable in the UI (hidden `TRY`); the spec does not invent a currency picker.
