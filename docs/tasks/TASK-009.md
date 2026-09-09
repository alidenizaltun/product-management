# TASK-009

## Title

Stop closing modals on backdrop click

## Goal

Clicking the dimmed area around a modal does not close it. The user dismisses it with the explicit cancel / close controls.

## Context

Origin: User request in `docs/PROJECT-INIT-PROMPT.md` (UX consistency backlog).

Reactstrap `Modal` calls `toggle` on backdrop click when `toggle` is passed. Shared shells all do that today:

- `FormModal`, `DetailModal`, `ImagePreviewModal` (`src/components/shared/FormModal.tsx`)
- `ConfirmDialog` (`toggle={onCancel}`)
- Raw modals: `SalesPlanModal`, `ProductPricingRulesPanel` rule form, `UnitQuickAddModal`, `PricingTemplateActions` (two modals)

ASSUMPTION: header X and footer İptal remain valid dismissals. Escape still dismisses (keyboard cancel). Only the backdrop is blocked (`backdrop="static"`). If a later pass wants Escape blocked as well, that is a separate change.

Do not change submit / unsaved-data behavior in this task.

## Dependencies

```
Depends On: -
Blocks:     TASK-016
```

## Required Skills

- testing

## Recommended Skills

- NONE

## Validation / Review Skills

- NONE

## Relevant Areas

- `src/components/shared/FormModal.tsx`
- `src/components/shared/ConfirmDialog.tsx`
- `src/pages/products/components/pricing/SalesPlanModal.tsx`
- `src/pages/products/components/pricing/UnitQuickAddModal.tsx`
- `src/pages/products/components/pricing/PricingTemplateActions.tsx`
- `src/pages/products/components/pricing-rules/ProductPricingRulesPanel.tsx`
- Any other `src/` `<Modal isOpen ... toggle=` that is a product/catalog/pricing dialog
- New tests next to the shared modal components

## Implementation Notes

- Prefer fixing the shared shells first so every `FormModal` / `DetailModal` / `ConfirmDialog` consumer inherits the behavior.
- Then set `backdrop="static"` on remaining raw `Modal`s. Do not restyle them here (TASK-016 converts those shells).
- `ReactDataTable` export-column modal is a special utility; include it if it is a real dialog the user can dismiss by clicking outside.
- Do not add a new modal library.

## Acceptance Criteria

- [x] Clicking the backdrop does not close `FormModal`, `DetailModal`, `ConfirmDialog`, or the listed product/pricing modals
- [x] İptal / header X still close those modals
- [x] Submit / confirm actions still work
- [x] A grep of `src/` `<Modal` usage has an explicit backdrop policy; no leftover create/edit dialog still closes on overlay click

## Testing Requirements

Unit tests on `FormModal` and `ConfirmDialog`:

- overlay / backdrop click does not call `toggle` / `onCancel`
- İptal (and header close, where present) does

If React Testing Library cannot click the reactstrap backdrop reliably, test that the `Modal` is rendered with `backdrop="static"` (or the equivalent prop the version actually uses). Verify against the installed `reactstrap` version.

## Potential Risks

- Some flows may have relied on accidental overlay-dismiss; users will need İptal
- Confirm dialogs that used overlay as cancel will now require the button — that is intended

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped (modal dismiss behavior, not auth/data)
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE
