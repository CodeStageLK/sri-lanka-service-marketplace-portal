---
name: sri-lanka-localization
description: "Sri Lanka localization rules for the marketplace: LKR currency formatting, +94 phone validation/normalization, the 9-province/25-district/DS-division geography model, address formats, Asia/Colombo timezone handling, trilingual (Sinhala/Tamil/English) i18n readiness, and date formats. Use when handling currency, phone numbers, locations, addresses, timestamps, translations, fonts, or seeding location data anywhere in the backend, React apps, or Flutter app."
license: MIT
metadata:
  category: "project"
  scope: "project"
  project: "sri-lanka-service-marketplace"
  version: "1.0.0"
---

# Sri Lanka Localization

## Purpose
One set of rules for everything Sri Lanka–specific: money, phone numbers, geography, addresses, time, language, and the regulatory items that must be verified before launch. Applies to the NestJS backend, all three React apps, and the Flutter app.

## When to Use
- Formatting, storing, or validating LKR amounts, phone numbers, addresses, or dates.
- Modeling or seeding provinces/districts/DS divisions, or building location pickers/search.
- Adding user-facing strings (i18n keys), fonts, or language switching.
- Scheduling jobs or displaying timestamps.

## Currency (LKR)
- **Store** all amounts as PostgreSQL `NUMERIC(14,2)`; API transports as strings or integer cents consistently (never JS `number` arithmetic on money); **format at the edge** only.
- Display format: `Rs. 12,500.00` — `Rs.` prefix, space, comma thousands grouping, 2 decimals (drop decimals for marketing contexts only, e.g., `Rs. 12,500`). ISO code `LKR` used in APIs, exports, and anywhere ambiguity matters.
- Web: `Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' })` wrapped in one shared `formatLKR()` util (verify the symbol output; override to `Rs.` for consistency). Flutter: `intl` `NumberFormat.currency(locale: 'en_LK', symbol: 'Rs. ')`. One util per platform — no inline formatting.
- ASSUMPTION: Sinhala/Tamil UIs also use `Rs.` (common local practice: රු / ரூ exist but `Rs.` is widely understood) — placeholder pending content/design decision.
- No multi-currency at launch; schema still records `currency = 'LKR'` on money rows for future-proofing.

## Phone Numbers (+94)
- **Store** E.164: `+94XXXXXXXXX` (+94 followed by 9 digits, no leading zero). One backend normalizer is the source of truth; clients may pre-validate but the server re-normalizes.
- Accepted inputs → normalization: `0771234567` → `+94771234567`; `94771234567`, `0094771234567`, `+94 77 123 4567` (strip spaces/dashes/parens) → `+94771234567`.
- Validation: after normalization, must match `^\+94\d{9}$`. Mobile numbers: `+947\d{8}` (local `07x`); prefixes include 070/071/072/074/075/076/077/078 across operators — validate the shape (`+947[0-9]\d{7}`), not a hardcoded operator list, since prefixes change with operator mergers. Fixed lines: `+94` + area code (e.g., Colombo 11) + 7 digits.
- Display format: local style `077 123 4567` or international `+94 77 123 4567` via a shared formatter; inputs accept local `07x...` entry with automatic conversion (critical for the Flutter app keyboards).
- OTP/verification flows always target the E.164 value.

## Administrative Geography
- Hierarchy: **9 provinces → 25 districts → DS (Divisional Secretariat) divisions** (~331 nationally). Model as one `locations` table: `id`, `parent_id`, `type` (PROVINCE|DISTRICT|DS_DIVISION), `name_en`, `name_si`, `name_ta`, `slug`, `is_serviceable` (launch-location gating), optional centroid lat/lng for maps.
- Seeding strategy: idempotent seed migration from a versioned source file (provinces + districts fully; DS divisions from an official list). REQUIRES VERIFICATION: authoritative current DS-division list (Ministry/Dept. of Census & Statistics) — counts change with administrative revisions; record the source and date in the seed file.
- Providers declare coverage areas as sets of location references (district or DS-division granularity — ASSUMPTION: district-level at launch, DS-division later, placeholder). Customers search by location; matching uses the hierarchy (a provider covering a district matches all its DS divisions).
- Never hardcode province/district lists in frontend code — always fetch from the Locations API (cacheable, rarely changes).
- Launch-locations rollout: `is_serviceable` flags control where enquiries can be created; admin-managed (see marketplace-admin-operations).

## Address Format
- Structured fields: `line1` (house no. + street), `line2` (optional, e.g., apartment/landmark), `city/town`, `ds_division_id` (optional), `district_id` (required), `province` (derived), `postal_code` (optional — 5 digits where used, not universally known/used by residents, so never mandatory).
- Display order: line1, line2, city, district, province, postal code. Do not impose Western state/ZIP-required patterns.
- Geocoding optional; lat/lng captured from map pin where available (mobile) rather than parsed from text.

## Reference Shapes

Phone normalizer (backend source of truth):

```ts
export function normalizeLkPhone(raw: string): string {
  const d = raw.replace(/[\s\-().]/g, '');
  let n = d;
  if (n.startsWith('0094')) n = '+94' + n.slice(4);
  else if (n.startsWith('94')) n = '+' + n;
  else if (n.startsWith('0')) n = '+94' + n.slice(1);
  if (!/^\+94\d{9}$/.test(n)) throw new InvalidPhoneException(raw);
  return n;                                  // E.164
}
export const isLkMobile = (e164: string) => /^\+947\d{8}$/.test(e164);
```

Locations model and seed:

```sql
CREATE TABLE locations (
  id        UUID PRIMARY KEY,
  parent_id UUID REFERENCES locations(id),
  type      TEXT NOT NULL CHECK (type IN ('PROVINCE','DISTRICT','DS_DIVISION')),
  name_en   TEXT NOT NULL,
  name_si   TEXT,
  name_ta   TEXT,
  slug      TEXT NOT NULL UNIQUE,
  is_serviceable BOOLEAN NOT NULL DEFAULT false,
  lat NUMERIC(9,6), lng NUMERIC(9,6)
);
-- Seed: 9 provinces → 25 districts → DS divisions, idempotent ON CONFLICT (slug),
-- source file versioned with origin + retrieval date recorded in the migration.
```

Example formatted address:
`No. 42, Galle Road` / `Colpetty` / `Colombo` / `Colombo District` / `Western Province` / `00300`.

## Timezone (Asia/Colombo)
- UTC+5:30, **no DST**. Store every timestamp in UTC (`timestamptz`); convert to Asia/Colombo only at display or when computing user-facing day boundaries.
- The +5:30 half-hour offset is a classic bug source: "today" in Colombo ≠ UTC date for ~5.5 h/day. All daily rollups, quiet hours, SLA timers, and "booking date" semantics use Asia/Colombo days explicitly (see marketplace-analytics).
- Scheduled jobs (payouts, renewals, digests) are defined in Asia/Colombo and converted to UTC cron; server/container TZ stays UTC.
- Date formats: display `15 Nov 2025` (en) or locale-appropriate; numeric form `DD/MM/YYYY` (never US `MM/DD`); APIs/exchange always ISO 8601 with offset or UTC `Z`.

## Trilingual Readiness (Sinhala / Tamil / English)
- i18n keys from day one on every surface: React apps via an i18n library (e.g., i18next) with `en`/`si`/`ta` namespaces; Flutter via ARB files. English ships first; `si`/`ta` fall back to `en` but **keys must exist** — no hardcoded strings in components (lint-enforced).
- Database: PostgreSQL UTF-8 with ICU collation for Sinhala/Tamil-safe sorting/search; user-generated content (names, enquiry text, reviews) is unicode throughout — test Sinhala (සිංහල) and Tamil (தமிழ்) round-trips in forms, PDFs/exports, push notifications, and emails.
- Entity-level localization where needed: category and location names carry `name_en/name_si/name_ta` columns (not translation files) because they are data, not UI copy.
- Fonts: web — include Noto Sans Sinhala + Noto Sans Tamil fallbacks in the font stack; Flutter — bundle or fallback to those fonts in `TextTheme`. Verify line-height/clipping: Sinhala and Tamil scripts have taller ascenders/descenders than Latin.
- Language preference stored per user, sent via `Accept-Language`/profile setting; notifications render in the user's language (see marketplace-notifications).
- Never machine-concatenate sentence fragments; use full ICU messages with placeholders for grammatical correctness in si/ta.

## Assumptions and Open Questions
- ASSUMPTION: `Rs.` prefix used across all three languages; district-level provider coverage at launch; postal code optional.
- ASSUMPTION: English is the launch language with si/ta activated progressively.
- REQUIRES VERIFICATION: **PDPA (Personal Data Protection Act No. 9 of 2021)** obligations — consent, data subject rights, cross-border transfer, breach notification, retention — affecting analytics, notifications, admin PII access, and storage location choices.
- REQUIRES VERIFICATION: SMS sender-ID registration and A2P rules with Sri Lankan operators/TRCSL before enabling SMS.
- REQUIRES VERIFICATION: payment gateway compliance and Central Bank of Sri Lanka regulations (see marketplace-payments-commissions).
- REQUIRES VERIFICATION: tax/VAT registration and invoicing requirements for platform fees, subscriptions, and commissions.
- REQUIRES VERIFICATION: authoritative DS-division dataset and its licensing for seeding.

## Checklist
- [ ] Money stored NUMERIC(14,2), transported as strings/cents, formatted only via shared `formatLKR` utils.
- [ ] Phones stored E.164 `+94XXXXXXXXX`; server-side normalizer handles `0`-prefix, `0094`, spacing variants.
- [ ] Mobile validation uses shape `+947X XXXXXXX`, not hardcoded operator lists.
- [ ] Locations table seeded idempotently (9 provinces, 25 districts, DS divisions) with source + date recorded; frontends fetch, never hardcode.
- [ ] Addresses structured with required district, optional postal code; no Western-format assumptions.
- [ ] All timestamps UTC in storage; Asia/Colombo only at edges; daily boundaries explicitly Colombo-local.
- [ ] Dates displayed `DD MMM YYYY` / `DD/MM/YYYY`; APIs use ISO 8601.
- [ ] Every UI string behind an i18n key with en/si/ta namespaces; category/location names localized as data columns.
- [ ] Noto Sans Sinhala/Tamil fallbacks configured web + Flutter; unicode round-trip tested in forms, exports, push, email.
- [ ] All REQUIRES VERIFICATION items tracked and resolved before the affected feature ships.
