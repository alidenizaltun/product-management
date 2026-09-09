# TASK-015

## Title

Align create/edit form pages to the shared form shell

## Goal

Full-page create/edit screens use the same shell, field controls, and save/cancel pattern so a category form, a unit form, and a price-list form do not feel like three products.

## Context

Origin: User request in `docs/PROJECT-INIT-PROMPT.md` (last item: one standard for forms).

Binding standard: `src/components/shared/CONVENTIONS.md` — `FormPage` or `FormCard` + `FormField` / `TextInput` / `NumberInput` / `Textarea` / `Checkbox`, `LoadingButton`, `useUnsavedChangesGuard` on multi-section forms.

Verified drift:

- Catalog forms (`CategoryFormPage`, `RegionFormPage`, …) already mix `PageHeader` + `FormField` but are not on `FormPage`.
- `PricingTemplateFormPage` is a raw `<label>` / `<input>` form. TASK-013 owns the adjustment block; this task owns the page shell and identity fields after that.
- Product section pages use `ProductSectionPage` — keep that feature shell; do not force them onto `FormPage`.

Do not redesign field order or add fields. Swap chrome and repeated input markup.

## Dependencies

```
Depends On: TASK-008, TASK-013
Blocks:     -
```

## Required Skills

- NONE

## Recommended Skills

- emil-design-eng

## Validation / Review Skills

- NONE

## Relevant Areas

- `src/components/shared/PageLayout.tsx` (`FormPage`)
- `src/components/shared/FormCard.tsx`
- `src/components/shared/CONVENTIONS.md`
- `src/pages/catalog/*FormPage.tsx`
- `src/pages/pricing/PriceListFormPage.tsx`
- `src/pages/pricing/PriceRevisionFormPage.tsx`
- `src/pages/pricing/PricingTemplateFormPage.tsx` (shell only if TASK-013 already aligned the adjustment UI)
- Identity create/edit pages if they are full-page forms

## Implementation Notes

- TASK-008 must be DONE so this sweep does not restore "Kod sistem tarafından üretilir."
- TASK-013 must be DONE so the template page is not rewritten twice.
- Prefer `FormPage` when the page is a single create/edit record. If a page already has a correct `PageHeader` + card, wrapping is enough — do not nest two headers.
- Sticky save only when the form is long enough that the header actions scroll away.
- Product editor tabs/sections are out of scope.

## Acceptance Criteria

- [x] Catalog and pricing create/edit pages share one header/actions/field pattern
- [x] Fields use `FormField` (or the existing shared inputs), not one-off `<label className="form-label">` stacks on pages this task opens
- [x] Save uses `LoadingButton` or `FormPage` submit; cancel is the light/outline action
- [x] Unsaved-changes guard remains on forms that already had it
- [x] Product section pages are unchanged
- [x] The "system generates the code" sentence is still absent

## Testing Requirements

Update catalog/pricing form unit tests if they query old markup.

No new E2E unless an existing form spec breaks.

## Potential Risks

- Double headers if `FormPage` is wrapped around a page that already has `PageHeader`
- Breaking `form="…"` submit buttons that target a form id

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped (shell consistency)
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE
