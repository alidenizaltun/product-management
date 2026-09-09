# Task Index

Single source of truth for task status. Update it whenever a status changes.

Status: `TODO` | `IN_PROGRESS` | `BLOCKED` | `DONE`

Origin of TASK-001–006: software-product end-to-end verification backlog.
Those tasks are complete. Existing app architecture stays as-is.

Origin of TASK-007–017: UX consistency backlog from
`docs/PROJECT-INIT-PROMPT.md` (2026-09-09). Not a greenfield `project-init`.
Do not invent a second product editor, a second table kit, or a new design
system. Follow `src/components/shared/CONVENTIONS.md` and the existing Dashlite
shells. B2B (`D:\Projects\React\b2b`) is the visual/table reference, not a
license to copy its zustand list pages.

| ID | Task | Status | Depends On | Blocks |
| --- | --- | --- | --- | --- |
| TASK-001 | Cover software product creation and general information | DONE | - | TASK-002, TASK-003, TASK-004 |
| TASK-002 | Cover inline category, attribute, and region definition plus assignment | DONE | TASK-001 | - |
| TASK-003 | Cover media upload and software advanced profile | DONE | TASK-001 | - |
| TASK-004 | Cover every sales plan type and multi-unit pricing rules | DONE | TASK-001 | TASK-005, TASK-006 |
| TASK-005 | Verify B2B mapper, purchase-order price, and order calculate | DONE | TASK-004 | - |
| TASK-006 | Cover software product module assignment and offering prices | DONE | TASK-004 | - |
| TASK-007 | Clarify product general-info sales switches and unique SKU suggestion | DONE | - | - |
| TASK-008 | Remove "the system generates the code" copy from the UI | DONE | - | TASK-015 |
| TASK-009 | Stop closing modals on backdrop click | DONE | - | TASK-016 |
| TASK-010 | Replace oversized sort-order inputs with the classification drag pattern | DONE | - | - |
| TASK-011 | Hide deleted products from the product picker recents | DONE | - | - |
| TASK-012 | Turn sales plan tiles into illustrated cards | DONE | - | - |
| TASK-013 | Make the pricing-template form match in-product pricing-rule create | DONE | - | TASK-015 |
| TASK-014 | Align list-page tables with the B2B Dashlite table standard | DONE | - | - |
| TASK-015 | Align create/edit form pages to the shared form shell | DONE | TASK-008, TASK-013 | - |
| TASK-016 | Route remaining dialogs through the shared modal shells | DONE | TASK-009 | - |
| TASK-017 | Align detail pages to the shared detail shell | DONE | TASK-014 | - |

## Recommended Implementation Order

1. **TASK-007** — isolated general-info copy/behavior; unblocks nothing else
2. **TASK-008** — copy-only; must land before the form-shell sweep
3. **TASK-009** — shared modal dismiss policy; must land before modal-shell conversion
4. **TASK-010** — region/definition order UX; independent of lists
5. **TASK-011** — product picker recents; independent
6. **TASK-012** — sales plan cards; independent of template form
7. **TASK-013** — shared pricing adjustment UI; must land before form-shell sweep
8. **TASK-014** — list table chrome; must land before detail-shell sweep
9. **TASK-016** — convert leftover raw modals after backdrop policy exists
10. **TASK-015** — form pages after copy + template form are stable
11. **TASK-017** — detail pages after list chrome is the standard

## Parallelizable

Tasks with no dependency on each other, safe to run concurrently:

- **TASK-007**, **TASK-008**, **TASK-009**, **TASK-010**, **TASK-011**, **TASK-012**, **TASK-013**, **TASK-014**
  (distinct files; TASK-013 and TASK-010 both may touch `PricingTemplateFormPage` Sıra — if run in parallel, agree that TASK-013 owns that page's adjustment block and TASK-010 only removes a leftover Sıra box if still present)
- After TASK-009: **TASK-016**
- After TASK-008 and TASK-013: **TASK-015**
- After TASK-014: **TASK-017**

Do not run TASK-015 before TASK-013. The template page would be rewritten twice.
Do not run TASK-016 before TASK-009. Backdrop policy must be inherited, not re-litigated.

## Discovered Tasks

Tasks created after initial planning, with their origin.

| ID | Task | Discovered During | Status |
| --- | --- | --- | --- |
| TASK-001 | Cover software product creation and general information | User request: software-product E2E verification | DONE |
| TASK-002 | Cover inline category, attribute, and region definition plus assignment | User request: software-product E2E verification | DONE |
| TASK-003 | Cover media upload and software advanced profile | User request: software-product E2E verification | DONE |
| TASK-004 | Cover every sales plan type and multi-unit pricing rules | User request: software-product E2E verification | DONE |
| TASK-005 | Verify B2B mapper, purchase-order price, and order calculate | User request: software-product E2E verification | DONE |
| TASK-006 | Cover software product module assignment and offering prices | User request: software-product E2E verification | DONE |
| TASK-007 | Clarify product general-info sales switches and unique SKU suggestion | User request: PROJECT-INIT-PROMPT UX backlog | DONE |
| TASK-008 | Remove "the system generates the code" copy from the UI | User request: PROJECT-INIT-PROMPT UX backlog | DONE |
| TASK-009 | Stop closing modals on backdrop click | User request: PROJECT-INIT-PROMPT UX backlog | DONE |
| TASK-010 | Replace oversized sort-order inputs with the classification drag pattern | User request: PROJECT-INIT-PROMPT UX backlog | DONE |
| TASK-011 | Hide deleted products from the product picker recents | User request: PROJECT-INIT-PROMPT UX backlog | DONE |
| TASK-012 | Turn sales plan tiles into illustrated cards | User request: PROJECT-INIT-PROMPT UX backlog | DONE |
| TASK-013 | Make the pricing-template form match in-product pricing-rule create | User request: PROJECT-INIT-PROMPT UX backlog | DONE |
| TASK-014 | Align list-page tables with the B2B Dashlite table standard | User request: PROJECT-INIT-PROMPT UX backlog | DONE |
| TASK-015 | Align create/edit form pages to the shared form shell | User request: PROJECT-INIT-PROMPT UX backlog | DONE |
| TASK-016 | Route remaining dialogs through the shared modal shells | User request: PROJECT-INIT-PROMPT UX backlog | DONE |
| TASK-017 | Align detail pages to the shared detail shell | User request: PROJECT-INIT-PROMPT UX backlog | DONE |
