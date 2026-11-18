---
name: marketplace-brand-design-system
description: "Brand palette as design tokens (CSS variables for web, ThemeExtension for Flutter), WCAG AA contrast pairings, typography/spacing/radius/elevation tokens, per-surface personality, shadcn/ui theming, and Flutter Material 3 seeding for the Sri Lanka Service Marketplace. Use when styling any web or Flutter UI, defining theme tokens, choosing color combinations, building components (buttons, cards, badges, verified badge), or applying the brand and tagline."
license: MIT
metadata:
  category: "project"
  scope: "project"
  project: "sri-lanka-service-marketplace"
  version: "1.0.0"
---

# Marketplace Brand and Design System

## Purpose
One source of truth for brand color, type, spacing, and component tone across the four surfaces (public site, customer/provider dashboard, admin, Flutter app). Brand voice: modern, professional, trustworthy, approachable. Tagline: "Every Service. One Platform."

## When to Use
- Creating or theming any component on web (Tailwind + shadcn/ui) or Flutter (Material 3).
- Choosing text/background color combinations or button/badge styles.
- Setting up CSS variables, Tailwind config, or Flutter ThemeData/ThemeExtension.
- Reviewing UI PRs for brand or accessibility compliance.

## Palette and Semantic Tokens
ASSUMPTION: The semantic role mapping below is the working default; confirm with design before locking.

| Token | Hex | Semantic role |
|---|---|---|
| `--color-primary` | #102A43 Deep Navy | Primary brand, headers, primary buttons, nav |
| `--color-accent` | #0F9D8A Teal | Accent, success, verified/active states |
| `--color-highlight` | #F4B544 Warm Amber | CTAs, highlights, featured/promo badges |
| `--color-surface` | #F5F8FA Soft Background | Page/app background, subtle panels |
| `--color-background` | #FFFFFF White | Cards, inputs, elevated surfaces |
| `--color-text` | #263746 Charcoal | Body text, icons |

Derived tokens (generate tints/shades programmatically, keep in tokens file, never inline hex in components): `primary-hover` (~8% lighter navy), `accent-text` #0B7A6B (darkened teal for text/links on white — the raw teal fails AA for body text), `border` (navy at ~12% alpha), `muted-text` (charcoal at ~70%), `danger` (ASSUMPTION: a red, e.g., #C7442E placeholder — no error color exists in the brand palette yet).

## Accessible Contrast Pairings (computed, WCAG 2.1)
- White on Deep Navy — **14.6:1** — AAA. Safe for all text. Primary buttons: navy bg + white text.
- Charcoal on White — **12.2:1** — AAA. Default body text.
- Charcoal on Soft Background #F5F8FA — **11.5:1** — AAA. Body text on page bg.
- Warm Amber on Deep Navy — **8.1:1** — AAA. Great for highlights on dark headers/hero.
- Charcoal on Warm Amber — **6.7:1** — AA (normal text). Amber CTA buttons MUST use charcoal/navy text.
- White on Teal #0F9D8A — **3.4:1** — fails AA for normal text; passes only large text (≥18.66px bold / 24px) and UI components (3:1). Teal-filled buttons with white text are allowed only at large sizes; prefer teal backgrounds with navy text or outline style.
- Teal #0F9D8A on White — **3.4:1** — fails for body text/links. Use darkened `accent-text` #0B7A6B (**5.2:1**, AA) for teal text and links on white/soft backgrounds.
- White on Warm Amber — **1.8:1** — never use.
- Deep Navy on Teal — **4.3:1** — fails AA normal text narrowly; large text/icons only.
Rule: any new pairing must be contrast-checked (4.5:1 normal text, 3:1 large text and UI components) before merge.

## Typography, Spacing, Radius, Elevation
- ASSUMPTION (recommendation, pending design sign-off): Web font **Inter** (UI + body) with system fallback; Flutter uses platform defaults or Inter; Sinhala/Tamil coverage via Noto Sans Sinhala / Noto Sans Tamil fallbacks on every surface (see sri-lanka-localization).
- Type scale (rem, 1rem=16px): `xs 0.75`, `sm 0.875`, `base 1`, `lg 1.125`, `xl 1.25`, `2xl 1.5`, `3xl 1.875`, `4xl 2.25` (hero). Headings navy and semibold/bold; body charcoal regular; line-height 1.5 body, 1.2 headings.
- Spacing: 4px base grid — tokens 4/8/12/16/24/32/48/64. No arbitrary pixel values in components.
- Radius: `sm 6px` (inputs, badges), `md 10px` (buttons, cards), `lg 16px` (modals, feature cards), `full` (avatars, pills). ASSUMPTION placeholders.
- Elevation: 3 levels only — `e1` subtle card shadow, `e2` dropdown/popover, `e3` modal. Shadows tinted with navy (e.g., `rgba(16,42,67,0.08–0.16)`), never pure black.

## Per-Surface Personality
- **Public customer website**: welcoming — generous whitespace, soft-background sections, amber CTAs, imagery, large friendly type, tagline in hero. SEO-critical: tokens must not break SSR/static rendering.
- **Customer dashboard + provider portal**: modern SaaS — denser than public, white cards on soft background, navy sidebar/nav, teal state indicators, data-forward.
- **Admin dashboard**: enterprise-dense — compact tables, smaller base size allowed (14px), minimal decoration, high information density; same tokens, tighter spacing scale.
- **Flutter app**: native-feeling — Material 3 components, platform conventions (back gestures, pickers), brand colors via theme, not web-cloned layouts.

## Implementation: Web (Tailwind + shadcn/ui)
- Define tokens as CSS variables in `:root` using shadcn/ui conventions (HSL triplets): `--primary: 210 61% 16%` (navy), `--accent`, `--background`, `--foreground`, `--muted`, `--ring`, etc., then map in `tailwind.config` (`colors: { primary: 'hsl(var(--primary))' ... }`).
- Components consume semantic tokens only (`bg-primary`, `text-foreground`) — raw hex in JSX is a review blocker.
- Shared token file/package consumed by all three React apps so public, dashboard, and admin never drift; per-surface overrides limited to density (spacing/type) variables, not colors.
- Dark mode: ASSUMPTION — not in launch scope; keep variables structured so a `.dark` block can be added later.

## Implementation: Flutter (Material 3)
- `ColorScheme.fromSeed(seedColor: Color(0xFF102A43))` then explicitly override: `primary` navy, `secondary`/`tertiary` teal, surfaces white/#F5F8FA, `onSurface` charcoal — seeding alone will drift from brand hexes, so overrides are mandatory.
- A `BrandColors ThemeExtension` carries non-Material roles: `highlight` (amber), `verified` (teal), `accentText` (#0B7A6B), success/warning/danger — so widgets never hardcode hex.
- Typography via `TextTheme` mirroring the web scale; density/touch targets per Material defaults (min 48dp).

## Token Snippets

Web (shadcn/ui CSS variables, HSL triplets):

```css
:root {
  --primary: 210 61% 16%;        /* #102A43 Deep Navy */
  --primary-foreground: 0 0% 100%;
  --accent: 171 83% 34%;         /* #0F9D8A Teal */
  --highlight: 39 88% 61%;       /* #F4B544 Warm Amber */
  --background: 204 33% 97%;     /* #F5F8FA */
  --card: 0 0% 100%;             /* #FFFFFF */
  --foreground: 210 30% 21%;     /* #263746 Charcoal */
  --ring: 210 61% 16%;
}
```

Flutter (ThemeExtension):

```dart
class BrandColors extends ThemeExtension<BrandColors> {
  const BrandColors({required this.highlight, required this.verified,
      required this.accentText, required this.danger});
  final Color highlight;   // 0xFFF4B544
  final Color verified;    // 0xFF0F9D8A
  final Color accentText;  // 0xFF0B7A6B
  final Color danger;      // ASSUMPTION placeholder
  // copyWith / lerp omitted
}
// ColorScheme.fromSeed(seedColor: Color(0xFF102A43)) + explicit brand overrides
```

## Component Tone
- **Buttons**: primary = navy bg/white text; CTA = amber bg/charcoal text (reserve amber for the one key action per screen); secondary = outline navy; destructive = danger token. Teal filled only for large-text contexts or icon buttons.
- **Cards**: white on soft background, `md` radius, `e1` shadow, 16–24px padding.
- **Badges**: status pills — `verified` badge is teal (icon + "Verified", white/navy text sized to pass 3:1 UI contrast; prefer teal outline + `accent-text` label on white). Featured/promoted = amber badge with charcoal text. Verified badge style must be identical across all surfaces — it is a trust anchor.
- **Forms**: white inputs, navy focus ring (`--ring`), inline validation in danger token; labels charcoal.
- **Tagline**: "Every Service. One Platform." — exact punctuation (two sentences, title case), used in hero, app splash/onboarding, and marketing email footers; never reworded or translated without brand sign-off (translation readiness: keep as i18n key).

## Assumptions and Open Questions
- ASSUMPTION: Semantic role mapping (navy=primary, teal=accent/success, amber=CTA/highlight) pending design confirmation.
- ASSUMPTION: Inter as primary typeface; radius/elevation values; danger red #C7442E; no dark mode at launch — all placeholders.
- ASSUMPTION: Derived shades (hover states, #0B7A6B accent-text) are engineering-proposed and need design ratification.
- REQUIRES VERIFICATION: none — branding is internal; but accessibility target (WCAG 2.1 AA) should be confirmed as a product commitment.

## Checklist
- [ ] No raw hex in components; semantic tokens only (CSS vars / ThemeExtension).
- [ ] Every text/background pairing meets AA (4.5:1 normal, 3:1 large/UI); teal never used for body text on light backgrounds.
- [ ] Amber buttons always use charcoal/navy text, never white.
- [ ] Shared token source across the three React apps; Flutter overrides seed-generated scheme to exact brand hexes.
- [ ] Surface personality respected: welcoming public, SaaS dashboard, dense admin, native mobile.
- [ ] Verified badge rendered identically on all surfaces.
- [ ] Spacing on the 4px grid; three elevation levels max; navy-tinted shadows.
- [ ] Sinhala/Tamil font fallbacks configured on web and Flutter.
- [ ] Tagline used verbatim with exact punctuation.
