# TASK-011

## Title

Hide deleted products from the product picker recents

## Goal

The product picker's "Son kullanılanlar" list never offers a product that no longer exists. Selecting a recent always lands on a live product.

## Context

Origin: User request in `docs/PROJECT-INIT-PROMPT.md` (UX consistency backlog).

`ProductPicker` reads `pm_recent_products_*` from `localStorage` via `recentProducts.ts`. `useProductMutations.deleteMutation` already calls `forgetRecentProduct(id)` on success. That is not enough:

- Another browser/tab still has the id
- Delete outside this session (API, other user) leaves stale recents
- Recents are shown without checking the current product list

`visibleRecents` today only filters by `allowedKinds`.

ASSUMPTION: "silinmiş" means the product is not returned by the product list/search API (deleted). Archived/inactive products that still exist may remain until the user says otherwise.

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

- review-code if recents start calling extra product-by-id endpoints in a loop

## Relevant Areas

- `src/pages/products/utils/recentProducts.ts`
- `src/pages/products/components/ProductPicker.tsx`
- `src/application/hooks/useProductMutations.ts` (already forgets on delete; keep that)
- `src/application/hooks/useProducts.ts`
- New: `src/pages/products/utils/__tests__/recentProducts.test.ts` and/or a ProductPicker test

## Implementation Notes

- When the picker is open (or when recents are rendered), drop any recent whose id is not in the current product query results **and** is not the currently selected live product, **or** confirm existence with a single batched lookup if the list query is not a valid existence check (search term empty vs recents).
- Do not fire one GET per recent id in a loop if a list/lookup endpoint can answer.
- After a confirmed miss, `forgetRecentProduct` so the stale id does not return on the next visit.
- Keep `forgetRecentProduct` on delete.
- Do not expand recents into a global product history.

## Acceptance Criteria

- [x] A product id that is only in `localStorage` and not returned as an existing product does not appear under "Son kullanılanlar"
- [x] After that miss, the id is removed from `localStorage` recents
- [x] Deleting a product from the product list still clears it from recents in this session
- [x] Live recents still appear and remain selectable

## Testing Requirements

Unit:

- recents containing a deleted id are filtered out
- filtered ids are written back / forgotten
- kind filtering still applies

Do not add E2E against shared-DB leftovers unless a writable spec already covers delete + picker.

## Potential Risks

- Treating "not on the first page of search" as deleted would hide valid recents. Existence check must not depend on an unrelated search term.
- Extra API chatter if implemented as N+1 GETs

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped unless the existence check hits a new endpoint pattern
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE
