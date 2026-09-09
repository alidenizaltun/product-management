# TASK-006

## Title

Cover software product module assignment and offering prices

## Goal

A software product can have modules created, ordered, marked required or
optional, and priced per sales plan. Assignments persist after reload.

## Context

Modüller is `/software-products/modules` (`ModulesPage` +
`ProductModulesTab`). The product picker lists software products only.
Offering prices are per license offering, with an "applies to all offerings"
option. The tab already warns if no license offering exists — that is why
this task depends on TASK-004.

There is no modules E2E today. `ModuleOfferingPricesPanel` exists on product
detail but the section page is the user-facing write path.

Origin: User request for a software-product end-to-end verification backlog.

## Dependencies

```
Depends On: TASK-004
Blocks:     -
```

## Required Skills

- testing

## Recommended Skills

- NONE

## Validation / Review Skills

- review-code if offering-price payload is fixed

## Relevant Areas

- `src/pages/products/sections/ModulesPage.tsx`
- `src/pages/products/components/editor/ProductModulesTab.tsx`
- `src/pages/products/components/detail/ModuleOfferingPricesPanel.tsx`
- `src/application/hooks/useModuleOfferingPrices.ts`
- `src/pages/products/config/productSections.ts`
- B2B catalog display of modules is out of scope unless a PM save is proven
  not to appear on public product detail; if that happens, file a follow-up
  rather than expanding this task into B2B UI.

## Implementation Notes

- Use the TASK-001 helper, then ensure at least one sales plan exists
  (TASK-004 helper or the same product created there). Do not start from a
  product with zero offerings and treat the warning as success.
- Create two modules: one optional, one required. Set code, name, sort order.
  If drag-and-drop reorder exists, move one and assert sort order after save.
- Attach offering prices: one module priced for a single plan, one module
  using "all offerings" if that control exists. Reload and assert prices.
- Product picker on this page must not list a physical product if one is
  searchable; a single assertion is enough.
- Unique module codes. Cleanup modules if the API allows delete.
- Do not build a module-template catalog. Modules are product-scoped.

## Acceptance Criteria

- [x] Two modules can be created on a software product and survive reload
- [x] Required vs optional is persisted
- [x] At least one per-plan price and, if the UI supports it, one all-plans price persist
- [x] Reorder persists if the UI exposes reorder
- [x] The modules page picker does not offer a physical product
- [x] No 4xx/5xx on module or offering-price save

## Testing Requirements

E2E writable:

- create modules + prices + reload
- picker excludes physical (can use an existing physical product on the
  writable API, or skip with an explicit reason if none can be created here)

Unit: mapper/payload test only if `buildFullProductPayload` drops
`offeringPrices` or `appliesToAllLicenseOfferings`.

## Potential Risks

- Saving modules before offerings exist is a dead end; the spec must create
  or reuse a plan first.
- "All offerings" vs per-plan rows can double-price in B2B. If public detail
  shows duplicate prices, that is in-scope to assert and fix on the PM
  payload, not to redesign B2B.

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped: implementer is Grok; a second Grok pass is not independent (architecture D-10). Module CRUD plus payload id preservation; money comparison belongs to TASK-005.
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE
