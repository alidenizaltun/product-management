# TASK-012

## Title

Turn sales plan tiles into illustrated cards

## Goal

On the product pricing page, each sales plan looks like a real card with a simple illustration, not a text-only tile.

## Context

Origin: User request in `docs/PROJECT-INIT-PROMPT.md` (UX consistency backlog).

`SalesPlanListPanel` renders a bordered card per offering: badge (license model), active/passive, name, action buttons. No image, no illustration, little hierarchy.

`LICENSE_MODELS` in `LicenseOfferingFormFields.tsx` already has `icon` and `color` per model (Tek Seferlik, Abonelik, Deneme). `ProductCard` already uses a 200px image area with a kind-icon fallback — that is the in-app visual language to follow.

Do not upload per-plan photos. Use the model icon (and optional existing product thumbnail only if it is already available without new API work). Simple, printed-card presence: illustration block, title, model, status, actions.

Required skill direction: Dashlite + existing product-card language. Do not introduce a new illustration library or generic AI-card chrome (gradients, glow, glass).

## Dependencies

```
Depends On: -
Blocks:     -
```

## Required Skills

- emil-design-eng

## Recommended Skills

- NONE

## Validation / Review Skills

- NONE

## Relevant Areas

- `src/pages/products/components/pricing/SalesPlanListPanel.tsx`
- `src/pages/products/components/pricing/LicenseOfferingFormFields.tsx` (`LICENSE_MODELS`, `getModelMeta`)
- `src/pages/products/components/ProductCard.tsx` (visual reference)
- `src/assets/scss/global/wgs/_products.scss` (only if a small shared card rule is required)
- Existing pricing E2E that locates plan names / buttons

## Implementation Notes

- Keep create / edit / rules / delete actions and permission gating.
- Empty state stays; restyle only if it looks broken next to the new cards.
- Grid can stay; cards should feel like physical cards (image/illustration on top, body, actions), not a table.
- Reuse Nioicon already used by Dashlite (`ni-repeat`, `ni-package`, `ni-clock`, …).
- No new npm dependency.

## Acceptance Criteria

- [x] Each plan card has a distinct illustration area (icon or simple artwork) tied to license model
- [x] Name, model, and active/passive remain readable
- [x] Ayarlar, Fiyatlandırma, and delete still work for users who can edit
- [x] Empty "Henüz satış planı eklenmedi" still shows when there are no plans
- [x] Cards do not use a different component kit than the rest of the pricing page

## Testing Requirements

Unit: panel still renders offerings by name and exposes the action buttons.

E2E: update `plan-types-and-rules.spec.ts` / helpers if they depend on the old tile DOM.

Browser: exercise `/product-info` pricing (or the sales-plan section) on desktop and a narrow viewport after implementation.

## Potential Risks

- E2E selectors keyed to the old card structure
- Illustration that competes with Dashlite density on a page that already has many cards

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped (presentation)
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE
