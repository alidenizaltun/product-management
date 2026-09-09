# TASK-007

## Title

Clarify product general-info sales switches and unique SKU suggestion

## Goal

On Genel Bilgiler, "Öner" always produces a new SKU, software products never show stock tracking, and the sellable/purchasable switches use names that match how B2B actually uses those flags.

## Context

Origin: User request in `docs/PROJECT-INIT-PROMPT.md` (UX consistency backlog).

`GeneralInfoTab.suggestSku` is a pure slug of the product name (`PRD-{SEED}`). Clicking "Öner" twice with the same name writes the same code. The user wants a new suggestion on every click.

Software products already force `trackInventory: false` in `productFormMapper.ts`, but the UI still renders a disabled "Stok Takibi" switch. Hide it entirely for kind = Yazılım (`2`). Also hide the matching flag on the product detail hero.

B2B usage (verified in `D:\Projects\React\b2b`):

- `isSellable` — public catalog filter (`PublicProductRepository`) and "published" mapping
- `isPurchasable` — dealer purchase button enabled only when this is not false

ASSUMPTION (labels, PM UI only; B2B copy is out of scope):

- `isSellable` → **Satışa açık**
- `isPurchasable` → **Bayiler satın alabilir**

If the user later prefers different wording, change labels only — do not rename the API fields.

Existing tests and E2E helpers still look up "Satılabilir" / "Satın Alınabilir" and must move with the UI.

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

- review-code only if the mapper payload for `trackInventory` / sales flags changes

## Relevant Areas

- `src/pages/products/components/editor/GeneralInfoTab.tsx`
- `src/pages/products/components/detail/ProductDetailHero.tsx`
- `src/pages/products/utils/productFormMapper.ts` (only if software still needs a payload guarantee)
- `src/pages/products/__tests__/GeneralInfoTab.test.tsx`
- `e2e/authenticated/helpers/softwareProduct.ts`
- Any other PM UI copy of "Satılabilir" / "Satın Alınabilir" / "Stok Takibi" on the product editor or detail hero

## Implementation Notes

- Keep generating a readable slug from the name, then append a per-click unique suffix (timestamp fragment or short random token). Do not call the API to reserve a code.
- Empty name still disables "Öner".
- Do not show a disabled stock switch for software. Non-software kinds keep the existing switch.
- Mapper already sends `trackInventory: false` for kind `2`; keep that guarantee.
- Do not rename DTO fields. Do not change B2B.
- Match existing Dashlite form controls; no new component library.

## Acceptance Criteria

- [x] Clicking "Öner" twice with the same product name writes two different `productCode` values
- [x] "Öner" remains disabled when the product name is empty
- [x] When Ürün Tipi is Yazılım, "Stok Takibi" is not in the document (editor or detail hero)
- [x] When Ürün Tipi is not Yazılım, "Stok Takibi" remains an editable switch
- [x] Saving a software product still sends `trackInventory: false`
- [x] The two sales switches are labeled to match B2B meaning (default: "Satışa açık" and "Bayiler satın alabilir")
- [x] Existing unit tests and the software-product E2E helper use the new labels

## Testing Requirements

Unit (`GeneralInfoTab.test.tsx`):

- "Öner" with a name produces a code; a second click produces a different code
- software kind: stock switch absent; sales switches present under the new labels
- non-software kind: stock switch present (if that kind can still be selected in the UI)

Mapper (only if touched):

- software payload has `trackInventory: false` regardless of form state

E2E: update `softwareProduct.ts` selectors. Do not add a new spec unless the existing general-info spec would otherwise go red.

## Potential Risks

- E2E and unit tests that query the old Turkish labels will fail if not updated in the same change
- A suffix that is too long will hit backend `productCode` length limits (UNKNOWN — keep the slug short)

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped (copy + client-side SKU suffix, not high-risk)
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE
