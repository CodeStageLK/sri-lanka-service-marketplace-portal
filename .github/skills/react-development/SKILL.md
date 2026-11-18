---
name: react-development
description: "Modern React development rules: function components, hooks discipline, effects hygiene, memoization, error boundaries, and Suspense. Use when writing or reviewing React components, fixing useEffect bugs, deciding on memo/useMemo/useCallback, handling lists and keys, structuring component files, or refactoring class components to hooks."
license: MIT
metadata:
  category: "frontend"
  scope: "universal"
  version: "1.0.0"
---

# React Development

## Purpose

Opinionated rules for writing modern React (18+) with function components and hooks. Focuses on the highest-leverage decisions: when effects are wrong, when memoization helps, how to compose components, and how to keep renders predictable.

## When to Use

- Writing new React components or custom hooks
- Reviewing React code for correctness and render behavior
- Debugging stale state, infinite effect loops, or unnecessary re-renders
- Refactoring class components or prop-drilling-heavy trees
- Deciding where state lives and how data flows

## Components and Composition

- Function components only. Never introduce new class components (except error boundaries, which still require classes unless a library provides one).
- Prefer composition over configuration: pass `children` or named slots (`header`, `actions` props taking `ReactNode`) instead of boolean flags that mutate component behavior (`isCompact`, `showX`, `variantWithSidebar`).
- One component per concern. If a component renders two unrelated sections joined by conditionals, split it.
- Props: destructure in the signature, type with an explicit `Props` interface/type. Avoid `React.FC`; type props directly: `function Card({ title }: CardProps)`.
- Derive, don't store: anything computable from props/state during render must be computed during render, never copied into state.

```tsx
// ❌ copying props into state
const [fullName, setFullName] = useState(first + " " + last);
// ✅ derive during render
const fullName = `${first} ${last}`;
```

## Hooks Rules

- Call hooks unconditionally at the top level, same order every render. Never inside `if`, loops, or after early returns.
- Custom hooks for any reusable stateful logic; name them `useXxx`. Extract a custom hook as soon as the same effect+state pairing appears twice.
- A custom hook should return a stable, minimal API (values + handlers), not internal setters.
- `useState` with functional updates (`setCount(c => c + 1)`) whenever the next state depends on the previous state.
- `useRef` for mutable values that must not trigger re-renders (timers, previous values, DOM nodes). Never read/write refs during render.

## Effects Discipline

`useEffect` is for synchronizing with external systems (network, DOM APIs, subscriptions, timers). It is NOT for:

- **Transforming data for render** → compute during render (optionally `useMemo`).
- **Responding to user events** → put logic in the event handler.
- **Resetting state when a prop changes** → use a `key` on the component instead.
- **Chaining state updates** (`useEffect` that only calls `setState` based on other state) → derive the value or update both in the event handler.
- **Fetching in apps that have a data library** → prefer TanStack Query/SWR/router loaders over hand-rolled fetch effects.

When an effect is genuinely needed:

- Include every reactive value in the dependency array; fix lint warnings by restructuring, never by suppressing.
- Always return a cleanup function for subscriptions, timers, and aborting fetches (`AbortController`).
- Effects must be resilient to running twice (React 18 StrictMode) — idempotent setup + full cleanup.

## Keys and Lists

- Keys must be stable and unique per item identity: use the data's ID, never the array index when items can reorder, insert, or delete.
- Changing a `key` deliberately remounts a component — use this to reset internal state (`<Form key={userId} />`).
- Never generate keys at render time (`key={Math.random()}`) — this remounts every item every render.

## Memoization

Default: do NOT memoize. Measure first (React DevTools Profiler). Then:

- `memo(Component)` only when the component is expensive AND re-renders with identical props frequently.
- `useMemo` for genuinely expensive computations or to stabilize object/array identity passed to memoized children or dependency arrays.
- `useCallback` only when the function is a prop to a `memo`ized child or a dependency of another hook.
- Memoization is void if any prop is a fresh object/array/function literal — audit the whole chain.
- Prefer restructuring over memoizing: lift content into `children` (children passed from a parent don't re-render when the wrapper's state changes), or push state down to the smallest component that needs it.

## Controlled Components and Forms

- Controlled inputs (`value` + `onChange`) when you need live validation, formatting, or dependent fields; uncontrolled (`defaultValue` + ref / FormData) for simple submit-only forms.
- Never mix: an input must not switch between controlled and uncontrolled (`value={x ?? ""}` to avoid `undefined`).
- For non-trivial forms, use a form library (react-hook-form) instead of one `useState` per field.

## Error Boundaries and Suspense

- Place error boundaries at route level and around independently-failing widgets (charts, third-party embeds) — not around every component. Use `react-error-boundary`'s `ErrorBoundary` with `fallbackRender` and `onReset`.
- Error boundaries do not catch event handler errors — handle those with try/catch + state.
- `Suspense` fallbacks at route level for `lazy()` components and for suspending data libraries. Keep fallbacks layout-stable (skeletons sized like the content) to avoid layout shift.
- Code-split at route boundaries first: `const Page = lazy(() => import("./Page"))`.

## Project Organization

- Co-locate: component + its hook + its test + its styles in one folder; export the component from the folder's entry file.
- Group by feature, not by kind. `features/billing/InvoiceList.tsx`, not `components/` + `hooks/` + `utils/` dumping grounds.
- Shared primitives (Button, Dialog) live in a `ui`/`shared` layer that never imports from features.
- Keep components under ~200 lines; extract subcomponents and hooks before they grow past that.

## Common Mistakes

- **Effect that mirrors state into other state** → derive during render or update both in the handler.
- **Missing effect cleanup causing leaks/double subscriptions** → return cleanup; verify under StrictMode.
- **Index as key in a mutable list** → use stable item IDs.
- **`useCallback`/`useMemo` everywhere "for performance"** → remove; memoize only measured hot paths with `memo`d consumers.
- **Object/array literal props defeating `memo`** → hoist constants outside the component or memoize them.
- **Conditional hook calls after early return** → move all hooks above the first `return`.
- **Prop drilling fixed with one giant context** → split contexts by concern; pass components (`children`) instead of data where possible.
- **Setting state in render** → move to event handler or derive; if intentional reset, use `key`.
- **`value={maybeUndefined}` on inputs** → coalesce to `""` or use uncontrolled.

## Checklist

- [ ] All components are function components; no new classes except error boundaries
- [ ] No `useEffect` used for derivable data, event logic, or state resets
- [ ] Every effect has correct deps and a cleanup; survives StrictMode double-invoke
- [ ] List keys are stable item IDs, not indexes
- [ ] No `useMemo`/`useCallback`/`memo` without a measured reason or memoized consumer
- [ ] State lives at the lowest component that needs it; derived values computed in render
- [ ] Inputs are consistently controlled or uncontrolled, never mixed
- [ ] Error boundaries wrap routes and risky widgets; Suspense fallbacks are layout-stable
- [ ] Routes are code-split with `lazy()`
- [ ] Files organized by feature; shared UI layer has no feature imports
