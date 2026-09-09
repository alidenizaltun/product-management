# TASK-013

## Title

Make the pricing-template form match in-product pricing-rule create

## Goal

Creating or editing a price template (`/pricing/templates/new`) uses the same field language, grouping, and controls as creating a pricing rule on a product. A user who learned one screen can complete the other without translation.

## Context

Origin: User request in `docs/PROJECT-INIT-PROMPT.md` (UX consistency backlog).

`ProductPricingRulesPanel` rule modal is the source of truth for "fiyatlandırma kuralı oluştur": calculation mode, direction, adjustment type/value, unit mode, tiers, rounding, copy, `HelpLabel`.

`PricingTemplateFormPage` is a separate hand-rolled form: raw `<label>` / `<input>`, different mode labels ("Tek tutar" vs "Sabit", "Birim başına" vs "Kademeli"), and no shared component. TASK-010 already removed the oversized Sıra box; create sends `sortOrder: 0`, edit keeps the existing value.

The template still stores `payloadJson` / `ProductPricingRuleAdjustmentDto` via `adjustmentForm.ts`. Reuse that adapter. Do not invent a second payload.

Product-scoped fields (which product units the rule applies to, assign-to-plan) do not belong on a product-independent template. Template-only fields (name, description, unit definition, currency, active) stay. The **pricing / adjustment block** must match.

## Dependencies

```
Depends On: -
Blocks:     TASK-017
```

## Required Skills

- testing

## Recommended Skills

- research (only to confirm template DTO vs rule DTO still match the installed API types)

## Validation / Review Skills

- review-code (shared form must not change rule payload meaning)
- grok-review after the shared extraction, because pricing math/payload is high-impact

## Relevant Areas

- `src/pages/pricing/PricingTemplateFormPage.tsx`
- `src/pages/pricing/adjustment/adjustmentForm.ts`
- `src/pages/products/components/pricing-rules/ProductPricingRulesPanel.tsx`
- Possible new shared module under `src/pages/pricing/` or `src/pages/products/components/pricing-rules/` for the adjustment fields only
- `src/pages/pricing/adjustment/__tests__/adjustmentForm.test.ts`
- Template repository tests if the submitted payload shape could change

## Implementation Notes

- Extract the adjustment UI that both screens need. One implementation. Do not duplicate JSX.
- Keep the in-product modal's unit-scope dual list **out** of the template page.
- Labels on the template page must match the rule modal (Hesaplama modu, Fiyat yönü, Kademeli, …).
- Use `FormField` / existing inputs from `components/shared` where the rule UI already does, or where CONVENTIONS.md requires it for a touched form.
- Sıra: TASK-010 already removed the number column. Keep sending `sortOrder: 0` on create and the existing value on edit unless the shared rule form later owns order.
- Smallest diff that makes the two adjustment experiences the same. Do not restyle the entire pricing module.

## Acceptance Criteria

- [x] Template create/edit adjustment fields use the same labels and control set as in-product rule create
- [x] Saving a template still persists a valid `ProductPricingRuleAdjustmentDto` payload
- [x] In-product rule create still saves the same payload shape as before (regression)
- [x] Unit-scope / plan-assignment UI is not on the template page
- [x] Mode `unit` still supports tiers; non-unit still supports type + value

## Testing Requirements

Unit:

- `adjustmentForm` round-trip unchanged
- template submit builds the same payload as the rule form for an equivalent filled adjustment
- rule panel tests still pass

E2E: not required unless an existing template spec exists.

## Potential Risks

- Shared extraction accidentally changes rule payload (`operation`, `mode`, tiers)
- Template API rejects fields the rule modal sends; stay inside `CreatePricingTemplateRequestDto` / `UpdatePricingTemplateRequestDto`

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped (implementer is Grok; same-model review is not independent, D-10)
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE
