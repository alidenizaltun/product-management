# TASK-010

## Title

Replace oversized sort-order inputs with the classification drag pattern

## Goal

Forms that collect an ordered list no longer spend a full column on a "Sıra" number box. Order is set by drag (and the existing up/down handles), matching Sınıflandırma.

## Context

Origin: User request in `docs/PROJECT-INIT-PROMPT.md` (UX consistency backlog).

The intended example is `CategoryTreeSelector`: hidden `sortOrder`, `pricing-order-chip` ("Sıra N"), drag handle, optional chevrons. `ProductModulesTab` and `MediaUploadManager` already follow that pattern.

Verified leftover **list** form with a large Sıra box:

- `ProductRegionsTab.tsx` — `col-md-3` number input labeled "Sıra"

Verified leftover **single-record** Sıra boxes (drag does not apply; default or compact):

- `RegionFormPage.tsx`, `UnitDefinitionFormPage.tsx` — `NumberInput label="Sıra"` taking a column
- `RegionQuickAddModal.tsx` — same
- `PricingTemplateFormPage.tsx` — raw number input (TASK-013 may replace this form; still remove the oversized box if the field survives)

Read-only "Sıra" on `ProductDetailTabs` stays; it is not an editor.

Do not build a new sortable kit. Reuse `@dnd-kit` and the existing `pricing-drag-handle` / `pricing-order-chip` classes.

## Dependencies

```
Depends On: -
Blocks:     -
```

## Required Skills

- testing

## Recommended Skills

- NONE

## Validation / Review Skills

- NONE

## Relevant Areas

- `src/pages/products/components/editor/ProductRegionsTab.tsx`
- `src/pages/products/components/editor/CategoryTreeSelector.tsx` (pattern to copy, not rewrite)
- `src/pages/catalog/RegionFormPage.tsx`
- `src/pages/catalog/UnitDefinitionFormPage.tsx`
- `src/pages/products/components/editor/RegionQuickAddModal.tsx`
- `src/pages/pricing/PricingTemplateFormPage.tsx` (only the Sıra field, unless TASK-013 already removed it)
- Tests covering region assignment order if they exist; add one if not

## Implementation Notes

- Product regions: `DndContext` + `SortableContext` like categories; persist `sortOrder` as index + 1 on drag/move; hide the number input.
- Quick-add region: do not ask for Sıra; send `0` or append-at-end. The product assignment list is ordered on the product form, not in the definition modal.
- Catalog Region / Unit **create**: default `sortOrder` to `0` (or next index if the API already returns a list) and do not show a full-width box. Edit may keep a compact control if the API requires an explicit value — not a `col-md-3` `NumberInput`.
- Do not add drag-and-drop reordering of catalog **list pages** in this task.
- Do not change the payload shape.

## Acceptance Criteria

- [x] Product region cards have no Sıra number text box; order is visible as a chip and changeable by drag (and chevrons if categories have them)
- [x] Saving regions after reorder persists the new `sortOrder` values
- [x] Region quick-add modal has no Sıra field
- [x] Region and unit definition create forms do not use a large Sıra number column
- [x] Classification category drag still works (no regression)

## Testing Requirements

Unit:

- region list reorder updates `sortOrder` to match visual order
- region quick-add form does not render a Sıra input

E2E: not required unless `product-regions.spec.ts` fills a Sıra box — update that spec if it does.

## Potential Risks

- Hidden `sortOrder` forgotten on submit → API keeps old order
- Keyboard / pointer sensor distance must match the classification tab so accidental drags stay rare

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped (UI reorder, existing dnd-kit pattern)
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE
