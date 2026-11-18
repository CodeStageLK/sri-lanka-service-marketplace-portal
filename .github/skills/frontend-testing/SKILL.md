---
name: frontend-testing
description: "Frontend testing strategy: test behavior not implementation, unit/component/e2e split, Vitest + React Testing Library patterns, MSW API mocking, accessibility assertions, and avoiding brittle snapshots. Use when writing tests for React components or hooks, setting up Vitest/RTL/MSW, deciding what to test at which level, fixing flaky or brittle tests, or reviewing test quality."
license: MIT
metadata:
  category: "frontend"
  scope: "universal"
  version: "1.0.0"
---

# Frontend Testing

## Purpose

Rules for testing frontend code so tests catch regressions without blocking refactors: query the DOM like a user, mock at the network boundary, pick the cheapest test level that proves the behavior, and delete tests that assert implementation details.

## When to Use

- Writing tests for components, hooks, or utilities
- Setting up Vitest, React Testing Library, or MSW
- Deciding unit vs component vs e2e for a behavior
- Fixing flaky tests or tests that break on every refactor
- Reviewing PRs for test quality and coverage gaps

## Philosophy: Test Behavior, Not Implementation

- A test should fail only when user-observable behavior breaks — never when internals are refactored (renamed state, extracted hook, restructured JSX).
- Interact as the user does: find by role/label/text, click, type, read what's on screen. Never assert on state variables, hook internals, instance methods, or child-component props.
- If you can't test it through the UI contract, that's usually a design smell — extract the logic into a pure function or hook and unit test that.
- Don't shallow-render or mock child components by default; render the real tree. Mock a child only when it's genuinely heavy or third-party (maps, charts, editors).
- Coverage is a byproduct, not a goal. 100% coverage of implementation-detail assertions is worth less than 60% of behavior tests.

## Test Level Split

Choose the cheapest level that gives real confidence:

- **Unit (Vitest, no DOM)**: pure logic — formatters, validators, reducers, store actions, date math, business rules. Fast, exhaustive edge cases live here.
- **Component/integration (Vitest + RTL + MSW)**: the workhorse (~most tests). A feature rendered with real children, real hooks, mocked network. "User fills form, submits, sees success."
- **E2E (Playwright)**: few, critical journeys only — sign-in, checkout, the one flow that pays the bills. Real browser, real (or staging) backend. Expensive and flakier: don't test edge cases here.
- Push logic down the pyramid: complex branching tested as unit tests on extracted functions; the component test covers the happy path + key failure path.
- Don't test the same behavior at multiple levels; don't e2e-test what a component test proves.

## Vitest + React Testing Library Patterns

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

test("submits the new invoice", async () => {
  const user = userEvent.setup();
  renderWithProviders(<InvoiceForm />);          // shared wrapper: QueryClient, router, theme

  await user.type(screen.getByRole("textbox", { name: /amount/i }), "250");
  await user.click(screen.getByRole("button", { name: /save/i }));

  expect(await screen.findByText(/invoice created/i)).toBeInTheDocument();
});
```

- Query priority: `getByRole` (with `name`) > `getByLabelText` > `getByPlaceholderText` > `getByText` > `getByTestId` (last resort, for genuinely role-less containers). Role queries double as accessibility checks.
- `userEvent` (with `setup()`), never `fireEvent`, for interactions — it simulates real event sequences (focus, keydown, input).
- Async: `await screen.findByX` for things that appear; `await waitFor(...)` only for non-query assertions; `waitForElementToBeRemoved` for disappearance. Never arbitrary `setTimeout`/sleep.
- `getBy` = must exist now; `queryBy` = asserting absence (`expect(queryByX).not.toBeInTheDocument()`); `findBy` = will appear.
- Build one `renderWithProviders` helper wrapping required providers (fresh `QueryClient` per test with `retry: false`); never copy provider boilerplate per test.
- Custom hooks: test through a component that uses them when practical; `renderHook` for pure reusable hooks with no UI.
- Keep tests independent: no shared mutable state, order-dependence, or reliance on previous test's DOM. `beforeEach` resets.

## Mocking APIs with MSW

Mock at the network boundary, not the module boundary — your fetch wrapper, query hooks, serialization, and error handling all stay under test:

```ts
// src/test/server.ts
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const server = setupServer(
  http.get("/api/invoices", () => HttpResponse.json({ items: [invoiceFixture] })),
);
// setup file: beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
// afterEach(() => server.resetHandlers()); afterAll(() => server.close());
```

- Default happy-path handlers globally; per-test overrides for errors/edge cases: `server.use(http.get("/api/invoices", () => HttpResponse.json({ message: "boom" }, { status: 500 })))`.
- `onUnhandledRequest: "error"` — an unmocked request is a test bug, not something to silently pass through.
- Don't `vi.mock` your api module or TanStack Query — that unlinks the test from reality. `vi.mock` is for non-network third-party SDKs and non-determinism (analytics, `Date` via `vi.setSystemTime`, crypto).
- Share typed fixtures (ideally schema-validated factories) between handlers and assertions; drifted fixtures = tests passing against a dead contract.

## Accessibility Assertions

- Role/name queries make every test an implicit a11y check — if `getByRole("button", { name: /save/i })` fails, a screen reader user is lost too. Prefer them everywhere.
- Add axe to representative component tests (not every test — it's slow):

```tsx
import { axe } from "vitest-axe";
expect(await axe(container)).toHaveNoViolations();
```

- Assert interactive states accessibly: `toBeDisabled()`, `toHaveAccessibleName()`, `toBeChecked()`, `aria-expanded` values — not class names.
- Test keyboard paths for custom widgets: `await user.keyboard("{Escape}")` closes the dialog; `{Tab}` order reaches controls.

## What NOT to Test

- Third-party library internals (don't test that TanStack Query caches or Radix traps focus).
- Styling/class names, markup structure, or CSS values — unless the style IS the behavior (visibility, disabled look conveyed by state attr).
- Implementation details: hook call counts, internal state values, that `useX` was called with Y.
- Trivial pass-throughs: a component that renders props with no logic doesn't need its own test.
- Exact copy strings everywhere — match with case-insensitive regex (`/save/i`) so copy tweaks don't cascade through the suite.

## Snapshots: Almost Never

- Full-component snapshots fail on every markup change, and developers rubber-stamp `--update` — zero regression value, pure friction. Don't write them.
- Acceptable: small, intentional snapshots of serialized data (error shapes, generated config, tokens) where the whole value is the contract — reviewed like code on change.
- If tempted to snapshot a component, write explicit assertions for the 2–3 things that matter instead.

## Common Mistakes

- **Asserting on internal state/props/hook calls** → assert rendered output and user-visible behavior.
- **`getByTestId` as the default query** → role/label queries; testid only as last resort.
- **`fireEvent.click`** → `userEvent.setup()` + `await user.click()`.
- **`vi.mock("./api")` module mocks** → MSW handlers at the network layer.
- **Sleeps / arbitrary waits for async UI** → `findBy*` / `waitFor` with real conditions.
- **Giant snapshot tests updated blindly** → targeted assertions.
- **Shared QueryClient/state leaking between tests** → fresh providers per test; `resetHandlers` after each.
- **E2E suite covering every edge case, permanently flaky** → edge cases at unit/component level; e2e for few critical journeys.
- **Unhandled requests silently ignored** → `onUnhandledRequest: "error"`.
- **Testing that a mock was called instead of the outcome** → assert the UI result (success message, list updated).

## Checklist

- [ ] Tests query by role/label/text; `testid` rare and justified
- [ ] All interactions via `userEvent`; async handled with `findBy`/`waitFor`, no sleeps
- [ ] Network mocked with MSW; `onUnhandledRequest: "error"`; per-test error overrides
- [ ] No module mocks of own api/query layer; `vi.mock` limited to SDKs and non-determinism
- [ ] Shared `renderWithProviders`; fresh QueryClient per test; no inter-test leakage
- [ ] Logic-heavy code extracted and unit tested; component tests cover happy + key error paths
- [ ] E2E limited to critical user journeys
- [ ] axe assertions on representative components; keyboard paths tested for custom widgets
- [ ] No full-component snapshots; no assertions on classes/internal state
- [ ] Suite passes reliably in CI — zero known-flaky tests tolerated
