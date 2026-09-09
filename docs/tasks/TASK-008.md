# TASK-008

## Title

Remove "the system generates the code" copy from the UI

## Goal

Users no longer see helper text that explains that the system generates codes. Create forms stay usable without that sentence.

## Context

Origin: User request in `docs/PROJECT-INIT-PROMPT.md` (UX consistency backlog).

Verified user-visible strings:

- `CategoryFormPage.tsx` — description: "Kod sistem tarafından üretilir."
- `RegionFormPage.tsx` — same
- `SupplierFormPage.tsx` — same
- `WarehouseFormPage.tsx` — same
- `UnitDefinitionFormPage.tsx` — same, appended to the page description
- `PriceListFormPage.tsx` — same
- `CategoryQuickAddModal.tsx` — "Kod sistem tarafından üretilir."
- `RegionQuickAddModal.tsx` — same

Out of scope (not UI):

- JSDoc on DTOs in `productOperations.types.ts`
- The comment in `ProductCreatePage.tsx` (the create form does not show that sentence)

Do not invent replacement copy that still talks about the system. If a description becomes empty, omit it.

## Dependencies

```
Depends On: -
Blocks:     TASK-017
```

## Required Skills

- NONE

## Recommended Skills

- NONE

## Validation / Review Skills

- NONE

## Relevant Areas

- `src/pages/catalog/CategoryFormPage.tsx`
- `src/pages/catalog/RegionFormPage.tsx`
- `src/pages/catalog/SupplierFormPage.tsx`
- `src/pages/catalog/WarehouseFormPage.tsx`
- `src/pages/catalog/UnitDefinitionFormPage.tsx`
- `src/pages/pricing/PriceListFormPage.tsx`
- `src/pages/products/components/editor/CategoryQuickAddModal.tsx`
- `src/pages/products/components/editor/RegionQuickAddModal.tsx`

## Implementation Notes

- Search the UI for `sistem tarafından` / `Kod sistem` before finishing; the list above is the verified set at planning time.
- Do not change code-generation behavior. Codes may still be omitted on create.
- Do not add a different hint that restates the same idea.

## Acceptance Criteria

- [x] No user-visible string contains "sistem tarafından üretilir" or equivalent "the system does X" code-generation copy
- [x] Create forms and quick-add modals still render and submit without that sentence
- [x] DTO comments and non-UI source comments may remain

## Testing Requirements

Grep the `src/` UI (`tsx`) for the old sentence after the change.

Update any test that asserts the old description string.

No new E2E required unless a spec snapshots that description.

## Potential Risks

- Snapshot / copy assertions in catalog form tests if they exist
- TASK-017 must not reintroduce the sentence when it rewrites form headers

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped (copy-only)
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE
