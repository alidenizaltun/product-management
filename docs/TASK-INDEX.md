# Task Index

Single source of truth for task status. Update it whenever a status changes.

Status: `TODO` | `IN_PROGRESS` | `BLOCKED` | `DONE`

Origin: software-product end-to-end verification backlog requested by the user.
This is not a greenfield `project-init`. Existing app architecture stays as-is.
These tasks add missing coverage and fix defects found while exercising the
software-product journey. They do not invent a second product editor.

| ID | Task | Status | Depends On | Blocks |
| --- | --- | --- | --- | --- |
| TASK-001 | Cover software product creation and general information | DONE | - | TASK-002, TASK-003, TASK-004 |
| TASK-002 | Cover inline category, attribute, and region definition plus assignment | DONE | TASK-001 | - |
| TASK-003 | Cover media upload and software advanced profile | DONE | TASK-001 | - |
| TASK-004 | Cover every sales plan type and multi-unit pricing rules | DONE | TASK-001 | TASK-005, TASK-006 |
| TASK-005 | Verify B2B mapper, purchase-order price, and order calculate | DONE | TASK-004 | - |
| TASK-006 | Cover software product module assignment and offering prices | DONE | TASK-004 | - |

## Recommended Implementation Order

1. **TASK-001** — later journeys need a writable software product and a shared create helper
2. **TASK-002** — classification and regions after the product exists; independent of pricing
3. **TASK-003** — media and advanced profile after the product exists; independent of TASK-002
4. **TASK-004** — sales plans and unit rules are the input to B2B money and to module prices
5. **TASK-005** — B2B mapper / purchase / order calculate can only be judged against known PM pricing
6. **TASK-006** — module offering prices attach to sales plans created in TASK-004

## Parallelizable

Tasks with no dependency on each other, safe to run concurrently:

- After TASK-001: **TASK-002**, **TASK-003**, and **TASK-004**
- After TASK-004: **TASK-005** and **TASK-006**

Do not run TASK-005 before TASK-004. Without known plans, units, and rules there
is nothing correct to compare B2B totals against.

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
