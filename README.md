# Product Management Frontend

## Architecture

The project uses a feature-oriented structure. Keep new code close to the domain that owns it, and move code to shared locations only after it is reused by more than one feature.

```text
src/
  app/
    providers/        Global application providers
    router.tsx        Route tree and layout/guard composition
  modules/
    auth/             Auth pages, API, hooks, schemas, store, and types
    products/         Product pages, editor/detail components, API, hooks, tests, and types
    catalog/          Categories, suppliers, warehouses, and unit definitions
    attributes/       Attribute definitions and attribute sets
    inventory/        Stock, transactions, reservations, and warehouse stock
    pricing/          Price lists and campaign rules
    shared/           Reusable module-level UI primitives
  shared/
    api/              Common API client
    config/           App configuration and endpoint constants
    navigation/       Cross-cutting navigation helper
    storage/          Cross-cutting storage helper
    types/            Truly shared application types
  layout/             Dashlite layout shells and chrome
  components/         Legacy Dashlite primitives used across the app
  tests/              Shared test setup, mocks, fixtures, and render helpers
```

## Placement Rules

- Add feature pages, hooks, API functions, schemas, and domain types under `src/modules/<feature>`.
- Keep components inside a feature unless they are genuinely reused across features.
- Put global app setup in `src/app`, not inside a feature.
- Keep shared HTTP behavior in `src/shared/api`; feature modules should expose domain-specific API functions.
- Use the `@/` alias for imports from `src`.
- Avoid broad barrel files unless they define a deliberate feature boundary.

## Naming

- Components: `PascalCase.tsx`
- Hooks: `useSomething.ts`
- Schemas: domain-specific names such as `authSchemas.ts`
- Types: `PascalCase`
- Booleans: `isLoading`, `hasError`, `canEdit`

## State And Data

- Use local state for modal visibility, local filters, and temporary UI state.
- Use React Query for server state, caching, loading states, and mutations.
- Use module stores only for state that is actually shared across screens.
- Keep non-trivial data transformations outside JSX as pure helpers.

## Validation

Use the real project scripts:

```bash
npm.cmd run build
npm.cmd test
npm.cmd run lint
```

There is no separate `typecheck` script at the moment; the production build is the current compile check.
