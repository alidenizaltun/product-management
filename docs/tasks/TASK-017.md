# TASK-017

## Title

Align detail pages to the shared detail shell

## Goal

Record detail screens (category, region, price list, user, …) use the same page shell, section grouping, empty-value rendering, and loading/error treatment so no detail page is a one-off layout.

## Context

Origin: User request in `docs/PROJECT-INIT-PROMPT.md` (one standard for detail pages).

Binding standard: CONVENTIONS.md — `DetailPage` + `DetailSection` / `DetailCard`, `DetailSkeleton`, retryable `StatusAlert`, missing values as `"—"` after mapping, Turkish labels not raw enums.

Product workspace (`ProductDetailPage` + section pages) is a different IA (hero + sections). Do not force it onto `DetailPage`. Only apply CONVENTIONS situation table (empty/loading/error/toast) if those files are opened for a real gap.

This task is the definition/pricing/identity record details.

## Dependencies

```
Depends On: TASK-014
Blocks:     -
```

## Required Skills

- NONE

## Recommended Skills

- emil-design-eng

## Validation / Review Skills

- NONE

## Relevant Areas

- `src/components/shared/PageLayout.tsx` (`DetailPage`)
- `src/components/shared/DetailSection.tsx`
- Catalog detail routes / `*DetailPage.tsx` under catalog
- `src/pages/pricing/PriceListDetailPage.tsx`
- `src/pages/pricing/PriceRevisionDetailPage.tsx`
- `src/pages/pricing/PricingTemplateDetailPage.tsx`
- Identity detail pages
- `src/pages/products/ProductDetailPage.tsx` — out of shell scope; do not convert

## Implementation Notes

- List chrome is TASK-014; this task only opens detail routes.
- Do not invent fields. Map what the DTO already has.
- Keep existing edit/delete actions in the header.
- If a "detail" is only a modal, leave it to TASK-016 (`DetailModal`).

## Acceptance Criteria

- [x] Catalog/pricing/identity record details share `DetailPage` (or an equivalent existing header + `DetailSection` composition) rather than unrelated custom layouts
- [x] Loading uses `DetailSkeleton` (or `DetailPage`'s `loading`)
- [x] Missing mapped values render `"—"`; no leftover English enum names on pages this task opens
- [x] Product workspace detail is unchanged as a shell

## Testing Requirements

Update any detail-page tests that query old layout.

Existing category detail visual E2E: update snapshots if the shell changes.

## Potential Risks

- Product detail accidentally restyled
- Snapshot churn on `categories.spec.ts`

## Definition of Done

- [x] Acceptance criteria met
- [x] Tests written and passing
- [x] Typecheck / lint / build pass where they exist
- [x] Diff self-reviewed
- [x] Independent Grok review skipped (shell consistency)
- [x] No unrelated changes
- [x] Docs updated if this made them wrong
- [x] TASK-INDEX.md status set to DONE
