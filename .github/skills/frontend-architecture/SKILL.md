---
name: frontend-architecture
description: "Frontend codebase architecture: feature-folder organization, UI/state/data layer separation, dependency direction, shared vs feature-local code, barrel-file pitfalls, and routing structure. Use when structuring a new frontend app, reorganizing folders, deciding where code lives, untangling cross-feature imports, fixing circular dependencies, or scaling a codebase across multiple teams."
license: MIT
metadata:
  category: "frontend"
  scope: "universal"
  version: "1.0.0"
---

# Frontend Architecture

## Purpose

Rules for organizing a component-based frontend codebase so it stays navigable and changeable as it grows: feature-first folders, enforced dependency direction, clear layer separation, and deliberate sharing — instead of type-based dumping grounds and import spaghetti.

## When to Use

- Scaffolding or restructuring a frontend project
- Deciding where a new component, hook, or utility belongs
- Reviewing imports that cross feature boundaries
- Fixing circular dependencies or bloated barrel files
- Planning code ownership across teams

## Feature-First Organization

Group by business feature, not by technical kind:

```
src/
  app/            # app shell: providers, router, global styles, entry
  features/
    checkout/
      components/ # feature-private UI
      hooks/
      api.ts      # feature's data access
      types.ts
      index.ts    # the feature's PUBLIC surface (small, deliberate)
    catalog/
  shared/         # cross-feature, domain-agnostic
    ui/           # design-system primitives (Button, Dialog)
    lib/          # utils, api client, config
    hooks/
  pages/ (or routes/)  # thin route components composing features
```

- A feature folder contains everything the feature needs: components, hooks, data access, types, tests.
- Top-level `components/`, `hooks/`, `utils/` dumping grounds are banned beyond the `shared` layer — "where does this go?" must have one answer: the feature it belongs to.
- Keep route/page components thin: compose feature modules, handle route params, nothing else.

## Dependency Direction

Enforce a one-way import rule:

```
app → pages/routes → features → shared
```

- `shared` imports nothing from features or pages. `features` import shared, never pages, never `app`.
- **Features must not import from other features' internals.** If checkout needs catalog data, either (a) go through catalog's `index.ts` public API, (b) lift the shared piece into `shared`/an `entities` layer, or (c) have the page compose both and pass data down.
- Circular imports are architecture bugs, not bundler quirks. Fix by extracting the shared dependency downward (into `shared`) — never by lazy-importing around the cycle.
- Enforce mechanically: `eslint-plugin-boundaries` or `import/no-restricted-paths` (or Nx module boundaries). Unenforced conventions decay.

## Layer Separation: UI / State / Data

Within a feature, separate three concerns:

- **Data layer** (`api.ts`, query hooks): knows about HTTP, schemas, caching. Exposes typed hooks/functions (`useInvoices()`, `createInvoice()`). No JSX.
- **State/logic layer** (custom hooks): orchestrates data + client state + derived values into a view-ready API. This is the hooks-era "container": `useCheckout()` returns `{ items, total, submit, isSubmitting }`.
- **UI layer** (components): renders props and local interaction state. Minimal imports from data layer; receives behavior via the logic hook or props.

Container vs presentational today = **smart hook + dumb component**, not two component classes:

```tsx
function CheckoutPage() {
  const checkout = useCheckout();       // all logic/data
  return <CheckoutView {...checkout} />; // pure rendering, trivially testable
}
```

- Don't force the split on trivial components; apply it when logic becomes hard to test through the DOM or the component exceeds ~200 lines.
- UI primitives in `shared/ui` must be logic-free and fetch-free: props in, events out.

## Shared vs Feature-Local

- Default to feature-local. Code starts private to its feature.
- Promote to `shared` only when a **second** feature genuinely needs it AND it is domain-agnostic or a stable domain entity — not "might be useful someday."
- Promotion is a deliberate refactor: generalize the API, remove feature-specific params, add tests, then move. Never deep-import another feature's file as a shortcut.
- Beware premature sharing: a shared component serving two masters grows boolean props for each (`isCheckoutVariant`). If consumers diverge, duplicate it back into each feature — duplication is cheaper than the wrong abstraction.
- For large apps, add an `entities/` layer (domain models + their basic UI/api, e.g. `entities/user`) between `shared` and `features` (feature-sliced style): features depend on entities, entities depend only on shared.

## Barrel Files

- One barrel per feature (`features/checkout/index.ts`) defining the public API — this is good: it's the boundary.
- Barrels everywhere else are a liability:
  - Deep re-export chains defeat tree-shaking and slow dev-server cold starts (importing one icon pulls the barrel's whole graph).
  - They create accidental circular imports (`a → index → b → index → a`).
- Rules: no barrel inside `components/` subfolders; never import a feature's own barrel from within the feature (import source files directly); keep barrels re-export-only — no logic, no side effects.
- Enforce "outsiders import only the barrel" with lint (`no-restricted-imports` pattern `features/*/!(index)`).

## Routing Structure

- Route tree mirrors URL structure; each route maps to a thin page component that composes features.
- Code-split at route boundaries by default (`lazy`); nested layouts (shells, sidebars) via layout routes rather than copying chrome into every page.
- Route params/search params are state (see state-management skill): read them via router hooks in the page, pass values down as props — feature internals shouldn't read the router directly, or they become unreusable and untestable.
- Centralize path construction: a typed `routes.ts` (`routes.invoice(id)`) instead of string literals scattered across files; or use a typed router (TanStack Router) for this guarantee.

## Scaling Across Teams

- Feature folders are the ownership unit: assign CODEOWNERS per feature; cross-feature changes require the boundary (public API) to change, which makes coupling visible in review.
- Public APIs between features are contracts — keep them small; every export is something another team can depend on forever.
- Shared layer changes need wider review than feature changes; treat `shared/ui` like an internal library (changelog discipline, no breaking changes without migration).
- When one app no longer fits: split by feature into a monorepo of packages (same boundaries, now physical) before reaching for microfrontends — microfrontends buy independent deployment at a steep complexity cost and are a last resort.
- Record structural decisions (layering, state strategy, routing) in short ADRs in-repo so new teams don't relitigate them.

## Common Mistakes

- **Type-based top-level folders (`components/`, `helpers/`) as the whole structure** → reorganize by feature; keep type folders only inside features and `shared`.
- **Feature A deep-importing `features/b/components/X`** → use B's public barrel, promote to shared/entities, or compose at the page.
- **`shared/` as a junk drawer growing without review** → promotion requires a second real consumer + generalization.
- **Barrels re-exporting barrels, cold starts slow, tree-shaking broken** → barrels only at feature boundaries; direct imports internally.
- **Circular dependency "fixed" with dynamic import** → extract the shared piece downward.
- **Components fetching data directly deep in the tree, untestable** → data via feature hooks at the top of the feature; UI receives props.
- **Route components with hundreds of lines of logic** → extract a `usePageName()` hook; keep the page compositional.
- **Shared component accreting consumer-specific boolean props** → split or duplicate back into features.
- **Conventions documented but not enforced** → add eslint boundary rules; conventions without tooling decay.

## Checklist

- [ ] Code grouped by feature; no top-level kind-based dumping grounds
- [ ] Import direction app → pages → features → shared holds; enforced by lint rule
- [ ] No feature imports another feature's internals; only public barrels
- [ ] Each feature exposes a minimal `index.ts` public API
- [ ] Data access isolated in feature api/query hooks; shared/ui components are fetch-free
- [ ] Complex pages split into logic hook + presentational component
- [ ] Barrels exist only at feature boundaries; no internal/self barrel imports
- [ ] Routes are thin, code-split, use centralized typed path helpers
- [ ] Zero circular dependencies (verified via lint/madge)
- [ ] Ownership mapped to feature folders; structural decisions captured as ADRs
