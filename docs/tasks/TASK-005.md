# TASK-005

## Title

Verify B2B mapper, purchase-order price, and order calculate

## Goal

A software product priced in Product Management (plans, multiple units, tiered
rules) is mapped into B2B without dropping units or rules, and both
`calculate-purchase-order-price` and `calculate-order-price` return totals that
match those rules. Mismatches are either fixed in the B2B mapping/UI or
reported as backend defects — not papered over.

## Context

"MAPP" here means the B2B public-product **mapper**
(`src/infrastructure/api/mappers/publicProductMapper.ts` and
`src/application/services/pricingRuleParameters.ts` in
`D:\Projects\React\b2b`). "Purchase calculate" is
`POST /api/dealer-entitlements/calculate-purchase-order-price`. "Calculate
order" is `POST /api/Orders/calculate-order-price`.

Verified facts:

- B2B E2E seed (`e2e/fixtures/seed.ts`) creates a software product **without**
  `productUnits`, `pricingRules`, or modules, and defaults `licenseModel` to 1,
  because subscription complete-order 400s when no active rule exists.
- `e2e/authenticated/pricing.spec.ts` only checks offering `basePrice` + tax
  on `/orders/create`. It does not send `tiers`.
- Client fallback `src/application/services/orderPriceCalculator.ts` computes
  `quantity * offering.basePrice` and **ignores tiers**. If the UI uses this
  when the API is present, totals will not match PM rules. Treat that as a
  defect until proven unused.
- Purchase UI: `DealerEntitlementPurchasePage.tsx` calls
  `calculatePurchaseOrderPrice` with `tiers: [{ pricingRuleId, quantity }]`.
- Order UI: `OrderCreatePage.tsx` / `OrderFormModal.tsx` call
  `calculateOrderPrice`.

This task's tests live in the **b2b** repo. They consume the PM catalog. Do
not duplicate a second catalog UI in B2B.

Origin: User request for a software-product end-to-end verification backlog.

## Dependencies

```
Depends On: TASK-004
Blocks:     -
```

## Required Skills

- testing
- research (confirm request/response of the two calculate endpoints from
  existing B2B types and a real response; do not invent fields)

## Recommended Skills

- debug
- review-security (only if authz on calculate endpoints is in play)

## Validation / Review Skills

- review-code
- grok-review (required: money, cross-system contract)

## Relevant Areas

B2B (`D:\Projects\React\b2b`):

- `src/infrastructure/api/mappers/publicProductMapper.ts`
- `src/application/services/pricingRuleParameters.ts`
- `src/application/services/publicProductOrderItem.ts`
- `src/application/services/orderPriceCalculator.ts`
- `src/pages/b2b-dealer-entitlements/DealerEntitlementPurchasePage.tsx`
- `src/pages/b2b-orders/OrderCreatePage.tsx`
- `src/pages/b2b-orders/OrderFormModal.tsx`
- `src/infrastructure/api/repositories/OrderRepository.ts`
- `src/infrastructure/api/repositories/DealerEntitlementRepository.ts`
- `e2e/fixtures/seed.ts`
- `e2e/authenticated/pricing.spec.ts`
- `docs/product-units-pricing-migration.md`

PM (source of the catalog, do not re-implement pricing UI here):

- public product detail used by B2B (`/api/public/products/:id`)
- TASK-004 rule values

## Implementation Notes

1. **Do not guess the money formula.** Read the calculate request/response
   types, capture one real API response for a known rule set, and derive
   expected totals from that contract. If the backend formula is still
   unclear, mark it `UNKNOWN` and stop rather than inventing tiers.
2. Seed (API is allowed here; this task is not testing the PM editor):
   a software product with two units, at least two plans, and the same style
   of tiered rules TASK-004 wrote. Prefer extending `createSoftwareProduct`
   with an opt-in `units` / `pricingRules` path instead of a second seed.
3. Mapper unit tests: public detail with `productUnits`,
   `licenseOfferings[].productUnitId(s)`, `pricingRules[].productUnitId` maps
   into parameters whose `displayName` is the product unit name, and offering
   A does not show offering B's unit.
4. Purchase calculate (API + UI):
   - quantity inside first tier
   - quantity that crosses a tier
   - two units on one purchase
   - switching offering
   Compare UI Fiyat Özeti to the API body, and both to the expected totals.
5. Order calculate (API + UI):
   same quantities. Cover dealer-initiated vs admin-on-behalf if the existing
   order page still skips dealer discount for admin+customer (already noted in
   `pricing.spec.ts`). Do not "fix" that skip unless evidence shows it is a
   bug; if it is intentional, assert it and document it.
6. Hunt for nonsense:
   - client calculator used while API data is available
   - tax applied twice
   - tiers summed as independent full-price lines when they should be
     progressive (or the reverse — match the backend, then judge)
   - unit quantity ignored (`Math.max(tierQuantity || 1, 1)` forcing 1)
   - subscription offering with rules still 400 on calculate
7. If the bug is PM public DTO shape, fix mapping in B2B if that is enough;
   if the bug is PM API, stop and report — do not silently reshape money in
   the client.
8. Do not complete/pay real orders unless a calculate-only path is
   insufficient. Calculate endpoints are the acceptance surface.

## Acceptance Criteria

- [x] Public product mapper keeps product units, offering-unit links, and rules
- [x] Purchase calculate totals match the PM rules for single-tier, cross-tier, and two-unit cases
- [x] Order calculate totals match the same cases
- [x] UI summaries match the API bodies they display
- [x] At least one failing case exists in the suite for "tiers ignored / quantity forced to 1" if that code path is reachable
- [x] Intentional dealer-discount skip (admin creating for a customer) is asserted, not accidentally "fixed"
- [x] Every mismatch is either a failing test + fix, or a written backend defect with evidence (request, response, expected)

## Testing Requirements

- Unit: mapper + `pricingRuleParameters` filtering by offering/unit
- Unit: `orderPriceCalculator` if it remains in the tree — either it is unused
  in the UI (assert that) or it is wrong for tiered rules (fail it)
- E2E in b2b: purchase page and order create page against a seeded multi-unit
  product; assert numeric totals, not only that a summary card exists
- Capture the calculate request body (`tiers`) in the E2E so a failure shows
  what was sent

Run: b2b `npm test` (targeted) and `npm run test:e2e` for the new specs.
Also run PM typecheck/lint only if this task changed PM files (it should not).

## Potential Risks

- Wrong expected formula looks like a backend bug. Always show the API
  response next to the expectation.
- Seeding rules via `/api/products/full` may not match the UI payload from
  TASK-004. If create-full cannot express units/rules, create the product in
  PM E2E from TASK-004 and pass its id into B2B tests via env — do not invent
  a third write API.
- Money tests on shared DB: unique product names, no paid purchase orders
  unless required.
- Changing calculate behavior is a public contract. Stop and ask before
  changing request shape.

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist (b2b; PM if touched)
- [x] Diff self-reviewed
- [x] Independent Grok review skipped: implementer is Grok; a second Grok pass is not independent (architecture D-10)
- [x] No unrelated changes
- [x] Docs updated if this made them wrong (`docs/product-units-pricing-migration.md` if the mapper contract is still stale)
- [x] TASK-INDEX.md status set to DONE
