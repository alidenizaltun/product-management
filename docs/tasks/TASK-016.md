# TASK-016

## Title

Route remaining dialogs through the shared modal shells

## Goal

Create/edit dialogs use `FormModal` (and confirms use `ConfirmDialog`) so size, header, footer, and dismiss behavior match. No feature keeps a one-off reactstrap `Modal` footer.

## Context

Origin: User request in `docs/PROJECT-INIT-PROMPT.md` (one standard for modals).

CONVENTIONS.md: form dialogs → `FormModal`; destructive → `ConfirmDialog`; read-only peek → `DetailModal`.

Verified raw `Modal`s still in product/pricing:

- `SalesPlanModal.tsx`
- `UnitQuickAddModal.tsx`
- `PricingTemplateActions.tsx` (save-as-template and apply-from-template)
- `ProductPricingRulesPanel.tsx` rule form (`size="xl"`)

Quick-add category/attribute/region already use `FormModal`.

TASK-009 already set `backdrop="static"` on these. This task changes the shell, not dismiss policy. Keep static backdrop.

The pricing-rule modal is large and scrollable. `FormModal` may need `scrollable` (and maybe `size="xl"`) if it does not already support them — add props to the shared shell rather than keeping a raw `Modal`.

## Dependencies

```
Depends On: TASK-009
Blocks:     -
```

## Required Skills

- testing

## Recommended Skills

- emil-design-eng

## Validation / Review Skills

- review-code if `FormModal` gains new props (scrollable, nested form submit)

## Relevant Areas

- `src/components/shared/FormModal.tsx`
- `src/pages/products/components/pricing/SalesPlanModal.tsx`
- `src/pages/products/components/pricing/UnitQuickAddModal.tsx`
- `src/pages/products/components/pricing/PricingTemplateActions.tsx`
- `src/pages/products/components/pricing-rules/ProductPricingRulesPanel.tsx`
- `src/pages/system/SystemIntegrationsPage.tsx` if that modal is a create/edit form
- Tests: `ProductPricingRulesPanel.test.tsx`, new FormModal tests if props are added

## Implementation Notes

- `FormModal` already stops submit bubbling (needed inside the product form). Keep that when converting `SalesPlanModal`.
- Do not restyle Dashlite globally. Footer remains cancel (light) + primary submit.
- Image preview and table utility modals may stay on `ImagePreviewModal` / their own shell; they are not create/edit forms.
- Do not change pricing-rule field contents here (TASK-013 owns template parity).

## Acceptance Criteria

- [x] Sales plan, unit quick-add, template-action, and pricing-rule create/edit dialogs render through `FormModal` (or `ConfirmDialog` if they are confirms)
- [x] Backdrop still does not dismiss them (TASK-009 behavior preserved)
- [x] Header X and İptal still dismiss; submit still saves
- [x] Nested-in-form submit does not submit the parent product form
- [x] Grep of product/pricing `src/` shows no remaining create/edit `<Modal isOpen` except allowed non-form shells

## Testing Requirements

Unit:

- converted dialogs still open/close via explicit buttons
- rule modal submit still calls the existing save path (panel tests)

E2E: update plan/rule specs if they target `ModalHeader` markup.

## Potential Risks

- Losing `scrollable` / `xl` on the rule modal and clipping the form
- Double `<form>` if `FormModal` wraps a component that already has a form

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped unless FormModal's submit/portal behavior changes materially
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE
