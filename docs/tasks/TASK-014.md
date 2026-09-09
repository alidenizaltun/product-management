# TASK-014

## Title

Align list-page tables with the B2B Dashlite table standard

## Goal

Every PM list that is a table looks and behaves like the B2B admin lists: same table chrome, toolbar, empty/loading, row actions, and pagination. A user who knows B2B can read a PM list without relearning the layout.

## Context

Origin: User request in `docs/PROJECT-INIT-PROMPT.md` (UX consistency backlog). Reference app: `D:\Projects\React\b2b`.

Verified facts:

- PM and B2B already share `DataTableServer` (the files match).
- Most PM `*ListPage.tsx` files already compose `PageHeader` + `DataTableServer` + `ConfirmDialog`.
- B2B entity lists (`DealersListPage`, `OrdersListPage`, `CustomersListPage`) still use the older Dashlite `BlockHead` + `DataTable` + `card-tools` + `nk-tb-actions` pattern, not `ListPage`.
- Binding written standard for **new/touched** PM pages is `src/components/shared/CONVENTIONS.md` (`ListPage` or `PageHeader` + list body, `EmptyState`, `TableSkeleton`, `FilterBar`).
- Product list in **both** apps is a **card grid**, not a table. Do not convert `ProductListPage` into a table.

Do not copy B2B's zustand + `BlockHead` lists wholesale. Keep React Query. Match visual and interaction standard: `PageHeader` / `ListPage`, toolbar search in the table card, `DataTable` / `DataTableServer` with `nk-tb-col-tools` actions, `EmptyState`, table skeleton, existing `DataTablePagination`.

If B2B and CONVENTIONS disagree, CONVENTIONS + Dashlite `nk-tb-*` chrome win. Do not introduce a second table component.

## Dependencies

```
Depends On: -
Blocks:     TASK-017
```

## Required Skills

- emil-design-eng

## Recommended Skills

- NONE

## Validation / Review Skills

- NONE

## Relevant Areas

- `src/components/shared/DataTableServer.tsx`
- `src/components/shared/PageLayout.tsx` (`ListPage`)
- `src/components/shared/CONVENTIONS.md`
- `src/pages/catalog/*ListPage.tsx`
- `src/pages/pricing/*ListPage.tsx`
- `src/pages/inventory/*ListPage.tsx`
- `src/pages/identity/*ListPage.tsx`
- `src/pages/attributes/AttributeDefinitionListPage.tsx`
- `src/pages/products/ProductListPage.tsx` — out of table scope; only touch if a shared header/toolbar change would otherwise leave it broken

## Implementation Notes

- Upgrade the shared table once, then sweep pages. Do not restyle each list with unique CSS.
- Preserve each page's data, columns, permissions, and delete confirmations.
- Search/filter that already exists stays; do not invent new filters.
- Product cards stay cards.
- No new table library.

## Acceptance Criteria

- [x] Catalog, pricing, inventory, identity, and attribute list tables share one table chrome (header/toolbar/empty/loading/actions/pagination)
- [x] Row actions use the same icon-button pattern as B2B (`nk-tb-actions` / `btn-trigger`)
- [x] Empty and loading states use `EmptyState` and a table skeleton/loading row, not a raw `text-soft` span
- [x] `ProductListPage` remains a card grid
- [x] No list page in this sweep introduces a second table implementation

## Testing Requirements

Unit: none required unless `DataTableServer` pagination or empty-state props change — then a shallow render test for empty + loading.

Existing E2E (`categories.spec.ts` and other list specs): update selectors if the action-column markup changes; do not drop coverage.

Browser: open at least one catalog list, one pricing list, and one identity list at desktop and a narrow viewport.

## Potential Risks

- Visual snapshots in Playwright (`categories.spec.ts-snapshots`) will fail if layout changes; update them in this task
- Over-unifying columns and losing a page-specific column

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped (presentation sweep)
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE
