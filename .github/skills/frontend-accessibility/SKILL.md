---
name: frontend-accessibility
description: "Web accessibility rules: semantic HTML first, ARIA only when needed, keyboard navigation, focus management for modals and route changes, color contrast, accessible forms, and axe + screen reader testing. Use when building interactive UI components, implementing modals/menus/forms, fixing a11y audit findings, adding keyboard support, managing focus, or setting up automated accessibility checks."
license: MIT
metadata:
  category: "frontend"
  scope: "universal"
  version: "1.0.0"
---

# Frontend Accessibility

## Purpose

Rules for building interfaces usable by keyboard, screen reader, and low-vision users — targeting WCAG 2.2 AA. Core strategy: semantic HTML does most of the work; ARIA patches genuine gaps; focus and keyboard behavior are managed deliberately; testing combines automation with manual checks.

## When to Use

- Building any interactive component (buttons, menus, dialogs, tabs, forms)
- Fixing axe/Lighthouse/audit findings
- Implementing keyboard navigation or focus behavior
- Reviewing color, contrast, or motion choices
- Setting up a11y testing in CI

## Semantic HTML First

- Use the native element for the job: `<button>` for actions, `<a href>` for navigation, `<label>`+`<input>`, `<nav>`, `<main>`, `<header>`, `<table>` for tabular data, `<ul>/<ol>` for lists. Native elements ship keyboard support, focusability, and semantics for free.
- `<div onClick>` is banned for interactive behavior. Recreating a button on a div requires `role="button"`, `tabIndex={0}`, Enter AND Space key handling — just use `<button type="button">` and restyle it.
- Button vs link: changes the URL → link; performs an action → button. Don't style one as the other without keeping the correct element.
- One `<h1>` per page; heading levels descend without skipping (h2 → h3, never h2 → h4). Headings are structure, not font sizes — style with CSS instead of picking a level for its size.
- Landmarks: exactly one `<main>`; label repeated landmarks (`<nav aria-label="Primary">` vs `aria-label="Breadcrumbs"`).
- Images: meaningful → descriptive `alt`; decorative → `alt=""` (never omit the attribute). Icon-only buttons need an accessible name: `aria-label` or visually hidden text.

## ARIA: Only When Needed

- First rule of ARIA: don't use ARIA if a native element does it. ARIA adds semantics, never behavior — `role="button"` doesn't make it clickable or focusable.
- Legitimate uses: state on custom widgets (`aria-expanded`, `aria-selected`, `aria-current="page"`), relationships (`aria-labelledby`, `aria-describedby`, `aria-controls`), and live regions.
- Live regions announce dynamic changes: `role="status"` (polite — toasts, "saved") and `role="alert"` (assertive — errors). The region must exist in the DOM *before* content changes, and be used sparingly.
- Never `aria-hidden="true"` on focusable elements or their ancestors; never positive `tabindex` (only `0` and `-1`).
- Composite widgets (menus, tabs, comboboxes, listboxes) follow WAI-ARIA Authoring Practices patterns exactly — half-applied ARIA is worse than none. Strongly prefer a headless library (Radix, React Aria, Headless UI) over hand-rolling these.

## Keyboard Navigation

- Everything operable by mouse must work by keyboard: Tab/Shift+Tab between controls, Enter/Space to activate, Escape to dismiss, arrow keys within composite widgets.
- Tab order follows visual/reading order; achieve it with DOM order, not `tabindex`. If CSS order diverges from DOM order, fix the DOM.
- Composite widgets use roving tabindex: one Tab stop for the widget, arrows move within (tabs, menus, radio groups, grids). Don't put every menu item in the Tab order.
- Visible focus indicator on every interactive element — `:focus-visible` ring, ≥3:1 contrast against adjacent colors; never remove outlines without replacement.
- Skip link as the first focusable element (`<a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>`).
- No keyboard traps: focus must always be able to leave any widget (except modal dialogs, which trap intentionally while open).
- Hover-only affordances (row action buttons appearing on hover) must also appear on `:focus-within`.

## Focus Management

Explicitly move focus when context changes; silence after an action strands screen reader users:

- **Modals/dialogs**: on open, focus the dialog (or first sensible control); trap focus inside; Escape closes; on close, return focus to the trigger. Use Radix/React Aria/native `<dialog>` — don't hand-roll traps.
- **SPA route changes**: routers don't manage focus; browsers do full-page loads. On navigation, move focus to the new page's `<h1>` (`tabIndex={-1}` + `.focus()`) or a skip target, and update `document.title`.
- **Deletion/removal**: when the focused element disappears (deleting a list row), move focus to a sensible neighbor (next row, list heading) — never let it fall to `<body>`.

```tsx
function PageTitle({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return <h1 tabIndex={-1} ref={ref} className="outline-none">{children}</h1>;
}
```

- Async results (search finished, items loaded) that don't move focus should announce via a polite live region.

## Color, Contrast, Motion

- Contrast minimums (AA): normal text 4.5:1; large text (≥24px or ≥18.7px bold) 3:1; UI components and focus indicators 3:1. Check both light and dark themes — verify your theme tokens' foreground/background pairs.
- Never color alone to convey meaning: error = red + icon + text; chart series = color + pattern/label; required field = asterisk/text, not red border only.
- Placeholder text is not a label and usually fails contrast — always a real `<label>`.
- Respect `prefers-reduced-motion`: disable or reduce non-essential animation (parallax, auto-playing carousels, large transitions). No flashing content >3 times/second.
- Support 200% zoom and 320px-wide viewports without loss of content or horizontal scrolling of text.
- Touch/click targets ≥24×24 CSS px (WCAG 2.2), ideally 44×44 — enlarge hit areas with padding, not icon size.

## Forms

- Every input has a programmatically associated `<label htmlFor>` (or wrapping label). `aria-label` only when a visible label is genuinely impossible.
- Group related controls: `<fieldset>` + `<legend>` for radio/checkbox groups.
- Errors: set `aria-invalid` on the field and link the message via `aria-describedby`; messages are specific ("Enter a valid email like name@example.com", not "Invalid input"). Hint text joins the same `aria-describedby`.
- On failed submit: move focus to the first invalid field, or to an error summary at the top linking to each field; announce via `role="alert"` as appropriate.
- Use correct `type` (`email`, `tel`, `url`, `number`-with-care) and `autocomplete` attributes (`autocomplete="email"`, `"given-name"`) — they drive mobile keyboards and autofill.
- Don't disable the submit button as the only validation feedback — allow submit and show errors, or pair disabled state with visible requirements.
- Form libraries + component kits (e.g., react-hook-form with properly wired field components) handle id/describedby plumbing — use them rather than wiring manually each time.

## Testing

- **Automated**: `eslint-plugin-jsx-a11y` in lint; `jest-axe`/`vitest-axe` in component tests (`expect(await axe(container)).toHaveNoViolations()`); axe DevTools/Lighthouse on pages; Playwright + `@axe-core/playwright` in e2e. Automation catches only ~30–40% of issues — necessary, not sufficient.
- **Keyboard pass (every feature)**: unplug the mouse — Tab through the page. Can you reach, operate, and leave everything? Is focus always visible? Does Escape close overlays? Does focus go somewhere sensible after actions?
- **Screen reader pass (significant flows)**: NVDA+Firefox/Chrome (Windows), VoiceOver+Safari (macOS, Cmd+F5). Verify names, roles, states are announced; forms and errors are understandable; dynamic updates are heard.
- Test with real content lengths, 200% zoom, and both themes.
- Prefer queries that mirror the accessibility tree in component tests (`getByRole("button", { name: /save/i })`) — tests then fail when accessible names break.

## Common Mistakes

- **`<div onClick>` interactive elements** → native `<button>`/`<a>`.
- **Icon buttons with no accessible name** → `aria-label` or sr-only text.
- **`outline: none` with no focus replacement** → `:focus-visible` ring with ≥3:1 contrast.
- **Modal without trap/restore** → use a primitive library; return focus to trigger on close.
- **SPA navigation leaving focus stranded** → focus the new `<h1>`; update `document.title`.
- **Placeholder as the only label** → real associated `<label>`.
- **Error messages not linked to fields** → `aria-invalid` + `aria-describedby`; focus first error on submit.
- **Toast/status updates never announced** → pre-rendered `role="status"` live region.
- **Heading levels chosen for size** → semantic order; style with CSS.
- **Relying on axe alone** → add keyboard and screen reader passes to definition of done.

## Checklist

- [ ] Native semantic elements used; zero clickable divs/spans
- [ ] One h1; heading levels sequential; landmarks labeled; single `<main>`
- [ ] All functionality keyboard-operable; visible focus everywhere; no traps; skip link present
- [ ] Modals trap and restore focus; route changes move focus and update title
- [ ] Text ≥4.5:1, large text/UI ≥3:1 contrast in all themes; no color-only meaning
- [ ] All inputs labeled; errors linked via aria-describedby and focused on submit
- [ ] Correct input types and autocomplete attributes
- [ ] prefers-reduced-motion respected; 200% zoom and 320px width usable
- [ ] jsx-a11y lint + axe assertions in CI; role-based queries in component tests
- [ ] Keyboard-only pass done per feature; screen reader pass done for key flows
