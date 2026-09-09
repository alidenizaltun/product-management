# TASK-004

## Title

Cover every sales plan type and multi-unit pricing rules

## Goal

On a software product, every built-in sales-plan template can be created, at
least two product units can be attached across plans, and tiered pricing rules
for those units persist. This is the source of truth TASK-005 will price
against.

## Context

Licensed pricing lives on `/pricing/product-pricing` (`SalesPlanManager`,
`LicenseOfferingFormFields`, `ProductPricingRulesPanel`). Built-in templates
in `PLAN_TEMPLATES` are: Aylık plan, Yıllık plan, Tek seferlik, Deneme.
License models: 1 one-time, 2 subscription, 5 trial.

Existing E2E is fixture-based on İKNET:

- `plan-pricing-units.spec.ts` — read-only heading and unit list
- `plan-unit-assignment.spec.ts` — write path that assigns GB to Deneme Planı
  and checks it appears on another plan

Neither creates the four plan types, nor writes multi-unit *rules* with
tiers. `buildOfferingPayload` currently sends `basePrice: 0` always; rules
carry the money. Tests must not assume list-card prices equal rule totals.

B2B seed (`D:\Projects\React\b2b\e2e\fixtures\seed.ts`) explicitly omits
pricing rules and modules and uses license model 1, because subscription
orders 400 when no active rule exists. This task is where a known, documented
rule set is created so that gap can be closed in TASK-005.

Origin: User request for a software-product end-to-end verification backlog.

## Dependencies

```
Depends On: TASK-001
Blocks:     TASK-005, TASK-006
```

## Required Skills

- testing

## Recommended Skills

- debug (if save/validation of rules or unit assignment fails)

## Validation / Review Skills

- review-code
- grok-review (money-adjacent; run if this task changes pricing payload/mapping,
  skip if it is tests-only against unchanged UI)

## Relevant Areas

- `src/pages/products/sections/ProductPricingPage.tsx`
- `src/pages/products/components/pricing/SalesPlanManager.tsx`
- `src/pages/products/components/pricing/LicenseOfferingFormFields.tsx`
- `src/pages/products/components/pricing/SalesPlanListPanel.tsx`
- `src/pages/products/components/pricing-rules/ProductPricingRulesPanel.tsx`
- `src/pages/products/utils/productUnitSync.ts`
- `src/pages/pricing/adjustment/adjustmentForm.ts`
- `e2e/authenticated/plan-pricing-units.spec.ts`
- `e2e/authenticated/plan-unit-assignment.spec.ts`

## Implementation Notes

- Use the TASK-001 helper. Do not mutate İKNET.
- Create all four plan templates on one product. Assert each plan's name,
  license model, and billing period after reload.
- Add at least two product units (for example Kullanıcı and GB / a second
  dictionary unit). Assign both to at least one plan; assign only one of them
  to a second plan. Confirm the unassigned-on-this-plan unit still appears in
  the left list as "Bu planda kullanılmıyor" rather than disappearing.
- On one subscription plan, create pricing rules that cover **both** units,
  with at least two tiers each (example: 1–10 fixed, 11+ a different fixed or
  percentage). Record the exact adjustment JSON / form values in the spec as
  comments so TASK-005 can compute expected money.
- Quantity crossing a tier boundary and a second unit on the same offering
  must both be representable in the saved rules. If the UI cannot attach two
  units to one rule, that is a product bug: fix the smallest existing path,
  do not invent a new pricing engine.
- Persist: leave the page, come back, plans + units + rules still match.
- Keep tests serial if they share one product. Prefer one product per spec
  file with `test.describe.configure({ mode: "serial" })`.
- Do not call B2B APIs in this task.

## Acceptance Criteria

- [x] Aylık, yıllık, tek seferlik, and deneme plans can each be created and reloaded
- [x] Two product units exist on the product and can be assigned independently per plan
- [x] A unit used on plan A remains selectable on plan B
- [x] Tiered rules for more than one unit save and reload without loss
- [x] Known rule values (unit ids, from/to, type, value) are written down in the spec for TASK-005
- [x] No 4xx/5xx on plan, unit, or rule save

## Testing Requirements

E2E writable, serial:

- create four plan types
- add two units, assign across plans
- create multi-unit tiered rules
- reload persistence
- keep the existing İKNET read-only tests; do not delete them, do not point
  them at the new product

Unit: add cases to `ProductPricingRulesPanel` / `adjustmentForm` only for a
real serialization bug found while writing the E2E.

## Potential Risks

- `basePrice: 0` on offerings will look "wrong" on the plan card; assert rules,
  not the card price, unless the card is documented to show something else.
- Subscription without rules is known to 400 in B2B complete-order. Creating
  rules here is what unblocks TASK-005; do not ship a subscription plan with
  empty rules as the "happy" fixture.
- Shared-DB leftovers: unique product name, serial describe.

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped: implementer is Grok; a second Grok pass is not independent (architecture D-10). Tests-only plus a list-summary JSON fallback, not a pricing payload/mapping change.
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE
